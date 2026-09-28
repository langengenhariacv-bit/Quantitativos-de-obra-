const dataset=require('../REGRESSION_100_DATASET.json');
const core=require('./analyze-plan');
const {ask,basePrompt,MODEL_PROD,MODEL_TEST}=core._internals;

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'GET only'});
  const id=Math.max(1,Math.min(100,Number(req.query?.id)||0));
  const item=dataset.items.find(x=>Number(x.id)===id);
  if(!item)return res.status(404).json({ok:false,error:'Caso não encontrado'});
  const prod=String(req.query?.model||'').toLowerCase()==='sol';
  const model=prod?MODEL_PROD:MODEL_TEST;
  try{
    const body={imageUrl:item.url,page:1,filename:item.name,pageText:'',algorithm:{},mode:prod?'production-check':'regression'};
    const t0=Date.now();
    const result=await ask({body,model,prompt:basePrompt(body)});
    const a=result.data||{};
    const wall=Number(a.walls?.totalLengthM)||0,area=Number(a.areas?.builtAreaM2||a.areas?.floorAreaM2)||0;
    const conf=Number(a.meta?.overallConfidence)||0;
    const meaningful=!a.meta?.isFloorPlan||(wall>0||area>0||(a.rooms||[]).length>0||(a.openings||[]).length>0);
    const sane=wall<5000&&area<20000;
    const ignored=Boolean(a.excluded?.dimensionLinesIgnored&&a.excluded?.textFurnitureIgnored);
    const pass=conf>=0&&conf<=1&&meaningful&&sane&&ignored;
    return res.status(200).json({
      ok:true,pass,id:item.id,name:item.name,kind:item.kind,source:item.source,url:item.url,model:result.model||model,
      durationMs:Date.now()-t0,
      summary:{isFloorPlan:Boolean(a.meta?.isFloorPlan),drawingType:a.meta?.drawingType||'',confidence:conf,wallLengthM:wall||null,areaM2:area||null,rooms:(a.rooms||[]).length,openings:(a.openings||[]).reduce((s,o)=>s+(Number(o.quantity)||0),0),dimensionLinesIgnored:Boolean(a.excluded?.dimensionLinesIgnored),textFurnitureIgnored:Boolean(a.excluded?.textFurnitureIgnored),warnings:a.warnings||[]},
      usage:result.usage||null
    });
  }catch(err){
    console.error('ai-regression',id,err?.status||500,err?.message||err);
    return res.status(err?.status&&err.status>=400&&err.status<600?err.status:500).json({ok:false,pass:false,id:item.id,name:item.name,kind:item.kind,url:item.url,model,error:err?.message||'Falha'});
  }
};