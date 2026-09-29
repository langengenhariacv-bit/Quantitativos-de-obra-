export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const base='https://api.jsonstorage.net/v1/json/';
    const initial={app:'l2b-storage-test',value:1};
    const c=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(initial)});
    const cj=await c.json().catch(()=>({}));
    if(!c.ok||!cj.uri) return res.status(502).json({ok:false,step:'create',status:c.status,body:cj});
    const g=await fetch(cj.uri,{cache:'no-store'});
    const gj=await g.json().catch(()=>({}));
    const u=await fetch(cj.uri,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({app:'l2b-storage-test',value:2})});
    const g2=await fetch(cj.uri,{cache:'no-store'});
    const g2j=await g2.json().catch(()=>({}));
    await fetch(cj.uri,{method:'DELETE'}).catch(()=>{});
    return res.status(200).json({ok:c.ok&&g.ok&&u.ok&&g2.ok,create:c.status,get:g.status,put:u.status,get2:g2.status,first:gj?.value,second:g2j?.value});
  }catch(e){return res.status(500).json({ok:false,error:String(e?.message||e)})}
}