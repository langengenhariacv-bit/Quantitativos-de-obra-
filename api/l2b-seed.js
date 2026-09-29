const TOKEN='seed-l2b-7Qp4Xk29mV';
const PAYLOAD={"app":"l2b-financeiro-v1","salt":"jr9YvRnHSZ7Ki7sFx+asEA==","iv":"OdSRLVlsooK/dm6a","data":"H1BKMgPugZ7AAXiXUjXXkZYMY2uw7JbwOQBWAYLgscwepd1FHNA10ch5JJFfeFAd276mba0DE+TnScATmtEhh/PWTtzx7hVixvS9Vy7kv0chJcsCsT/F++3R4ITvxpUEmp8L/xHyLnbRbA=="};
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='GET'||String(req.query?.token||'')!==TOKEN) return res.status(404).json({error:'not found'});
  try{
    const r=await fetch('https://jsonblob.com/api/jsonBlob',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(PAYLOAD)});
    if(!r.ok) return res.status(502).json({error:'seed upstream failed',status:r.status});
    const loc=r.headers.get('location')||'';
    const id=loc.split('/').filter(Boolean).pop();
    return id?res.status(200).json({id}):res.status(502).json({error:'missing id'});
  }catch(e){return res.status(500).json({error:String(e?.message||e)})}
}
