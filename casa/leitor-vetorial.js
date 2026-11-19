/* Lang Quantitativos — leitura automática de planta baixa em PDF vetorial (exportado do CAD), sem IA.
 *
 * 1. extrair(pdfjs, page): traços (com cor e espessura) e textos da página, em pontos (y para baixo).
 * 2. analisar(dados): escala pelas cotas, paredes pela camada mais forte, cômodos por preenchimento
 *    entre paredes (nome e área pelos textos), vãos de portas/janelas pelos rótulos P/J e pelo desenho.
 * Funções puras (sem DOM) para poderem ser testadas em Node.
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ extração (precisa do PDF.js)
  async function extrair(pdfjs, page) {
    const O = pdfjs.OPS;
    const vp = page.getViewport({ scale: 1 });
    const ol = await page.getOperatorList();
    const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
    const ap = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
    let ctm = vp.transform.slice(), cor = [0, 0, 0], lw = 1, pend = null;
    const pilha = [], segs = [];
    for (let i = 0; i < ol.fnArray.length; i++) {
      const f = ol.fnArray[i], a = ol.argsArray[i];
      if (f === O.save) pilha.push([ctm, cor, lw]);
      else if (f === O.restore) { const t = pilha.pop(); if (t) [ctm, cor, lw] = t; }
      else if (f === O.transform) ctm = mul(ctm, a);
      else if (f === O.setStrokeRGBColor) cor = typeof a === 'string' ? hexRgb(a) : [a[0], a[1], a[2]];
      else if (f === O.setStrokeGray) cor = [a[0] * 255, a[0] * 255, a[0] * 255];
      else if (f === O.setLineWidth) lw = a[0];
      else if (f === O.constructPath) {
        const ops = a[0], c = a[1]; let k = 0, cur = null, ini = null; const s = [];
        for (const op of ops) {
          if (op === O.moveTo) { cur = ap(ctm, c[k], c[k + 1]); ini = cur; k += 2; }
          else if (op === O.lineTo) { const n = ap(ctm, c[k], c[k + 1]); k += 2; if (cur) s.push([cur, n, 0]); cur = n; }
          else if (op === O.curveTo) { const n = ap(ctm, c[k + 4], c[k + 5]); k += 6; if (cur) s.push([cur, n, 1]); cur = n; }
          else if (op === O.curveTo2 || op === O.curveTo3) { const n = ap(ctm, c[k + 2], c[k + 3]); k += 4; if (cur) s.push([cur, n, 1]); cur = n; }
          else if (op === O.closePath) { if (cur && ini) s.push([cur, ini, 0]); cur = ini; }
          else if (op === O.rectangle) {
            const x = c[k], y = c[k + 1], w = c[k + 2], h = c[k + 3]; k += 4;
            const P = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map((q) => ap(ctm, q[0], q[1]));
            for (let j = 0; j < 4; j++) s.push([P[j], P[(j + 1) % 4], 0]);
          }
        }
        pend = s;
      } else if (f === O.stroke || f === O.closeStroke || f === O.fillStroke || f === O.eoFillStroke || f === O.closeFillStroke || f === O.closeEOFillStroke) {
        if (pend) {
          const w = lw * Math.hypot(ctm[0], ctm[1]);
          for (const [p0, p1, cv] of pend) segs.push([+p0[0].toFixed(3), +p0[1].toFixed(3), +p1[0].toFixed(3), +p1[1].toFixed(3), Math.round(cor[0]), Math.round(cor[1]), Math.round(cor[2]), +w.toFixed(3), cv]);
        }
        pend = null;
      } else if (f === O.endPath || f === O.fill || f === O.eoFill) pend = null;
    }
    const tc = await page.getTextContent();
    const textos = [];
    for (const it of tc.items) {
      const str = (it.str || '').trim(); if (!str) continue;
      const [a, b, c, d, e, f2] = it.transform;
      const su = Math.hypot(a, b) || 1, sv = Math.hypot(c, d) || 1;
      const w = it.width || 0, h = it.height || su;
      const cx = e + (a / su) * w / 2 + (c / sv) * h / 2, cy = f2 + (b / su) * w / 2 + (d / sv) * h / 2;
      const p = ap(vp.transform, cx, cy), o = ap(vp.transform, e, f2), q = ap(vp.transform, e + a, f2 + b);
      const L = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1;
      textos.push({ s: str, x: +p[0].toFixed(2), y: +p[1].toFixed(2), ux: +((q[0] - o[0]) / L).toFixed(4), uy: +((q[1] - o[1]) / L).toFixed(4), h: +h.toFixed(2) });
    }
    return { w: vp.width, h: vp.height, segs, textos };
  }
  function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }

  // ------------------------------------------------------------------ utilidades
  const num = (s) => parseFloat(String(s).replace(',', '.'));
  const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const mediana = (v) => { if (!v.length) return 0; const a = v.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };

  function tipoPorNome(nome) {
    const n = semAcento(nome);
    if (/lavabo/.test(n)) return 'lavabo';
    if (/\b(bwc|wc|banh|sanit)/.test(n)) return 'banheiro';
    if (/cozinha/.test(n) && /servi|lavand/.test(n)) return 'cozinha_servico';
    if (/servi|lavand/.test(n)) return 'servico';
    if (/cozinha|copa/.test(n)) return 'cozinha';
    if (/\b(flat|studio|estudio|kitnet|kitinete|loft|living)\b/.test(n)) return 'conjugado';
    if (/quarto|dormit|suite/.test(n)) return 'quarto';
    if (/escrit|home office|estudo/.test(n)) return 'escritorio';
    if (/garag/.test(n)) return 'garagem';
    if (/varanda|sacada|terra[cç]o|alpendre|area coberta|gourmet/.test(n)) return 'varanda';
    if (/deposito|despensa|dispensa/.test(n)) return 'deposito';
    if (/circul|corredor|hall|escada|acesso/.test(n)) return 'circulacao';
    if (/sala|estar|jantar|tv/.test(n)) return 'sala';
    return 'sala';
  }

  // ------------------------------------------------------------------ quadro de esquadrias
  // Procura linhas de tabela como "P1 | 0,80 x 2,10" ou "J1  150  120  100" e devolve { P1: {l, a, p} }.
  function lerQuadro(textos) {
    const linhas = [];
    for (const t of textos) {
      const nx = -t.uy, ny = t.ux, v = t.x * nx + t.y * ny, u = t.x * t.ux + t.y * t.uy;
      let L = linhas.find((l) => Math.abs(l.ux - t.ux) < 0.05 && Math.abs(l.uy - t.uy) < 0.05 && Math.abs(l.v - v) < Math.max(1.2, t.h * 0.5));
      if (!L) { L = { ux: t.ux, uy: t.uy, v, itens: [] }; linhas.push(L); }
      L.itens.push({ s: t.s, u, h: t.h || 2 });
    }
    // medida: "0,80" / "2,10" (metros com 2 casas) ou "80" / "210" (centímetros, 40 a 400)
    const medida = (x) => {
      if (/^\d[.,]\d{2}$/.test(x)) return num(x);
      if (/^[1-9]\d{1,2}$/.test(x)) { const n = +x; return n >= 40 && n <= 400 ? n / 100 : null; }
      return null;
    };
    const achados = [];
    for (const L of linhas) {
      L.itens.sort((a, b) => a.u - b.u);
      L.itens.forEach((it, k) => {
        if (!/^[PJ]\d+$/i.test(it.s)) return;
        const lim = it.u + it.h * 40;
        const prox = L.itens.slice(k + 1).filter((o) => o.u <= lim);
        const ate = prox.findIndex((o) => /^[PJ]\d+$/i.test(o.s));
        const toks = (ate >= 0 ? prox.slice(0, ate) : prox).map((o) => o.s);
        let l = null, a = null, p = null;
        const junto = toks.join(' ').replace(/[×X]/g, 'x');
        const m = junto.match(/(?:^|\s)(\d[.,]\d{2}|[1-9]\d{1,2})\s*x\s*(\d[.,]\d{2}|[1-9]\d{1,2})(?:\s*(?:\/|x)\s*(\d[.,]\d{2}|[1-9]\d{1,2}))?/);
        if (m) { l = medida(m[1]); a = medida(m[2]); if (m[3]) p = medida(m[3]); }
        else {
          const ns = toks.map(medida).filter((v) => v != null);
          if (ns.length >= 2) { l = ns[0]; a = ns[1]; if (ns.length >= 3) p = ns[2]; }
        }
        if (!(l >= 0.3 && l <= 5 && a >= 0.3 && a <= 3.2)) return;
        if (p != null && !(p >= 0 && p <= 2.5)) p = null;
        achados.push({ rot: it.s.toUpperCase(), l, a, p, u: it.u, h: it.h, ux: L.ux, uy: L.uy, v: L.v });
      });
    }
    // tabela de verdade: rótulos alinhados em coluna (mesma posição ao longo da linha), em linhas próximas
    let melhor = [];
    for (const x of achados) {
      const col = achados.filter((y) => Math.abs(y.ux - x.ux) < 0.05 && Math.abs(y.u - x.u) < x.h * 3 && Math.abs(y.v - x.v) < x.h * 40);
      if (new Set(col.map((y) => y.rot)).size > new Set(melhor.map((y) => y.rot)).size) melhor = col;
    }
    const res = {};
    if (new Set(melhor.map((y) => y.rot)).size < 2) return res;
    for (const y of melhor) if (!res[y.rot]) res[y.rot] = { l: y.l, a: y.a, p: y.p };
    return res;
  }

  // ------------------------------------------------------------------ análise
  function analisar(D, opt) {
    opt = opt || {};
    const avisos = [];
    const segs = D.segs.map((s) => ({ x1: s[0], y1: s[1], x2: s[2], y2: s[3], r: s[4], g: s[5], b: s[6], w: s[7], curva: s[8], L: Math.hypot(s[2] - s[0], s[3] - s[1]) })).filter((s) => s.L > 1e-3);
    if (segs.length < 20) return { ok: false, erro: 'O PDF não tem desenho vetorial suficiente (parece imagem escaneada). Use o desenho manual ou a leitura por IA.' };

    // camadas por cor+espessura
    const grupos = {};
    for (const s of segs) { const k = s.r + ',' + s.g + ',' + s.b + '|' + s.w.toFixed(2); (grupos[k] = grupos[k] || { k, r: s.r, g: s.g, b: s.b, w: s.w, L: 0, n: 0, segs: [] }); grupos[k].L += s.L; grupos[k].n++; grupos[k].segs.push(s); }
    const lista = Object.values(grupos);
    const sat = (g) => Math.max(g.r, g.g, g.b) - Math.min(g.r, g.g, g.b);
    const lum = (g) => 0.3 * g.r + 0.59 * g.g + 0.11 * g.b;

    // ---- escala pelas cotas: número de cota + linha paralela que passa por ele
    const numeros = D.textos.filter((t) => /^\d*[.,]\d{2}$/.test(t.s) && num(t.s) >= 0.3 && num(t.s) < 200);
    function votarEscala(cands) {
      const votos = [];
      for (const t of numeros) {
        const v = num(t.s);
        for (const s of cands) {
          const dx = (s.x2 - s.x1) / s.L, dy = (s.y2 - s.y1) / s.L;
          if (Math.abs(dx * t.uy - dy * t.ux) > 0.05) continue; // paralela ao texto
          const px = t.x - s.x1, py = t.y - s.y1;
          const along = px * dx + py * dy, perp = Math.abs(px * dy - py * dx);
          if (perp > Math.max(6, t.h * 2.2) || along < -0.05 * s.L || along > 1.05 * s.L) continue;
          votos.push(v / s.L);
        }
      }
      if (!votos.length) return null;
      votos.sort((a, b) => a - b);
      let best = 0, bv = 0;
      for (let i = 0, j = 0; i < votos.length; i++) { while (votos[i] > votos[j] * 1.02) j++; if (i - j + 1 > best) { best = i - j + 1; bv = votos[Math.floor((i + j) / 2)]; } }
      return { m: bv, votos: best, total: numeros.length };
    }
    let esc = null;
    const vermelhos = lista.filter((g) => g.r > 170 && g.g < 110 && g.b < 110).flatMap((g) => g.segs);
    if (vermelhos.length) esc = votarEscala(vermelhos);
    if (!esc || esc.votos < 4) {
      // tenta cada camada e fica com a de maior concordância
      for (const g of lista) { const e = votarEscala(g.segs); if (e && (!esc || e.votos > esc.votos)) esc = e; }
    }
    if (opt.escala) esc = { m: opt.escala, votos: 99 };
    if (!esc || esc.votos < 3) return { ok: false, erro: 'Não encontrei cotas legíveis para achar a escala. Calibre a escala manualmente e desenhe a planta.' };
    const S = esc.m; // metros por ponto

    // ---- camada de paredes: escura, pouco saturada, com mais comprimento de linhas retas
    const candidatos = lista.filter((g) => sat(g) < 60 && lum(g) < 150);
    if (!candidatos.length) return { ok: false, erro: 'Não identifiquei a camada de paredes.' };
    candidatos.sort((a, b) => b.L - a.L);
    const camadaParede = candidatos[0];
    const paredes = camadaParede.segs.filter((s) => !s.curva);

    // ---- espessura das paredes: distância entre faces paralelas
    const dists = [];
    for (let i = 0; i < paredes.length; i++) {
      const a = paredes[i]; if (a.L * S < 0.3) continue;
      const dx = (a.x2 - a.x1) / a.L, dy = (a.y2 - a.y1) / a.L;
      let best = Infinity;
      for (let j = 0; j < paredes.length; j++) {
        if (i === j) continue; const b = paredes[j];
        const ex = (b.x2 - b.x1) / b.L, ey = (b.y2 - b.y1) / b.L;
        if (Math.abs(dx * ey - dy * ex) > 0.02) continue;
        const mx = (b.x1 + b.x2) / 2 - a.x1, my = (b.y1 + b.y2) / 2 - a.y1;
        const along = mx * dx + my * dy, perp = Math.abs(mx * dy - my * dx) * S;
        if (along < 0 || along > a.L || perp < 0.05 || perp > 0.40) continue;
        if (perp < best) best = perp;
      }
      if (best < Infinity) dists.push(Math.round(best * 100) / 100);
    }
    const t = moda(dists) || 0.15;

    // ---- grade (raster) em metros
    const cel = opt.cel || 0.025;
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const s of paredes) { minx = Math.min(minx, s.x1, s.x2); maxx = Math.max(maxx, s.x1, s.x2); miny = Math.min(miny, s.y1, s.y2); maxy = Math.max(maxy, s.y1, s.y2); }
    const marg = 1.0 / S;
    minx -= marg; miny -= marg; maxx += marg; maxy += marg;
    const k = S / cel; // células por ponto
    const W = Math.ceil((maxx - minx) * k) + 1, H = Math.ceil((maxy - miny) * k) + 1;
    if (W * H > 9e6) return { ok: false, erro: 'Desenho grande demais para a leitura automática.' };
    const gx = (x) => Math.round((x - minx) * k), gy = (y) => Math.round((y - miny) * k);
    const BAR = 1, PONTE = 2;
    const g = new Uint8Array(W * H);
    function linha(x1, y1, x2, y2, v) {
      let X1 = gx(x1), Y1 = gy(y1); const X2 = gx(x2), Y2 = gy(y2);
      const dx = Math.abs(X2 - X1), dy = -Math.abs(Y2 - Y1), sx = X1 < X2 ? 1 : -1, sy = Y1 < Y2 ? 1 : -1; let err = dx + dy;
      for (;;) {
        if (X1 >= 0 && Y1 >= 0 && X1 < W && Y1 < H && !g[Y1 * W + X1]) g[Y1 * W + X1] = v;
        if (X1 === X2 && Y1 === Y2) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; X1 += sx; }
        if (e2 <= dx) { err += dx; Y1 += sy; }
      }
    }
    for (const s of camadaParede.segs) linha(s.x1, s.y1, s.x2, s.y2, BAR);

    // ---- pontes nos vãos: extremidade de face que continua, alinhada, noutra face a até 3,2 m
    const pontes = [];
    const ends = [];
    paredes.forEach((s, i) => { ends.push({ i, x: s.x1, y: s.y1, ox: s.x2, oy: s.y2 }); ends.push({ i, x: s.x2, y: s.y2, ox: s.x1, oy: s.y1 }); });
    const maxGap = 3.2 / S, tolP = 0.03 / S;
    for (const e of ends) {
      const s = paredes[e.i];
      const dx = (e.x - e.ox) / s.L, dy = (e.y - e.oy) / s.L; // direção saindo pela extremidade
      let best = null, bd = maxGap;
      for (const f of ends) {
        if (f.i === e.i) continue;
        const s2 = paredes[f.i];
        const ex = (s2.x2 - s2.x1) / s2.L, ey = (s2.y2 - s2.y1) / s2.L;
        if (Math.abs(dx * ey - dy * ex) > 0.02) continue;
        const px = f.x - e.x, py = f.y - e.y;
        const along = px * dx + py * dy, perp = Math.abs(px * dy - py * dx);
        if (along < 0.25 / S || along > bd || perp > tolP) continue;
        // a outra face precisa seguir para longe (não voltar sobre o vão)
        if ((f.ox - f.x) * dx + (f.oy - f.y) * dy < 0) continue;
        best = f; bd = along;
      }
      if (best && e.i < best.i + 1e9) {
        const key = [Math.min(e.i, best.i), Math.max(e.i, best.i)].join('-');
        if (!pontes.some((p) => p.key === key)) pontes.push({ key, x1: e.x, y1: e.y, x2: best.x, y2: best.y, L: bd * S });
      }
    }
    // uma ponte não pode atravessar outra parede
    const pontesOk = pontes.filter((p) => !atravessa(p, camadaParede.segs));
    for (const p of pontesOk) linha(p.x1, p.y1, p.x2, p.y2, PONTE);

    // ---- regiões (4-vizinhança)
    const reg = new Int32Array(W * H).fill(-1);
    const regioes = [];
    const fila = new Int32Array(W * H);
    for (let i0 = 0; i0 < W * H; i0++) {
      if (g[i0] || reg[i0] >= 0) continue;
      const id = regioes.length; let qh = 0, qt = 0; fila[qt++] = i0; reg[i0] = id;
      let n = 0, borda = false, minX = W, maxX = 0, minY = H, maxY = 0, perBar = 0, perExtra = 0;
      while (qh < qt) {
        const c = fila[qh++]; n++;
        const x = c % W, y = (c / W) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) borda = true;
        const viz = [x > 0 ? c - 1 : -1, x < W - 1 ? c + 1 : -1, y > 0 ? c - W : -1, y < H - 1 ? c + W : -1];
        for (const v of viz) {
          if (v < 0) continue;
          if (g[v]) { if (g[v] === BAR || g[v] === PONTE) perBar++; continue; }
          if (reg[v] < 0) { reg[v] = id; fila[qt++] = v; }
        }
      }
      regioes.push({ id, n, borda, minX, maxX, minY, maxY, perBar, area: n * cel * cel, per: perBar * cel });
    }
    const externas = new Set(regioes.filter((r) => r.borda).map((r) => r.id));
    if (!externas.size) return { ok: false, erro: 'Não consegui separar o lado de fora da planta.' };

    // ---- rótulos de área dos cômodos
    const rotulosArea = D.textos.filter((x) => /area\s*:?\s*\d/.test(semAcento(x.s)) || /^\d+[.,]\d+\s*m(2|²)$/i.test(x.s));
    const outros = D.textos.filter((x) => !rotulosArea.includes(x) && !/^\d*[.,]\d+$/.test(x.s) && !/^[PJ]\d+$/i.test(x.s) && !/^\d+$/.test(x.s));
    const usadosReg = new Map();
    const ambientes = [];
    for (const r0 of rotulosArea) {
      const m = semAcento(r0.s).match(/(\d+[.,]\d+)/); if (!m) continue;
      const area = num(m[1]); if (!(area > 0.3 && area < 500)) continue;
      const id = regiaoEm(r0.x, r0.y);
      if (id < 0 || externas.has(id)) continue;
      const R = regioes[id];
      // nome: textos próximos (até 1,6 m) do mesmo cômodo, acima do rótulo de área
      const perto = outros.filter((x) => Math.hypot(x.x - r0.x, x.y - r0.y) * S < 1.6 && regiaoEm(x.x, x.y) === id)
        .sort((a, b) => ((a.x - r0.x) * -a.uy + (a.y - r0.y) * a.ux) - ((b.x - r0.x) * -b.uy + (b.y - r0.y) * b.ux));
      let nome = perto.map((x) => x.s).join(' ').replace(/\s+/g, ' ').trim() || 'Ambiente';
      const a = { nome, tipo: tipoPorNome(nome), area, perimetro: 0, areaMedida: +R.area.toFixed(2), conf: 'alta', regiao: id, x: r0.x, y: r0.y };
      if (!usadosReg.has(id)) usadosReg.set(id, []);
      usadosReg.get(id).push(a); ambientes.push(a);
    }
    // perímetro: o da região; se vários cômodos dividem a mesma região (ambientes integrados), reparte pela área
    for (const [id, lst] of usadosReg) {
      const R = regioes[id], soma = lst.reduce((s2, a) => s2 + a.area, 0);
      const razao = R.area / soma;
      for (const a of lst) {
        if (razao > 1.6 || razao < 0.5) { a.perimetro = +(4.1 * Math.sqrt(a.area)).toFixed(2); a.conf = 'baixa'; }
        else if (lst.length > 1) { a.perimetro = +(Math.max(R.per * a.area / soma, 4 * Math.sqrt(a.area))).toFixed(2); a.conf = 'integrado'; }
        else a.perimetro = +R.per.toFixed(2);
      }
    }
    const nBaixa = ambientes.filter((a) => a.conf === 'baixa').length;
    if (nBaixa) avisos.push(nBaixa + ' cômodo(s) com contorno não fechado no desenho: o perímetro foi estimado pela área. Confira no levantamento.');

    // ---- paredes: faixa entre faces (regiões finas) + linhas
    let celParede = 0;
    for (let i = 0; i < W * H; i++) if (g[i] === BAR) celParede++;
    const finas = new Set();
    for (const R of regioes) {
      if (externas.has(R.id) || usadosReg.has(R.id)) continue;
      const esp = R.per > 0 ? R.area / (R.per / 2) : 1;
      if (esp < t * 1.3 && esp > t * 0.25) { finas.add(R.id); celParede += R.n; }
    }
    // contorno externo
    let bordaExt = 0;
    const ext = (i) => reg[i] >= 0 && externas.has(reg[i]);
    let minX = W, maxX = 0, minY = H, maxY = 0, dentro = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!ext(i)) { dentro++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      else {
        if (x < W - 1 && !ext(i + 1)) bordaExt++; if (x > 0 && !ext(i - 1)) bordaExt++;
        if (y < H - 1 && !ext(i + W)) bordaExt++; if (y > 0 && !ext(i - W)) bordaExt++;
      }
    }
    const Pface = bordaExt * cel;
    let areaConstr = dentro * cel * cel;
    // área total escrita fora dos cômodos (carimbo/quadro de áreas)
    const somaAmb = ambientes.reduce((s2, a) => s2 + a.area, 0);
    const totais = rotulosArea.map((x) => ({ x, v: num((semAcento(x.s).match(/(\d+[.,]\d+)/) || [])[1]) }))
      .filter((o) => o.v > somaAmb && Math.abs(o.v - areaConstr) / areaConstr < 0.12 && externas.has(regiaoEm(o.x.x, o.x.y)));
    let fonteArea = 'medida no desenho';
    if (totais.length) { areaConstr = totais[0].v; fonteArea = 'quadro de áreas da prancha'; }
    let vazios = 0;
    for (const R of regioes) if (!externas.has(R.id) && !usadosReg.has(R.id) && !finas.has(R.id)) vazios += R.area;
    let areaParedes = celParede * cel * cel;
    const porDiferenca = areaConstr - somaAmb - vazios;
    if (ambientes.length >= 3 && porDiferenca > 0) areaParedes = porDiferenca;
    const Ltot = areaParedes / t;
    const Lext = Math.max(0, Pface - 4 * t);
    const Lint = Math.max(0, Ltot - Lext);
    const envelope = { area: +areaConstr.toFixed(2), perimetro: +Pface.toFixed(2), comprimento: +((maxX - minX + 1) * cel).toFixed(2), largura: +((maxY - minY + 1) * cel).toFixed(2) };
    if (envelope.largura > envelope.comprimento) { const tmp = envelope.largura; envelope.largura = envelope.comprimento; envelope.comprimento = tmp; }

    // ---- vãos de portas e janelas
    const portasCam = lista.filter((g2) => sat(g2) > 60 && !(g2.r > 170 && g2.g < 110 && g2.b < 110)).flatMap((g2) => g2.segs);
    const rotPJ = [];
    for (const x of D.textos) if (/^[PJ]\d+$/i.test(x.s) && !rotPJ.some((y) => y.s === x.s && Math.hypot(y.x - x.x, y.y - x.y) * S < 0.3)) rotPJ.push(x);
    // caixilho desenhado dentro da espessura da parede: linha paralela entre as duas faces
    const caixilhos = [];
    for (const c of paredes) {
      const Lm = c.L * S; if (Lm < 0.3 || Lm > 3.6) continue;
      const dx = (c.x2 - c.x1) / c.L, dy = (c.y2 - c.y1) / c.L, mx = (c.x1 + c.x2) / 2, my = (c.y1 + c.y2) / 2;
      let ladoA = Infinity, ladoB = Infinity;
      for (const f of paredes) {
        if (f === c || f.L < c.L * 0.99) continue;
        const ex = (f.x2 - f.x1) / f.L, ey = (f.y2 - f.y1) / f.L;
        if (Math.abs(dx * ey - dy * ex) > 0.02) continue;
        const px = mx - f.x1, py = my - f.y1, along = px * ex + py * ey;
        if (along < 0 || along > f.L) continue;
        const perp = (px * ey - py * ex) * S;
        if (perp > 0.004 && perp < t) ladoA = Math.min(ladoA, perp); else if (perp < -0.004 && -perp < t) ladoB = Math.min(ladoB, -perp);
      }
      if (ladoA < Infinity && ladoB < Infinity && Math.abs(ladoA + ladoB - t) < 0.04) caixilhos.push({ x: mx, y: my, L: Lm });
    }
    // vão = dois arremates (traço do tamanho da espessura, ligando as faces) alinhados na mesma parede,
    // com a face interrompida entre eles (porta/passagem) ou com caixilho entre eles (janela)
    const arremates = paredes.filter((s2) => Math.abs(s2.L * S - t) < 0.035);
    const vaos = [], chaves = new Set();
    arremates.forEach((c, ci) => {
      const ux = (c.x2 - c.x1) / c.L, uy = (c.y2 - c.y1) / c.L, wx = -uy, wy = ux, mx = (c.x1 + c.x2) / 2, my = (c.y1 + c.y2) / 2;
      for (const sinal of [1, -1]) {
        let best = -1, bd = 3.3 / S;
        arremates.forEach((d, di) => {
          if (di === ci) return;
          const ex = (d.x2 - d.x1) / d.L, ey = (d.y2 - d.y1) / d.L;
          if (Math.abs(ux * ey - uy * ex) > 0.03) return;
          const vx = (d.x1 + d.x2) / 2 - mx, vy = (d.y1 + d.y2) / 2 - my;
          const along = (vx * wx + vy * wy) * sinal, off = Math.abs(vx * ux + vy * uy);
          if (off > 0.03 / S || along < 0.3 / S || along > bd) return;
          best = di; bd = along;
        });
        if (best < 0) continue;
        const key = Math.min(ci, best) + '-' + Math.max(ci, best);
        if (chaves.has(key)) continue; chaves.add(key);
        const L = bd * S, ox = wx * sinal, oy = wy * sinal;
        const cx = mx + ox * bd / 2, cy = my + oy * bd / 2;
        const cobertura = (px, py) => {
          let n = 0; const N = 12;
          for (let q = 1; q < N; q++) { const qx = px + ox * bd * q / N, qy = py + oy * bd * q / N; if (paredes.some((s2) => distSeg(qx, qy, s2) < 0.6)) n++; }
          return n / (N - 1);
        };
        const vazado = Math.min(cobertura(c.x1, c.y1), cobertura(c.x2, c.y2)) < 0.5;
        const caix = caixilhos.some((q) => Math.hypot(q.x - cx, q.y - cy) * S < t && Math.abs(q.L - L) < 0.08);
        if (!vazado && !caix) continue;
        const ang = Math.atan2(oy, ox);
        // arco de porta: pontos da camada de portas a uma distância ≈ largura de um dos batentes (dobradiça)
        const dob = [[c.x1, c.y1], [c.x2, c.y2], [c.x1 + ox * bd, c.y1 + oy * bd], [c.x2 + ox * bd, c.y2 + oy * bd]];
        let arco = false;
        for (const [hx, hy] of dob) {
          let n = 0;
          for (const s2 of portasCam) for (const [px, py] of [[s2.x1, s2.y1], [s2.x2, s2.y2]]) { const d = Math.hypot(px - hx, py - hy); if (d > bd * 0.85 && d < bd * 1.15) n++; }
          if (n >= 6) { arco = true; break; }
        }
        vaos.push({ x: cx, y: cy, largura: +L.toFixed(2), ang, externa: externoPerto(cx, cy, ang), janela: caix, porta: vazado && !caix, arco });
      }
    });

    const aberturas = [];
    const porRotulo = rotPJ.length >= 3;
    const vUsado = new Set();
    if (porRotulo) {
      // um rótulo = uma esquadria; a largura vem do vão mais próximo do mesmo tipo
      const pares = [];
      rotPJ.forEach((r, ri) => vaos.forEach((v, vi) => {
        const d = Math.hypot(r.x - v.x, r.y - v.y) * S; if (d > 1.8) return;
        const porta = /^p/i.test(r.s);
        pares.push([d + (porta === v.porta ? 0 : 1.2), ri, vi]);
      }));
      pares.sort((a, b) => a[0] - b[0]);
      const rUsado = new Set(), alvo = {};
      for (const [, ri, vi] of pares) { if (rUsado.has(ri) || vUsado.has(vi)) continue; rUsado.add(ri); vUsado.add(vi); alvo[ri] = vaos[vi]; }
      rotPJ.forEach((r, ri) => {
        const v = alvo[ri] || null;
        aberturas.push({ porta: /^p/i.test(r.s), largura: v ? v.largura : null, externa: v ? v.externa : null, rotulo: r.s.toUpperCase(), x: v ? v.x : r.x, y: v ? v.y : r.y, ang: v ? v.ang : 0 });
      });
      const grupo = {};
      for (const a of aberturas) (grupo[a.rotulo] = grupo[a.rotulo] || []).push(a);
      for (const k2 in grupo) {
        const ls = grupo[k2].filter((a) => a.largura).map((a) => a.largura);
        const larg = ls.length ? +modaTol(ls, 0.04).toFixed(2) : (/^P/.test(k2) ? 0.80 : 1.20);
        const nExt = grupo[k2].filter((a) => a.externa).length, nInt = grupo[k2].filter((a) => a.externa === false).length;
        const distintas = [...new Set(ls.map((x) => x.toFixed(2)))];
        const varias = distintas.length > 1 && ls.every((x) => ls.filter((y) => Math.abs(y - x) < 0.04).length >= 2);
        if (varias) avisos.push('O rótulo ' + k2 + ' aparece com larguras diferentes no desenho (' + distintas.map((x) => x.replace('.', ',')).join(' e ') + ' m): mantida a medida de cada vão.');
        for (const a of grupo[k2]) { a.larguraMedida = a.largura; a.largura = varias && a.largura ? a.largura : larg; if (a.externa === null) a.externa = /^J/.test(k2) ? true : nExt > nInt; }
      }
      const semVao = rotPJ.length - Object.keys(alvo).length;
      if (semVao) avisos.push(semVao + ' rótulo(s) de esquadria sem vão próximo: largura adotada pela do mesmo rótulo.');
    }
    // vãos sem rótulo: janela (caixilho) ou porta (com arco); em plantas rotuladas, só a porta de entrada
    vaos.forEach((v, vi) => {
      if (vUsado.has(vi)) return;
      if (aberturas.some((a) => Math.hypot(a.x - v.x, a.y - v.y) * S < 0.4)) return;
      if (porRotulo && !(v.porta && v.arco && v.largura <= 1.4)) return;
      if (!porRotulo && !(v.janela || (v.porta && v.arco))) return;
      // adota o rótulo de mesmo tipo e largura (ex.: balão desenhado como linhas, não como texto)
      let rotulo = '', larg = v.largura;
      const pref = v.janela ? 'J' : 'P';
      const mesmo = aberturas.filter((a) => a.rotulo && a.rotulo[0] === pref && a.externa === v.externa && Math.abs((a.larguraMedida || a.largura) - v.largura) < 0.05);
      if (mesmo.length) { rotulo = mesmo[0].rotulo + '*'; larg = v.largura; }
      aberturas.push({ porta: !v.janela, largura: larg, larguraMedida: v.largura, externa: v.externa, rotulo, x: v.x, y: v.y, ang: v.ang });
    });
    const semRot = aberturas.filter((a) => !a.rotulo || a.rotulo.endsWith('*')).length;
    if (porRotulo && semRot) avisos.push(semRot + ' esquadria(s) sem rótulo em texto foram reconhecidas pelo desenho (vão com arco de porta ou caixilho).');
    // quadro de esquadrias da prancha: vale mais que a medida no desenho
    const quadro = lerQuadro(D.textos);
    const qk = Object.keys(quadro);
    if (qk.length) {
      avisos.unshift('Quadro de esquadrias lido da prancha: ' + qk.sort().map((k) => k + ' ' + fmtN(quadro[k].l) + '×' + fmtN(quadro[k].a) + (quadro[k].p != null ? ' peitoril ' + fmtN(quadro[k].p) : '')).join('; ') + '.');
      for (let i = avisos.length - 1; i >= 0; i--) if (/larguras diferentes/.test(avisos[i])) avisos.splice(i, 1);
      const divergem = new Set();
      for (const a of aberturas) {
        const q = quadro[(a.rotulo || '').replace('*', '')]; if (!q) continue;
        if (a.larguraMedida && Math.abs(a.larguraMedida - q.l) > 0.06) divergem.add(a.rotulo.replace('*', ''));
        a.largura = q.l; a.alturaQuadro = q.a; if (q.p != null) a.peitorilQuadro = q.p;
      }
      if (divergem.size) avisos.push('No desenho, ' + [...divergem].join(', ') + ' não bate com a largura do quadro de esquadrias: valeu o quadro. Confira a planta.');
    }
    for (const a of aberturas) {
      const L = a.largura;
      a.tipo = a.porta ? (a.externa ? (L >= 1.6 ? 'porta_correr' : 'porta_ext') : 'porta_int') : (L < 0.8 ? 'basculante' : 'janela');
      a.altura = a.alturaQuadro || (a.porta ? 2.10 : a.tipo === 'basculante' ? 0.60 : 1.20);
      a.peitoril = a.porta ? 0 : a.peitorilQuadro != null ? a.peitorilQuadro : a.tipo === 'basculante' ? 1.60 : 1.00; a.qtd = 1;
    }

    // multiunidades / pavimentos
    const nomes = ambientes.map((a) => semAcento(a.nome)).join(' ');
    if (/escada/.test(nomes) || ambientes.filter((a) => a.tipo === 'conjugado').length > 1 || ambientes.filter((a) => a.tipo === 'cozinha' || a.tipo === 'cozinha_servico').length > 1)
      avisos.push('A planta parece ter mais de uma unidade ou outro pavimento (escada, várias cozinhas). O cálculo trata tudo como uma única casa térrea: quadro, padrão de entrada, caixa d’água e cobertura devem ser ajustados.');

    function regiaoEm(x, y) {
      let X = gx(x), Y = gy(y);
      if (X < 0 || Y < 0 || X >= W || Y >= H) return -1;
      if (reg[Y * W + X] >= 0) return reg[Y * W + X];
      for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const xx = X + dx, yy = Y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const v = reg[yy * W + xx]; if (v >= 0) return v;
      }
      return -1;
    }
    function regiaoEmExato(x, y) { const X = gx(x), Y = gy(y); if (X < 0 || Y < 0 || X >= W || Y >= H) return -1; return reg[Y * W + X]; }
    function externoPerto(x, y, ang) {
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      for (const m of [t * 0.6, t, t * 1.4 + 0.05, t * 2 + 0.1]) { const off = m / S; if (externas.has(regiaoEmExato(x + nx * off, y + ny * off)) || externas.has(regiaoEmExato(x - nx * off, y - ny * off))) return true; }
      return false;
    }
    function ladoExterno(p) {
      const dx = (p.x2 - p.x1) / (p.L / S), dy = (p.y2 - p.y1) / (p.L / S);
      const mx = (p.x1 + p.x2) / 2, my = (p.y1 + p.y2) / 2;
      for (const m of [0.06, t * 0.6, t, t * 1.4 + 0.05, t * 2 + 0.1]) {
        const off = m / S;
        if (externas.has(regiaoEmExato(mx - dy * off, my + dx * off)) || externas.has(regiaoEmExato(mx + dy * off, my - dx * off))) return true;
      }
      return false;
    }

    // ---- camada visual (para sobrepor na planta)
    const cores = { quarto: [255, 140, 60], sala: [255, 190, 60], conjugado: [255, 170, 80], escritorio: [255, 160, 90], circulacao: [180, 180, 180], cozinha: [60, 190, 170], cozinha_servico: [60, 190, 170], banheiro: [40, 160, 230], lavabo: [40, 160, 230], servico: [80, 200, 220], deposito: [170, 150, 130], varanda: [140, 200, 90], garagem: [150, 150, 150] };
    const corReg = new Map();
    for (const a of ambientes) corReg.set(a.regiao, cores[a.tipo] || [255, 150, 60]);
    // distância ao lado de fora, para colorir parede externa
    const distExt = new Int16Array(W * H).fill(-1);
    let qh = 0, qt = 0;
    for (let i = 0; i < W * H; i++) if (ext(i)) { distExt[i] = 0; fila[qt++] = i; }
    const lim = Math.ceil(t * 1.6 / cel);
    while (qh < qt) {
      const c = fila[qh++]; const d = distExt[c]; if (d >= lim) continue;
      const x = c % W;
      for (const v of [x > 0 ? c - 1 : -1, x < W - 1 ? c + 1 : -1, c - W, c + W]) {
        if (v < 0 || v >= W * H || distExt[v] >= 0) continue;
        if (!(g[v] || finas.has(reg[v]))) continue;
        distExt[v] = d + 1; fila[qt++] = v;
      }
    }
    const camada = new Uint8ClampedArray(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      let c = null, al = 0;
      if (g[i] === PONTE) { c = [22, 133, 95]; al = 230; }
      else if (g[i] === BAR || finas.has(reg[i])) { c = distExt[i] > 0 ? [217, 72, 15] : [31, 111, 209]; al = 200; }
      else if (reg[i] >= 0 && corReg.has(reg[i])) { c = corReg.get(reg[i]); al = 60; }
      if (c) { camada[i * 4] = c[0]; camada[i * 4 + 1] = c[1]; camada[i * 4 + 2] = c[2]; camada[i * 4 + 3] = al; }
    }

    return {
      ok: true,
      escala: S, espessura: t, votosEscala: esc.votos,
      lev: {
        ambientes: ambientes.map((a) => ({ nome: a.nome, tipo: a.tipo, area: a.area, perimetro: a.perimetro })),
        aberturas: aberturas.map((a) => ({ tipo: a.tipo, largura: a.largura, altura: a.altura, peitoril: a.peitoril, externa: a.externa, qtd: 1 })),
        paredes: { externas: +Lext.toFixed(2), internas: +Lint.toFixed(2) },
        envelope, nos: 0
      },
      detalhe: { ambientes, aberturas, vaos, fonteArea, quadro, totalRotulos: rotPJ.length, camadaParede: { cor: [camadaParede.r, camadaParede.g, camadaParede.b], w: camadaParede.w } },
      camada: { w: W, h: H, data: camada, x0: minx, y0: miny, k },
      avisos
    };
  }

  function modaTol(v, tol) {
    const a = v.slice().sort((x, y) => x - y); let best = 0, bv = a[0];
    for (let i = 0; i < a.length; i++) { let j = i; while (j + 1 < a.length && a[j + 1] - a[i] <= tol) j++; if (j - i + 1 > best) { best = j - i + 1; bv = a[Math.floor((i + j) / 2)]; } }
    return bv;
  }
  function distSeg(x, y, s) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L2 = dx * dx + dy * dy;
    let u = L2 ? ((x - s.x1) * dx + (y - s.y1) * dy) / L2 : 0; u = Math.max(0, Math.min(1, u));
    return Math.hypot(x - (s.x1 + u * dx), y - (s.y1 + u * dy));
  }
  function moda(v) {
    if (!v.length) return 0; const c = {}; let best = 0, bv = 0;
    for (const x of v) { c[x] = (c[x] || 0) + 1; if (c[x] > best) { best = c[x]; bv = x; } }
    return bv;
  }
  function atravessa(p, segs) {
    // verdadeiro se a ponte cruza algum traço de parede no meio (exclui as extremidades)
    const ax = p.x1, ay = p.y1, bx = p.x2, by = p.y2;
    for (const s of segs) {
      const d = (bx - ax) * (s.y2 - s.y1) - (by - ay) * (s.x2 - s.x1);
      if (Math.abs(d) < 1e-9) continue;
      const u = ((s.x1 - ax) * (s.y2 - s.y1) - (s.y1 - ay) * (s.x2 - s.x1)) / d;
      const v = ((s.x1 - ax) * (by - ay) - (s.y1 - ay) * (bx - ax)) / d;
      if (u > 0.08 && u < 0.92 && v > 0.02 && v < 0.98) return true;
    }
    return false;
  }

  const fmtN = (v) => String(Math.round(v * 100) / 100).replace('.', ',');
  const API = { extrair, analisar, tipoPorNome, lerQuadro };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.LeitorVetorial = API;
})(typeof self !== 'undefined' ? self : this);
