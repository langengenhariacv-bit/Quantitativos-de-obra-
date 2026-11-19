const CACHE='lang-casa-v16';
const SHELL=['./','./engine.js','./leitor-vetorial.js','./xlsx.js','./manifest.json','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-180.png','../vendor/pdf.min.mjs','../vendor/pdf.worker.min.mjs'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('lang-casa-')&&x!==CACHE).map(x=>caches.delete(x)))),self.clients.claim()]))});
self.addEventListener('fetch',e=>{const req=e.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(req.mode==='navigate'){e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./',r.clone()));return r}).catch(()=>caches.match('./')));return}
  e.respondWith(fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r}).catch(()=>caches.match(req)))});
