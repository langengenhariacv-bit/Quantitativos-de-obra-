const crypto = require('crypto');
const BASE='https://mantledb.sh/v2/';
const PATH='state';
const PAYLOAD={"app":"l2b-financeiro-v1","salt":"zXtQQ6RmLtyELem0Jw1ccA==","iv":"ZC+I5n6qKTZZ6IZI","data":"ttAiHBZpg8HAy0uJjuxfSxNdIaclZ8mzrXpFJYMCcbM/R5megIt4HB/oqBgdi/qrv9oqte2UGVo6VBrOvjqXMVCGTwSm6tDhQX053KNJ+1V7RiG3EY48gKJFKnhAVSIchhl1WuaN0BkCwg=="};

module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET' || String(req.query?.token||'')!=='l2b-init-2026'){
    return res.status(404).json({error:'not found'});
  }
  try{
    const id='l2b-'+crypto.randomUUID().replace(/-/g,'');
    const r=await fetch(BASE+id+'/'+PATH,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(PAYLOAD)
    });
    const text=await r.text();
    if(!r.ok) return res.status(502).json({error:'storage create failed',status:r.status,detail:text});
    return res.status(200).json({id});
  }catch(e){
    return res.status(500).json({error:String(e?.message||e)});
  }
}