// Cena 3D real (WebGL) do painel da Visão geral.
// Desenha a base, as torres, o anel e as esferas com luz e sombra de verdade.
// Os rótulos, toques e o painel de detalhes continuam em HTML por cima, alinhados
// porque a câmera aqui reproduz exatamente a perspectiva do CSS (.h3d-stage / .h3d-world).
import * as THREE from './vendor/three.module.min.js';

const P = 1500, PW = 600, PH = 400, DEG = Math.PI / 180;
const PAL = {
  '': [[255, 122, 55], [255, 196, 140]], hot: [[255, 176, 84], [255, 236, 190]], red: [[255, 75, 58], [255, 170, 150]],
  dim: [[150, 135, 125], [205, 190, 180]], good: [[70, 210, 150], [170, 255, 215]], sel: [[255, 240, 200], [255, 255, 245]],
  blue: [[77, 163, 255], [190, 222, 255]], violet: [[155, 123, 255], [216, 204, 255]], teal: [[47, 214, 195], [180, 246, 238]],
  pink: [[255, 95, 162], [255, 196, 222]], lime: [[170, 220, 70], [225, 245, 170]]
};
const DOT = { r: [255, 90, 72], '': [255, 196, 107], n: [111, 182, 255] };
const ZONE = [[[255, 75, 58], .30], [[255, 190, 90], .22], [[77, 163, 255], .16]];
const col = a => new THREE.Color().setRGB(a[0] / 255, a[1] / 255, a[2] / 255, THREE.SRGBColorSpace);
const clamp01 = t => Math.min(1, Math.max(0, t));
const easeBack = t => { t = clamp01(t); const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) };
const easeOut = t => 1 - Math.pow(1 - clamp01(t), 3);

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function floorTexture(aniso) {
  const S = 2, c = document.createElement('canvas'); c.width = PW * S; c.height = PH * S;
  const g = c.getContext('2d'); g.scale(S, S);
  const bg = g.createLinearGradient(0, 0, PW, PH); bg.addColorStop(0, '#3a2012'); bg.addColorStop(1, '#1c110b');
  g.fillStyle = bg; g.fillRect(0, 0, PW, PH);
  const rg = g.createRadialGradient(PW / 2, PH / 2, 20, PW / 2, PH / 2, 330);
  rg.addColorStop(0, 'rgba(255,122,55,.34)'); rg.addColorStop(1, 'rgba(255,122,55,0)');
  g.fillStyle = rg; g.fillRect(0, 0, PW, PH);
  g.strokeStyle = 'rgba(255,170,110,.17)'; g.lineWidth = 1; g.beginPath();
  for (let x = 50; x < PW; x += 50) { g.moveTo(x, 0); g.lineTo(x, PH) }
  for (let y = 50; y < PH; y += 50) { g.moveTo(0, y); g.lineTo(PW, y) }
  g.stroke();
  g.strokeStyle = 'rgba(255,180,120,.85)'; g.lineWidth = 2; g.strokeRect(2, 2, PW - 4, PH - 4);
  g.strokeStyle = '#ffd08a'; g.lineWidth = 4; g.shadowColor = 'rgba(255,190,110,.9)'; g.shadowBlur = 12; g.lineCap = 'square';
  const L = 40, m = 9;
  [[m, m, 1, 1], [PW - m, m, -1, 1], [m, PH - m, 1, -1], [PW - m, PH - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    g.beginPath(); g.moveTo(x + L * sx, y); g.lineTo(x, y); g.lineTo(x, y + L * sy); g.stroke();
  });
  g.shadowBlur = 0; g.fillStyle = 'rgba(255,205,165,.5)'; g.font = '900 11px system-ui,-apple-system,Segoe UI,sans-serif'; g.textBaseline = 'alphabetic';
  let x = 26; for (const ch of 'LANG ENGENHARIA') { g.fillText(ch, x, PH - 18); x += g.measureText(ch).width + 4.6 }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = aniso; return t;
}
function roundedShape(w, d) {
  const r = Math.min(7, w / 5, d / 5), x = -w / 2, y = -d / 2, s = new THREE.Shape();
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}

export function createGL() {
  const canvas = document.createElement('canvas'); canvas.className = 'h3d-canvas'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch (e) { return null }
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());

  const scene = new THREE.Scene(), cam = new THREE.Camera();
  cam.position.set(0, 0, P); cam.updateMatrixWorld(true);
  const root = new THREE.Group(); root.matrixAutoUpdate = false; scene.add(root);
  const dyn = new THREE.Group(); root.add(dyn);
  const glowTex = glowTexture(), unitPlane = new THREE.PlaneGeometry(1, 1);
  const glowMat = (c, o) => new THREE.MeshBasicMaterial({ map: glowTex, color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });

  // luzes
  scene.add(new THREE.HemisphereLight(0xffe6d2, 0x24120a, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1e2, 2.6);
  sun.position.set(-120, -300, 640); sun.target.position.set(PW / 2, PH / 2, 0); sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -470, right: 470, top: 470, bottom: -470, near: 50, far: 2200 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 1.2; sun.shadow.radius = 5;
  root.add(sun, sun.target);
  const warm = new THREE.PointLight(0xff8a45, 60000, 0, 2); warm.position.set(PW / 2, PH / 2, 190); root.add(warm);

  // base
  const floorTex = floorTexture(renderer.capabilities.getMaxAnisotropy());
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: floorTex, emissiveMap: floorTex, emissive: 0xffffff, emissiveIntensity: .8, roughness: .5, metalness: .25 }));
  floor.position.set(PW / 2, PH / 2, 0); floor.receiveShadow = true; root.add(floor);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 16), new THREE.MeshStandardMaterial({ color: 0x1a0f09, emissive: 0xff7a37, emissiveIntensity: .22, roughness: .6 }));
  slab.position.set(PW / 2, PH / 2, -8.2); root.add(slab);
  const under = new THREE.Mesh(unitPlane, glowMat(0xff6a28, .55)); under.scale.set(PW * 1.7, PH * 1.9, 1); under.position.set(PW / 2, PH / 2, -70); root.add(under);

  // poeira luminosa
  const N = 70, pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i * 3] = -80 + Math.random() * (PW + 160); pp[i * 3 + 1] = -80 + Math.random() * (PH + 160); pp[i * 3 + 2] = 10 + Math.random() * 260 }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffc89a, size: 5, sizeAttenuation: false, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(dust);

  const geoCache = new Map();
  const boxGeo = (w, d) => {
    const k = w + 'x' + d; if (geoCache.has(k)) return geoCache.get(k);
    const shape = roundedShape(w, d), body = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 5 });
    const pos = body.attributes.position, cs = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const v = pos.getZ(i) > .5 ? 1 : .42; cs[i * 3] = cs[i * 3 + 1] = cs[i * 3 + 2] = v }
    body.setAttribute('color', new THREE.BufferAttribute(cs, 3));
    const g = { body, cap: new THREE.ShapeGeometry(shape, 5) }; geoCache.set(k, g); return g;
  };
  const sphereGeo = new THREE.SphereGeometry(1, 28, 20), stemGeo = new THREE.BoxGeometry(1, 1, 1); stemGeo.translate(0, 0, .5);

  let items = [], t0 = 0, still = false, selKey = null, stage = null, world = null, lw = 0, lh = 0, lp = 0;
  const m = new THREE.Matrix4(), tmp = new THREE.Matrix4();

  function paintBox(o) {
    const [k, kt] = PAL[o.key && o.key === selKey ? 'sel' : o.cls] || PAL[''];
    o.body.material.color.copy(col(k)); o.body.material.emissive.copy(col(k)); o.cap.material.color.copy(col(kt)); o.glow.material.color.copy(col(k));
  }
  function clear() {
    for (const o of [...dyn.children]) {
      dyn.remove(o);
      o.traverse(x => { if (x.material) x.material.dispose(); if (x.userData.ownGeo) x.geometry.dispose() });
    }
    items = [];
  }
  function setScene(list, reduce) {
    clear(); still = !!reduce; t0 = performance.now();
    for (const it of list || []) {
      if (it.t === 'box') {
        const g = new THREE.Group(), geo = boxGeo(it.w, it.d); g.position.set(it.x + it.w / 2, it.y + it.d / 2, 0);
        const body = new THREE.Mesh(geo.body, new THREE.MeshStandardMaterial({ emissiveIntensity: .38, roughness: .26, metalness: .12, vertexColors: true }));
        body.castShadow = true; body.receiveShadow = true;
        const cap = new THREE.Mesh(geo.cap, new THREE.MeshBasicMaterial());
        const glow = new THREE.Mesh(unitPlane, glowMat(0xffffff, .6)); glow.scale.set(it.w + 80, it.d + 80, 1); glow.position.z = .9;
        g.add(glow, body, cap); dyn.add(g);
        const o = { ...it, body, cap, glow }; paintBox(o); items.push(o);
      } else if (it.t === 'dot') {
        const c = col(DOT[it.cls] || DOT['']), g = new THREE.Group(); g.position.set(it.x, it.y, 0);
        const ball = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .38, roughness: .16, metalness: .05 })); ball.castShadow = true;
        const stem = new THREE.Mesh(stemGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .6 }));
        const glow = new THREE.Mesh(unitPlane, glowMat(c, .5)); glow.scale.set(54, 54, 1); glow.position.z = 1;
        g.add(glow, stem, ball); dyn.add(g); items.push({ ...it, ball, stem });
      } else if (it.t === 'zone') {
        const [c, o] = ZONE[it.zi] || ZONE[2];
        const z = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ color: col(c), transparent: true, opacity: o, depthWrite: false }));
        z.scale.set(it.w - 1, PH - 2, 1); z.position.set(it.x + it.w / 2, PH / 2, .5); dyn.add(z);
      } else if (it.t === 'ring') {
        const g = new THREE.Group(); g.position.set(it.x, it.y, 4); g.scale.z = .55; g.rotation.z = -Math.PI / 2;
        const bg = new THREE.Mesh(new THREE.TorusGeometry(it.r, 7, 10, 72), new THREE.MeshStandardMaterial({ color: 0x6b3a1e, emissive: 0xff9a5a, emissiveIntensity: .12, roughness: .5 }));
        bg.userData.ownGeo = true; bg.receiveShadow = true;
        const fg = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x58e0a8, emissive: 0x46d296, emissiveIntensity: .7, roughness: .3 }));
        fg.userData.ownGeo = true; fg.castShadow = true; fg.position.z = 1.5; fg.visible = false;
        const glow = new THREE.Mesh(unitPlane, glowMat(0x46d296, .35)); glow.scale.set(it.r * 3.4, it.r * 3.4, 1); glow.position.z = -3;
        g.add(glow, bg, fg); dyn.add(g); items.push({ ...it, fg, arc: -1 });
      }
    }
  }
  function setSel(key) { selKey = key || null; for (const o of items) if (o.t === 'box') paintBox(o) }
  function attach(st, w) {
    stage = st; world = w; lw = lh = 0;
    if (canvas.parentNode !== st) st.insertBefore(canvas, st.firstChild);
  }
  function frame(t, rz, rx, sc, bs) {
    if (!stage || !stage.isConnected || !world) return;
    const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    const pr = Math.min(window.devicePixelRatio || 1, 2), Ox = .5 * W, Oy = .38 * H;
    if (W !== lw || H !== lh || pr !== lp) {
      lw = W; lh = H; lp = pr; renderer.setPixelRatio(pr); renderer.setSize(W, H, false);
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
        o.body.scale.z = h; o.cap.position.z = h + .25;
      } else if (o.t === 'dot') {
        const sel = o.key && o.key === selKey, r = 10 * (bs || 1) * (sel ? 1.3 : 1), z = o.z + 6 + (still ? 0 : 6 * Math.sin(t / 1080 + o.ph));
        o.ball.scale.setScalar(r); o.ball.position.z = z + r; o.stem.scale.set(1.8, 1.8, z + r * .3);
        o.ball.material.emissiveIntensity = sel ? .9 : .38;
      } else if (o.t === 'ring') {
        const arc = Math.round(o.pct / 100 * (still ? 1 : easeOut((el - 150) / 1400)) * 200) / 200;
        if (arc !== o.arc) {
          o.arc = arc; o.fg.geometry.dispose(); o.fg.visible = arc > .004;
          if (o.fg.visible) o.fg.geometry = new THREE.TorusGeometry(o.r, 8.5, 12, Math.max(8, Math.round(96 * arc)), Math.PI * 2 * arc);
        }
      }
    }
    if (!still) {
      const a = dustGeo.attributes.position;
      for (let i = 0; i < N; i++) { let z = a.getZ(i) + .12 + (i % 5) * .03; if (z > 280) z = 8; a.setZ(i, z) }
      a.needsUpdate = true;
    }
    renderer.render(scene, cam);
  }
  return { canvas, attach, setScene, setSel, frame };
}
