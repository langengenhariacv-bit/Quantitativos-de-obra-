const sharp=require('sharp');
const dataset=require('../REGRESSION_100_DATASET.json');

async function inspect(item){
  const t0=Date.now();
  try{
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);
    const r=await fetch(item.url,{signal:ctrl.signal,headers:{'User-Agent':'Mozilla/5.0 LANG-Quantitativos-Regression/4.6','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
    clearTimeout(timer);
    if(!r.ok)return{id:item.id,name:item.name,kind:item.kind,url:item.url,ok:false,status:r.status,error:'HTTP '+r.status,durationMs:Date.now()-t0};
    const type=(r.headers.get('content-type')||'').toLowerCase();
    const ab=await r.arrayBuffer();
    if(ab.byteLength<500)return{id:item.id,name:item.name,kind:item.kind,url:item.url,ok:false,status:r.status,type,bytes:ab.byteLength,error:'Arquivo vazio/pequeno',durationMs:Date.now()-t0};
    let meta={};try{meta=await sharp(Buffer.from(ab)).metadata()}catch(e){return{id:item.id,name:item.name,kind:item.kind,url:item.url,ok:false,status:r.status,type,bytes:ab.byteLength,error:'Imagem não decodificável: '+e.message,durationMs:Date.now()-t0}}
    return{id:item.id,name:item.name,kind:item.kind,url:item.url,ok:Boolean(meta.width&&meta.height),status:r.status,type,bytes:ab.byteLength,width:meta.width,height:meta.height,format:meta.format,durationMs:Date.now()-t0};
  }catch(e){return{id:item.id,name:item.name,kind:item.kind,url:item.url,ok:false,error:e.name==='AbortError'?'timeout':e.message,durationMs:Date.now()-t0}}
}

module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false});
 const start=Math.max(1,Math.min(100,Number(req.query?.start)||1)),count=Math.max(1,Math.min(5,Number(req.query?.count)||5));
 const items=dataset.items.filter(x=>x.id>=start).slice(0,count);
 const results=await Promise.all(items.map(inspect));
 res.status(200).json({ok:true,start,count:results.length,passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,results});
};