const CACHE='l2b-financeiro-pwa-v5';
const APP_SHELL=['./','./manifest.json','./assets/l2b-logo-aprovada.webp','./assets/l2b-icon-192.png','./assets/l2b-icon-512.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('l2b-financeiro-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.method!=='GET') return;
  if(url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        if(res.ok)caches.open(CACHE).then(c=>c.put('./',res.clone()));
        return res;
      }).catch(()=>caches.match('./'))
    );
    return;
  }
  event.respondWith(
    fetch(req).then(res=>{
      if(res.ok)caches.open(CACHE).then(c=>c.put(req,res.clone()));
      return res;
    }).catch(()=>caches.match(req))
  );
});
