// Cena 3D real (WebGL) do painel da Visão geral — estilo neon.
// Desenha a base espelhada, as torres com contorno luminoso, o anel e as esferas, com brilho (bloom).
// Os rótulos, toques e o painel de detalhes continuam em HTML por cima, alinhados
// porque a câmera aqui reproduz exatamente a perspectiva do CSS (.h3d-stage / .h3d-world).
import * as THREE from './vendor/three.module.min.js';

const P = 1500, PW = 600, PH = 400, DEG = Math.PI / 180;
const PAL = {
  '': [[255, 122, 55], [255, 196, 140]], hot: [[255, 176, 84], [255, 236, 190]], red: [[255, 75, 58], [255, 170, 150]],
  dim: [[120, 112, 108], [190, 180, 172]], good: [[70, 210, 150], [170, 255, 215]], sel: [[255, 240, 200], [255, 255, 245]],
  blue: [[77, 163, 255], [190, 222, 255]], violet: [[155, 123, 255], [216, 204, 255]], teal: [[47, 214, 195], [180, 246, 238]],
  pink: [[255, 95, 162], [255, 196, 222]], lime: [[170, 220, 70], [225, 245, 170]]
};
const DOT = { r: [255, 90, 72], '': [255, 196, 107], n: [111, 182, 255] };
const ZONE = [[[255, 75, 58], .17], [[255, 190, 90], .11], [[77, 163, 255], .1]];
const col = a => new THREE.Color().setRGB(a[0] / 255, a[1] / 255, a[2] / 255, THREE.SRGBColorSpace);
const clamp01 = t => Math.min(1, Math.max(0, t));
const easeBack = t => { t = clamp01(t); const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) };
const easeOut = t => 1 - Math.pow(1 - clamp01(t), 3);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const glowTexture = () => canvasTex(128, 128, g => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});
// feixe vertical: opaco embaixo, some em cima
const beamTexture = () => canvasTex(4, 128, (g, w, h) => {
  const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(.55, 'rgba(255,255,255,.22)'); r.addColorStop(1, 'rgba(255,255,255,.9)');
  g.fillStyle = r; g.fillRect(0, 0, w, h);
});
// faixa de luz que varre o piso
const sweepTexture = () => canvasTex(128, 4, (g, w, h) => {
  const r = g.createLinearGradient(0, 0, w, 0); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(.8, 'rgba(255,255,255,.35)'); r.addColorStop(.97, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, h);
});
function floorTexture(aniso) {
  const S = 2, t = canvasTex(PW * S, PH * S, g => {
    g.scale(S, S);
    g.fillStyle = '#0d0a09'; g.fillRect(0, 0, PW, PH);
    const rg = g.createRadialGradient(PW / 2, PH / 2, 20, PW / 2, PH / 2, 340);
    rg.addColorStop(0, 'rgba(255,110,45,.30)'); rg.addColorStop(1, 'rgba(255,110,45,0)');
    g.fillStyle = rg; g.fillRect(0, 0, PW, PH);
    g.strokeStyle = 'rgba(255,150,90,.26)'; g.lineWidth = 1; g.beginPath();
    for (let x = 50; x < PW; x += 50) { g.moveTo(x, 0); g.lineTo(x, PH) }
    for (let y = 50; y < PH; y += 50) { g.moveTo(0, y); g.lineTo(PW, y) }
    g.stroke();
    g.fillStyle = 'rgba(255,190,140,.75)';
    for (let x = 50; x < PW; x += 50) for (let y = 50; y < PH; y += 50) g.fillRect(x - 1.5, y - 1.5, 3, 3);
    g.strokeStyle = 'rgba(255,170,110,1)'; g.lineWidth = 2.5; g.strokeRect(2, 2, PW - 4, PH - 4);
    g.strokeStyle = '#ffe0a8'; g.lineWidth = 4; g.lineCap = 'square';
    const L = 40, m = 9;
    [[m, m, 1, 1], [PW - m, m, -1, 1], [m, PH - m, 1, -1], [PW - m, PH - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      g.beginPath(); g.moveTo(x + L * sx, y); g.lineTo(x, y); g.lineTo(x, y + L * sy); g.stroke();
    });
    g.fillStyle = 'rgba(255,205,165,.6)'; g.font = '900 11px system-ui,-apple-system,Segoe UI,sans-serif'; g.textBaseline = 'alphabetic';
    let x = 26; for (const ch of 'LANG ENGENHARIA') { g.fillText(ch, x, PH - 18); x += g.measureText(ch).width + 4.6 }
  });
  t.flipY = false; t.anisotropy = aniso; return t;
}

// opts.fx: 'auto' (brilho ligado; desliga sozinho se o aparelho ficar lento), 'full' (sempre ligado) ou 'lite' (sem brilho nem espelho)
export function createGL(opts = {}) {
  const canvas = document.createElement('canvas'); canvas.className = 'h3d-canvas'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: true, powerPreference: 'high-performance' }) } catch (e) { return null }
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());

  const scene = new THREE.Scene(), cam = new THREE.Camera(); scene.background = new THREE.Color(0x0b0908);
  cam.position.set(0, 0, P); cam.updateMatrixWorld(true);
  const root = new THREE.Group(); root.matrixAutoUpdate = false; scene.add(root);
  const dyn = new THREE.Group(); root.add(dyn);
  const glowTex = glowTexture(), beamTex = beamTexture(), sweepTex = sweepTexture(), unitPlane = new THREE.PlaneGeometry(1, 1);
  const addMat = (c, o, map) => new THREE.MeshBasicMaterial({ map: map || glowTex, color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  // tudo o que é reflexo só aparece dentro da área do piso (máscara de estêncil)
  const mirrorProps = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc };

  // luzes
  scene.add(new THREE.HemisphereLight(0xffe6d2, 0x1a0e08, .9));
  const sun = new THREE.DirectionalLight(0xfff1e2, 2.2);
  sun.position.set(-120, -300, 640); sun.target.position.set(PW / 2, PH / 2, 0); sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -470, right: 470, top: 470, bottom: -470, near: 50, far: 2200 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 1.2; sun.shadow.radius = 5;
  root.add(sun, sun.target);
  const warm = new THREE.PointLight(0xff8a45, 50000, 0, 2); warm.position.set(PW / 2, PH / 2, 190); root.add(warm);

  // base: máscara do espelho, piso semitransparente, moldura luminosa e brilho por baixo
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }));
  mask.position.set(PW / 2, PH / 2, 0); mask.renderOrder = -3; root.add(mask);
  const floorTex = floorTexture(renderer.capabilities.getMaxAnisotropy());
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: floorTex, emissiveMap: floorTex, emissive: 0xffffff, emissiveIntensity: 1.0, roughness: .35, metalness: .4, transparent: true, opacity: .74, depthWrite: false }));
  floor.position.set(PW / 2, PH / 2, 0); floor.receiveShadow = true; floor.renderOrder = -1; root.add(floor);
  const under = new THREE.Mesh(unitPlane, addMat(0xff5a1c, .26)); under.scale.set(PW * 1.8, PH * 2, 1); under.position.set(PW / 2, PH / 2, -90); under.renderOrder = -4; root.add(under);
  const sweep = new THREE.Mesh(unitPlane, addMat(0xffc48a, .0, sweepTex)); sweep.scale.set(150, PH - 6, 1); sweep.position.set(0, PH / 2, .8); root.add(sweep);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 72), addMat(0xffb070, 0)); pulse.material.map = null; pulse.position.set(PW / 2, PH / 2, 1.1); pulse.visible = false; root.add(pulse);
  const selRing = new THREE.Group(); selRing.visible = false; root.add(selRing);
  for (let i = 0; i < 3; i++) { const a = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 24, 1, i * Math.PI * 2 / 3, 1.5), addMat(0xfff0c8, .95)); a.material.map = null; selRing.add(a) }

  // partículas de luz
  const N = 130, pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i * 3] = -80 + Math.random() * (PW + 160); pp[i * 3 + 1] = -80 + Math.random() * (PH + 160); pp[i * 3 + 2] = 6 + Math.random() * 300 }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffc89a, size: 5, sizeAttenuation: false, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(dust);

  // geometrias compartilhadas (caixa unitária com base em z=0 e topo em z=1, mais clara em cima)
  const boxGeo = new THREE.BoxGeometry(1, 1, 1); boxGeo.translate(0, 0, .5);
  { const pos = boxGeo.attributes.position, cs = new Float32Array(pos.count * 3); for (let i = 0; i < pos.count; i++) { const v = pos.getZ(i) > .5 ? 1 : .3; cs[i * 3] = cs[i * 3 + 1] = cs[i * 3 + 2] = v } boxGeo.setAttribute('color', new THREE.BufferAttribute(cs, 3)) }
  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const beamGeo = new THREE.CylinderGeometry(.5, .5, 1, 14, 1, true); beamGeo.rotateX(Math.PI / 2); beamGeo.translate(0, 0, .5);
  const sphereGeo = new THREE.SphereGeometry(1, 28, 20), stemGeo = new THREE.BoxGeometry(1, 1, 1); stemGeo.translate(0, 0, .5);

  // brilho (bloom) por pós-processamento
  let composer = null, bloom = null, fx = opts.fx || 'auto', fxOn = fx !== 'lite', slow = 0, frames = 0, lastT = 0;
  function buildComposer() {
    try {
      const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4, stencilBuffer: true, depthBuffer: true });
      composer = new THREE.EffectComposer(renderer, rt);
      composer.addPass(new THREE.RenderPass(scene, cam));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), .5, .5, .8); composer.addPass(bloom);
      composer.addPass(new THREE.OutputPass());
    } catch (e) { composer = null; fxOn = false }
  }
  function applyFx() {
    if (fxOn && !composer) buildComposer();
    for (const o of items) { if (o.mirror) o.mirror.visible = fxOn; if (o.beam) o.beam.visible = fxOn && o.beamOk }
    floor.material.opacity = fxOn ? .74 : .96; lw = lh = 0;
  }
  function setFx(mode) { fx = mode || 'auto'; fxOn = fx !== 'lite'; slow = frames = 0; applyFx() }

  let items = [], t0 = 0, still = false, selKey = null, stage = null, world = null, lw = 0, lh = 0, lp = 0;
  const m = new THREE.Matrix4(), tmp = new THREE.Matrix4();

  function paintBox(o) {
    const [k, kt] = PAL[o.key && o.key === selKey ? 'sel' : o.cls] || PAL[''];
    const c = col(k), ct = col(kt), big = o.w * o.d > 9000, capC = c.clone().lerp(ct, big ? .1 : .45), dimC = c.clone().multiplyScalar(.45);
    o.body.material.color.copy(c); o.body.material.emissive.copy(c); o.cap.material.color.copy(capC); o.edges.material.color.copy(ct); o.glow.material.color.copy(c);
    if (o.beam) o.beam.material.color.copy(c);
    if (o.mirror) { o.mirror.children[0].material.color.copy(dimC); o.mirror.children[0].material.emissive.copy(dimC); o.mirror.children[1].material.color.copy(c) }
  }
  function clear() {
    for (const o of [...dyn.children]) { dyn.remove(o); o.traverse(x => { if (x.material) x.material.dispose(); if (x.userData.ownGeo) x.geometry.dispose() }) }
    items = [];
  }
  function setScene(list, reduce) {
    clear(); still = !!reduce; t0 = performance.now(); selRing.visible = false;
    for (const it of list || []) {
      if (it.t === 'box') {
        const g = new THREE.Group(); g.position.set(it.x + it.w / 2, it.y + it.d / 2, 0);
        const body = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ emissiveIntensity: .34, roughness: .22, metalness: .2, vertexColors: true }));
        body.castShadow = true; body.scale.set(it.w, it.d, 1);
        const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial()); edges.scale.copy(body.scale);
        const cap = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial()); cap.scale.set(it.w, it.d, 1);
        const glow = new THREE.Mesh(unitPlane, addMat(0xffffff, .7)); glow.scale.set(it.w + 90, it.d + 90, 1); glow.position.z = .9;
        const beamOk = it.cls !== 'dim' && it.h > 12, beam = new THREE.Mesh(beamGeo, addMat(0xffffff, .34, beamTex));
        const br = Math.min(it.w, it.d) * .62; beam.scale.set(br, br, 60 + it.h * .45);
        const mirror = new THREE.Group();
        const mb = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ emissiveIntensity: .3, roughness: .3, vertexColors: true, ...mirrorProps })); mb.scale.set(it.w, it.d, -1);
        const me = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ ...mirrorProps })); me.scale.copy(mb.scale);
        mb.renderOrder = me.renderOrder = -2; mirror.add(mb, me);
        g.add(mirror, glow, body, edges, cap, beam); dyn.add(g);
        const o = { ...it, body, edges, cap, glow, beam, beamOk, mirror }; paintBox(o); items.push(o);
      } else if (it.t === 'dot') {
        const c = col(DOT[it.cls] || DOT['']), g = new THREE.Group(); g.position.set(it.x, it.y, 0);
        const ball = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .7, roughness: .16, metalness: .05 })); ball.castShadow = true;
        const stem = new THREE.Mesh(stemGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .7 }));
        const glow = new THREE.Mesh(unitPlane, addMat(c, .6)); glow.scale.set(60, 60, 1); glow.position.z = 1;
        const mirror = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(.5), emissive: c, emissiveIntensity: .25, roughness: .2, ...mirrorProps })); mirror.renderOrder = -2;
        g.add(mirror, glow, stem, ball); dyn.add(g); items.push({ ...it, ball, stem, glow, mirror });
      } else if (it.t === 'zone') {
        const [c, o] = ZONE[it.zi] || ZONE[2];
        const z = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: o, depthWrite: false }));
        z.scale.set(it.w - 1, PH - 2, 1); z.position.set(it.x + it.w / 2, PH / 2, .5); dyn.add(z);
        const edge = new THREE.Mesh(unitPlane, addMat(col(c), .8)); edge.material.map = null; edge.scale.set(it.w - 8, 3, 1); edge.position.set(it.x + it.w / 2, 5, .9); dyn.add(edge);
      } else if (it.t === 'ring') {
        const g = new THREE.Group(); g.position.set(it.x, it.y, 4); g.scale.z = .55; g.rotation.z = -Math.PI / 2;
        const bg = new THREE.Mesh(new THREE.TorusGeometry(it.r, 7, 10, 72), new THREE.MeshStandardMaterial({ color: 0x1f3a30, emissive: 0x46d296, emissiveIntensity: .1, roughness: .5 }));
        bg.userData.ownGeo = true; bg.receiveShadow = true;
        const fg = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x58e0a8, emissive: 0x46d296, emissiveIntensity: 1.1, roughness: .3 }));
        fg.userData.ownGeo = true; fg.castShadow = true; fg.position.z = 1.5; fg.visible = false;
        const glow = new THREE.Mesh(unitPlane, addMat(0x46d296, .4)); glow.scale.set(it.r * 3.4, it.r * 3.4, 1); glow.position.z = -3;
        g.add(glow, bg, fg); dyn.add(g); items.push({ ...it, fg, arc: -1 });
      }
    }
    applyFx(); placeSel();
  }
  function placeSel() {
    const o = selKey && items.find(x => x.key === selKey && (x.t === 'box' || x.t === 'dot'));
    selRing.visible = !!o; if (!o) return;
    const r = o.t === 'box' ? Math.max(o.w, o.d) * .92 : 26;
    selRing.position.set(o.t === 'box' ? o.x + o.w / 2 : o.x, o.t === 'box' ? o.y + o.d / 2 : o.y, 1.4); selRing.scale.set(r, r, 1);
  }
  function setSel(key) { selKey = key || null; for (const o of items) if (o.t === 'box') paintBox(o); placeSel() }
  function attach(st, w) {
    stage = st; world = w; lw = lh = 0;
    if (canvas.parentNode !== st) st.insertBefore(canvas, st.firstChild);
  }
  function frame(t, rz, rx, sc, bs) {
    if (!stage || !stage.isConnected || !world) return;
    const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    // no modo automático, desliga o brilho se o aparelho não mantiver ~30 quadros por segundo
    if (fx === 'auto' && fxOn && lastT) { frames++; if (frames > 40) { if (t - lastT > 40) slow++; if (frames > 160) { if (slow > 60) { fxOn = false; applyFx(); try { localStorage.setItem('langFxSlow', '1') } catch (e) { } } slow = frames = 0 } } }
    lastT = t;
    const pr = Math.min(window.devicePixelRatio || 1, fxOn && W < 700 ? 1.5 : 2), Ox = .5 * W, Oy = .38 * H;
    if (W !== lw || H !== lh || pr !== lp) {
      lw = W; lh = H; lp = pr; renderer.setPixelRatio(pr); renderer.setSize(W, H, false);
      if (composer) { composer.setPixelRatio(pr); composer.setSize(W, H) }
      const n = 60, f = 6000, k = n / P;
      cam.projectionMatrix.makePerspective(-Ox * k, (W - Ox) * k, Oy * k, -(H - Oy) * k, n, f);
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    }
    // mesma transformação do CSS: translate(posição do mundo) scale rotateX rotateZ, com o eixo Y invertido
    m.makeScale(1, -1, 1).multiply(tmp.makeTranslation(world.offsetLeft - Ox, world.offsetTop - Oy, 0)).multiply(tmp.makeScale(sc, sc, sc))
      .multiply(tmp.makeRotationX(rx * DEG)).multiply(tmp.makeRotationZ(rz * DEG)).multiply(tmp.makeTranslation(-PW / 2, -PH / 2, 0));
    root.matrix.copy(m); root.matrixWorldNeedsUpdate = true;

    const el = t - t0;
    for (const o of items) {
      if (o.t === 'box') {
        const h = Math.max(.6, o.h * (still ? 1 : easeBack((el - o.delay) / 1100)));
        o.body.scale.z = o.edges.scale.z = h; o.cap.position.z = h + .25; o.beam.position.z = h;
        o.mirror.children[0].scale.z = o.mirror.children[1].scale.z = -h;
        o.beam.material.opacity = still ? .16 : .13 + .07 * Math.sin(t / 900 + o.x * .02);
        o.glow.material.opacity = still ? .5 : .44 + .12 * Math.sin(t / 1300 + o.x * .03);
      } else if (o.t === 'dot') {
        const sel = o.key && o.key === selKey, beat = !still && o.cls === 'r' ? 1 + .16 * Math.pow(Math.max(0, Math.sin(t / 330 + o.ph)), 6) : 1;
        const r = 10 * (bs || 1) * (sel ? 1.3 : 1) * beat, z = o.z + 6 + (still ? 0 : 6 * Math.sin(t / 1080 + o.ph));
        o.ball.scale.setScalar(r); o.ball.position.z = z + r; o.stem.scale.set(1.8, 1.8, z + r * .3);
        o.mirror.scale.setScalar(r); o.mirror.position.z = -(z + r);
        o.ball.material.emissiveIntensity = sel ? 1.3 : .7; o.glow.scale.setScalar(60 * beat);
      } else if (o.t === 'ring') {
        const arc = Math.round(o.pct / 100 * (still ? 1 : easeOut((el - 150) / 1400)) * 200) / 200;
        if (arc !== o.arc) {
          o.arc = arc; o.fg.geometry.dispose(); o.fg.visible = arc > .004;
          if (o.fg.visible) o.fg.geometry = new THREE.TorusGeometry(o.r, 8.5, 12, Math.max(8, Math.round(96 * arc)), Math.PI * 2 * arc);
        }
      }
    }
    if (still) { sweep.material.opacity = 0; pulse.visible = false }
    else {
      // onda que se abre a cada troca de cena, faixa de luz que varre o piso e partículas subindo
      const pu = el / 1300; pulse.visible = pu < 1; if (pulse.visible) { const s = 30 + 430 * easeOut(pu); pulse.scale.set(s, s, 1); pulse.material.opacity = .85 * (1 - pu) }
      const sw = (t % 6500) / 2300; sweep.material.opacity = sw < 1 ? .5 * Math.sin(sw * Math.PI) : 0; sweep.position.x = -75 + (PW + 150) * sw;
      selRing.rotation.z = t / 700;
      const a = dustGeo.attributes.position;
      for (let i = 0; i < N; i++) { let z = a.getZ(i) + .22 + (i % 5) * .06; if (z > 320) z = 6; a.setZ(i, z) }
      a.needsUpdate = true;
    }
    if (fxOn && composer) { try { composer.render() } catch (e) { composer = null; fxOn = false; applyFx(); renderer.render(scene, cam) } }
    else renderer.render(scene, cam);
  }
  return { canvas, attach, setScene, setSel, setFx, frame, fxState: () => (fxOn ? 'on' : 'off') };
}
