const UPSTREAM='https://jsonblob.com/api/jsonBlob';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    const id=String(req.query?.id||'').trim();
    if(req.method==='GET'){
      if(!id) return res.status(400).json({error:'ID obrigatório'});
      const r=await fetch(UPSTREAM+'/'+encodeURIComponent(id),{headers:{Accept:'application/json'},cache:'no-store'});
      const body=await r.text();
      res.status(r.status).setHeader('Content-Type','application/json; charset=utf-8');
      return res.send(body);
    }
    if(req.method==='POST'){
      const r=await fetch(UPSTREAM,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(req.body||{})});
      if(!r.ok) return res.status(502).json({error:'Falha ao criar armazenamento'});
      const loc=r.headers.get('location')||'';
      const newId=loc.split('/').filter(Boolean).pop();
      if(!newId) return res.status(502).json({error:'Armazenamento não retornou ID'});
      return res.status(201).json({id:newId});
    }
    if(req.method==='PUT'){
      if(!id) return res.status(400).json({error:'ID obrigatório'});
      const r=await fetch(UPSTREAM+'/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(req.body||{})});
      if(!r.ok) return res.status(502).json({error:'Falha ao salvar armazenamento'});
      return res.status(200).json({ok:true});
    }
    res.setHeader('Allow','GET, POST, PUT');
    return res.status(405).json({error:'Método não permitido'});
  }catch(e){
    return res.status(500).json({error:'Erro de armazenamento',detail:String(e?.message||e)});
  }
}
