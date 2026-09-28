const {getVercelOidcToken}=require('@vercel/oidc');
const MODEL_PROD='openai/gpt-5.6-sol';
const MODEL_TEST='openai/gpt-5.6-luna';
const GATEWAY='https://ai-gateway.vercel.sh/v1/chat/completions';

const nnullable={anyOf:[{type:'number'},{type:'null'}]};
const schema={
  type:'object',
  additionalProperties:false,
  properties:{
    meta:{type:'object',additionalProperties:false,properties:{
      page:{type:'integer'},drawingType:{type:'string'},isFloorPlan:{type:'boolean'},level:{type:'string'},
      scaleDenominator:nnullable,overallConfidence:{type:'number',minimum:0,maximum:1},
      measurementBasis:{type:'string'}
    },required:['page','drawingType','isFloorPlan','level','scaleDenominator','overallConfidence','measurementBasis']},
    areas:{type:'object',additionalProperties:false,properties:{
      builtAreaM2:nnullable,floorAreaM2:nnullable,roofAreaM2:nnullable,slabAreaM2:nnullable
    },required:['builtAreaM2','floorAreaM2','roofAreaM2','slabAreaM2']},
    walls:{type:'object',additionalProperties:false,properties:{
      totalLengthM:nnullable,averageHeightM:nnullable,grossAreaM2:nnullable,
      thicknessesM:{type:'array',items:{type:'number'}},confidence:{type:'number',minimum:0,maximum:1},basis:{type:'string'},
      segments:{type:'array',items:{type:'object',additionalProperties:false,properties:{
        label:{type:'string'},lengthM:nnullable,thicknessM:nnullable,external:{type:'boolean'},
        confidence:{type:'number',minimum:0,maximum:1},basis:{type:'string'}
      },required:['label','lengthM','thicknessM','external','confidence','basis']}}
    },required:['totalLengthM','averageHeightM','grossAreaM2','thicknessesM','confidence','basis','segments']},
    rooms:{type:'array',items:{type:'object',additionalProperties:false,properties:{
      name:{type:'string'},areaM2:nnullable,perimeterM:nnullable,confidence:{type:'number',minimum:0,maximum:1}
    },required:['name','areaM2','perimeterM','confidence']}},
    openings:{type:'array',items:{type:'object',additionalProperties:false,properties:{
      kind:{type:'string'},code:{type:'string'},quantity:{type:'integer',minimum:1},widthM:nnullable,heightM:nnullable,
      confidence:{type:'number',minimum:0,maximum:1}
    },required:['kind','code','quantity','widthM','heightM','confidence']}},
    structure:{type:'object',additionalProperties:false,properties:{
      columnsQty:{anyOf:[{type:'integer'},{type:'null'}]},beamsLengthM:nnullable,footingsQty:{anyOf:[{type:'integer'},{type:'null'}]},
      slabAreaM2:nnullable,confidence:{type:'number',minimum:0,maximum:1},notes:{type:'array',items:{type:'string'}}
    },required:['columnsQty','beamsLengthM','footingsQty','slabAreaM2','confidence','notes']},
    finishes:{type:'object',additionalProperties:false,properties:{
      ceramicFloorAreaM2:nnullable,ceramicWallAreaM2:nnullable,wetAreaM2:nnullable
    },required:['ceramicFloorAreaM2','ceramicWallAreaM2','wetAreaM2']},
    excluded:{type:'object',additionalProperties:false,properties:{
      dimensionLinesIgnored:{type:'boolean'},textFurnitureIgnored:{type:'boolean'},notes:{type:'array',items:{type:'string'}}
    },required:['dimensionLinesIgnored','textFurnitureIgnored','notes']},
    warnings:{type:'array',items:{type:'string'}}
  },
  required:['meta','areas','walls','rooms','openings','structure','finishes','excluded','warnings']
};

function basePrompt(body){
  const txt=String(body.pageText||'').slice(0,18000);
  const alg=body.algorithm&&typeof body.algorithm==='object'?JSON.stringify(body.algorithm).slice(0,4000):'sem leitura geométrica auxiliar';
  return `Você é o módulo de leitura técnica de plantas do LANG Quantitativos. Analise a imagem da prancha como desenho técnico de arquitetura/engenharia.

REGRA CRÍTICA: linhas de cota, linhas auxiliares de dimensão, eixos, chamadas, setas, hachuras, mobiliário, louças, textos, carimbos e molduras NÃO são paredes. Os números de cota podem ser usados como MEDIDAS, mas a linha gráfica da cota nunca entra no comprimento de paredes.

Extraia somente dados sustentados pela prancha. Não invente medidas. Quando um valor não puder ser obtido com segurança, retorne null. Você pode derivar uma medida quando houver escala/cotas suficientes; nesse caso informe a base e reduza a confiança. Comprimento total de paredes deve representar eixos/comprimentos reais de alvenaria, sem cotas e sem duplicar as duas faces da mesma parede.

Para portas/janelas, agrupe elementos iguais quando o quadro ou códigos permitirem. Para estrutura, só informe pilares, vigas, sapatas ou lajes quando estiverem realmente identificáveis; não transforme encontro de paredes automaticamente em pilar. O cálculo de ferragens será feito pelo aplicativo, não por você.

Página: ${Number(body.page)||1}. Arquivo: ${String(body.filename||'projeto').slice(0,160)}.
Texto extraído pelo PDF.js (pode conter ruído): ${txt||'não disponível'}.
Leitura geométrica auxiliar do navegador, use apenas para conferência e NÃO como verdade: ${alg}.

Retorne a leitura técnica estruturada. Priorize precisão a preenchimento.`;
}

async function ask({body,model,prompt}){
  let token=process.env.AI_GATEWAY_API_KEY;
  if(!token){try{token=await getVercelOidcToken({project:'prj_5sL43a1HSIwTHbdFlgIhizzG91XC',team:'team_znY0BtI5yphevDDCpDDf5oAE',expirationBufferMs:60000})}catch(e){console.warn('OIDC indisponível',e?.message||e)}}
  if(!token)throw Object.assign(new Error('AI Gateway sem credencial OIDC/API. Ative OIDC no projeto ou configure AI_GATEWAY_API_KEY.'),{status:503});
  const image=body.imageData||body.imageUrl;
  if(!image)throw Object.assign(new Error('Imagem da planta ausente.'),{status:400});
  const response=await fetch(GATEWAY,{method:'POST',headers:{
    'Authorization':`Bearer ${token}`,'Content-Type':'application/json'
  },body:JSON.stringify({
    model,
    messages:[{role:'user',content:[
      {type:'text',text:prompt},
      {type:'image_url',image_url:{url:image,detail:'high'}}
    ]}],
    response_format:{type:'json_schema',json_schema:{name:'lang_plan_extraction',strict:true,schema}},
    reasoning_effort:'medium',
    max_completion_tokens:12000,
    stream:false,
    providerOptions:{gateway:{tags:['lang-quantitativos','plan-extraction']}}
  })});
  const raw=await response.json().catch(()=>({}));
  if(!response.ok){
    const msg=raw?.error?.message||raw?.message||`AI Gateway HTTP ${response.status}`;
    throw Object.assign(new Error(msg),{status:response.status,raw});
  }
  const content=raw?.choices?.[0]?.message?.content;
  if(!content)throw Object.assign(new Error('A IA não retornou conteúdo estruturado.'),{status:502,raw});
  let data;try{data=JSON.parse(content)}catch{throw Object.assign(new Error('Resposta da IA não pôde ser interpretada.'),{status:502,raw})}
  return{data,usage:raw.usage||null,model:raw.model||model};
}

function needsReview(data,alg){
  const conf=Number(data?.meta?.overallConfidence)||0;
  const ai=Number(data?.walls?.totalLengthM)||0;
  const local=Number(alg?.wallLengthM)||0;
  const diff=ai>0&&local>0?Math.abs(ai-local)/Math.max(ai,local):0;
  return conf<0.72||(diff>0.24&&Number(data?.walls?.confidence||0)<0.86);
}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'&&req.query?.health==='1'){
    let oidc=false;try{oidc=Boolean(await getVercelOidcToken({project:'prj_5sL43a1HSIwTHbdFlgIhizzG91XC',team:'team_znY0BtI5yphevDDCpDDf5oAE',expirationBufferMs:60000}))}catch{}
    return res.status(200).json({ok:true,service:'LANG multimodal plan reader',model:MODEL_PROD,auth:Boolean(process.env.AI_GATEWAY_API_KEY)||oidc,authType:process.env.AI_GATEWAY_API_KEY?'api-key':oidc?'oidc':'none'});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    if((body.imageData&&String(body.imageData).length>7_000_000))return res.status(413).json({error:'Imagem muito grande. Reduza a resolução.'});
    const testMode=body.mode==='regression';
    const model=testMode?MODEL_TEST:MODEL_PROD;
    const primary=await ask({body,model,prompt:basePrompt(body)});
    let final=primary.data,review=null;
    if(!testMode&&needsReview(primary.data,body.algorithm||{})){
      const reviewPrompt=basePrompt(body)+`\n\nREVISÃO OBRIGATÓRIA: a primeira leitura foi:\n${JSON.stringify(primary.data).slice(0,14000)}\nRevise visualmente do zero, com atenção especial a cotas confundidas com paredes e a duplicação das duas faces de alvenaria. Mantenha null onde não houver evidência. Retorne o JSON final corrigido.`;
      review=await ask({body,model,prompt:reviewPrompt});final=review.data;
    }
    return res.status(200).json({ok:true,extraction:final,model:review?.model||primary.model,reviewed:Boolean(review),usage:{primary:primary.usage,review:review?.usage||null}});
  }catch(err){
    console.error('analyze-plan',err?.status||500,err?.message||err);
    return res.status(err?.status&&err.status>=400&&err.status<600?err.status:500).json({ok:false,error:err?.message||'Falha na análise multimodal.'});
  }
};