// Ponte usada no navegador (iPhone/computador): mesma interface do window.TV do app Android,
// falando o protocolo SSAP da LG direto por WebSocket. Não tem infravermelho.
(function () {
  if (window.TV) return;

  const store = {
    get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const POINTER_URI = 'ssap://com.webos.service.networkinput/getPointerInputSocket';

  let pairingTemplate = null;
  const pairingReady = fetch('pairing.json').then(r => r.json()).then(j => { pairingTemplate = j; });

  let ws = null, pointer = null, registered = false, registerSigned = true;
  let seq = 0, gen = 0, ip = '', pointerPending = false, queued = [];

  const emit = (state, detail) => { if (window.tvState) window.tvState(state, detail || ''); };

  function send(type, id, uri, payload) {
    if (!ws || ws.readyState !== 1) return;
    const m = { type, id };
    if (uri) m.uri = uri;
    if (payload) m.payload = payload;
    ws.send(JSON.stringify(m));
  }

  function register(signed) {
    const p = JSON.parse(JSON.stringify(pairingTemplate));
    if (!signed) {
      // TVs com firmware recente recusam o manifesto assinado antigo.
      delete p.manifest.signed;
      p.manifest.appVersion = '1.0';
      p.manifest.permissions.push('CONTROL_INPUT_TEXT', 'CONTROL_MOUSE_AND_KEYBOARD');
    }
    const key = store.get('lg_key');
    if (key) p['client-key'] = key;
    registerSigned = signed;
    send('register', 'reg_' + (++seq), null, p);
  }

  function closeAll() {
    gen++;
    if (ws) ws.close();
    if (pointer) pointer.close();
    ws = pointer = null;
    registered = false;
    pointerPending = false;
    queued = [];
  }

  function connect(address) {
    closeAll();
    ip = address;
    store.set('lg_ip', ip);
    const g = gen;
    emit('connecting', ip);
    // Páginas https só podem abrir wss://; TVs antigas (antes de 2018) só têm ws:// na porta 3000.
    const urls = ['wss://' + ip + ':3001'];
    if (location.protocol !== 'https:') urls.push('ws://' + ip + ':3000');

    const attempt = i => {
      if (g !== gen) return;
      if (i >= urls.length) { ws = null; emit('offline', 'cert'); return; }
      let opened = false, s;
      try { s = new WebSocket(urls[i]); } catch (e) { attempt(i + 1); return; }
      ws = s;
      const timer = setTimeout(() => { if (!opened) s.close(); }, 4000);
      s.onopen = () => {
        if (g !== gen) { s.close(); return; }
        opened = true;
        clearTimeout(timer);
        pairingReady.then(() => { if (g === gen) register(true); });
      };
      s.onmessage = e => { if (g === gen) handle(e.data); };
      s.onclose = () => {
        clearTimeout(timer);
        if (g !== gen) return;
        if (!opened) { attempt(i + 1); return; }
        ws = pointer = null;
        registered = false;
        emit('offline', '');
      };
    };
    attempt(0);
  }

  function handle(text) {
    let d;
    try { d = JSON.parse(text); } catch (e) { return; }
    const id = d.id || '', payload = d.payload || {};
    if (id.startsWith('reg_')) {
      if (d.type === 'registered') {
        if (payload['client-key']) store.set('lg_key', payload['client-key']);
        registered = true;
        emit('connected', ip);
      } else if (d.type === 'response' && payload.pairingType === 'PROMPT') {
        emit('prompt');
      } else if (d.type === 'error') {
        if (registerSigned && /blacklisted/i.test(d.error || '')) register(false);
        else emit('refused', d.error);
      }
      return;
    }
    if (id.startsWith('ptr_')) {
      if (payload.socketPath) openPointer(payload.socketPath);
      else { pointerPending = false; queued = []; }
    }
    if (d.type === 'error') emit('error', d.error);
  }

  function openPointer(path) {
    // Em página https, troca o endereço ws:// que algumas TVs devolvem pela porta segura.
    if (location.protocol === 'https:' && path.startsWith('ws://')) {
      path = path.replace(/^ws:\/\/([^/:]+)(:\d+)?/, 'wss://$1:3001');
    }
    const g = gen;
    let s;
    try { s = new WebSocket(path); } catch (e) { pointerPending = false; queued = []; return; }
    s.onopen = () => {
      if (g !== gen) { s.close(); return; }
      pointer = s;
      pointerPending = false;
      queued.forEach(name => s.send('type:button\nname:' + name + '\n\n'));
      queued = [];
    };
    s.onclose = () => {
      if (pointer === s) pointer = null;
      if (g === gen) { pointerPending = false; queued = []; }
    };
  }

  function key(name) {
    if (!registered) return false;
    if (pointer && pointer.readyState === 1) { pointer.send('type:button\nname:' + name + '\n\n'); return true; }
    queued.push(name);
    if (!pointerPending) { pointerPending = true; send('request', 'ptr_' + (++seq), POINTER_URI, null); }
    return true;
  }

  window.TV = {
    hasIr: () => false,
    ir: () => false,
    connected: () => registered,
    connect,
    forget() { closeAll(); store.del('lg_ip'); store.del('lg_key'); emit('offline', ''); },
    request(uri, payload) {
      if (!registered) return false;
      let p = null;
      if (payload) { try { p = JSON.parse(payload); } catch (e) { return false; } }
      send('request', 'req_' + (++seq), uri, p);
      return true;
    },
    key,
    getPref: n => store.get('ui_' + n),
    setPref: (n, v) => store.set('ui_' + n, v),
    savedIp: () => store.get('lg_ip'),
    vibrate() { if (navigator.vibrate) navigator.vibrate(12); }
  };

  window.addEventListener('load', () => {
    if (store.get('lg_ip')) connect(store.get('lg_ip'));
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !registered && (!ws || ws.readyState > 1) && store.get('lg_ip')) connect(store.get('lg_ip'));
  });
})();
