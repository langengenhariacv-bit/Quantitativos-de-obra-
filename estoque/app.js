'use strict';
/* ============ Dados ============ */
const KEY='lang-estoque-v1';
const CATS=[
  ['Cimento e argamassa','🪣'],['Agregados','⛰️'],['Aço e ferragens','🔩'],['Alvenaria','🧱'],['Hidráulica','🚰'],
  ['Elétrica','⚡'],['Madeira e fôrmas','🪵'],['Revestimento','🔲'],['Pintura','🎨'],['Ferramentas','🧰'],['EPI','🦺'],['Outros','📦']];
const CAT_ICON=Object.fromEntries(CATS);
const ICONS=[['🪣','cimento argamassa rejunte cal balde graute'],['🧱','bloco tijolo telha'],['⛰️','areia'],['🪨','brita pedra pedrisco seixo'],['🔩','vergalhao ferro aco parafuso tela trelica prego'],['➰','arame'],['🪵','tabua madeira pinus caibro sarrafo compensado ripa pontalete'],['🚰','tubo cano pvc conexao joelho registro'],['🚿','chuveiro ducha'],['🚽','vaso sanitario louca'],['🔌','cabo fio tomada interruptor disjuntor eletroduto'],['💡','lampada luminaria refletor'],['🎨','tinta selador textura'],['🖌️','pincel rolo trincha'],['⛑️','capacete'],['🧤','luva'],['🦺','colete'],['🥾','bota botina'],['🥽','oculos'],['🔨','martelo marreta'],['🪚','serra serrote disco'],['🪛','chave fenda broca'],['🔧','chave inglesa'],['🧰','ferramenta caixa'],['📏','trena nivel regua prumo'],['🪜','escada andaime'],['🧪','aditivo impermeabilizante manta'],['🛢️','tambor oleo desmoldante'],['🔲','piso ceramica porcelanato azulejo revestimento'],['🚪','porta'],['🪟','janela vidro'],['🔗','corrente'],['🧵','fita lona'],['🧹','vassoura'],['🛒','carrinho'],['💧','agua'],['🧴','adesivo selante cola espuma'],['😷','mascara'],['🛞','pneu'],['🔥','macarico botijao gas'],['🌿','rocadeira mato'],['✏️','lapis'],['🔦','refletor'],['🧽','escova desempenadeira'],['🎛️','quadro disjuntor barramento'],['🔘','botao interruptor'],['📄','lixa'],['🧷','abracadeira cinta'],['📌','prego'],['💿','disco'],['⬜','placa'],['📡','sensor fotocelula'],['🌀','aspirador'],['⚫','carvao'],['⚙️','peca'],['📦','']];
const UNITS=['un','saco','kg','t','m','m²','m³','barra','pç','cx','lata','galão','L','rolo','milheiro','par','jogo','pct','folha'];
const COLORS=['#ff5a00','#2d6bd6','#16855f','#7a5bd1','#d6336c','#0f9aa8','#c9890a','#5b6470','#8d5524','#3d9b2f'];
const TIPOS={entrada:{nome:'Entrada',ic:'📥',cls:'in'},saida:{nome:'Saída',ic:'🚚',cls:'out'},devolucao:{nome:'Devolução',ic:'↩️',cls:'back'},ajuste:{nome:'Ajuste',ic:'⚖️',cls:'adj'}};

function blank(){return {empresa:'LANG Engenharia',seq:0,materiais:[],obras:[],movs:[],ultimoResp:'',pessoas:[]}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.materiais)&&Array.isArray(d.obras)&&Array.isArray(d.movs))return Object.assign(blank(),d)}catch(e){}return blank()}
let db=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){toast('⚠️ Não foi possível salvar no aparelho. Exporte um backup.');return false}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ============ Estoque compartilhado ============ */
let modo='consultando', versao=0, confirmado='', ocupada=false, ativando=false;
const nuvem=()=>modo==='online';
const senhaOk=senha=>senha.length>=10&&senha.length<=128;

function bloquearRede(bloquear){
  ocupada=bloquear;
  const anterior=document.getElementById('redeOcupada');
  if(anterior)anterior.remove();
  if(!bloquear)return;
  const aviso=document.createElement('div');
  aviso.id='redeOcupada';
  aviso.setAttribute('role','status');
  aviso.textContent='Aguarde…';
  aviso.style.cssText='position:fixed;z-index:9999;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.6);color:white;text-align:center;padding-top:25vh;font-size:22px';
  if(document.activeElement)document.activeElement.blur();
  document.body.appendChild(aviso);
}
document.addEventListener('keydown',e=>{if(ocupada){e.preventDefault();e.stopImmediatePropagation()}},true);

function usarEstoque(resposta){
  if(resposta.token)EstoqueCompartilhado.sessao(resposta.token);
  db=Object.assign(blank(),resposta.dados);
  versao=resposta.versao;
  confirmado=JSON.stringify(db);
  U=resposta.pessoa;
}

async function persistir(opcoes={}){
  if(!nuvem())return save();
  if(ocupada||!U)return false;
  bloquearRede(true);
  try{
    const resultado=await EstoqueCompartilhado.enviar('salvar',{dados:db,versao,...opcoes});
    versao=resultado.versao;
    U=resultado.pessoa;
    confirmado=JSON.stringify(db);
    return true;
  }catch(err){
    db=JSON.parse(confirmado);
    if(err.status===401)logout(err.message);
    else{
      if(err.status===409)await atualizarEstoque(true);
      toast(err.message);
    }
    return false;
  }finally{bloquearRede(false)}
}

async function atualizarEstoque(conflito){
  const atual=U, revisao=versao;
  if(!nuvem()||!atual||(!conflito&&(ocupada||F||$('#sheetBg')||document.hidden)))return;
  try{
    const resposta=await EstoqueCompartilhado.enviar('ler',{versao:revisao});
    if(!U||U.id!==atual.id||versao!==revisao||(!conflito&&(ocupada||F||$('#sheetBg')))||!resposta.dados)return;
    usarEstoque(resposta);
    if(conflito){F=null;closeSheet();location.hash='#inicio'}
    render();
  }catch(err){if(err.status===401&&U&&U.id===atual.id)logout(err.message)}
}

async function abrirEstoque(){
  // Antes da ativação a cópia original continua disponível para uso e backup.
  try{
    const resposta=await EstoqueCompartilhado.enviar('estado');
    modo=resposta.ativo?'online':'local';
    db=nuvem()?blank():load();
    if(!nuvem()&&(db.catalogo||0)<CATALOGO_VERSAO){aplicaCatalogo();save()}
  }catch(err){modo='indisponivel'}
  render();
}

function telaCompartilhada(){
  if(modo==='consultando'||modo==='indisponivel'){
    return '<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Lang Estoque</b><small>'+
      (modo==='consultando'?'Conectando ao estoque…':'O estoque está indisponível. Confira sua conexão.')+
      '</small></div></div>'+(modo==='indisponivel'?'<button class="btn primary" onclick="abrirEstoque()">Tentar novamente</button>':'')+'</div>';
  }
  return '<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Lang Estoque</b><small>Entre com seu nome e sua senha.</small></div></div>'+
    '<form class="card" style="max-width:460px;margin:0 auto;color:var(--ink)" onsubmit="return entrarCompartilhado(event)">'+
    '<div class="f"><label for="cLogin">Nome conforme o cadastro</label><input id="cLogin" autocomplete="username" required></div>'+
    '<div class="f"><label for="cSenha">Senha</label><input id="cSenha" type="password" autocomplete="current-password" required maxlength="128"></div>'+
    '<button class="btn primary lg full" type="submit">Entrar</button></form></div>';
}

function entrarCompartilhado(evento){
  evento.preventDefault();
  if(ocupada)return false;
  const nome=$('#cLogin').value.trim(),senha=$('#cSenha').value;
  iniciarSessao('entrar',{nome,senha});
  return false;
}

async function iniciarSessao(acao,payload){
  if(ocupada)return;
  bloquearRede(true);
  try{
    if(acao==='ativar'){
      const fotos=await fotoTodas();
      const ids=new Set(payload.dados.movs.filter(mov=>mov.foto).map(mov=>mov.id));
      payload.fotos={};
      Object.keys(fotos).filter(id=>ids.has(id)).forEach(id=>{payload.fotos[id]=fotos[id]});
    }
    const resposta=await EstoqueCompartilhado.enviar(acao,payload);
    modo='online';
    ativando=false;
    usarEstoque(resposta);
    lockSel=null;pinBuf='';lastAct=Date.now();
    if(!location.hash)location.hash='#inicio';
    closeSheet();render();
    toast(acao==='ativar'?'Estoque compartilhado ativado':'Olá, '+U.nome.split(' ')[0]+'!');
  }catch(err){
    if(acao==='ativar'&&err.status===409){ativando=false;await abrirEstoque()}
    toast(err.message);
  }finally{bloquearRede(false)}
}

function telaAtivacao(){
  const admins=db.pessoas.filter(p=>p.admin&&p.ativo!==false);
  const conta=admins.length
    ? '<div class="f"><label for="atAdm">Administrador neste aparelho</label><select id="atAdm">'+admins.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nome)+'</option>').join('')+'</select></div>'+
      '<div class="f"><label for="atPin">PIN usado neste aparelho</label><input id="atPin" type="password" inputmode="numeric" maxlength="4" required></div>'
    : '<div class="f"><label for="atNome">Nome do administrador</label><input id="atNome" maxlength="120" required></div>';
  return '<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Ativar estoque compartilhado</b><small>Faça isso no aparelho onde estão os cadastros.</small></div></div>'+
    '<form class="card" style="max-width:460px;margin:0 auto;color:var(--ink)" onsubmit="return ativarCompartilhado(event)">'+
    '<p class="small muted">A ativação copia os dados deste aparelho para o estoque da equipe. Depois, ajuste as senhas dos demais usuários em Configurações → Pessoas.</p>'+
    conta+'<div class="f"><label for="atCodigo">Código de ativação</label><input id="atCodigo" type="password" autocomplete="off" required></div>'+
    '<div class="f"><label for="atSenha">Nova senha (mínimo de 10 caracteres)</label><input id="atSenha" type="password" autocomplete="new-password" required maxlength="128"></div>'+
    '<div class="f"><label for="atSenha2">Repita a senha</label><input id="atSenha2" type="password" autocomplete="new-password" required maxlength="128"></div>'+
    '<button class="btn primary full" type="submit">Ativar e entrar</button>'+
    '<button class="btn soft full mt" type="button" onclick="ativando=false;renderLock()">Voltar</button></form></div>';
}

function ativarCompartilhado(evento){
  evento.preventDefault();
  if(ocupada)return false;
  const senha=$('#atSenha').value;
  if(!senhaOk(senha)||senha!==$('#atSenha2').value){
    toast('Digite a mesma senha nos dois campos, com pelo menos 10 caracteres.');
    return false;
  }
  const dados=JSON.parse(JSON.stringify(db));
  let pessoa;
  if($('#atAdm')){
    pessoa=dados.pessoas.find(p=>p.id===$('#atAdm').value&&p.admin&&p.ativo!==false);
    if(!pessoa||hpin(pessoa.id,$('#atPin').value)!==pessoa.pin){toast('PIN incorreto.');return false}
  }else{
    const nome=$('#atNome').value.trim();
    if(!nome){toast('Informe o nome do administrador.');return false}
    pessoa={id:uid(),nome,admin:true,ativo:true,criado:Date.now()};
    dados.pessoas.push(pessoa);
  }
  dados.pessoas.forEach(p=>{delete p.pin});
  iniciarSessao('ativar',{codigo:$('#atCodigo').value.trim(),senha,dados,pessoa:pessoa.id});
  return false;
}

/* ============ Utilidades ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Formatação em pt-BR. Aparelhos antigos (iOS 9) não têm Intl: usa um formatador próprio.
function fmtBR(v,dec,fix){const neg=v<0;let x=Math.abs(+v||0);const p=Math.pow(10,dec);x=Math.round(x*p)/p;
  let [i,f]=x.toFixed(dec).split('.');i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'.');if(!fix&&f)f=f.replace(/0+$/,'');return (neg?'-':'')+i+(f?','+f:'')}
const temIntl=typeof Intl!=='undefined'&&Intl.NumberFormat&&(function(){try{return new Intl.NumberFormat('pt-BR').format(1234.5)==='1.234,5'}catch(e){return false}})();
const nf=temIntl?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}):{format:v=>fmtBR(v,2,false)};
const brl=temIntl?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}):{format:v=>'R$ '+fmtBR(v,2,true)};
const brl0=temIntl?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}):{format:v=>'R$ '+fmtBR(v,0,true)};
const fq=v=>nf.format(Math.round((+v||0)*100)/100);
const money=v=>Math.abs(v)>=10000?brl0.format(v):brl.format(v);
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const fdate=s=>s?s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4):'';
const fdateS=s=>s?s.slice(8,10)+'/'+s.slice(5,7):'';
const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const num=v=>{if(typeof v==='number')return v;const s=String(v||'').trim().replace(/\s/g,'');if(!s)return 0;const n=s.includes(',')?s.replace(/\./g,'').replace(',','.'):s;const x=parseFloat(n);return isFinite(x)?x:0};
const matById=id=>db.materiais.find(m=>m.id===id);
const obraById=id=>db.obras.find(o=>o.id===id);
const catIcon=c=>CAT_ICON[c]||'📦';
function guessIcon(nome,cat){const n=norm(nome);for(const [e,k] of ICONS)if(k&&k.split(' ').some(w=>n.includes(w)))return e;return catIcon(cat)}
function matIcon(m){if(!m)return '📦';if(m.foto)return `<img class="mi" src="${esc(m.foto)}" alt="">`;return m.ic||guessIcon(m.nome,m.cat)}
function toast(msg){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
function sortedMovs(){return db.movs.slice().sort((a,b)=>(b.data||'').localeCompare(a.data||'')||(b.criado||0)-(a.criado||0))}

/* ============ Cálculos ============ */
// Saldo no depósito: entradas (sem obra) + devoluções − saídas ± ajustes.
// Entrada com obra = compra entregue direto na obra: conta para a obra, não passa pelo depósito.
function calc(){
  const saldo={},custoTot={},custoQtd={},obraQ={},obraV={},ult={};
  db.materiais.forEach(m=>{saldo[m.id]=0});
  const sorted=db.movs.slice().sort((a,b)=>(a.data||'').localeCompare(b.data||'')||(a.criado||0)-(b.criado||0));
  for(const mv of sorted)for(const it of mv.itens||[]){
    const q=+it.q||0,m=it.m;
    if(mv.tipo==='entrada'){if(!mv.obra)saldo[m]=(saldo[m]||0)+q;if(+it.v>0){custoTot[m]=(custoTot[m]||0)+q*it.v;custoQtd[m]=(custoQtd[m]||0)+q}}
    else if(mv.tipo==='saida')saldo[m]=(saldo[m]||0)-q;
    else if(mv.tipo==='devolucao')saldo[m]=(saldo[m]||0)+q;
    else if(mv.tipo==='ajuste')saldo[m]=(saldo[m]||0)+q;
    ult[m]=mv.data;
  }
  const custo={};db.materiais.forEach(m=>{custo[m.id]=custoQtd[m.id]?custoTot[m.id]/custoQtd[m.id]:(+m.preco||0)});
  for(const mv of db.movs){
    if(!mv.obra)continue;let sg=0;
    if(mv.tipo==='saida'||mv.tipo==='entrada')sg=1;else if(mv.tipo==='devolucao')sg=-1;else continue;
    const oq=obraQ[mv.obra]||(obraQ[mv.obra]={});
    for(const it of mv.itens||[]){const q=sg*(+it.q||0);oq[it.m]=(oq[it.m]||0)+q;
      const v=(mv.tipo==='entrada'&&+it.v>0?+it.v:custo[it.m]||0);obraV[mv.obra]=(obraV[mv.obra]||0)+q*v}
  }
  return {saldo,custo,obraQ,obraV,ult};
}
function status(m,s){if(s<=0)return +m.min>0?{k:'zero',t:'Sem estoque',c:'var(--danger)'}:{k:'none',t:'Sem saldo',c:'#b7b0aa'};if(+m.min>0&&s<=+m.min)return{k:'low',t:'Estoque baixo',c:'var(--warn)'};return{k:'ok',t:'Em estoque',c:'var(--in)'}}
const alerta=k=>k==='zero'||k==='low';
function movValor(mv,C){return (mv.itens||[]).reduce((a,it)=>a+(+it.q||0)*((mv.tipo==='entrada'&&+it.v>0)?+it.v:(C.custo[it.m]||0)),0)}

/* ============ Catálogo padrão ============ */
function aplicaCatalogo(forcar){
  if(typeof CATALOGO==='undefined')return 0;
  if(!forcar&&(db.catalogo||0)>=CATALOGO_VERSAO)return 0;
  const nomes=new Set(db.materiais.map(m=>norm(m.nome)));let n=0;
  for(const [nome,cat,un,ic] of CATALOGO){if(nomes.has(norm(nome)))continue;nomes.add(norm(nome));
    db.materiais.push({id:uid(),nome,cat,un,min:0,preco:0,local:'',ic,foto:'',criado:Date.now()});n++}
  db.catalogo=CATALOGO_VERSAO;return n;
}
/* ============ Pessoas, login (foto + PIN) e permissões ============ */
let U=null,lockSel=null,pinBuf='',falhas=0,bloqAte=0,lastAct=Date.now(),camAtiva=false;
const INATIVO_MS=3*60*1000;
const isAdmin=()=>!!(U&&U.admin);
function hpin(id,pin){let h=2166136261;const s='lang-estoque|'+id+'|'+pin;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
const pessoaById=id=>(db.pessoas||[]).find(p=>p.id===id);
const AVCOR=['#ff5a00','#2d6bd6','#16855f','#7a5bd1','#d6336c','#0f9aa8','#c9890a','#5b6470'];
function avatar(p,size){size=size||40;const st=`width:${size}px;height:${size}px;line-height:${size}px;font-size:${Math.round(size*.4)}px`;
  if(p&&p.foto)return `<img class="av" src="${esc(p.foto)}" style="${st}" alt="">`;
  const nm=(p&&p.nome)||'?',ini=nm.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  let h=0;for(let i=0;i<nm.length;i++)h=(h*31+nm.charCodeAt(i))>>>0;
  return `<span class="av" style="${st};background:${AVCOR[h%AVCOR.length]}">${esc(ini)}</span>`}
function soAdmin(){if(isAdmin())return true;toast('🔒 Só o administrador pode fazer isso');return false}
function logout(msg){if(nuvem()){EstoqueCompartilhado.sair();db=blank();confirmado='';versao=0}U=null;lockSel=null;pinBuf='';F=null;window._onClose=null;closeSheet();if(location.hash&&location.hash!=='#inicio')location.hash='#inicio';render();if(msg)toast(msg)}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{lastAct=Date.now()},{passive:true}));
setInterval(()=>{if(U&&!ocupada&&!camAtiva&&Date.now()-lastAct>INATIVO_MS)logout('Sessão encerrada por inatividade')},15000);

function renderLock(){
  const el=$('#lock'),ps=(db.pessoas||[]).filter(p=>p.ativo!==false);
  if(modo!=='local'){el.innerHTML=telaCompartilhada();return}
  if(ativando){el.innerHTML=telaAtivacao();return}
  const ativar='<div style="text-align:center;margin:18px"><button class="btn soft" onclick="ativando=true;renderLock()">Ativar estoque compartilhado</button></div>';
  if(!ps.some(p=>p.admin)){el.innerHTML=setupHTML()+ativar;return}
  if(lockSel&&pessoaById(lockSel)){const p=pessoaById(lockSel);
    el.innerHTML=`<div class="lock"><div class="pinbox">
      <button class="link" style="color:#ff9a5f" onclick="lockSel=null;pinBuf='';renderLock()">‹ Trocar pessoa</button>
      <div style="margin-top:22px">${avatar(p,96)}</div><h2 style="margin-top:12px">${esc(p.nome)}</h2>
      <div class="pdots" id="pdots">${[0,1,2,3].map(i=>`<i class="${i<pinBuf.length?'on':''}"></i>`).join('')}</div>
      <div id="pmsg" style="min-height:22px;color:#ffb38a;font-weight:700;font-size:14px">${Date.now()<bloqAte?'Muitas tentativas. Aguarde 30 segundos.':'Digite seu PIN'}</div>
      <div class="kpad" style="margin-top:14px">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k?`<button onclick="pinKey('${k}')">${k}</button>`:'<span></span>').join('')}</div>
    </div></div>`;return}
  el.innerHTML=`<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>${esc((db.empresa||'Lang').split(' ')[0])} Estoque</b><small>Quem está usando? Toque na sua foto.</small></div></div>
    <div class="people">${ps.map(p=>`<button class="person" onclick="lockSel='${p.id}';pinBuf='';renderLock()">${avatar(p,88)}<span>${esc(p.nome)}</span>${p.admin?'<small>Administrador</small>':''}</button>`).join('')}</div></div>`;
  el.insertAdjacentHTML('beforeend',ativar);
}
function pinKey(k){
  if(Date.now()<bloqAte)return;
  if(k==='⌫')pinBuf=pinBuf.slice(0,-1);else if(pinBuf.length<4)pinBuf+=k;
  const d=$('#pdots');d.innerHTML=[0,1,2,3].map(i=>`<i class="${i<pinBuf.length?'on':''}"></i>`).join('');
  if(pinBuf.length<4)return;
  const p=pessoaById(lockSel);
  if(p&&hpin(p.id,pinBuf)===p.pin){falhas=0;U=p;lockSel=null;pinBuf='';lastAct=Date.now();if(!location.hash)location.hash='#inicio';render();toast('Olá, '+p.nome.split(' ')[0]+'!');return}
  falhas++;pinBuf='';d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');
  setTimeout(()=>{d.innerHTML=[0,1,2,3].map(()=>'<i></i>').join('')},350);
  if(falhas>=5){bloqAte=Date.now()+30000;falhas=0;$('#pmsg').textContent='Muitas tentativas. Aguarde 30 segundos.';setTimeout(()=>{if($('#pmsg'))$('#pmsg').textContent='Digite seu PIN'},30000)}
  else $('#pmsg').textContent='PIN errado. Tente de novo.';
}
function setupHTML(){
  return `<div class="lock"><div class="lock-h"><span class="mk">📦</span><div><b>Primeiro acesso</b><small>Cadastre o administrador do estoque.</small></div></div>
  <div class="card" style="max-width:460px;margin:0 auto;color:var(--ink)">
    <p class="muted small" style="margin-top:0">O administrador cadastra as pessoas, corrige saldos e exclui lançamentos. Os outros só lançam entradas, saídas e devoluções.</p>
    <div class="f"><label>Seu nome</label><input id="sNome" autocomplete="off" placeholder="Ex.: Geovane Lang"></div>
    <div class="f"><label>Sua foto <span class="muted">(aparece na tela de login)</span></label>
      <div style="display:flex;gap:12px;align-items:center"><span id="sPrev">${avatar({nome:'?'},64)}</span>
      <label class="btn soft" style="cursor:pointer">📷 Tirar foto<input type="file" accept="image/*" capture="user" class="hidden" onchange="pFotoSel(this,'sPrev')"></label></div></div>
    <div class="f2"><div class="f"><label>PIN (4 números)</label><input id="sPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"></div>
    <div class="f"><label>Repita o PIN</label><input id="sPin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"></div></div>
    <button class="btn primary lg full" onclick="criarAdmin()">Criar administrador e entrar</button>
    <p class="muted small" style="margin-bottom:0">Guarde bem o PIN: sem ele não dá para entrar como administrador.</p>
  </div></div>`;
}
let pFotoTmp='';
async function pFotoSel(inp,prev){const f=inp.files[0];inp.value='';if(!f)return;try{pFotoTmp=await fotoReduzida(f);$('#'+prev).innerHTML=`<img class="av" src="${pFotoTmp}" style="width:64px;height:64px">`}catch(e){toast('Não foi possível ler a foto')}}
const pinOk=p=>/^\d{4}$/.test(p);
function criarAdmin(){
  const nome=$('#sNome').value.trim(),a=$('#sPin').value,b=$('#sPin2').value;
  if(!nome)return toast('Informe seu nome');if(!pinOk(a))return toast('O PIN precisa ter 4 números');if(a!==b)return toast('Os dois PINs não são iguais');
  const id=uid(),p={id,nome,foto:pFotoTmp,pin:hpin(id,a),admin:true,ativo:true,criado:Date.now()};
  db.pessoas=(db.pessoas||[]).concat(p);pFotoTmp='';save();U=p;lastAct=Date.now();location.hash='#inicio';render();toast('Administrador criado');
}
function pessoasSec(){
  const ps=db.pessoas||[];
  return `<div class="sec"><h2>👥 Pessoas</h2><span class="sp"></span><button class="btn primary" style="padding:8px 12px" onclick="formPessoa()">＋ Pessoa</button></div>
  <div class="list">${ps.map(p=>`<button class="row" onclick="formPessoa('${p.id}')" style="${p.ativo===false?'opacity:.5':''}">${avatar(p,44)}<span class="tx"><div class="t">${esc(p.nome)}</div><div class="s">${p.admin?'⭐ Administrador':'Lança entradas, saídas e devoluções'}${p.ativo===false?' · desativado':''}</div></span><span class="muted">›</span></button>`).join('')}</div>`;
}
function formPessoa(id){
  if(!soAdmin())return;
  const p=id?pessoaById(id):{nome:'',foto:'',admin:false,ativo:true};pFotoTmp=p.foto||'';
  const campoSenha=nuvem()
    ? `<div class="f"><label>${id?'Nova senha (em branco, mantém a atual)':'Senha (mínimo de 10 caracteres)'}</label><input id="pPin" type="password" maxlength="128" autocomplete="new-password"></div>`
    : `<div class="f"><label>${id?'Novo PIN (deixe em branco para manter)':'PIN (4 números)'}</label><input id="pPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"></div>`;
  sheet(id?'✏️ Editar pessoa':'👤 Nova pessoa',`
   <div class="f"><label>Nome</label><input id="pNome" value="${esc(p.nome)}" autocomplete="off" placeholder="Ex.: Carlos (mestre de obras)"></div>
   <div class="f"><label>Foto</label><div style="display:flex;gap:12px;align-items:center"><span id="pPrev">${avatar(p,64)}</span>
     <label class="btn soft" style="cursor:pointer">📷 Tirar foto<input type="file" accept="image/*" capture="user" class="hidden" onchange="pFotoSel(this,'pPrev')"></label></div></div>
   ${campoSenha}
   <label class="chk"><input type="checkbox" id="pAdm" ${p.admin?'checked':''}> <span><b>Administrador</b><br><span class="muted small">Pode excluir lançamentos, corrigir saldo, cadastrar pessoas e mexer nas configurações.</span></span></label>
   ${id?`<label class="chk"><input type="checkbox" id="pAtv" ${p.ativo!==false?'checked':''}> <span><b>Ativo</b><br><span class="muted small">Desative quem saiu da empresa: some da tela de login, mas o histórico continua.</span></span></label>
   ${U&&U.id!==id?`<button class="btn danger full" onclick="delPessoa('${id}')">🗑️ Excluir pessoa</button><div class="small muted mt">Os lançamentos que ela fez continuam no histórico com o nome dela.</div>`:'<div class="small muted">Você não pode excluir a si mesmo.</div>'}`:''}`,
   `<button class="btn primary lg full" onclick="salvarPessoa('${id||''}')">Salvar</button>`);
}
async function salvarPessoa(id){
  const nome=$('#pNome').value.trim(),pin=$('#pPin').value,adm=$('#pAdm').checked,atv=id?$('#pAtv').checked:true;
  if(!nome)return toast('Informe o nome');
  if((!id||pin)&&!(nuvem()?senhaOk(pin):pinOk(pin)))return toast(nuvem()?'A senha precisa ter entre 10 e 128 caracteres.':'O PIN precisa ter 4 números');
  const outrosAdm=(db.pessoas||[]).filter(x=>x.id!==id&&x.admin&&x.ativo!==false).length;
  if(id&&(!adm||!atv)&&!outrosAdm)return toast('Precisa existir pelo menos um administrador ativo');
  const pid=id||uid();
  const p=id?pessoaById(id):{id:pid,criado:Date.now()};
  Object.assign(p,{nome,foto:pFotoTmp,admin:adm,ativo:atv});
  if(!nuvem()&&pin)p.pin=hpin(pid,pin);
  if(!id)db.pessoas.push(p);
  if(!await persistir(nuvem()&&pin?{credencial:{id:pid,senha:pin}}:undefined))return;
  if(!nuvem()&&U&&U.id===id)U=p;
  pFotoTmp='';config();toast('Pessoa salva');
  if(U&&!U.admin)logout();
}

async function delPessoa(id){
  if(!soAdmin())return;const p=pessoaById(id);if(!p)return;
  if(U&&U.id===id)return toast('Você não pode excluir a si mesmo');
  if(p.admin&&!(db.pessoas||[]).some(x=>x.id!==id&&x.admin&&x.ativo!==false))return toast('Precisa existir pelo menos um administrador ativo');
  if(!confirm(`Excluir ${p.nome}? Ela não poderá mais entrar no app. Os lançamentos dela continuam no histórico.`))return;
  db.movs.forEach(mv=>{if(mv.por===id&&!mv.porNome)mv.porNome=p.nome});
  db.pessoas=db.pessoas.filter(x=>x.id!==id);if(!await persistir())return;config();toast('Pessoa excluída');
}
/* ============ Selfie no lançamento ============ */
let idbP=null;
function idb(){return idbP||(idbP=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('sem IndexedDB'));setTimeout(()=>rej(new Error('IndexedDB não respondeu')),3000);const r=indexedDB.open('lang-estoque',1);r.onupgradeneeded=()=>r.result.createObjectStore('fotos');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))}
function idbOp(mode,fn){return idb().then(d=>new Promise((res,rej)=>{const t=d.transaction('fotos',mode),q=fn(t.objectStore('fotos'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}))}
const LSF='lang-estoque-foto:';
const fotoPut=(k,v)=>idbOp('readwrite',s=>s.put(v,k)).catch(()=>{localStorage.setItem(LSF+k,v)});
const fotoGet=k=>idbOp('readonly',s=>s.get(k)).catch(()=>null).then(v=>v||localStorage.getItem(LSF+k));
const fotoDel=k=>idbOp('readwrite',s=>s.delete(k)).catch(()=>{}).then(()=>{try{localStorage.removeItem(LSF+k)}catch(e){}});
function fotoTodas(){const ls={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.indexOf(LSF)===0)ls[k.slice(LSF.length)]=localStorage.getItem(k)}}catch(e){}
  return fotoTodasIdb().catch(()=>({})).then(o=>Object.assign(ls,o))}
function fotoTodasIdb(){return idb().then(d=>new Promise((res,rej)=>{const out={},t=d.transaction('fotos','readonly'),c=t.objectStore('fotos').openCursor();c.onsuccess=()=>{const x=c.result;if(x){out[x.key]=x.value;x.continue()}};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)}))}
// Abre a câmera frontal, conta 3-2-1 e tira a foto. Resolve: dataURL, '' (sem foto) ou undefined (cancelado).
function selfie(){return new Promise(resolve=>{
  sheet('📸 Foto de quem está lançando',`<div class="cam"><video id="camV" playsinline autoplay muted></video><div class="cd" id="camCd">⏳</div></div>
    <p class="muted small" style="text-align:center" id="camMsg">Olhe para a câmera…</p>`,
   `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn soft" id="camSkip">Lançar sem foto</button>
    <label class="btn dark" style="flex:1;cursor:pointer">📷 Abrir câmera do aparelho<input type="file" accept="image/*" capture="user" id="camFile" class="hidden"></label></div>`);
  let stream=null,done=false,timer=null;camAtiva=true;
  const parar=()=>{camAtiva=false;lastAct=Date.now();clearInterval(timer);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null};
  const fim=v=>{if(done)return;done=true;parar();window._onClose=null;closeSheet();resolve(v)};
  window._onClose=()=>{if(!done){done=true;parar();resolve(undefined)}};
  $('#camSkip').onclick=()=>fim('');
  $('#camFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{fim(await fotoReduzida(f))}catch(err){toast('Não foi possível ler a foto')}};
  const falhou=()=>{$('#camCd').textContent='📷';$('#camMsg').textContent='Câmera indisponível aqui. Toque em "Abrir câmera do aparelho".'};
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){falhou();return}
  navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:640}},audio:false}).then(s=>{
    if(done){s.getTracks().forEach(t=>t.stop());return}
    stream=s;const v=$('#camV');v.srcObject=s;const p=v.play();if(p&&p.catch)p.catch(()=>{});
    let n=3;$('#camCd').textContent=n;
    timer=setInterval(()=>{n--;if(n>0){$('#camCd').textContent=n;return}clearInterval(timer);
      const S=240,c=document.createElement('canvas'),w=v.videoWidth,h=v.videoHeight;if(!w||!h){falhou();return}
      const k=Math.min(w,h);c.width=c.height=S;const g=c.getContext('2d');g.translate(S,0);g.scale(-1,1);g.drawImage(v,(w-k)/2,(h-k)/2,k,k,0,0,S,S);
      fim(c.toDataURL('image/jpeg',.6))},900);
  }).catch(falhou);
})}

/* ============ Rotas ============ */
function route(){const h=(location.hash||'#inicio').slice(1).split('/');return{p:h[0]||'inicio',id:h[1]?decodeURIComponent(h[1]):null}}
const state={fEst:'',fCat:'',fStatus:'',fMovTipo:'',fMovObra:'',fMovPer:'30',fObraSt:'ativa'};
function render(){
  if(!U||!pessoaById(U.id)||pessoaById(U.id).ativo===false){U=null;document.body.classList.add('locked');renderLock();return}
  U=pessoaById(U.id);document.body.classList.remove('locked');$('#lock').innerHTML='';
  $('#btnCfg').classList.toggle('hidden',!isAdmin());
  $('#btnUser').innerHTML=avatar(U,30)+'<span>'+esc(U.nome.split(' ')[0])+' · Sair</span>';
  const r=route();
  document.querySelectorAll('[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===r.p||(r.p==='obra'&&a.dataset.r==='obras')||(r.p==='mat'&&a.dataset.r==='estoque')));
  $('#brandName').textContent=db.empresa?db.empresa.split(' ')[0]+' Estoque':'Estoque';
  const C=calc(),app=$('#app');
  const views={inicio:vInicio,estoque:vEstoque,obras:vObras,movs:vMovs,obra:vObra,mat:vMat,mov:vMov};
  document.body.classList.toggle('movmode',r.p==='mov');
  app.innerHTML=(views[r.p]||vInicio)(C,r.id);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{window._onClose=null;closeSheet();render()});

/* ============ Telas ============ */
function vInicio(C){
  if(!db.materiais.length&&!db.obras.length)return `
    <div class="card empty"><div class="i">📦🏗️</div><h3>Bem-vindo ao controle de estoque</h3>
    <p>Cadastre seus materiais e obras e registre cada entrada e saída.<br>Tudo fica salvo neste aparelho e funciona sem internet.</p>
    <div class="grid" style="max-width:340px;margin:0 auto">
      <button class="btn primary lg" onclick="formObra()">🏗️ Cadastrar primeira obra</button>
      <button class="btn dark lg" onclick="formMaterial()">📦 Cadastrar primeiro material</button>
      <button class="btn soft" onclick="loadDemo()">Ver com dados de exemplo</button>
    </div></div>`;
  const mats=db.materiais,obrasAt=db.obras.filter(o=>o.status!=='concluida');
  const low=mats.filter(m=>alerta(status(m,C.saldo[m.id]).k)).sort((a,b)=>C.saldo[a.id]-C.saldo[b.id]);
  const valorEst=mats.reduce((a,m)=>a+Math.max(0,C.saldo[m.id])*(C.custo[m.id]||0),0);
  const d30=daysAgo(30),m30=db.movs.filter(m=>m.data>=d30);
  // saídas por obra (30 dias)
  const por={};let temValor=false;
  for(const mv of m30){if(!mv.obra||!(mv.tipo==='saida'||mv.tipo==='entrada'))continue;const v=movValor(mv,C);if(v>0)temValor=true;
    const p=por[mv.obra]||(por[mv.obra]={v:0,n:0});p.v+=v;p.n+=(mv.itens||[]).length}
  const porArr=Object.entries(por).map(([id,x])=>({o:obraById(id),...x})).filter(x=>x.o).sort((a,b)=>temValor?b.v-a.v:b.n-a.n);
  const mx=Math.max(1,...porArr.map(x=>temValor?x.v:x.n));
  // movimento diário 14 dias
  const days=[];for(let i=13;i>=0;i--)days.push(daysAgo(i));
  const cnt=days.map(d=>({d,e:0,s:0}));
  for(const mv of db.movs){const k=days.indexOf(mv.data);if(k<0)continue;const n=(mv.itens||[]).length;if(mv.tipo==='entrada')cnt[k].e+=n;else if(mv.tipo==='saida')cnt[k].s+=n}
  const mxc=Math.max(1,...cnt.map(c=>Math.max(c.e,c.s)));
  const ult=sortedMovs().slice(0,6);
  return `${!db.obras.length?`<div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:12px;border:2px dashed #f0c7ad;background:#fff8f3"><span style="font-size:30px">🏗️</span><div style="flex:1"><b>Cadastre suas obras</b><div class="muted small">Para poder enviar material para elas.</div></div><button class="btn primary" onclick="formObra()">＋ Obra</button></div>`:''}
  <div class="quick">
    <button class="qa in" onclick="formMov('entrada')"><span class="i">📥</span>Entrada<small>chegou material</small></button>
    <button class="qa out" onclick="formMov('saida')"><span class="i">🚚</span>Saída<small>enviar p/ obra</small></button>
    <button class="qa back" onclick="formMov('devolucao')"><span class="i">↩️</span>Devolução<small>voltou da obra</small></button>
  </div>
  <div class="grid g4 mt">
    <a class="card kpi" href="#estoque" style="text-decoration:none;color:inherit"><span class="e">📦</span><div class="l">Materiais</div><div class="v">${mats.length}</div></a>
    <a class="card kpi ${low.length?'alert':''}" href="#estoque" onclick="state.fStatus='baixo'" style="text-decoration:none;color:inherit"><span class="e">${low.length?'⚠️':'✅'}</span><div class="l">Abaixo do mínimo</div><div class="v">${low.length}</div></a>
    <a class="card kpi" href="#obras" style="text-decoration:none;color:inherit"><span class="e">🏗️</span><div class="l">Obras ativas</div><div class="v">${obrasAt.length}</div></a>
    <div class="card kpi"><span class="e">💰</span><div class="l">Valor no depósito</div><div class="v" style="font-size:${valorEst>=1e5?21:25}px">${valorEst?money(valorEst):'—'}</div></div>
  </div>
  ${low.length?`<div class="sec"><h2>⚠️ Precisa comprar</h2><span class="sp"></span><a href="#estoque" onclick="state.fStatus='baixo'">ver todos</a></div>
   <div class="list">${low.slice(0,4).map(m=>matRow(m,C)).join('')}</div>`:''}
  <div class="grid mt2" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    <div class="card"><h3 style="font-size:15px">Para onde foi o material <span class="muted small">· 30 dias</span></h3>
      <div class="bars mt">${porArr.length?porArr.slice(0,7).map(x=>`<a href="#obra/${x.o.id}" class="bar-row" style="text-decoration:none;color:inherit"><span class="n"><span class="dot" style="background:${x.o.cor}"></span>${esc(x.o.nome)}</span>
        <span class="bar-track"><span class="bar-fill" style="display:block;width:${Math.round((temValor?x.v:x.n)/mx*100)}%;background:${x.o.cor}"></span></span>
        <span class="val">${temValor?money(x.v):x.n+' itens'}</span></a>`).join(''):'<p class="muted small">Nenhuma saída para obra nos últimos 30 dias.</p>'}</div></div>
    <div class="card"><h3 style="font-size:15px">Itens movimentados <span class="muted small">· 14 dias</span></h3>
      <div class="cols">${cnt.map(c=>`<div class="c" title="${fdate(c.d)}: ${c.e} item(ns) de entrada, ${c.s} de saída"><div style="display:flex;gap:2px;align-items:flex-end;height:100%"><i style="flex:1;height:${c.e/mxc*100}%;background:var(--in)"></i><i style="flex:1;height:${c.s/mxc*100}%;background:var(--out)"></i></div></div>`).join('')}</div>
      <div class="cols-x">${cnt.map((c,i)=>`<span>${i%2?'':c.d.slice(8,10)}</span>`).join('')}</div>
      <div class="legend"><span><i class="dot" style="background:var(--in)"></i>Entradas</span><span><i class="dot" style="background:var(--out)"></i>Saídas</span></div></div>
  </div>
  <div class="sec"><h2>Últimas movimentações</h2><span class="sp"></span><a href="#movs">ver todas</a></div>
  <div class="list">${ult.length?ult.map(mv=>movRow(mv,C)).join(''):'<div class="card muted small">Nenhuma movimentação ainda. Use os botões acima.</div>'}</div>`;
}

function matRow(m,C){
  const s=C.saldo[m.id]||0,st=status(m,s),ref=Math.max(+m.min*3||0,s,1);
  return `<a class="row" href="#mat/${m.id}"><span class="ic">${matIcon(m)}</span>
   <span class="tx"><div class="t">${esc(m.nome)}</div><div class="s"><span class="pill ${st.k}">${st.t}</span> ${+m.min?'· mín. '+fq(m.min):''}${m.local?' · '+esc(m.local):''}</div>
   <div class="lvl"><i style="width:${Math.max(0,Math.min(100,s/ref*100))}%;background:${st.c}"></i></div></span>
   <span class="r"><div class="q" style="color:${s<=0?'var(--danger)':'inherit'}">${fq(s)}</div><div class="u">${esc(m.un)}</div></span></a>`;
}
function movRow(mv,C){
  const t=TIPOS[mv.tipo]||TIPOS.ajuste,o=obraById(mv.obra),its=mv.itens||[];
  const nomes=its.map(it=>{const m=matById(it.m);return (m?m.nome:'(excluído)')}).join(', ');
  const dest=mv.tipo==='saida'?'→ '+(o?o.nome:'?'):mv.tipo==='devolucao'?'← '+(o?o.nome:'?'):mv.tipo==='entrada'?(o?'direto na '+o.nome:(mv.forn||'Depósito')):(mv.obs||'Correção de saldo');
  const q1=its.length===1?(()=>{const m=matById(its[0].m);return `<div class="q">${its[0].q>0&&mv.tipo!=='saida'?'+':mv.tipo==='saida'?'−':''}${fq(Math.abs(its[0].q))}</div><div class="u">${m?esc(m.un):''}</div>`})():`<div class="q">${its.length}</div><div class="u">itens</div>`;
  return `<button class="row" onclick="verMov('${mv.id}')"><span class="ic ${t.cls}">${t.ic}</span>
   <span class="tx"><div class="t">${esc(nomes)||'—'}</div><div class="s">${o?`<span class="dot" style="background:${o.cor};width:8px;height:8px"></span> `:''}${esc(dest)} · ${fdateS(mv.data)}${mv.porNome?' · 👤 '+esc(mv.porNome.split(' ')[0]):''}</div></span>
   <span class="r">${q1}</span></button>`;
}

function vEstoque(C){
  if(!db.materiais.length)return `<div class="card empty"><div class="i">📦</div><h3>Nenhum material cadastrado</h3><p>Cadastre cimento, areia, aço, tijolos… com unidade e estoque mínimo.</p><button class="btn primary lg" onclick="formMaterial()">＋ Novo material</button></div>`;
  const ws=norm(state.fEst).split(/\s+/).filter(Boolean);
  let ms=db.materiais.filter(m=>(ws.every(w=>norm(m.nome+' '+(m.local||'')+' '+m.cat).includes(w)))&&(!state.fCat||m.cat===state.fCat));
  if(state.fStatus==='baixo')ms=ms.filter(m=>alerta(status(m,C.saldo[m.id]).k));
  ms.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
  const cats=[...new Set(db.materiais.map(m=>m.cat))];
  const nLow=db.materiais.filter(m=>alerta(status(m,C.saldo[m.id]).k)).length;
  return `<div class="sec" style="margin-top:4px"><h2 style="font-size:22px">Estoque</h2><span class="sp"></span><button class="btn primary" onclick="formMaterial()">＋ Material</button></div>
  <div class="search"><input id="qEst" placeholder="🔎 Buscar material…" value="${esc(state.fEst)}" oninput="state.fEst=this.value;clearTimeout(window._t);window._t=setTimeout(()=>{render();const i=$('#qEst');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)"></div>
  <div class="chips">
    <button class="chip ${!state.fCat&&!state.fStatus?'on':''}" onclick="state.fCat='';state.fStatus='';render()">Todos</button>
    <button class="chip ${state.fStatus==='baixo'?'on':''}" onclick="state.fStatus=state.fStatus==='baixo'?'':'baixo';render()">⚠️ Comprar (${nLow})</button>
    ${cats.map(c=>`<button class="chip ${state.fCat===c?'on':''}" data-c="${esc(c)}" onclick="state.fCat=state.fCat===this.dataset.c?'':this.dataset.c;render()">${catIcon(c)} ${esc(c)}</button>`).join('')}
  </div>
  <div class="list">${ms.length?ms.map(m=>matRow(m,C)).join(''):'<div class="card muted small">Nada encontrado.</div>'}</div>`;
}

function vMat(C,id){
  const m=matById(id);if(!m)return notFound();
  const s=C.saldo[m.id]||0,st=status(m,s),c=C.custo[m.id]||0;
  const usos=db.obras.map(o=>({o,q:(C.obraQ[o.id]||{})[m.id]||0})).filter(x=>x.q>0).sort((a,b)=>b.q-a.q);
  const mx=Math.max(1,...usos.map(x=>x.q));
  const movs=sortedMovs().filter(mv=>(mv.itens||[]).some(it=>it.m===m.id));
  return `<a class="link" href="#estoque">‹ Estoque</a>
  <div class="card mt" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
    <div class="ic" style="width:64px;height:64px;border-radius:18px;background:#f3f0ec;display:grid;place-items:center;font-size:34px">${matIcon(m)}</div>
    <div style="flex:1;min-width:180px"><h1 style="font-size:21px">${esc(m.nome)}</h1><div class="muted small" style="margin-top:4px">${esc(m.cat)}${m.local?' · 📍 '+esc(m.local):''}</div>
      <div style="margin-top:8px"><span class="pill ${st.k}">${st.t}</span></div></div>
    <div style="text-align:right"><div class="muted small b">No depósito</div><div class="big-saldo" style="color:${st.c}">${fq(s)}</div><div class="muted b">${esc(m.un)}</div></div>
  </div>
  <div class="grid g4 mt">
    <div class="card kpi"><div class="l">Estoque mínimo</div><div class="v">${+m.min?fq(m.min):'—'}</div></div>
    <div class="card kpi"><div class="l">Custo médio</div><div class="v" style="font-size:20px">${c?brl.format(c):'—'}</div></div>
    <div class="card kpi"><div class="l">Valor em estoque</div><div class="v" style="font-size:20px">${c&&s>0?money(s*c):'—'}</div></div>
    <div class="card kpi"><div class="l">Última movimentação</div><div class="v" style="font-size:20px">${C.ult[m.id]?fdate(C.ult[m.id]):'—'}</div></div>
  </div>
  <div class="actions">
    <button class="btn primary" onclick="formMov('entrada',{m:'${m.id}'})">📥 Entrada</button>
    <button class="btn dark" onclick="formMov('saida',{m:'${m.id}'})">🚚 Enviar p/ obra</button>
    ${isAdmin()?`<button class="btn soft" onclick="formAjuste('${m.id}')">⚖️ Corrigir saldo</button>`:''}
    <button class="btn soft" onclick="formMaterial('${m.id}')">✏️ Editar</button>
  </div>
  <div class="sec"><h2>Usado nas obras</h2></div>
  <div class="card">${usos.length?`<div class="bars">${usos.map(x=>`<a href="#obra/${x.o.id}" class="bar-row" style="text-decoration:none;color:inherit"><span class="n"><span class="dot" style="background:${x.o.cor}"></span>${esc(x.o.nome)}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${x.q/mx*100}%;background:${x.o.cor}"></span></span><span class="val">${fq(x.q)} ${esc(m.un)}</span></a>`).join('')}</div>`:'<p class="muted small" style="margin:0">Ainda não foi enviado para nenhuma obra.</p>'}</div>
  <div class="sec"><h2>Histórico</h2></div>
  <div class="list">${movs.length?movs.slice(0,60).map(mv=>movRowMat(mv,m)).join(''):'<div class="card muted small">Sem movimentações.</div>'}</div>`;
}
function movRowMat(mv,m){
  const t=TIPOS[mv.tipo],o=obraById(mv.obra),q=(mv.itens||[]).filter(it=>it.m===m.id).reduce((a,it)=>a+(+it.q||0),0);
  const sinal=mv.tipo==='saida'?-1:(mv.tipo==='entrada'&&mv.obra)?0:1,val=sinal*q;
  const desc=mv.tipo==='saida'?'Enviado para '+(o?o.nome:'?'):mv.tipo==='devolucao'?'Devolvido por '+(o?o.nome:'?'):mv.tipo==='entrada'?(o?'Entregue direto na '+o.nome:'Entrada'+(mv.forn?' · '+mv.forn:'')):(mv.obs||'Ajuste de saldo');
  return `<button class="row" onclick="verMov('${mv.id}')"><span class="ic ${t.cls}">${t.ic}</span><span class="tx"><div class="t">${esc(desc)}</div><div class="s">${fdate(mv.data)}${mv.resp?' · '+esc(mv.resp):''}${mv.doc?' · '+esc(mv.doc):''}</div></span>
  <span class="r"><div class="q" style="color:${val<0?'var(--out)':val>0?'var(--in)':'inherit'}">${val>0?'+':val<0?'−':''}${fq(Math.abs(sinal?val:q))}</div><div class="u">${esc(m.un)}</div></span></button>`;
}

function vObras(C){
  if(!db.obras.length)return `<div class="card empty"><div class="i">🏗️</div><h3>Nenhuma obra cadastrada</h3><p>Cadastre as obras para onde o material é enviado. Cada uma ganha uma cor para ficar fácil de identificar.</p><button class="btn primary lg" onclick="formObra()">＋ Nova obra</button></div>`;
  const os=db.obras.filter(o=>state.fObraSt==='todas'||(state.fObraSt==='ativa'?o.status!=='concluida':o.status==='concluida'));
  return `<div class="sec" style="margin-top:4px"><h2 style="font-size:22px">Obras</h2><span class="sp"></span><button class="btn primary" onclick="formObra()">＋ Obra</button></div>
  <div class="chips">${[['ativa','Em andamento'],['concluida','Concluídas'],['todas','Todas']].map(([k,l])=>`<button class="chip ${state.fObraSt===k?'on':''}" onclick="state.fObraSt='${k}';render()">${l}</button>`).join('')}</div>
  <div class="grid g3">${os.map(o=>{
    const rem=db.movs.filter(mv=>mv.obra===o.id&&(mv.tipo==='saida'||mv.tipo==='entrada'));
    const last=rem.reduce((a,mv)=>mv.data>a?mv.data:a,'');
    const nIt=Object.values(C.obraQ[o.id]||{}).filter(q=>q>0).length;
    return `<a class="card obra" href="#obra/${o.id}" style="--c:${o.cor}">
      <div style="display:flex;gap:8px;align-items:flex-start"><h3 style="flex:1">${esc(o.nome)}</h3>${o.status==='concluida'?'<span class="pill gray">Concluída</span>':''}</div>
      <div class="muted small" style="margin-top:3px">${esc(o.end||'')}${o.resp?(o.end?' · ':'')+'👷 '+esc(o.resp):''}</div>
      <div class="meta"><div><b>${C.obraV[o.id]?money(C.obraV[o.id]):'—'}</b>enviado</div><div><b>${nIt}</b>materiais</div><div><b>${last?fdateS(last):'—'}</b>última</div></div></a>`}).join('')||'<div class="card muted small">Nenhuma obra nesta lista.</div>'}</div>`;
}

function vObra(C,id){
  const o=obraById(id);if(!o)return notFound();
  const oq=C.obraQ[o.id]||{};
  const linhas=Object.entries(oq).map(([mid,q])=>({m:matById(mid),q})).filter(x=>x.m&&Math.abs(x.q)>1e-9).map(x=>({...x,v:x.q*(C.custo[x.m.id]||0)})).sort((a,b)=>b.v-a.v||b.q-a.q);
  const movs=sortedMovs().filter(mv=>mv.obra===o.id);
  const rem=movs.filter(mv=>mv.tipo==='saida'||mv.tipo==='entrada');
  const mxv=Math.max(1,...linhas.map(x=>x.v));const temV=linhas.some(x=>x.v>0);
  // por categoria
  const porCat={};linhas.forEach(x=>{porCat[x.m.cat]=(porCat[x.m.cat]||0)+(temV?x.v:1)});
  const catArr=Object.entries(porCat).sort((a,b)=>b[1]-a[1]),totCat=catArr.reduce((a,x)=>a+x[1],0)||1;
  return `<a class="link" href="#obras">‹ Obras</a>
  <div class="hero mt" style="--c:${o.cor}">
    <h1>${esc(o.nome)}</h1><div class="sub">${esc(o.end||'')}${o.resp?' · 👷 '+esc(o.resp):''}${o.status==='concluida'?' · ✔ Concluída':''}</div>
    <div class="meta"><div><b>${C.obraV[o.id]?money(C.obraV[o.id]):'—'}</b>em material</div><div><b>${rem.length}</b>remessas</div><div><b>${linhas.length}</b>materiais</div><div><b>${rem[0]?fdate(rem[0].data):'—'}</b>última remessa</div></div>
    <div class="actions" style="position:relative;z-index:1">
      <button class="btn white" onclick="formMov('saida',{obra:'${o.id}'})">🚚 Enviar material</button>
      <button class="btn ghost" onclick="formMov('devolucao',{obra:'${o.id}'})">↩️ Devolução</button>
      <button class="btn ghost" onclick="printObra('${o.id}')">🖨️ Relatório</button>
      <button class="btn ghost" onclick="formObra('${o.id}')">✏️</button>
    </div>
  </div>
  ${catArr.length>1?`<div class="card mt"><div class="muted small b" style="margin-bottom:8px">Divisão por tipo ${temV?'(valor)':''}</div>
    <div style="display:flex;height:16px;border-radius:9px;overflow:hidden">${catArr.map(([c,v],i)=>`<span title="${esc(c)}" style="width:${v/totCat*100}%;background:${COLORS[i%COLORS.length]}"></span>`).join('')}</div>
    <div class="legend" style="flex-wrap:wrap;gap:6px 14px">${catArr.map(([c,v],i)=>`<span><i class="dot" style="background:${COLORS[i%COLORS.length]}"></i>${catIcon(c)} ${esc(c)} ${Math.round(v/totCat*100)}%</span>`).join('')}</div></div>`:''}
  <div class="sec"><h2>Material na obra</h2><span class="muted small">enviado − devolvido</span></div>
  <div class="card" style="padding:6px 12px">${linhas.length?`<table class="tbl"><thead><tr><th>Material</th><th class="n">Qtd.</th>${temV?'<th class="n">Valor</th>':''}</tr></thead><tbody>
    ${linhas.map(x=>`<tr onclick="location.hash='#mat/${x.m.id}'" style="cursor:pointer"><td><div style="display:flex;align-items:center;gap:8px"><span>${matIcon(x.m)}</span><div style="flex:1;min-width:0"><div class="b">${esc(x.m.nome)}</div>${temV?`<div class="lvl" style="margin-top:4px"><i style="width:${Math.max(0,x.v/mxv*100)}%;background:${o.cor}"></i></div>`:''}</div></div></td>
      <td class="n b">${fq(x.q)} <span class="muted small">${esc(x.m.un)}</span></td>${temV?`<td class="n">${x.v?money(x.v):'—'}</td>`:''}</tr>`).join('')}</tbody></table>`:'<p class="muted small">Nenhum material enviado ainda. Toque em <b>Enviar material</b>.</p>'}</div>
  <div class="sec"><h2>Histórico da obra</h2></div>
  <div class="list">${movs.length?movs.map(mv=>movRow(mv,C)).join(''):'<div class="card muted small">Sem movimentações.</div>'}</div>`;
}

function vMovs(C){
  const per=state.fMovPer,lim=per==='todos'?'':daysAgo(+per);
  const ms=sortedMovs().filter(mv=>(!lim||mv.data>=lim)&&(!state.fMovTipo||mv.tipo===state.fMovTipo)&&(!state.fMovObra||mv.obra===state.fMovObra));
  const tot={entrada:0,saida:0,devolucao:0};ms.forEach(mv=>{if(tot[mv.tipo]!=null)tot[mv.tipo]+=movValor(mv,C)});
  // agrupar por data
  let html='',cur='';
  for(const mv of ms.slice(0,300)){if(mv.data!==cur){cur=mv.data;html+=`<div class="muted small b" style="margin:12px 2px 2px">${diaLabel(cur)}</div>`}html+=movRow(mv,C)}
  return `<div class="sec" style="margin-top:4px"><h2 style="font-size:22px">Movimentações</h2><span class="sp"></span><button class="btn soft" onclick="exportCSV()">⬇️ Planilha</button></div>
  <div class="chips">${[['','Todas'],['entrada','📥 Entradas'],['saida','🚚 Saídas'],['devolucao','↩️ Devoluções'],['ajuste','⚖️ Ajustes']].map(([k,l])=>`<button class="chip ${state.fMovTipo===k?'on':''}" onclick="state.fMovTipo='${k}';render()">${l}</button>`).join('')}</div>
  <div class="search">
    <select onchange="state.fMovObra=this.value;render()" style="flex:1"><option value="">Todas as obras</option>${db.obras.map(o=>`<option value="${o.id}" ${state.fMovObra===o.id?'selected':''}>${esc(o.nome)}</option>`).join('')}</select>
    <select onchange="state.fMovPer=this.value;render()">${[['7','7 dias'],['30','30 dias'],['90','90 dias'],['365','12 meses'],['todos','Tudo']].map(([k,l])=>`<option value="${k}" ${per===k?'selected':''}>${l}</option>`).join('')}</select>
  </div>
  ${(tot.entrada||tot.saida)?`<div class="grid g2" style="grid-template-columns:repeat(3,1fr)">
    <div class="card kpi" style="padding:11px"><div class="l">📥 Entradas</div><div class="v" style="font-size:17px;color:var(--in)">${money(tot.entrada)}</div></div>
    <div class="card kpi" style="padding:11px"><div class="l">🚚 Saídas</div><div class="v" style="font-size:17px;color:var(--out)">${money(tot.saida)}</div></div>
    <div class="card kpi" style="padding:11px"><div class="l">↩️ Devoluções</div><div class="v" style="font-size:17px;color:var(--back)">${money(tot.devolucao)}</div></div></div>`:''}
  <div class="list">${html||'<div class="card muted small mt">Nenhuma movimentação neste filtro.</div>'}</div>`;
}
const DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function diaLabel(d){if(d===today())return 'Hoje';if(d===daysAgo(1))return 'Ontem';const dt=new Date(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10),12);return DIAS[dt.getDay()]+', '+d.slice(8,10)+' de '+MESES[dt.getMonth()]}
function notFound(){return `<div class="card empty"><div class="i">🤷</div><h3>Não encontrado</h3><a class="btn soft" href="#inicio">Voltar ao início</a></div>`}

/* ============ Folha (modal) ============ */
function sheet(title,body,foot){
  closeSheet();
  const bg=document.createElement('div');bg.className='sheet-bg';bg.id='sheetBg';
  bg.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-h"><h2>${title}</h2><button class="x" onclick="closeSheet()" aria-label="Fechar">✕</button></div><div class="sheet-b" id="sheetBody">${body}</div>${foot?`<div class="sheet-f" id="sheetFoot">${foot}</div>`:''}</div>`;
  bg.addEventListener('click',e=>{if(e.target===bg)closeSheet()});
  $('#sheetRoot').appendChild(bg);document.body.style.overflow='hidden';
}
function closeSheet(){const b=$('#sheetBg');if(b)b.remove();document.body.style.overflow='';const cb=window._onClose;window._onClose=null;if(b&&cb)cb()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});

/* ============ Movimentação (tela de ícones) ============ */
let F=null,K=null;
function newF(tipo,obra){return {tipo,obra:obra||'',data:today(),resp:U?U.nome:'',doc:'',forn:'',obs:'',itens:{},q:'',cat:'',from:'#inicio'}}
function formMov(tipo='saida',pre={}){
  if(!db.materiais.length){toast('Cadastre um material primeiro');formMaterial();return}
  const from=route().p==='mov'?(F&&F.from)||'#inicio':(location.hash||'#inicio');
  F=newF(tipo,pre.obra);F.from=from;
  if(route().p==='mov'){closeSheet();drawMovPage(true)}else location.hash='#mov';
  if(pre.m)setTimeout(()=>openKey(pre.m),60);
}
function itensArr(){return Object.entries(F.itens).map(([m,x])=>({m,q:num(x.q),v:num(x.v)})).filter(x=>x.q>0&&matById(x.m))}
function drawMovPage(top){if(route().p!=='mov')return;const y=scrollY;$('#app').innerHTML=vMov(calc());window.scrollTo(0,top?0:y)}
function drawTiles(){const el=$('#tiles');if(el)el.innerHTML=tilesHTML(calc())}
function drawBar(){const el=$('#mvBar');if(el)el.innerHTML=barHTML()}
function corTipo(t){return t==='entrada'?'var(--in)':t==='devolucao'?'var(--back)':'var(--out)'}
function sairMov(){if(F&&itensArr().length&&!confirm('Descartar os materiais escolhidos?'))return;const to=(F&&F.from)||'#inicio';F=null;location.hash=to==='#mov'?'#inicio':to}
function vMov(C){
  if(!F)F=newF('saida');
  const t=F.tipo,cats=[...new Set(db.materiais.map(m=>m.cat))];
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><button class="link" style="font-size:15px" onclick="sairMov()">‹ Voltar</button><span class="sp" style="flex:1"></span><span class="muted small b">${fdate(F.data)}</span></div>
  <div class="seg big">${['entrada','saida','devolucao'].map(k=>`<button class="${TIPOS[k].cls} ${t===k?'on':''}" onclick="trocaTipo('${k}')"><span class="i">${TIPOS[k].ic}</span>${TIPOS[k].nome}</button>`).join('')}</div>
  <div class="stepper-label"><span class="n">1</span>${t==='saida'?'Para qual obra vai?':t==='devolucao'?'De qual obra voltou?':'Onde o material foi entregue?'}</div>
  <div class="obras-strip">${obraCards()}</div>
  ${t==='entrada'&&F.obra?'<div class="small muted" style="margin:-2px 0 10px">Compra entregue direto na obra: conta para a obra e não muda o saldo do depósito.</div>':''}
  <div class="stepper-label"><span class="n">2</span>Toque no material e digite a quantidade</div>
  <div class="search"><input id="mvQ" type="search" placeholder="🔎 Buscar material…" value="${esc(F.q)}" oninput="F.q=this.value;drawTiles()"></div>
  ${cats.length>1?`<div class="chips"><button class="chip ${!F.cat?'on':''}" onclick="F.cat='';drawMovPage()">Todos</button>${cats.map(c=>`<button class="chip ${F.cat===c?'on':''}" data-c="${esc(c)}" onclick="F.cat=F.cat===this.dataset.c?'':this.dataset.c;drawMovPage()">${catIcon(c)} ${esc(c)}</button>`).join('')}</div>`:''}
  <div class="tiles" id="tiles">${tilesHTML(C)}</div>
  <button class="add-item mt" onclick="formMaterial(null,id=>{drawMovPage();openKey(id)})">＋ Cadastrar material novo</button>
  <div class="mv-bar" id="mvBar">${barHTML()}</div>`;
}
function trocaTipo(k){F.tipo=k;if(k==='devolucao'){const oq=calc().obraQ[F.obra]||{};for(const id in F.itens)if(!((oq[id]||0)>0))delete F.itens[id]}drawMovPage()}
function obraCards(compact){
  const t=F.tipo,obrasAt=db.obras.filter(o=>o.status!=='concluida'||o.id===F.obra);
  const fn=compact?'kObra':'escolheObra';
  let h=t==='entrada'?`<button class="oc ${!F.obra?'on':''}" style="--c:#171717" onclick="${fn}('')">🏬 Depósito<small>estoque central</small></button>`:'';
  h+=obrasAt.map(o=>`<button class="oc ${F.obra===o.id?'on':''}" style="--c:${o.cor}" onclick="${fn}('${o.id}')">${esc(o.nome)}<small>${esc(o.resp?'👷 '+o.resp:o.end||'')}</small></button>`).join('');
  if(!compact)h+=`<button class="oc new" onclick="formObra(null,id=>{F.obra=id;drawMovPage()})">＋ Nova obra<small>cadastrar</small></button>`;
  return h;
}
function escolheObra(id){F.obra=id;if(F.tipo==='devolucao')F.itens={};drawMovPage()}
const ACENTOS={'á':'a','à':'a','â':'a','ã':'a','ä':'a','é':'e','ê':'e','è':'e','ë':'e','í':'i','î':'i','ì':'i','ï':'i','ó':'o','ô':'o','õ':'o','ò':'o','ö':'o','ú':'u','û':'u','ù':'u','ü':'u','ç':'c','ñ':'n'};
const norm=s=>String(s||'').toLowerCase().replace(/[áàâãäéêèëíîìïóôõòöúûùüçñ]/g,c=>ACENTOS[c]);
function tilesHTML(C){
  const t=F.tipo,q=norm(F.q),oq=F.obra?(C.obraQ[F.obra]||{}):{};
  const ws=q.split(/\s+/).filter(Boolean);let ms=db.materiais.filter(m=>{const h=norm(m.nome+' '+m.cat+' '+(m.local||''));return ws.every(w=>h.includes(w))&&(!F.cat||m.cat===F.cat)});
  if(t==='devolucao'){
    if(!F.obra)return '<div class="card muted small" style="grid-column:1/-1">Escolha acima a obra de onde o material voltou.</div>';
    ms=ms.filter(m=>(oq[m.id]||0)>0);
    if(!ms.length)return '<div class="card muted small" style="grid-column:1/-1">Esta obra não tem material para devolver.</div>';
  }
  const freq={};db.movs.forEach(mv=>(mv.itens||[]).forEach(it=>{freq[it.m]=(freq[it.m]||0)+1}));
  const tem=m=>t==='saida'&&(C.saldo[m.id]||0)>0?1:0;
  ms.sort((a,b)=>tem(b)-tem(a)||(freq[b.id]||0)-(freq[a.id]||0)||a.nome.localeCompare(b.nome,'pt-BR'));
  if(!ms.length)return '<div class="card muted small" style="grid-column:1/-1">Nenhum material encontrado.</div>';
  return ms.map(m=>{const s=C.saldo[m.id]||0,st=status(m,s),sel=F.itens[m.id],dim=t==='saida'&&s<=0&&!sel;
    const info=t==='devolucao'?`na obra: ${fq(oq[m.id])} ${esc(m.un)}`:`${fq(s)} ${esc(m.un)}`;
    return `<button class="tile ${sel?'sel':''} ${dim?'dim':''}" style="--tc:${corTipo(t)}" onclick="openKey('${m.id}')">${sel?`<span class="badge">${fq(num(sel.q))} ${esc(m.un)}</span>`:''}
      <span class="ti">${matIcon(m)}</span><span class="tn">${esc(m.nome)}</span><span class="ts ${t==='devolucao'?'':st.k}">${info}</span></button>`}).join('');
}
function movErros(){
  const C=calc(),e=[],its=itensArr();
  if(F.tipo!=='entrada'&&!F.obra)e.push(F.tipo==='saida'?'Escolha a obra de destino':'Escolha a obra de origem');
  if(!its.length)e.push('Toque em um material');
  if(F.tipo==='saida')for(const it of its){if(it.q>(C.saldo[it.m]||0)+1e-9){const m=matById(it.m);e.push(`Só há ${fq(C.saldo[it.m]||0)} ${m.un} de ${m.nome}`);break}}
  if(F.tipo==='devolucao'&&F.obra){const oq=C.obraQ[F.obra]||{};for(const it of its){if(it.q>(oq[it.m]||0)+1e-9){const m=matById(it.m);e.push(`A obra só recebeu ${fq(oq[it.m]||0)} ${m.un} de ${m.nome}`);break}}}
  if(!F.data)e.push('Informe a data');
  return e;
}
function goLabel(){
  const e=movErros(),o=obraById(F.obra),n=itensArr().length,t=F.tipo;
  if(e.length)return {ok:false,txt:e[0]};
  const verbo=t==='saida'?'🚚 Dar saída':t==='entrada'?'📥 Dar entrada':'↩️ Devolver';
  return {ok:true,txt:`${verbo} · ${n} ${n===1?'item':'itens'}${o?(t==='saida'?' → ':t==='devolucao'?' ← ':' em ')+o.nome:''}`};
}
function barHTML(){
  const its=itensArr(),g=goLabel();
  return `<div class="mv-bar-in">
    ${its.length?`<div class="sel-strip">${its.map(it=>{const m=matById(it.m);return `<button class="sel-chip" onclick="openKey('${m.id}')"><span class="kic" style="width:24px;height:24px;font-size:15px;border-radius:7px">${matIcon(m)}</span>${fq(it.q)} ${esc(m.un)}</button>`}).join('')}</div>`:''}
    <div style="display:flex;gap:8px"><button class="btn soft lg" style="padding:15px 14px" onclick="formDetalhes()" title="Data, responsável, documento">📝</button>
    <button class="btn lg" style="flex:1;background:${g.ok?corTipo(F.tipo):'#d8d2cc'};color:#fff" ${g.ok?'':'disabled'} onclick="salvarMov()">${esc(g.txt)}</button></div></div>`;
}
/* teclado numérico */
function openKey(mid){
  const m=matById(mid);if(!m)return;const C=calc(),cur=F.itens[mid],t=F.tipo;
  K={m:mid,s:cur?String(cur.q).replace('.',','):'',fresh:!!cur};
  const s=C.saldo[mid]||0,oq=F.obra?((C.obraQ[F.obra]||{})[mid]||0):0;
  const info=t==='devolucao'?`A obra recebeu <b>${fq(oq)} ${esc(m.un)}</b>`:`No depósito: <b>${fq(s)} ${esc(m.un)}</b>`;
  sheet(`<span style="display:flex;align-items:center;gap:10px"><span class="kic">${matIcon(m)}</span><span>${esc(m.nome)}</span></span>`,`
    <div class="kinfo">${info}</div>
    <div class="kdisp"><span id="kVal">0</span> <span class="kun">${esc(m.un)}</span></div>
    <div id="kErr" style="min-height:8px"></div>
    <div class="kquick">${[1,5,10,50].map(n=>`<button onclick="kAdd(${n})">+${n}</button>`).join('')}</div>
    <div class="kpad">${['1','2','3','4','5','6','7','8','9',',','0','⌫'].map(k=>`<button onclick="kKey('${k}')">${k}</button>`).join('')}</div>
    ${t==='entrada'?`<div class="price" style="margin-top:12px">R$ por ${esc(m.un)} <input id="kPreco" inputmode="decimal" placeholder="${C.custo[mid]?nf.format(C.custo[mid]):'opcional'}" value="${cur&&cur.v?esc(String(cur.v).replace('.',',')):''}" oninput="if(F.itens[K.m])F.itens[K.m].v=this.value"></div>`:''}
    ${t!=='devolucao'?`<div class="stepper-label" style="margin-top:14px">${t==='saida'?'Para qual obra:':'Entregue em:'}</div><div class="obras-strip" id="kObras" style="margin-bottom:0">${obraCards(true)}</div>`:''}`,
   `<div style="display:flex;gap:8px">${cur?'<button class="btn danger lg" style="padding:15px 14px" onclick="kRemove()" title="Tirar da lista">🗑️</button>':''}
     <button class="btn soft lg" style="flex:1" onclick="closeSheet()">＋ Mais itens</button>
     <button class="btn lg" id="kGo" style="flex:1.4;color:#fff" onclick="kGo()"></button></div>`);
  window._onClose=()=>{K=null;drawMovPage()};
  kUpd();
}
function kKey(k){
  let s=K.fresh?'':K.s;K.fresh=false;
  if(k==='⌫')s=s.slice(0,-1);
  else if(k===','){if(!s.includes(','))s=(s||'0')+','}
  else{if(s==='0')s='';if(s.replace(',','').length<8&&!(s.includes(',')&&s.split(',')[1].length>=2))s+=k}
  K.s=s;kUpd();
}
function kAdd(n){K.s=String(Math.round((num(K.fresh?K.s:K.s)+n)*100)/100).replace('.',',');K.fresh=false;kUpd()}
function kObra(id){F.obra=id;$('#kObras').innerHTML=obraCards(true);kUpd()}
function kUpd(){
  const m=matById(K.m),q=num(K.s);
  if(q>0)F.itens[K.m]=Object.assign(F.itens[K.m]||{},{q:K.s,v:F.itens[K.m]?F.itens[K.m].v:($('#kPreco')?$('#kPreco').value:'')});else delete F.itens[K.m];
  $('#kVal').textContent=K.s||'0';
  const C=calc(),lim=F.tipo==='saida'?C.saldo[K.m]||0:F.tipo==='devolucao'?((C.obraQ[F.obra]||{})[K.m]||0):Infinity;
  $('#kErr').innerHTML=q>lim+1e-9?`<div class="errbox" style="text-align:center">${F.tipo==='saida'?`Só há ${fq(lim)} ${esc(m.un)} no depósito`:`A obra só recebeu ${fq(lim)} ${esc(m.un)}`}</div>`:'';
  const g=goLabel(),b=$('#kGo');b.textContent=g.ok?(F.tipo==='saida'?'🚚 Dar saída':F.tipo==='entrada'?'📥 Dar entrada':'↩️ Devolver'):g.txt;
  b.disabled=!g.ok;b.style.background=g.ok?corTipo(F.tipo):'#d8d2cc';b.style.fontSize=g.ok?'':'13px';
  drawBar();
}
function kRemove(){delete F.itens[K.m];closeSheet()}
function kGo(){if(goLabel().ok){window._onClose=null;closeSheet();salvarMov()}}
function formDetalhes(){
  const t=F.tipo;
  sheet('📝 Detalhes',`
  <div class="f2"><div class="f"><label>Data</label><input type="date" value="${F.data}" onchange="F.data=this.value"></div>
  <div class="f"><label>${t==='saida'?'Quem levou / recebeu':'Responsável'}</label><input value="${esc(F.resp)}" oninput="F.resp=this.value" placeholder="Nome" list="dlResp"></div></div>
  ${t==='entrada'?`<div class="f2"><div class="f"><label>Fornecedor</label><input value="${esc(F.forn)}" oninput="F.forn=this.value" list="dlForn" placeholder="Loja / distribuidora"></div><div class="f"><label>Nota fiscal</label><input value="${esc(F.doc)}" oninput="F.doc=this.value" placeholder="Nº da NF"></div></div>`:
  `<div class="f"><label>Veículo / documento <span class="muted">(opcional)</span></label><input value="${esc(F.doc)}" oninput="F.doc=this.value" placeholder="Ex.: caminhão ABC-1234"></div>`}
  <div class="f"><label>Observação <span class="muted">(opcional)</span></label><input value="${esc(F.obs)}" oninput="F.obs=this.value"></div>
  <datalist id="dlResp">${[...new Set(db.movs.map(m=>m.resp).filter(Boolean))].slice(0,30).map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
  <datalist id="dlForn">${[...new Set(db.movs.map(m=>m.forn).filter(Boolean))].slice(0,30).map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`,
  `<button class="btn dark lg full" onclick="closeSheet()">OK</button>`);
  window._onClose=()=>drawMovPage();
}
async function salvarMov(){
  if(movErros().length)return;
  const foto=await selfie();if(foto===undefined){drawMovPage();toast('Lançamento cancelado');return}
  if(!F||movErros().length)return;
  const itens=itensArr().map(it=>{const x={m:it.m,q:it.q};if(F.tipo==='entrada'&&it.v>0)x.v=it.v;return x});
  db.seq=(db.seq||0)+1;
  const mv={id:uid(),n:db.seq,tipo:F.tipo,obra:F.obra||'',data:F.data,resp:F.resp.trim(),doc:F.doc.trim(),forn:F.tipo==='entrada'?F.forn.trim():'',obs:F.obs.trim(),itens,criado:Date.now(),por:U.id,porNome:U.nome,foto:!!foto};
  db.movs.push(mv);if(mv.resp)db.ultimoResp=mv.resp;
  if(!await persistir(nuvem()&&foto?{fotos:{[mv.id]:foto}}:undefined)){if(!nuvem()&&db.movs[db.movs.length-1]===mv)db.movs.pop();return}
  if(!nuvem()&&foto)fotoPut(mv.id,foto).catch(()=>toast('⚠️ A foto não pôde ser salva'));
  F.itens={};F.doc='';F.forn='';F.obs='';F.q='';
  closeSheet();drawMovPage(true);
  const t=TIPOS[mv.tipo],o=obraById(mv.obra);
  sheet(`${t.ic} ${t.nome} registrada`,`<div style="text-align:center;padding:6px 0 4px"><div style="font-size:58px">✅</div>
    <p style="font-size:16px;margin:8px 0 4px" class="b">${itens.length} ${itens.length===1?'item':'itens'}${o?(mv.tipo==='saida'?' para ':mv.tipo==='devolucao'?' de ':' em ')+esc(o.nome):''}</p>
    <p class="muted" style="margin:0">Movimentação nº <b>${mv.n}</b> salva.${mv.tipo==='saida'?'<br>Imprima a guia e peça a assinatura de quem recebeu.':''}</p></div>`,
    `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn soft lg" style="flex:1" onclick="printGuia('${mv.id}')">🖨️ ${mv.tipo==='saida'?'Guia':'Comprovante'}</button>
     <button class="btn soft lg" style="flex:1" onclick="closeSheet()">＋ Nova</button>
     <button class="btn dark lg" style="flex:1" onclick="logout('Até logo!')">✓ Concluir e sair</button></div>`);
}
function verMov(id){
  const mv=db.movs.find(x=>x.id===id);if(!mv)return;
  const C=calc(),t=TIPOS[mv.tipo],o=obraById(mv.obra),total=movValor(mv,C);
  sheet(`${t.ic} ${t.nome} nº ${mv.n||''}`,`
   <div class="card" style="padding:12px 14px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="pill ${t.cls}">${t.nome}</span><span class="b">${fdate(mv.data)}</span></div>
    ${o?`<div class="mt" style="display:flex;align-items:center;gap:8px"><span class="dot" style="background:${o.cor}"></span><a href="#obra/${o.id}" onclick="closeSheet()" class="b" style="color:inherit">${esc(o.nome)}</a></div>`:mv.tipo==='entrada'?'<div class="mt b">🏬 Depósito</div>':''}
    <div class="small muted mt">${[mv.resp&&'👤 '+esc(mv.resp),mv.forn&&'🏪 '+esc(mv.forn),mv.doc&&'📄 '+esc(mv.doc)].filter(Boolean).join(' · ')}</div>
    ${mv.obs?`<div class="small mt">📝 ${esc(mv.obs)}</div>`:''}
   </div>
   ${mv.por||mv.porNome?`<div class="card mt" style="padding:12px 14px;display:flex;align-items:center"><div id="selfieBox" style="margin-right:12px">${mv.foto?'<div class="selfie" style="background:#eee"></div>':avatar(pessoaById(mv.por)||{nome:mv.porNome},56)}</div>
     <div><div class="muted small b">Lançado por</div><div class="b" style="font-size:16px">${esc((pessoaById(mv.por)||{}).nome||mv.porNome||'')}</div><div class="muted small">${mv.foto?'📸 com foto no momento do lançamento':'sem foto'}</div></div></div>`:''}
   <div class="card mt" style="padding:6px 12px"><table class="tbl"><thead><tr><th>Material</th><th class="n">Qtd.</th>${total?'<th class="n">Valor</th>':''}</tr></thead><tbody>
    ${(mv.itens||[]).map(it=>{const m=matById(it.m),pu=(mv.tipo==='entrada'&&it.v)?it.v:(C.custo[it.m]||0);return `<tr><td>${m?matIcon(m)+' '+esc(m.nome):'<i>material excluído</i>'}</td><td class="n b">${fq(it.q)} ${m?esc(m.un):''}</td>${total?`<td class="n">${pu?brl.format(it.q*pu):'—'}</td>`:''}</tr>`}).join('')}
    ${total?`<tr><td class="b">Total</td><td></td><td class="n b">${brl.format(total)}</td></tr>`:''}</tbody></table></div>`,
   `<div style="display:flex;gap:8px">${isAdmin()?`<button class="btn danger" onclick="delMov('${mv.id}')">🗑️ Excluir</button>`:''}<span style="flex:1"></span>${mv.tipo!=='ajuste'?`<button class="btn dark" onclick="printGuia('${mv.id}')">🖨️ Imprimir</button>`:''}</div>`);
  if(mv.foto){
    const foto=nuvem()?EstoqueCompartilhado.enviar('foto',{id:mv.id}).then(r=>r.imagem):fotoGet(mv.id);
    const caixa=$('#selfieBox');
    foto.then(d=>{if(caixa&&d)caixa.innerHTML=`<img class="selfie" src="${esc(d)}" alt="">`}).catch(()=>{});
  }
}
async function delMov(id){
  if(!soAdmin())return;
  if(!confirm('Excluir esta movimentação? O saldo do estoque será recalculado.'))return;
  db.movs=db.movs.filter(m=>m.id!==id);if(!await persistir())return;
  if(!nuvem())fotoDel(id).catch(()=>{});
  closeSheet();render();toast('Movimentação excluída');
}
function formAjuste(mid){
  if(!soAdmin())return;
  const m=matById(mid),s=calc().saldo[mid]||0;
  sheet('⚖️ Corrigir saldo',`<p class="muted small" style="margin-top:0">Use depois de contar o material no depósito. A diferença fica registrada no histórico como ajuste.</p>
   <div class="card" style="padding:12px 14px;margin-bottom:12px"><div class="b">${matIcon(m)} ${esc(m.nome)}</div><div class="muted small">Saldo no app: <b>${fq(s)} ${esc(m.un)}</b></div></div>
   <div class="f"><label>Quantidade contada (${esc(m.un)})</label><input id="ajQ" inputmode="decimal" value="${String(Math.round(s*100)/100).replace('.',',')}" style="font-size:20px;font-weight:900"></div>
   <div class="f"><label>Motivo</label><input id="ajO" placeholder="Ex.: inventário, perda, quebra" value="Inventário"></div>`,
   `<button class="btn dark lg full" onclick="salvarAjuste('${mid}',${s})">Salvar contagem</button>`);
}
async function salvarAjuste(mid,s){
  if(!soAdmin())return;
  const v=$('#ajQ').value.trim();if(v===''){toast('Informe a quantidade contada');return}
  const d=Math.round((num(v)-s)*1000)/1000;if(!d){closeSheet();toast('Saldo já está correto');return}
  db.seq=(db.seq||0)+1;db.movs.push({id:uid(),n:db.seq,tipo:'ajuste',obra:'',data:today(),resp:U.nome,doc:'',forn:'',obs:$('#ajO').value.trim()||'Ajuste de saldo',itens:[{m:mid,q:d}],criado:Date.now(),por:U.id,porNome:U.nome});
  if(!await persistir())return;closeSheet();render();toast(`Saldo corrigido (${d>0?'+':''}${fq(d)})`);
}

/* ============ Cadastros ============ */
function formMaterial(id,cb){
  const m=id?matById(id):{nome:'',cat:'Cimento e argamassa',un:'saco',min:'',preco:'',local:''};
  const used=id&&db.movs.some(mv=>(mv.itens||[]).some(it=>it.m===id));
  sheet(id?'✏️ Editar material':'📦 Novo material',`
   <div class="f"><label>Nome do material</label><input id="mNome" value="${esc(m.nome)}" placeholder="Ex.: Cimento CP-II 50 kg" autocomplete="off"></div>
   <div class="f"><label>Ícone ou foto <span class="muted">(aparece na tela de saída)</span></label>
    <div style="display:flex;gap:10px;align-items:center"><span class="kic" id="mPrev" style="width:60px;height:60px;font-size:36px;border-radius:16px">${matIcon(m)}</span>
    <label class="btn soft" style="cursor:pointer">📷 Tirar/escolher foto<input type="file" accept="image/*" id="mFoto" class="hidden"></label>
    <button type="button" class="btn soft ${m.foto?'':'hidden'}" id="mFotoDel">✕ Foto</button></div>
    <div class="icons" id="mIcons">${ICONS.map(([e])=>`<button type="button" data-v="${e}" class="${(m.ic||guessIcon(m.nome,m.cat))===e&&!m.foto?'on':''}">${e}</button>`).join('')}</div></div>
   <div class="f"><label>Categoria</label><div class="chips" style="flex-wrap:wrap" id="mCat">${CATS.map(([c,i])=>`<button type="button" class="chip ${m.cat===c?'on':''}" data-v="${esc(c)}" onclick="this.parentNode.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));this.classList.add('on')">${i} ${esc(c)}</button>`).join('')}</div></div>
   <div class="f2"><div class="f"><label>Unidade</label><select id="mUn">${UNITS.map(u=>`<option ${m.un===u?'selected':''}>${u}</option>`).join('')}${!UNITS.includes(m.un)?`<option selected>${esc(m.un)}</option>`:''}</select></div>
   <div class="f"><label>Estoque mínimo</label><input id="mMin" inputmode="decimal" value="${m.min!==''&&m.min!=null?String(m.min).replace('.',','):''}" placeholder="Avisa quando baixar"></div></div>
   <div class="f2"><div class="f"><label>Preço de referência (R$)</label><input id="mPreco" inputmode="decimal" value="${m.preco?String(m.preco).replace('.',','):''}" placeholder="opcional"></div>
   <div class="f"><label>Local no depósito</label><input id="mLocal" value="${esc(m.local||'')}" placeholder="Ex.: Prateleira A"></div></div>
   ${id||!isAdmin()?'':`<div class="f"><label>Quantidade que já tem no depósito</label><input id="mIni" inputmode="decimal" placeholder="0"></div>`}
   ${id&&isAdmin()?`<button class="btn danger full" onclick="delMaterial('${id}')">🗑️ Excluir material</button>${used?'<div class="small muted mt">Este material tem movimentações; ao excluir, elas também serão apagadas.</div>':''}`:''}`,
   `<button class="btn primary lg full" id="mSave">Salvar</button>`);
  setTimeout(()=>{if(!id)$('#mNome').focus()},60);
  const mf={ic:m.ic||'',foto:m.foto||''};
  const prev=()=>{const cur=mf.ic||guessIcon($('#mNome').value,(($('#mCat .chip.on')||{dataset:{}}).dataset.v));$('#mPrev').innerHTML=mf.foto?`<img class="mi" src="${mf.foto}" alt="">`:cur;
    document.querySelectorAll('#mIcons button').forEach(b=>b.classList.toggle('on',!mf.foto&&b.dataset.v===cur));$('#mFotoDel').classList.toggle('hidden',!mf.foto)};
  $('#mNome').addEventListener('input',prev);$('#mCat').addEventListener('click',()=>setTimeout(prev));
  $('#mIcons').onclick=e=>{const b=e.target.closest('button');if(!b)return;mf.ic=b.dataset.v;mf.foto='';prev()};
  $('#mFotoDel').onclick=()=>{mf.foto='';prev()};
  $('#mFoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{mf.foto=await fotoReduzida(f);prev()}catch(err){toast('Não foi possível ler a foto')}};
  $('#mSave').onclick=async()=>{
    const nome=$('#mNome').value.trim();if(!nome){toast('Informe o nome do material');$('#mNome').focus();return}
    if(db.materiais.some(x=>x.id!==id&&x.nome.toLowerCase()===nome.toLowerCase())){toast('Já existe um material com esse nome');return}
    const cat=(($('#mCat .chip.on')||{dataset:{}}).dataset.v)||'Outros';
    const data={nome,cat,un:$('#mUn').value,min:num($('#mMin').value),preco:num($('#mPreco').value),local:$('#mLocal').value.trim(),ic:mf.ic||guessIcon(nome,cat),foto:mf.foto};
    let mid=id;
    if(id)Object.assign(matById(id),data);
    else{mid=uid();db.materiais.push({id:mid,...data,criado:Date.now()});const ini=$('#mIni')?num($('#mIni').value):0;
      if(ini>0){db.seq=(db.seq||0)+1;db.movs.push({id:uid(),n:db.seq,tipo:'ajuste',obra:'',data:today(),resp:'',doc:'',forn:'',obs:'Saldo inicial',itens:[{m:mid,q:ini}],criado:Date.now(),por:U.id,porNome:U.nome})}}
    if(!await persistir())return;closeSheet();
    if(cb)cb(mid);else{render();toast(id?'Material atualizado':'Material cadastrado')}
  };
}
function fotoReduzida(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const S=240,c=document.createElement('canvas');c.width=c.height=S;const k=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-k)/2,(img.height-k)/2,k,k,0,0,S,S);URL.revokeObjectURL(img.src);res(c.toDataURL('image/jpeg',.75))};img.onerror=rej;img.src=URL.createObjectURL(file)})}
async function delMaterial(id){
  if(!soAdmin())return;
  const m=matById(id);if(!confirm(`Excluir "${m.nome}"? As movimentações deste material também serão apagadas.`))return;
  db.materiais=db.materiais.filter(x=>x.id!==id);
  db.movs=db.movs.map(mv=>({...mv,itens:(mv.itens||[]).filter(it=>it.m!==id)})).filter(mv=>mv.itens.length);
  if(!await persistir())return;closeSheet();location.hash='#estoque';render();toast('Material excluído');
}
function formObra(id,cb){
  const o=id?obraById(id):{nome:'',end:'',resp:'',cor:COLORS[db.obras.length%COLORS.length],status:'ativa'};
  sheet(id?'✏️ Editar obra':'🏗️ Nova obra',`
   <div class="f"><label>Nome da obra</label><input id="oNome" value="${esc(o.nome)}" placeholder="Ex.: Residencial Jardins" autocomplete="off"></div>
   <div class="f"><label>Endereço</label><input id="oEnd" value="${esc(o.end||'')}" placeholder="Rua, nº, bairro, cidade"></div>
   <div class="f"><label>Mestre / responsável</label><input id="oResp" value="${esc(o.resp||'')}" placeholder="Nome"></div>
   <div class="f"><label>Cor de identificação</label><div class="colors" id="oCor">${COLORS.map(c=>`<button type="button" class="${o.cor===c?'on':''}" data-v="${c}" style="background:${c}" onclick="this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));this.classList.add('on')"></button>`).join('')}</div></div>
   ${id?`<div class="f"><label>Situação</label><select id="oSt"><option value="ativa" ${o.status!=='concluida'?'selected':''}>Em andamento</option><option value="concluida" ${o.status==='concluida'?'selected':''}>Concluída</option></select></div>
   ${isAdmin()?`<button class="btn danger full" onclick="delObra('${id}')">🗑️ Excluir obra</button>`:''}`:''}`,
   `<button class="btn primary lg full" id="oSave">Salvar</button>`);
  setTimeout(()=>{if(!id)$('#oNome').focus()},60);
  $('#oSave').onclick=async()=>{
    const nome=$('#oNome').value.trim();if(!nome){toast('Informe o nome da obra');return}
    const data={nome,end:$('#oEnd').value.trim(),resp:$('#oResp').value.trim(),cor:(($('#oCor .on')||{dataset:{}}).dataset.v)||COLORS[0]};
    if(id){data.status=$('#oSt').value;Object.assign(obraById(id),data)}
    let oid=id;if(!id){oid=uid();db.obras.push({id:oid,...data,status:'ativa',criado:Date.now()})}
    if(!await persistir())return;closeSheet();
    if(cb)cb(oid);else{render();toast(id?'Obra atualizada':'Obra cadastrada')}
  };
}
async function delObra(id){
  if(!soAdmin())return;
  const n=db.movs.filter(m=>m.obra===id).length;
  if(n){alert(`Esta obra tem ${n} movimentação(ões). Para manter o histórico, marque-a como "Concluída" em vez de excluir.`);return}
  if(!confirm('Excluir esta obra?'))return;
  db.obras=db.obras.filter(o=>o.id!==id);if(!await persistir())return;closeSheet();location.hash='#obras';render();
}

/* ============ Impressão ============ */
function printHTML(html){$('#print').innerHTML=html;closeSheet();setTimeout(()=>window.print(),80)}
function phead(t){return `<div class="ph"><div><b style="font-size:16px">${esc(db.empresa||'')}</b><div>Controle de estoque</div></div><div style="text-align:right"><b>${t}</b><div>Emitido em ${fdate(today())}</div></div></div>`}
function printGuia(id){
  const mv=db.movs.find(x=>x.id===id);if(!mv)return;const C=calc(),o=obraById(mv.obra),t=TIPOS[mv.tipo];
  const tit=mv.tipo==='saida'?'GUIA DE REMESSA DE MATERIAL':mv.tipo==='devolucao'?'COMPROVANTE DE DEVOLUÇÃO':'COMPROVANTE DE ENTRADA';
  printHTML(`${phead(tit+' nº '+(mv.n||''))}
   <p><b>Data:</b> ${fdate(mv.data)} &nbsp; <b>Tipo:</b> ${t.nome}${o?` &nbsp; <b>Obra:</b> ${esc(o.nome)}${o.end?' — '+esc(o.end):''}`:''}</p>
   <p>${mv.forn?`<b>Fornecedor:</b> ${esc(mv.forn)} &nbsp; `:''}${mv.doc?`<b>Documento:</b> ${esc(mv.doc)} &nbsp; `:''}${mv.resp?`<b>Responsável:</b> ${esc(mv.resp)}`:''}</p>
   ${mv.obs?`<p><b>Obs.:</b> ${esc(mv.obs)}</p>`:''}${mv.porNome?`<p><b>Lançado por:</b> ${esc(mv.porNome)}</p>`:''}
   <table><thead><tr><th>#</th><th>Material</th><th class="n">Quantidade</th><th>Un.</th><th>Conferido</th></tr></thead><tbody>
   ${(mv.itens||[]).map((it,i)=>{const m=matById(it.m);return `<tr><td>${i+1}</td><td>${m?esc(m.nome):'—'}</td><td class="n">${fq(it.q)}</td><td>${m?esc(m.un):''}</td><td style="width:80px"></td></tr>`}).join('')}</tbody></table>
   <div class="sig"><div>${mv.tipo==='saida'?'Expedido por (depósito)':'Entregue por'}</div><div>${mv.tipo==='saida'?'Recebido por (obra)':'Recebido por'}</div></div>`);
}
function printObra(id){
  const o=obraById(id),C=calc(),oq=C.obraQ[id]||{};
  const linhas=Object.entries(oq).map(([mid,q])=>({m:matById(mid),q})).filter(x=>x.m&&Math.abs(x.q)>1e-9).sort((a,b)=>a.m.nome.localeCompare(b.m.nome,'pt-BR'));
  const movs=sortedMovs().filter(mv=>mv.obra===id).reverse();let tot=0;
  printHTML(`${phead('RELATÓRIO DE MATERIAL POR OBRA')}<h1>${esc(o.nome)}</h1><p>${esc(o.end||'')}${o.resp?' · Responsável: '+esc(o.resp):''}</p>
   <h3>Resumo (enviado − devolvido)</h3><table><thead><tr><th>Material</th><th class="n">Qtd.</th><th>Un.</th><th class="n">Custo médio</th><th class="n">Valor</th></tr></thead><tbody>
   ${linhas.map(x=>{const v=x.q*(C.custo[x.m.id]||0);tot+=v;return `<tr><td>${esc(x.m.nome)}</td><td class="n">${fq(x.q)}</td><td>${esc(x.m.un)}</td><td class="n">${C.custo[x.m.id]?brl.format(C.custo[x.m.id]):'—'}</td><td class="n">${v?brl.format(v):'—'}</td></tr>`}).join('')}
   <tr><td colspan="4"><b>Total</b></td><td class="n"><b>${brl.format(tot)}</b></td></tr></tbody></table>
   <h3 style="margin-top:18px">Movimentações</h3><table><thead><tr><th>Data</th><th>Nº</th><th>Tipo</th><th>Material</th><th class="n">Qtd.</th><th>Responsável</th></tr></thead><tbody>
   ${movs.flatMap(mv=>(mv.itens||[]).map(it=>{const m=matById(it.m);return `<tr><td>${fdate(mv.data)}</td><td>${mv.n||''}</td><td>${TIPOS[mv.tipo].nome}</td><td>${m?esc(m.nome):'—'}</td><td class="n">${fq(it.q)} ${m?esc(m.un):''}</td><td>${esc(mv.resp||'')}</td></tr>`})).join('')}</tbody></table>`);
}

/* ============ Exportar / backup ============ */
function download(name,content,type){const b=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportCSV(){
  const C=calc(),q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const rows=[['Data','Nº','Tipo','Obra','Material','Categoria','Quantidade','Unidade','Valor unitário','Valor total','Fornecedor','Documento','Responsável','Observação','Lançado por']];
  for(const mv of sortedMovs().reverse())for(const it of mv.itens||[]){const m=matById(it.m)||{},o=obraById(mv.obra),pu=(mv.tipo==='entrada'&&it.v)?it.v:(C.custo[it.m]||0);
    rows.push([fdate(mv.data),mv.n||'',TIPOS[mv.tipo].nome,o?o.nome:(mv.tipo==='entrada'?'Depósito':''),m.nome||'',m.cat||'',nf.format(it.q),m.un||'',pu?nf.format(pu):'',pu?nf.format(pu*it.q):'',mv.forn||'',mv.doc||'',mv.resp||'',mv.obs||'',mv.porNome||''])}
  download(`movimentacoes-estoque-${today()}.csv`,'﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');
}
function exportEstoqueCSV(){
  const C=calc(),q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const rows=[['Material','Categoria','Unidade','Saldo no depósito','Estoque mínimo','Situação','Custo médio','Valor em estoque','Local'],...db.materiais.map(m=>{const s=C.saldo[m.id]||0;return [m.nome,m.cat,m.un,nf.format(s),m.min?nf.format(m.min):'',status(m,s).t,C.custo[m.id]?nf.format(C.custo[m.id]):'',C.custo[m.id]&&s>0?nf.format(s*C.custo[m.id]):'',m.local||'']})];
  download(`estoque-${today()}.csv`,'﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');
}
function config(){
  if(!soAdmin())return;
  sheet('⚙️ Configurações',`
   ${pessoasSec()}
   <div class="sec"><h2>Empresa</h2></div>
   <div class="f"><label>Nome da empresa (sai nas guias e relatórios)</label><input id="cEmp" value="${esc(db.empresa||'')}"></div>
   <button class="btn dark full" onclick="salvarEmpresa()">Salvar nome</button>
   <div class="sec"><h2>Planilhas</h2></div>
   <div class="grid g2"><button class="btn soft" onclick="exportEstoqueCSV()">📦 Estoque atual</button><button class="btn soft" onclick="exportCSV()">🔄 Movimentações</button></div>
   <div class="sec"><h2>Backup</h2></div>
   <p class="muted small" style="margin-top:0">${nuvem()?'Os dados ficam salvos no estoque compartilhado. O backup guarda uma cópia das informações, sem as senhas.':'Os dados ficam salvos neste aparelho. Faça backup antes de trocar de aparelho.'}</p>
   <div class="grid g2"><button class="btn primary" onclick="fazerBackup()">⬇️ Fazer backup</button><button class="btn soft" onclick="$('#fileImport').click()">⬆️ Restaurar backup</button></div>
   <div class="sec"><h2>Outros</h2></div>
   ${nuvem()?'':'<div class="grid g2"><button class="btn soft" onclick="loadDemoConfirmado()">Dados de exemplo</button><button class="btn danger" onclick="apagarEstoqueLocal()">Apagar tudo</button></div>'}
   <button class="btn soft full mt" onclick="recolocarCatalogo()">📋 Recolocar materiais da lista padrão</button>
   <p class="muted small mt2">${db.materiais.length} materiais · ${db.obras.length} obras · ${db.movs.length} movimentações</p>`);
}
async function salvarEmpresa(){
  db.empresa=$('#cEmp').value.trim();
  if(await persistir()){render();toast('Nome salvo')}
}
async function recolocarCatalogo(){
  const n=aplicaCatalogo(true);
  if(await persistir()){render();toast(n?n+' materiais adicionados':'A lista padrão já está completa')}
}
function loadDemoConfirmado(){if(confirm('Substituir os dados atuais pelos dados de exemplo?'))loadDemo()}
function apagarEstoqueLocal(){
  if(nuvem()||!confirm('Apagar TODOS os dados deste aparelho? Faça backup antes.'))return;
  const pessoas=db.pessoas,empresa=db.empresa;
  db=Object.assign(blank(),{pessoas,empresa});aplicaCatalogo();save();
  closeSheet();location.hash='#inicio';render();
}
async function fazerBackup(){
  const copia=JSON.parse(JSON.stringify(db));
  try{
    copia._fotos=nuvem()?await EstoqueCompartilhado.enviar('backup'):await fotoTodas();
    download(`backup-estoque-${today()}.json`,JSON.stringify(copia),'application/json');
  }catch(err){toast(err.message)}
}
const lerTexto=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsText(f)});
$('#fileImport').addEventListener('change',async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  if(!isAdmin())return;
  try{const d=JSON.parse(await lerTexto(f));if(!d||!Array.isArray(d.materiais)||!Array.isArray(d.obras)||!Array.isArray(d.movs))throw new Error('formato');
    if(!confirm(`Restaurar backup com ${d.materiais.length} materiais, ${d.obras.length} obras e ${d.movs.length} movimentações? Os dados ${nuvem()?'da equipe':'deste aparelho'} serão substituídos.`))return;
    const fotos=d._fotos||{};delete d._fotos;
    if(nuvem())d.pessoas=db.pessoas;
    else if(!(d.pessoas||[]).some(p=>p.admin&&p.ativo!==false))d.pessoas=(db.pessoas||[]).concat((d.pessoas||[]).filter(p=>!pessoaById(p.id)));
    db=Object.assign(blank(),d);
    const ids=new Set(db.movs.filter(m=>m.foto).map(m=>m.id)),fotosAtivas={};
    Object.keys(fotos).filter(id=>ids.has(id)).forEach(id=>{fotosAtivas[id]=fotos[id]});
    if(!await persistir({restaurar:true,fotos:fotosAtivas}))return;
    if(!nuvem())Object.keys(fotosAtivas).forEach(k=>fotoPut(k,fotosAtivas[k]).catch(()=>{}));
    closeSheet();location.hash='#inicio';render();toast('Backup restaurado')}
  catch(err){alert('Arquivo de backup inválido.')}
});

/* ============ Exemplo ============ */
function loadDemo(){
  if(nuvem())return;
  const d=blank();d.empresa='LANG Engenharia';
  const M=(nome,cat,un,min,preco,local)=>{const m={id:uid(),nome,cat,un,min,preco,local,criado:Date.now()};d.materiais.push(m);return m.id};
  const cim=M('Cimento CP-II 50 kg','Cimento e argamassa','saco',15,38.9,'Galpão'),arg=M('Argamassa AC-II 20 kg','Cimento e argamassa','saco',10,24.5,'Galpão'),
    are=M('Areia média','Agregados','m³',4,145,'Pátio'),bri=M('Brita 1','Agregados','m³',4,160,'Pátio'),
    a10=M('Vergalhão CA-50 10 mm','Aço e ferragens','barra',10,62,'Baia de aço'),a8=M('Vergalhão CA-50 8 mm','Aço e ferragens','barra',30,41,'Baia de aço'),
    ara=M('Arame recozido 18','Aço e ferragens','kg',10,19.9,'Prateleira B'),blo=M('Bloco cerâmico 14x19x29','Alvenaria','milheiro',3,1350,'Pátio'),
    tub=M('Tubo PVC esgoto 100 mm','Hidráulica','barra',5,58,'Prateleira C'),cab=M('Cabo flexível 2,5 mm','Elétrica','rolo',5,189,'Prateleira D'),
    tab=M('Tábua de pinus 30 cm','Madeira e fôrmas','pç',40,28,'Pátio'),tin=M('Tinta acrílica fosca 18 L','Pintura','lata',4,320,'Prateleira E'),
    cap=M('Capacete de segurança','EPI','un',10,22,'Armário EPI'),luv=M('Luva de raspa','EPI','par',8,12.5,'Armário EPI');
  const O=(nome,end,resp,cor)=>{const o={id:uid(),nome,end,resp,cor,status:'ativa',criado:Date.now()};d.obras.push(o);return o.id};
  const o1=O('Residencial Jardins','Rua das Flores, 120 — Centro','Carlos','#ff5a00'),o2=O('Casa Família Souza','Av. Brasil, 845 — Itaum','Marcos','#2d6bd6'),o3=O('Galpão Industrial Norte','Rod. BR-101, km 32','Paulo','#16855f');
  let n=0,t=Date.now()-60*864e5;
  const V=(dd,tipo,obra,itens,x={})=>{d.movs.push({id:uid(),n:++n,tipo,obra:obra||'',data:daysAgo(dd),resp:x.resp||'',doc:x.doc||'',forn:x.forn||'',obs:x.obs||'',itens:itens.map(([m,q,v])=>v?{m,q,v}:{m,q}),criado:(t+=36e5)})};
  V(40,'entrada','',[[cim,200,37.5],[arg,80,24],[ara,40,19.5]],{forn:'Casa do Construtor',doc:'NF 10231',resp:'Geovane'});
  V(39,'entrada','',[[a10,150,61],[a8,150,40]],{forn:'Aço Sul',doc:'NF 5512',resp:'Geovane'});
  V(38,'entrada','',[[are,30,140],[bri,20,158]],{forn:'Areial Itajaí',doc:'NF 889',resp:'Geovane'});
  V(37,'entrada','',[[blo,12,1320],[tub,40,57],[cab,15,185],[tab,120,27],[tin,12,315],[cap,30,21],[luv,60,12]],{forn:'Depósito Central',doc:'NF 7781',resp:'Geovane'});
  V(35,'saida',o1,[[cim,60],[are,8],[bri,6],[a10,50],[a8,40],[ara,12]],{resp:'Carlos',doc:'Caminhão QHT-2B41'});
  V(33,'saida',o2,[[cim,30],[are,5],[blo,4],[cap,6],[luv,12]],{resp:'Marcos'});
  V(30,'saida',o3,[[cim,40],[bri,8],[a10,60],[a8,50],[tab,60]],{resp:'Paulo',doc:'Caminhão QHT-2B41'});
  V(26,'saida',o1,[[blo,5],[arg,30],[tub,15]],{resp:'Carlos'});
  V(22,'devolucao',o3,[[tab,12],[a8,6]],{resp:'Paulo',obs:'Sobra da fôrma do bloco B'});
  V(20,'entrada',o2,[[tin,6,309]],{forn:'Tintas Joinville',doc:'NF 3301',resp:'Marcos',obs:'Entregue direto na obra'});
  V(16,'saida',o2,[[cab,6],[tub,10],[arg,20]],{resp:'Marcos'});
  V(12,'saida',o1,[[cim,45],[are,9],[a10,25],[cab,5]],{resp:'Carlos'});
  V(9,'entrada','',[[cim,100,38.9],[are,10,145]],{forn:'Casa do Construtor',doc:'NF 10598',resp:'Geovane'});
  V(7,'saida',o3,[[cim,50],[are,10],[bri,4],[ara,15],[luv,20]],{resp:'Paulo'});
  V(5,'saida',o2,[[tin,4],[arg,15],[cap,4]],{resp:'Marcos'});
  V(3,'saida',o1,[[cim,40],[tab,30],[a8,20],[cap,8]],{resp:'Carlos',doc:'Caminhão QHT-2B41'});
  V(2,'devolucao',o1,[[cim,5]],{resp:'Carlos',obs:'Sacos fechados que sobraram'});
  V(1,'saida',o3,[[tub,8],[cab,3],[luv,18]],{resp:'Paulo'});
  V(0,'saida',o2,[[cim,20],[are,3]],{resp:'Marcos'});
  d.seq=n;d.ultimoResp='Geovane';d.pessoas=db.pessoas||[];d.empresa=db.empresa||d.empresa;db=d;aplicaCatalogo();save();closeSheet();location.hash='#inicio';render();toast('Dados de exemplo carregados');
}

/* ============ Início ============ */
$('#fab').onclick=()=>formMov('saida');
$('#tabNew').onclick=e=>{e.preventDefault();formMov('saida')};
$('#btnCfg').onclick=config;
$('#btnUser').onclick=()=>logout('Até logo!');
render();
abrirEstoque();
setInterval(()=>atualizarEstoque(false),30000);
document.addEventListener('visibilitychange',()=>atualizarEstoque(false));
if(navigator.serviceWorker&&location.protocol!=='file:')navigator.serviceWorker.register('service-worker.js').catch(()=>{});
