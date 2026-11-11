const CACHE='lang-engenharia-pwa-v19';
const APP_SHELL=['./vendor/jspdf.umd.min.js','./h3d-gl.js','./vendor/three.module.min.js','./','./manifest.json','./assets/lang-logo.svg','./assets/lang-icon-192.svg','./assets/lang-icon-512.svg'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lang-engenharia-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;if(url.pathname.startsWith('/api/')){event.respondWith(fetch(req,{cache:'no-store'}));return}if(req.mode==='navigate'){event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put('./',res.clone()));return res}).catch(()=>caches.match('./')));return}event.respondWith(fetch(req).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone()));return res}).catch(()=>caches.match(req)))});
// ----- Lembretes de prazo -----
// Lê o resumo (títulos e datas) que o app guarda no aparelho quando os lembretes estão ativados.
function kv(mode,fn){return new Promise((res,rej)=>{const r=indexedDB.open('lang-gestao-offline',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onerror=()=>rej(r.error);r.onsuccess=()=>{const t=r.result.transaction('kv',mode),q=fn(t.objectStore('kv'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}})}
async function showReminders(){
  const d=await kv('readonly',s=>s.get('reminders'));if(!d||!d.enabled||!Array.isArray(d.items))return;
  const t0=new Date().toISOString().slice(0,10),t1=new Date(Date.now()+864e5).toISOString().slice(0,10),items=d.items.filter(x=>x&&x.due&&x.due<=t1);if(!items.length)return;
  const shown=await kv('readonly',s=>s.get('remShown'));if(typeof shown==='string'&&shown.slice(0,10)===t0)return;
  const fmt=x=>x.slice(8,10)+'/'+x.slice(5,7),late=items.filter(x=>x.due<t0).length,now=items.filter(x=>x.due===t0).length,next=items.filter(x=>x.due===t1).length;
  const title='LANG Engenharia · '+[late?late+(late===1?' vencido':' vencidos'):'',now?now+' para hoje':'',next?next+' para amanhã':''].filter(Boolean).join(' · ');
  const body=items.slice(0,5).map(x=>(x.due<t0?'Vencido '+fmt(x.due):x.due===t0?'Hoje':'Amanhã')+': '+x.text).join('\n')+(items.length>5?'\n… e mais '+(items.length-5):'');
  await self.registration.showNotification(title,{body,tag:'lang-reminders',icon:'./assets/lang-icon-192.svg',data:{url:'./'}});
  await kv('readwrite',s=>s.put(t0+'|bg','remShown'));
}
self.addEventListener('periodicsync',event=>{if(event.tag==='lang-reminders')event.waitUntil(showReminders().catch(()=>{}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list.find(x=>x.url.startsWith(self.registration.scope));return c?c.focus():self.clients.openWindow(self.registration.scope)}))});
