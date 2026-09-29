const crypto = require('crypto');

const BASE='https://mantledb.sh/v2/';
const PATH='state';

function validId(id){
  return /^[a-z0-9-]{20,80}$/i.test(id||'');
}

async function upstream(url, options={}){
  const r=await fetch(url,{...options,headers:{'Accept':'application/json',...(options.headers||{})},cache:'no-store'});
  const text=await r.text();
  let body={};
  try{ body=text?JSON.parse(text):{} }catch{ body={raw:text} }
  return {r,body};
}

module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    if(req.method==='POST'){
      const id='l2b-'+crypto.randomUUID().replace(/-/g,'');
      const {r,body}=await upstream(BASE+id+'/'+PATH,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(req.body||{})
      });
      if(!r.ok) return res.status(502).json({error:'Não foi possível criar o banco compartilhado no servidor.',detail:body});
      return res.status(201).json({id});
    }

    const id=String(req.query?.id||'').trim();
    if(!validId(id)) return res.status(400).json({error:'Identificador do banco inválido.'});

    if(req.method==='GET'){
      const {r,body}=await upstream(BASE+encodeURIComponent(id)+'/'+PATH);
      if(!r.ok) return res.status(r.status===404?404:502).json({error:r.status===404?'Banco não encontrado.':'Não foi possível carregar os dados do servidor.'});
      return res.status(200).json(body);
    }

    if(req.method==='PUT'){
      const {r,body}=await upstream(BASE+encodeURIComponent(id)+'/'+PATH,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(req.body||{})
      });
      if(!r.ok) return res.status(502).json({error:'Não foi possível salvar os dados no servidor.',detail:body});
      return res.status(200).json({ok:true});
    }

    if(req.method==='DELETE'){
      const {r}=await upstream(BASE+encodeURIComponent(id)+'/'+PATH,{method:'DELETE'});
      return res.status(r.ok?200:502).json({ok:r.ok});
    }

    res.setHeader('Allow','GET, POST, PUT, DELETE');
    return res.status(405).json({error:'Método não permitido.'});
  }catch(e){
    return res.status(500).json({error:'Erro interno do armazenamento.',detail:String(e?.message||e)});
  }
}
