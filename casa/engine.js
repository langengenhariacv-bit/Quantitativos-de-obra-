/* Lang Casa — motor de quantitativos de insumos por etapa.
 * Entrada: levantamento (ambientes, paredes, aberturas, contorno) + respostas + coeficientes.
 * Saída: etapas com itens (insumos) e tabela consolidada.
 * Só insumos/materiais: nada de ferramentas, equipamentos ou mão de obra.
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ catálogos
  const TIPOS_AMBIENTE = {
    sala: { nome: 'Sala', seco: true },
    quarto: { nome: 'Quarto / suíte', seco: true },
    escritorio: { nome: 'Escritório', seco: true },
    circulacao: { nome: 'Circulação / hall', seco: true },
    cozinha: { nome: 'Cozinha', molhado: true },
    conjugado: { nome: 'Sala + cozinha integradas (flat/living)', seco: true },
    cozinha_servico: { nome: 'Cozinha + área de serviço', molhado: true },
    banheiro: { nome: 'Banheiro', molhado: true },
    lavabo: { nome: 'Lavabo', molhado: true },
    servico: { nome: 'Área de serviço', molhado: true },
    deposito: { nome: 'Depósito / despensa', seco: true },
    varanda: { nome: 'Varanda / área coberta', externo: true },
    garagem: { nome: 'Garagem', externo: true }
  };

  const TIPOS_ABERTURA = {
    porta_int: { nome: 'Porta interna', porta: true, w: 0.80, h: 2.10, p: 0 },
    porta_ext: { nome: 'Porta externa', porta: true, externa: true, w: 0.90, h: 2.10, p: 0 },
    porta_correr: { nome: 'Porta de correr de vidro', porta: true, externa: true, w: 2.00, h: 2.10, p: 0 },
    portao: { nome: 'Portão de garagem', porta: true, externa: true, w: 2.80, h: 2.20, p: 0 },
    janela: { nome: 'Janela de correr', janela: true, externa: true, w: 1.20, h: 1.20, p: 1.00 },
    basculante: { nome: 'Basculante (banheiro)', janela: true, externa: true, w: 0.60, h: 0.60, p: 1.60 }
  };

  const BLOCOS = {
    ceramico14: { nome: 'Bloco cerâmico de vedação 14×19×29 cm', c: 0.29, a: 0.19, e: 0.14 },
    ceramico9: { nome: 'Bloco cerâmico de vedação 9×19×29 cm', c: 0.29, a: 0.19, e: 0.09 },
    concreto14: { nome: 'Bloco de concreto de vedação 14×19×39 cm', c: 0.39, a: 0.19, e: 0.14 }
  };

  // massa linear do aço (kg/m)
  const ACO = { '5.0': 0.154, '6.3': 0.245, '8.0': 0.395, '10.0': 0.617, '12.5': 0.963 };

  const RESPOSTAS_PADRAO = {
    peDireito: 2.80,
    vedacao: 'ceramico14',
    fundacao: 'sapata',      // sapata | broca | radier
    laje: 'trelicada',       // trelicada | nenhuma
    teto: 'reboco',          // reboco | gesso | drywall | pvc
    telha: 'ceramica',       // ceramica | fibrocimento | metalica
    beiral: 0.60,
    calhas: true,
    manta: true,
    piso: 'porcelanato',     // ceramica | porcelanato
    revBanheiro: 'teto',     // teto | 1.50
    revCozinha: 'faixa',     // faixa | 1.50 | teto
    pinturaExterna: 'textura', // textura | acrilica
    janelas: 'aluminio',     // aluminio | pvc
    portaExterna: 'madeira', // madeira | aluminio
    esgoto: 'rede',          // rede | fossa
    calcada: 0.80,           // largura (m); 0 = sem
    concreto: 'obra',        // obra | usinado
    argamassa: 'obra',       // obra | industrializada
    arCondicionado: true,
    moradores: 0,            // 0 = automático (2 por quarto)
    distRede: 10,            // distância da casa até a rua / rede (m)
    canteiro: true           // barracão + placa
  };

  // coeficientes editáveis (consumos e perdas). valor, unidade, descrição.
  const COEF = {
    perdaBloco: [0.05, '', 'Perda de blocos'],
    perdaArgamassa: [0.10, '', 'Perda de argamassas'],
    perdaConcreto: [0.05, '', 'Perda de concreto'],
    perdaAco: [0.10, '', 'Perda e transpasse adicional do aço'],
    perdaPiso: [0.10, '', 'Perda de pisos e revestimentos cerâmicos'],
    perdaPintura: [0.10, '', 'Perda de tintas e massas'],
    juntaBloco: [0.01, 'm', 'Espessura da junta de assentamento'],
    chapisco: [0.005, 'm', 'Espessura do chapisco'],
    rebocoInt: [0.020, 'm', 'Espessura do emboço/reboco interno'],
    rebocoExt: [0.025, 'm', 'Espessura do emboço/reboco externo'],
    rebocoTeto: [0.015, 'm', 'Espessura do reboco de teto'],
    contrapiso: [0.04, 'm', 'Espessura do contrapiso'],
    lastroConcreto: [0.05, 'm', 'Espessura do lastro de concreto do piso'],
    lastroBrita: [0.03, 'm', 'Espessura do lastro de brita do piso'],
    // concreto (kg ou m³ por m³ de concreto)
    c25Cimento: [350, 'kg/m³', 'Cimento no concreto fck 25 MPa'],
    c25Areia: [0.72, 'm³/m³', 'Areia no concreto fck 25'],
    c25Brita: [0.82, 'm³/m³', 'Brita 1 no concreto fck 25'],
    c20Cimento: [300, 'kg/m³', 'Cimento no concreto fck 20 (calçada)'],
    c20Areia: [0.75, 'm³/m³', 'Areia no concreto fck 20'],
    c20Brita: [0.84, 'm³/m³', 'Brita 1 no concreto fck 20'],
    cmCimento: [210, 'kg/m³', 'Cimento no concreto magro'],
    cmAreia: [0.78, 'm³/m³', 'Areia no concreto magro'],
    cmBrita: [0.84, 'm³/m³', 'Brita 1 no concreto magro'],
    // argamassas
    a128Cimento: [153, 'kg/m³', 'Cimento na argamassa 1:2:8'],
    a128Cal: [150, 'kg/m³', 'Cal hidratada na argamassa 1:2:8'],
    a128Areia: [1.02, 'm³/m³', 'Areia na argamassa 1:2:8'],
    a13Cimento: [420, 'kg/m³', 'Cimento no chapisco 1:3'],
    a13Areia: [1.05, 'm³/m³', 'Areia no chapisco 1:3'],
    a14Cimento: [324, 'kg/m³', 'Cimento no contrapiso 1:4'],
    a14Areia: [1.08, 'm³/m³', 'Areia no contrapiso 1:4'],
    argIndustr: [1700, 'kg/m³', 'Argamassa industrializada (pó) por m³ aplicado'],
    // cerâmicas
    acPiso: [5.0, 'kg/m²', 'Argamassa colante no piso cerâmico (AC-II)'],
    acPorc: [6.0, 'kg/m²', 'Argamassa colante no porcelanato (AC-III, dupla colagem)'],
    acParede: [4.5, 'kg/m²', 'Argamassa colante em parede (AC-I)'],
    // pintura
    seladorInt: [0.10, 'L/m²', 'Selador acrílico interno (1 demão)'],
    massaCorrida: [0.65, 'kg/m²', 'Massa corrida PVA (2 demãos)'],
    massaAcrilica: [0.65, 'kg/m²', 'Massa acrílica (2 demãos)'],
    tintaInt: [0.17, 'L/m²', 'Tinta acrílica interna (2 demãos)'],
    tintaTeto: [0.15, 'L/m²', 'Tinta para teto (2 demãos)'],
    seladorExt: [0.12, 'L/m²', 'Selador acrílico externo'],
    textura: [1.5, 'kg/m²', 'Textura acrílica'],
    tintaExt: [0.20, 'L/m²', 'Tinta acrílica externa (2–3 demãos)'],
    // cobertura
    telhaCeramica: [16, 'un/m²', 'Telhas cerâmicas por m² de telhado'],
    ripa: [3.0, 'm/m²', 'Ripas por m² de telhado'],
    caibro: [2.0, 'm/m²', 'Caibros por m² de telhado'],
    terca: [0.60, 'm/m²', 'Terças por m² de telhado (telha cerâmica)'],
    // estrutura
    vaoPilar: [3.5, 'm', 'Vão máximo entre pilares (estimativa sem desenho)'],
    sapataLado: [0.80, 'm', 'Lado da sapata'],
    sapataAltura: [0.25, 'm', 'Altura da sapata'],
    profFundacao: [1.00, 'm', 'Profundidade da base da sapata'],
    pilarLado: [0.30, 'm', 'Maior lado do pilar'],
    baldrameAltura: [0.30, 'm', 'Altura da viga baldrame'],
    cintaAltura: [0.25, 'm', 'Altura da cinta/viga de respaldo'],
    capaLaje: [0.055, 'm³/m²', 'Concreto da laje treliçada H12 (capa + nervuras)'],
    reusoForma: [2, 'vezes', 'Reaproveitamento das tábuas de fôrma'],
    consumoAgua: [150, 'L/pessoa', 'Consumo diário de água por pessoa']
  };

  // ------------------------------------------------------------------ utilitários
  const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
  const ceil = (v) => Math.ceil(v - 1e-9);
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const fmt = (v, d = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });
  const dim = (w, h) => fmt(w, 2) + '×' + fmt(h, 2) + ' m';
  const escolher = (lista, v) => lista.find((x) => x >= v - 1e-9) || lista[lista.length - 1];

  function coefs(over) {
    const c = {};
    for (const k in COEF) c[k] = over && over[k] != null && Number.isFinite(Number(over[k])) ? Number(over[k]) : COEF[k][0];
    return c;
  }

  // ------------------------------------------------------------------ levantamento -> grandezas
  function normalizar(lev, resp) {
    lev = lev || {};
    const amb = (lev.ambientes || []).map((a) => ({
      nome: a.nome || TIPOS_AMBIENTE[a.tipo]?.nome || 'Ambiente',
      tipo: TIPOS_AMBIENTE[a.tipo] ? a.tipo : 'sala',
      area: Math.max(0, num(a.area)),
      perimetro: Math.max(0, num(a.perimetro)) || (num(a.area) > 0 ? 4.1 * Math.sqrt(num(a.area)) : 0)
    })).filter((a) => a.area > 0);
    const ab = [];
    for (const o of lev.aberturas || []) {
      const t = TIPOS_ABERTURA[o.tipo] ? o.tipo : 'janela';
      const q = Math.max(0, Math.round(num(o.qtd, 1)));
      if (!q) continue;
      ab.push({
        tipo: t,
        largura: num(o.largura) || TIPOS_ABERTURA[t].w,
        altura: num(o.altura) || TIPOS_ABERTURA[t].h,
        peitoril: o.peitoril == null || o.peitoril === '' ? TIPOS_ABERTURA[t].p : num(o.peitoril),
        externa: o.externa == null ? !!TIPOS_ABERTURA[t].externa : !!o.externa,
        qtd: q
      });
    }
    const somaArea = amb.reduce((s, a) => s + a.area, 0);
    const p = lev.paredes || {};
    const env = lev.envelope || {};
    const bl = BLOCOS[resp.vedacao] || BLOCOS.ceramico14;
    let Lext = Math.max(0, num(p.externas));
    let Lint = Math.max(0, num(p.internas));
    let A = Math.max(0, num(env.area));
    if (!A) A = somaArea * 1.12;
    let P = Math.max(0, num(env.perimetro));
    let Lc = Math.max(0, num(env.comprimento));
    let Wc = Math.max(0, num(env.largura));
    if (!Lc || !Wc) {
      if (Lc && !Wc) Wc = A / Lc; else if (Wc && !Lc) Lc = A / Wc;
      else { Lc = Math.sqrt(A * 1.4); Wc = Lc ? A / Lc : 0; }
    }
    if (Wc > Lc) { const t = Lc; Lc = Wc; Wc = t; }
    if (!P) P = Lext || 2 * (Lc + Wc);
    if (!Lext) Lext = P;
    if (!Lint) {
      // estimativa: metade da soma dos perímetros dos ambientes menos a parcela externa
      const somaPer = amb.filter((a) => !TIPOS_AMBIENTE[a.tipo].externo).reduce((s, a) => s + a.perimetro, 0);
      Lint = Math.max(0, (somaPer - Lext) / 2);
    }
    return { amb, ab, somaArea, A, P, Lc, Wc, Lext, Lint, Ltot: Lext + Lint, bl, nos: num(lev.nos) };
  }

  // ------------------------------------------------------------------ cálculo
  function calcular(projeto) {
    const resp = Object.assign({}, RESPOSTAS_PADRAO, projeto.resp || {});
    const C = coefs(projeto.coef);
    const g = normalizar(projeto.lev, resp);
    const avisos = [];
    const etapas = [];
    let atual = null;

    function etapa(id, nome) { atual = { id, nome, itens: [], mapa: {} }; etapas.push(atual); }
    // add(chave, descrição, unidade, quantidade, memória, embalagem)
    function add(key, desc, un, qtd, mem, emb) {
      if (!(qtd > 1e-6)) return;
      const k = key + '|' + un;
      let it = atual.mapa[k];
      if (!it) { it = { key: k, desc, un, qtd: 0, mem: [], emb: emb || null }; atual.mapa[k] = it; atual.itens.push(it); }
      it.qtd += qtd;
      if (mem && !it.mem.includes(mem)) it.mem.push(mem);
    }

    // ---- materiais básicos compostos
    const EMB = {
      cimento: { nome: 'saco 50 kg', qtd: 50 },
      cal: { nome: 'saco 20 kg', qtd: 20 },
      argInd: { nome: 'saco 20 kg', qtd: 20 },
      colante: { nome: 'saco 20 kg', qtd: 20 },
      rejunte: { nome: 'saco 1 kg', qtd: 1 },
      lata18: { nome: 'lata 18 L', qtd: 18 },
      galao: { nome: 'galão 3,6 L', qtd: 3.6 },
      massa: { nome: 'lata 25 kg', qtd: 25 },
      textura: { nome: 'balde 25 kg', qtd: 25 },
      rolo100: { nome: 'rolo 100 m', qtd: 100 },
      rolo50: { nome: 'rolo 50 m', qtd: 50 },
      barra6: { nome: 'barra 6 m', qtd: 6 },
      barra3: { nome: 'barra 3 m', qtd: 3 },
      gesso40: { nome: 'saco 40 kg', qtd: 40 },
      polimerica: { nome: 'caixa 18 kg', qtd: 18 }
    };
    const cimento = (kg, mem) => add('cimento', 'Cimento Portland CP-II', 'kg', kg, mem, EMB.cimento);
    const areia = (m3, mem) => add('areia', 'Areia média lavada', 'm³', m3, mem);
    const brita = (m3, mem) => add('brita1', 'Brita 1', 'm³', m3, mem);
    const cal = (kg, mem) => add('cal', 'Cal hidratada CH-III', 'kg', kg, mem, EMB.cal);

    function concreto(vol, tipo, mem) {
      if (!(vol > 0)) return;
      const v = vol * (1 + C.perdaConcreto);
      const m = mem + ': ' + fmt(vol, 3) + ' m³';
      if (tipo === 'magro') {
        cimento(v * C.cmCimento, m + ' (concreto magro)'); areia(v * C.cmAreia, m); brita(v * C.cmBrita, m); return;
      }
      if (tipo === 'c20') {
        cimento(v * C.c20Cimento, m + ' (fck 20)'); areia(v * C.c20Areia, m); brita(v * C.c20Brita, m); return;
      }
      if (resp.concreto === 'usinado') { add('concretoUsinado', 'Concreto usinado fck 25 MPa', 'm³', v, m); return; }
      cimento(v * C.c25Cimento, m + ' (fck 25)'); areia(v * C.c25Areia, m); brita(v * C.c25Brita, m);
    }
    function argamassa128(vol, mem, uso) {
      if (!(vol > 0)) return;
      const v = vol * (1 + C.perdaArgamassa);
      const m = mem + ': ' + fmt(vol, 3) + ' m³';
      if (resp.argamassa === 'industrializada') {
        add('arg_' + uso, uso === 'assent' ? 'Argamassa industrializada de assentamento' : 'Argamassa industrializada de revestimento (reboco)', 'kg', v * C.argIndustr, m, EMB.argInd);
        return;
      }
      cimento(v * C.a128Cimento, m + ' (traço 1:2:8)'); cal(v * C.a128Cal, m); areia(v * C.a128Areia, m);
    }
    function argamassa13(vol, mem) {
      const v = vol * (1 + C.perdaArgamassa), m = mem + ': ' + fmt(vol, 3) + ' m³ (traço 1:3)';
      cimento(v * C.a13Cimento, m); areia(v * C.a13Areia, m);
    }
    function argamassa14(vol, mem) {
      const v = vol * (1 + C.perdaArgamassa), m = mem + ': ' + fmt(vol, 3) + ' m³ (traço 1:4)';
      cimento(v * C.a14Cimento, m); areia(v * C.a14Areia, m);
    }
    const acoMetros = {};
    function aco(bitola, metros, mem) {
      if (!(metros > 0)) return;
      const kgm = ACO[bitola];
      const tipo = bitola === '5.0' ? 'CA-60' : 'CA-50';
      const kg = metros * kgm * (1 + C.perdaAco);
      add('aco' + bitola, 'Aço ' + tipo + ' Ø ' + bitola.replace('.', ',') + ' mm', 'kg', kg, mem + ': ' + fmt(metros, 1) + ' m', { nome: 'barra 12 m', qtd: 12 * kgm });
      acoMetros[atual.id] = (acoMetros[atual.id] || 0) + kg;
    }
    let formaEtapa = 0;
    function forma(area, mem) { formaEtapa += area; add('_formaMem', 'Área de fôrma (referência)', 'm²', 0, mem); }
    function fecharFormas(mem) {
      if (formaEtapa <= 0) return;
      const a = formaEtapa;
      add('tabuaForma', 'Tábua de pinus 2,5×30 cm (fôrma)', 'm', a / 0.30 / C.reusoForma * 1.10, mem + ': ' + fmt(a, 1) + ' m² de fôrma, ' + C.reusoForma + ' usos');
      add('sarrafo', 'Sarrafo de pinus 2,5×7 cm', 'm', a * 1.5 / C.reusoForma, 'travamento e gravatas das fôrmas');
      add('prego1727', 'Prego 17×27 com cabeça', 'kg', a * 0.12, '0,12 kg por m² de fôrma');
      add('desmoldante', 'Desmoldante para fôrmas', 'L', a * 0.05, '0,05 L por m² de fôrma');
      formaEtapa = 0;
    }
    function arameEspacador(mem, metrosLineares) {
      const kg = acoMetros[atual.id] || 0;
      if (kg > 0) add('arame18', 'Arame recozido nº 18', 'kg', kg * 0.025, '0,025 kg por kg de aço (' + mem + ')');
      if (metrosLineares > 0) add('espacador', 'Espaçador plástico p/ armadura (cobrimento 2,5 cm)', 'un', ceil(metrosLineares * 2), '2 por metro de peça');
    }

    // ---- grandezas gerais
    const h = num(resp.peDireito, 2.8);
    const bl = g.bl, e = bl.e;
    const b = 0.14; // largura de pilares/vigas
    const hC = C.cintaAltura;
    const temLaje = resp.laje === 'trelicada';
    const amb = g.amb;
    const porTipo = (t) => amb.filter((a) => a.tipo === t);
    const cont = (t) => porTipo(t).length;
    const nb = cont('banheiro'), nl = cont('lavabo');
    const nc = cont('cozinha') + cont('conjugado') + cont('cozinha_servico');
    const ns = cont('servico') + cont('cozinha_servico');
    const nq = cont('quarto'), nsala = cont('sala') + cont('escritorio');
    const molhados = nb + nl + nc + ns;
    const pessoas = num(resp.moradores) > 0 ? num(resp.moradores) : Math.max(2, nq * 2);

    if (!amb.length) avisos.push('Nenhum ambiente informado: pisos, tetos, instalações e louças ficaram sem base. Desenhe ou informe os ambientes.');
    if (!g.ab.length) avisos.push('Nenhuma porta ou janela informada: as áreas de parede não tiveram desconto de vãos e as esquadrias ficaram de fora.');
    if (!nb) avisos.push('Nenhum banheiro informado.');

    // aberturas
    let abExt = 0, abInt = 0, abTotal = 0, nVergas = 0, mVerga = 0, mContra = 0, nPortas = 0, nJanelas = 0, larguraPortas = 0;
    for (const o of g.ab) {
      const a = o.largura * o.altura * o.qtd;
      abTotal += a;
      if (o.externa) abExt += a; else abInt += a;
      mVerga += (o.largura + 0.60) * o.qtd; nVergas += o.qtd;
      if (TIPOS_ABERTURA[o.tipo].janela) { mContra += (o.largura + 0.60) * o.qtd; nJanelas += o.qtd; }
      if (TIPOS_ABERTURA[o.tipo].porta) { nPortas += o.qtd; larguraPortas += o.largura * o.qtd; }
    }

    // pilares
    let npil = g.nos > 0 ? Math.round(g.nos) : ceil(g.Lext / C.vaoPilar) + ceil(g.Lint / (C.vaoPilar * 1.4));
    npil = Math.max(4, npil);

    // oitões (telhado 2 águas sobre o lado maior)
    const incl = resp.telha === 'ceramica' ? 0.35 : resp.telha === 'fibrocimento' ? 0.15 : 0.10;
    const oitao = resp.telha === 'metalica' ? 0 : 2 * 0.5 * g.Wc * (g.Wc / 2 * incl);

    const hAlv = h - (temLaje ? hC : hC) + 0.05; // do baldrame à cinta
    const areaPilaresParede = npil * C.pilarLado * hAlv;
    const alvBruta = g.Ltot * hAlv + oitao;
    const alvLiq = Math.max(0, alvBruta - abTotal - areaPilaresParede);

    const facesInt = Math.max(0, (2 * g.Lint + g.Lext) * h - 2 * abInt - abExt);
    const hExt = h + (temLaje ? 0.45 : 0.30);
    const facesExt = Math.max(0, (g.P + 4 * e) * hExt + oitao - abExt);
    const areaTeto = amb.reduce((s, a) => s + a.area, 0);

    // revestimento cerâmico de parede
    let azulejo = 0; const memAz = [];
    const hBanh = resp.revBanheiro === 'teto' ? h : 1.50;
    for (const a of amb) {
      if (a.tipo === 'banheiro' || a.tipo === 'lavabo') {
        const v = Math.max(0, a.perimetro * hBanh - 1.80); azulejo += v; memAz.push(a.nome + ' ' + fmt(v, 1) + ' m²');
      } else if (a.tipo === 'conjugado') {
        const v = 0.60 * 2.40; azulejo += v; memAz.push(a.nome + ' ' + fmt(v, 1) + ' m² (faixa da bancada)');
      } else if (a.tipo === 'cozinha' || a.tipo === 'servico' || a.tipo === 'cozinha_servico') {
        let v;
        if (resp.revCozinha === 'faixa') v = a.tipo === 'cozinha' ? 0.60 * 2.40 : a.tipo === 'servico' ? 0.60 * 1.20 : 0.60 * 3.60;
        else v = Math.max(0, a.perimetro * (resp.revCozinha === 'teto' ? h : 1.50) - 2.0);
        azulejo += v; memAz.push(a.nome + ' ' + fmt(v, 1) + ' m²');
      }
    }
    azulejo = Math.min(azulejo, facesInt);
    const pinturaInt = Math.max(0, facesInt - azulejo);

    // ================================================================ 1 PRELIMINARES
    etapa('preliminares', 'Serviços preliminares e canteiro');
    {
      const pg = 2 * (g.Lc + 2 + g.Wc + 2);
      add('tabua15', 'Tábua de pinus 2,5×15 cm (gabarito)', 'm', pg * 1.10, 'gabarito de locação: perímetro ' + fmt(pg, 1) + ' m (afastado 1 m da obra)');
      add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', ceil(pg / 1.5) * 1.2, 'gabarito: 1 pontalete de 1,20 m a cada 1,5 m');
      add('prego1727', 'Prego 17×27 com cabeça', 'kg', 1.0, 'gabarito');
      add('linhaNylon', 'Linha de náilon para marcação (rolo 100 m)', 'un', 2, 'alinhamento dos eixos');
      if (resp.canteiro) {
        add('placaObra', 'Placa de obra (lona ou chapa) 2,0×1,0 m', 'un', 1, 'identificação do responsável técnico');
        add('compensado10', 'Chapa de compensado 10 mm 2,20×1,10 m (barracão)', 'un', 8, 'barracão de ~6 m² para cimento e materiais');
        add('telhaFibro', 'Telha de fibrocimento 6 mm 2,44×1,10 m', 'un', 4, 'cobertura do barracão');
        add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', 18, 'estrutura do barracão');
        add('lona', 'Lona plástica preta 150 µm', 'm²', 20, 'proteção de materiais e cura');
      }
      add('padraoProvisorio', 'Ligação provisória de água (kit cavalete + 20 m de mangueira/tubo 25 mm)', 'un', 1, 'água para a obra; usar o padrão de energia definitivo como provisório quando a concessionária permitir');
    }

    // ================================================================ 2 FUNDAÇÃO
    etapa('fundacao', 'Fundação');
    let metrosPecas = 0;
    if (resp.fundacao === 'radier') {
      const area = g.A + g.P * 0.10;
      const vol = area * 0.12 + g.P * 0.20 * 0.20;
      add('brita1', 'Brita 1', 'm³', area * 0.05 * 1.05, 'lastro de brita 5 cm sob o radier');
      add('lona', 'Lona plástica preta 150 µm', 'm²', area * 1.15, 'barreira de umidade sob o radier');
      concreto(vol, 'c25', 'Radier e=12 cm + borda engrossada 20×20');
      add('telaQ138', 'Tela soldada Q-138 (Ø 4,2 c/10) painel 2,0×3,0 m', 'un', ceil(area * 1.15 / 6), 'armadura do radier, 15% de transpasse');
      add('espacadorTrel', 'Espaçador treliçado (caranguejo) para tela', 'un', ceil(area * 0.8), '0,8 por m²');
      aco('10.0', g.P * 4 * 1.10, 'borda engrossada 4Ø10');
      aco('5.0', g.P / 0.20 * 0.70, 'estribos da borda c/20');
      forma(g.P * 0.20, 'borda do radier');
      aco('10.0', npil * 4 * 1.0, 'esperas dos pilares');
      metrosPecas += g.P;
      avisos.push('Radier: espessura e armadura adotadas são de pré-dimensionamento; confirme com o projeto estrutural.');
    } else {
      const lado = C.sapataLado, hs = C.sapataAltura;
      if (resp.fundacao === 'broca') {
        const nest = Math.max(npil, ceil(g.Ltot / 2.5));
        const vol = nest * Math.PI * 0.125 * 0.125 * 3.0;
        concreto(vol, 'c25', nest + ' estacas broca Ø25 cm × 3,0 m');
        aco('8.0', nest * 4 * 2.0, 'armadura de topo 4Ø8 × 2 m');
        aco('5.0', nest * 10 * 0.55, 'estribos Ø5 c/20');
        metrosPecas += nest * 2;
      } else {
        const vS = npil * lado * lado * hs;
        concreto(npil * (lado + 0.1) * (lado + 0.1) * 0.05, 'magro', 'Lastro das sapatas 5 cm');
        concreto(vS, 'c25', npil + ' sapatas ' + dim(lado, lado) + ' × ' + fmt(hs) + ' m');
        const nBar = ceil((lado - 0.10) / 0.15) + 1;
        aco('10.0', npil * 2 * nBar * (lado - 0.10 + 0.30), 'malha das sapatas Ø10 c/15 nas 2 direções');
        forma(npil * 4 * lado * hs, 'laterais das sapatas');
        const hPesc = C.profFundacao - hs - C.baldrameAltura;
        if (hPesc > 0) {
          concreto(npil * b * C.pilarLado * hPesc, 'c25', 'arranque dos pilares (pescoço)');
          forma(npil * 2 * (b + C.pilarLado) * hPesc, 'pescoço dos pilares');
        }
        metrosPecas += npil * 2;
      }
      // baldrame
      const hb = C.baldrameAltura;
      concreto(g.Ltot * (b + 0.10) * 0.05, 'magro', 'Lastro sob baldrame 5 cm');
      concreto(g.Ltot * b * hb, 'c25', 'Viga baldrame ' + fmt(b * 100, 0) + '×' + fmt(hb * 100, 0) + ' cm em ' + fmt(g.Ltot, 1) + ' m');
      aco('10.0', 4 * g.Ltot * 1.10, 'baldrame 4Ø10 (+10% ancoragens)');
      aco('5.0', ceil(g.Ltot / 0.20) * (2 * (b - 0.05 + hb - 0.05) + 0.10), 'estribos do baldrame Ø5 c/20');
      forma(2 * hb * g.Ltot, 'laterais do baldrame');
      metrosPecas += g.Ltot;
    }
    arameEspacador('fundação', metrosPecas);
    fecharFormas('fundação');
    add('impermBaldrame', 'Emulsão asfáltica para fundações (balde 18 L)', 'L',
      resp.fundacao === 'radier' ? g.P * 0.30 * 0.8 : g.Ltot * (b + 2 * 0.15) * 0.8,
      resp.fundacao === 'radier' ? 'borda do radier' : 'topo e laterais do baldrame, 0,8 L/m² (2 demãos)', { nome: 'balde 18 L', qtd: 18 });

    // ================================================================ 3 ESTRUTURA
    etapa('estrutura', 'Estrutura (pilares, cintas, vergas e laje)');
    {
      metrosPecas = 0;
      const hP = h - hC + 0.05;
      concreto(npil * b * C.pilarLado * hP, 'c25', npil + ' pilares ' + fmt(b * 100, 0) + '×' + fmt(C.pilarLado * 100, 0) + ' cm × ' + fmt(hP) + ' m' + (g.nos > 0 ? ' (nós do desenho)' : ' (estimado pelo vão máx. ' + fmt(C.vaoPilar) + ' m)'));
      aco('10.0', npil * 4 * (h + C.profFundacao + 0.70), 'pilares 4Ø10 (da sapata à cinta, com dobras e esperas)');
      aco('5.0', npil * ceil((h + C.profFundacao) / 0.15) * (2 * (b - 0.05 + C.pilarLado - 0.05) + 0.10), 'estribos dos pilares Ø5 c/15');
      forma(npil * 2 * (b + C.pilarLado) * hP, 'pilares');
      metrosPecas += npil * (h + 1);
      // cinta
      concreto(g.Ltot * b * hC, 'c25', 'Cinta de respaldo ' + fmt(b * 100, 0) + '×' + fmt(hC * 100, 0) + ' cm');
      aco('10.0', 2 * g.Ltot * 1.10, 'cinta 2Ø10 inferiores');
      aco('8.0', 2 * g.Ltot * 1.10, 'cinta 2Ø8 superiores');
      aco('5.0', ceil(g.Ltot / 0.15) * (2 * (b - 0.05 + hC - 0.05) + 0.10), 'estribos da cinta Ø5 c/15');
      forma(2 * hC * g.Ltot, 'laterais da cinta');
      metrosPecas += g.Ltot;
      // vergas e contravergas
      const mvc = mVerga + mContra;
      if (mvc > 0) {
        concreto(mvc * e * 0.10, 'c25', 'Vergas (' + nVergas + ') e contravergas (' + nJanelas + ') 10 cm, vão + 30 cm de cada lado');
        aco('8.0', mvc * 2, 'vergas/contravergas 2Ø8');
        forma(mvc * (2 * 0.10 + e), 'vergas e contravergas');
        metrosPecas += mvc;
      }
      if (temLaje) {
        const A = g.A;
        add('vigota', 'Vigota treliçada TR 8644 (laje H12)', 'm', A / 0.50 * 1.05, 'intereixo 50 cm, área de laje ' + fmt(A, 1) + ' m²');
        add('eps', 'Enchimento de EPS H8 × 40 × 100 cm', 'un', ceil(A * 2 * 1.03), '2 peças por m²');
        concreto(A * C.capaLaje, 'c25', 'Capa e nervuras da laje (' + fmt(C.capaLaje, 3) + ' m³/m²)');
        add('telaQ61', 'Tela soldada Q-61 (Ø 3,4 c/15) painel 2,0×3,0 m', 'un', ceil(A * 1.15 / 6), 'armadura de distribuição da capa');
        aco('6.3', ceil(g.Lint / 0.20) * 1.20, 'armadura negativa sobre paredes internas Ø6.3 c/20 × 1,20 m');
        forma(g.P * 0.16, 'borda da laje');
        add('escora', 'Escora de eucalipto Ø 8–10 cm × 3,0 m', 'un', ceil(A * 0.6), 'escoramento (pode ser alugado/reaproveitado)');
        add('tabuaForma', 'Tábua de pinus 2,5×30 cm (fôrma)', 'm', A / 1.2, 'guias do escoramento a cada 1,2 m');
      }
      arameEspacador('estrutura', metrosPecas);
      fecharFormas('estrutura');
    }

    // ================================================================ 4 ALVENARIA
    etapa('alvenaria', 'Alvenaria de vedação');
    {
      const j = C.juntaBloco;
      const porM2 = 1 / ((bl.c + j) * (bl.a + j));
      const memA = 'paredes ' + fmt(g.Ltot, 1) + ' m × ' + fmt(hAlv) + ' m' + (oitao ? ' + oitões ' + fmt(oitao, 1) + ' m²' : '') + ' − vãos ' + fmt(abTotal, 1) + ' m² − pilares ' + fmt(areaPilaresParede, 1) + ' m² = ' + fmt(alvLiq, 1) + ' m²';
      add('bloco', bl.nome, 'un', ceil(alvLiq * porM2 * (1 + C.perdaBloco)), memA + '; ' + fmt(porM2, 1) + ' blocos/m²');
      const vJunta = ((1 / (bl.a + j)) * j * bl.e + porM2 * bl.a * j * bl.e) * 1.15; // m³/m²
      argamassa128(alvLiq * vJunta, 'Assentamento (' + fmt(vJunta * 1000, 1) + ' L/m²)', 'assent');
      add('telaAmarr', 'Tela galvanizada 15×50 cm para ligação alvenaria/pilar', 'un', npil * 2 * ceil(hAlv / 0.40), '2 faces por pilar, a cada 2 fiadas');
      add('pinoAco', 'Pino de aço com arruela para fixar tela', 'un', npil * 2 * ceil(hAlv / 0.40) * 2, '2 por tela');
    }

    // ================================================================ 5 COBERTURA
    etapa('cobertura', 'Cobertura e águas pluviais');
    const bei = num(resp.beiral, 0.6);
    const proj = g.A + g.P * bei + 4 * bei * bei;
    const fatorI = Math.sqrt(1 + incl * incl);
    const aInc = proj * fatorI;
    const cumeeira = g.Lc + 2 * bei;
    {
      const memT = 'projeção ' + fmt(proj, 1) + ' m² (beiral ' + fmt(bei) + ' m), inclinação ' + fmt(incl * 100, 0) + '% → ' + fmt(aInc, 1) + ' m² de telhado em 2 águas';
      if (resp.telha === 'ceramica') {
        add('telhaCer', 'Telha cerâmica (tipo romana/portuguesa)', 'un', ceil(aInc * C.telhaCeramica * 1.05), memT + '; ' + C.telhaCeramica + ' un/m² + 5%');
        add('cumeeiraCer', 'Cumeeira cerâmica', 'un', ceil(cumeeira * 3 * 1.05), 'cumeeira ' + fmt(cumeeira, 1) + ' m, 3 peças/m');
        argamassa128(cumeeira * 0.012, 'Emboçamento da cumeeira', 'assent');
        add('terca', 'Viga de madeira 6×12 cm (terças)', 'm', aInc * C.terca, memT);
        add('caibro', 'Caibro de madeira 5×6 cm', 'm', aInc * C.caibro, 'espaçamento 50 cm');
        add('ripa', 'Ripa de madeira 1,5×5 cm', 'm', aInc * C.ripa, 'galga de ~33 cm');
        add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', proj * 0.35, 'apoio das terças sobre laje/paredes');
        add('prego1827', 'Prego 18×27 (caibros e terças)', 'kg', aInc * 0.08, '0,08 kg/m²');
        add('prego1515', 'Prego 15×15 (ripas)', 'kg', aInc * 0.05, '0,05 kg/m²');
        if (resp.manta) add('manta', 'Manta subcobertura aluminizada (rolo 50 m²)', 'm²', aInc * 1.10, 'com 10% de sobreposição', { nome: 'rolo 50 m²', qtd: 50 });
      } else if (resp.telha === 'fibrocimento') {
        add('telhaFibro', 'Telha de fibrocimento 6 mm 2,44×1,10 m', 'un', ceil(aInc / 2.415 * 1.05), memT + '; área útil 2,415 m²/telha');
        add('cumeeiraFibro', 'Cumeeira normal de fibrocimento', 'un', ceil(cumeeira / 1.05), 'cumeeira ' + fmt(cumeeira, 1) + ' m');
        add('parafusoFibro', 'Parafuso 8×110 mm com conjunto de vedação', 'un', ceil(aInc / 2.415 * 4 * 1.05), '4 por telha');
        add('terca', 'Viga de madeira 6×12 cm (terças)', 'm', aInc * 0.90, 'terças a cada ~1,15 m');
        add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', proj * 0.35, 'apoio das terças');
        add('prego1827', 'Prego 18×27 (caibros e terças)', 'kg', aInc * 0.04, '');
        if (resp.manta) add('manta', 'Manta subcobertura aluminizada (rolo 50 m²)', 'm²', aInc * 1.10, 'com 10% de sobreposição', { nome: 'rolo 50 m²', qtd: 50 });
      } else {
        add('telhaMet', 'Telha metálica trapezoidal termoacústica (sanduíche EPS 30 mm)', 'm²', aInc * 1.08, memT + ' + 8% de sobreposição');
        add('cumeeiraMet', 'Cumeeira de chapa pré-pintada', 'm', cumeeira * 1.10, 'cumeeira ' + fmt(cumeeira, 1) + ' m');
        add('perfilU', 'Perfil U enrijecido 75×40×15×2,0 mm (terças)', 'm', aInc * 0.60, 'terças a cada ~1,7 m');
        add('autobrocante', 'Parafuso autobrocante 12×1" com arruela de vedação', 'un', ceil(aInc * 5), '5 por m²');
        add('chumbador', 'Chumbador/insert para fixação das terças', 'un', ceil(aInc * 0.60 / 1.5), '1 a cada 1,5 m de terça');
        add('rufo', 'Rufo de chapa pré-pintada (corte 30 cm)', 'm', 2 * g.Wc + 2 * bei * 2, 'arremates laterais');
      }
      add('tabeira', 'Tábua de madeira 2,5×20 cm (testeira/tabeira do beiral)', 'm', 2 * (g.Lc + 2 * bei) + 4 * (g.Wc / 2 + bei) * fatorI, 'perímetro do telhado');
      if (resp.telha !== 'metalica') add('imunizante', 'Imunizante/cupinicida para madeira', 'L', aInc * 0.15, '0,15 L/m² de telhado');
      if (resp.calhas) {
        const mc = 2 * (g.Lc + 2 * bei);
        const ncond = Math.max(2, ceil(mc / 8));
        add('calha', 'Calha de chapa galvanizada (corte 33 cm)', 'm', mc * 1.05, 'beirais das 2 águas');
        add('suporteCalha', 'Suporte de calha', 'un', ceil(mc / 0.80), '1 a cada 80 cm');
        add('bocal', 'Bocal/saída de calha 100 mm', 'un', ncond, '1 por condutor');
        add('tubo100p', 'Tubo PVC esgoto/pluvial 100 mm', 'm', ncond * (hExt + 0.5) + g.P / 2, ncond + ' condutores + rede enterrada', EMB.barra6);
        add('joelho100p', 'Joelho 90° PVC 100 mm (pluvial)', 'un', ncond * 3, '3 por condutor');
        add('abracadeira100', 'Abraçadeira para tubo 100 mm', 'un', ncond * 3, 'fixação dos condutores');
        add('caixaAreia', 'Caixa de areia/passagem pluvial 40×40 cm com grelha', 'un', ncond, '1 por condutor');
        add('selanteCalha', 'Selante de poliuretano para calhas (sachê 400 g)', 'un', ceil(mc / 6), 'emendas');
      }
    }

    // ================================================================ 6 HIDRÁULICA
    etapa('hidraulica', 'Instalações hidráulicas (água fria)');
    const pontosAgua = nb * 4 + nl * 2 + nc * 2 + ns * 2 + 2;
    {
      const m25 = pontosAgua * 3.0 + molhados * 4.0 + num(resp.distRede, 10) + h + 4;
      const m32 = 6 + molhados * 2.5;
      add('tubo25', 'Tubo PVC soldável 25 mm', 'm', m25 * 1.10, pontosAgua + ' pontos × 3 m + ramais + alimentação desde o cavalete', EMB.barra6);
      add('tubo32', 'Tubo PVC soldável 32 mm', 'm', m32 * 1.10, 'barrilete e colunas', EMB.barra6);
      add('tubo40', 'Tubo PVC soldável 40 mm', 'm', 3, 'extravasor e limpeza da caixa d’água', EMB.barra6);
      add('joelho25', 'Joelho 90° PVC soldável 25 mm', 'un', pontosAgua * 2 + molhados, '2 por ponto + 1 por ambiente');
      add('joelhoAzul', 'Joelho 90° soldável com bucha de latão 25 mm × 1/2"', 'un', pontosAgua, '1 por ponto de utilização');
      add('te25', 'Tê 90° PVC soldável 25 mm', 'un', pontosAgua, 'derivações');
      add('luva25', 'Luva PVC soldável 25 mm', 'un', ceil(m25 * 1.1 / 6), '1 por barra');
      add('joelho32', 'Joelho 90° PVC soldável 32 mm', 'un', 4 + molhados, 'barrilete');
      add('te32', 'Tê 90° PVC soldável 32 mm', 'un', molhados, 'derivação para cada ambiente');
      add('luva32', 'Luva PVC soldável 32 mm', 'un', ceil(m32 * 1.1 / 6), '1 por barra');
      add('bucha3225', 'Bucha de redução soldável 32×25 mm', 'un', molhados, '');
      const regGaveta = molhados + 1;
      add('regGaveta', 'Registro de gaveta bruto 3/4"', 'un', regGaveta, '1 por ambiente molhado + 1 geral');
      add('regGaveta1', 'Registro de gaveta bruto 1" (saída da caixa d’água)', 'un', 1, '');
      add('regPressao', 'Registro de pressão bruto 3/4" (chuveiro)', 'un', nb, '1 por banheiro');
      add('adapt25', 'Adaptador soldável curto com bolsa e rosca 25 mm × 3/4"', 'un', (regGaveta + nb) * 2, '2 por registro');
      add('adapt32', 'Adaptador soldável curto com bolsa e rosca 32 mm × 1"', 'un', 2, 'registro de saída da caixa');
      const vol = pessoas * C.consumoAgua;
      const cx = escolher([500, 750, 1000, 1500, 2000, 3000, 5000], vol);
      add('caixaAgua', 'Caixa d’água de polietileno ' + fmt(cx, 0) + ' L com tampa', 'un', 1, pessoas + ' pessoas × ' + C.consumoAgua + ' L/dia = ' + fmt(vol, 0) + ' L');
      add('boia', 'Torneira de boia 3/4"', 'un', 1, 'entrada da caixa');
      add('flange25', 'Adaptador com flange para caixa d’água 25 mm × 3/4"', 'un', 1, 'entrada');
      add('flange32', 'Adaptador com flange para caixa d’água 32 mm × 1"', 'un', 1, 'saída de consumo');
      add('flange40', 'Adaptador com flange para caixa d’água 40 mm × 1 1/4"', 'un', 2, 'extravasor e limpeza');
      add('regEsfera40', 'Registro de esfera PVC soldável 40 mm', 'un', 1, 'limpeza da caixa');
      add('cavalete', 'Kit cavalete PVC 3/4" com registro (padrão da concessionária)', 'un', 1, 'o hidrômetro é fornecido pela concessionária');
      const juntas = pontosAgua * 4 + molhados * 4 + 10;
      add('adesivoPvc', 'Adesivo para PVC (bisnaga 175 g)', 'un', ceil(juntas / 40) + 1, 'água fria e esgoto: ~40 juntas por bisnaga');
      add('solLimp', 'Solução limpadora para PVC (frasco 200 ml)', 'un', ceil(juntas / 60), '');
      add('vedaRosca', 'Fita veda-rosca 18 mm × 25 m', 'un', ceil((pontosAgua + regGaveta * 2) / 15), '');
      add('lixa100', 'Lixa d’água nº 100 (preparo das juntas)', 'folha', ceil(juntas / 40), '');
    }

    // ================================================================ 7 ESGOTO
    etapa('esgoto', 'Instalações sanitárias (esgoto)');
    {
      const vasos = nb + nl;
      const m100 = vasos * 2.5 + molhados * 3 + g.P / 2 + (resp.esgoto === 'rede' ? num(resp.distRede, 10) : 6);
      const m50 = nc * 3 + ns * 4 + nb * 2 + nb * (h + 1.5);
      const m40 = (nb + nl) * 1.5 + nb * 1.5 + ns * 1.5;
      add('tubo100', 'Tubo PVC esgoto 100 mm', 'm', m100 * 1.10, 'ramais dos vasos, subcoletores e ligação ' + (resp.esgoto === 'rede' ? 'à rede' : 'à fossa'), EMB.barra6);
      add('tubo50', 'Tubo PVC esgoto 50 mm', 'm', m50 * 1.10, 'pia, tanque, máquina, caixas sifonadas e ventilação', EMB.barra6);
      add('tubo40e', 'Tubo PVC esgoto 40 mm', 'm', m40 * 1.10, 'lavatórios, ralos de box e tanque', EMB.barra6);
      add('joelho100', 'Joelho 90° PVC esgoto 100 mm', 'un', vasos + 2, '1 por vaso + mudanças de direção');
      add('joelho45_100', 'Joelho 45° PVC esgoto 100 mm', 'un', vasos * 2 + 2, '');
      add('juncao100', 'Junção simples PVC esgoto 100×100 mm', 'un', vasos + 1, '');
      add('juncao10050', 'Junção simples PVC esgoto 100×50 mm', 'un', nb + nc + ns, '');
      add('joelho50', 'Joelho 90° PVC esgoto 50 mm', 'un', (nb + nc + ns) * 3, '');
      add('joelho40', 'Joelho 90° PVC esgoto 40 mm', 'un', (nb + nl) * 2 + nb + ns, '');
      add('caixaSif', 'Caixa sifonada PVC 150×150×50 mm com grelha', 'un', nb + ns, '1 por banheiro e área de serviço');
      const ralos = cont('varanda') + cont('garagem');
      if (ralos) add('ralo100', 'Ralo seco PVC 100 mm com grelha', 'un', ralos, 'varanda/garagem');
      add('caixaGordura', 'Caixa de gordura PVC/polietileno 19 L', 'un', Math.max(1, nc), '1 por cozinha');
      add('caixaInsp', 'Caixa de inspeção pré-moldada de concreto 60×60 cm com tampa', 'un', 2 + ceil(g.P / 20), 'mudanças de direção da rede externa');
      add('terminalVent', 'Terminal de ventilação PVC 50 mm', 'un', Math.max(1, nb), '1 por coluna de ventilação');
      add('anelVed', 'Anel de vedação para saída de vaso sanitário', 'un', vasos, '');
      if (resp.esgoto === 'fossa') {
        const vf = 1000 + pessoas * (130 * 1 + 57);
        const vfc = escolher([1100, 1500, 2000, 3000, 5000], vf);
        const vfil = Math.max(1000, 1.6 * pessoas * 130);
        const vfilc = escolher([1000, 1500, 2000, 3000, 5000], vfil);
        add('fossa', 'Fossa séptica pré-fabricada ' + fmt(vfc, 0) + ' L', 'un', 1, 'NBR 7229: V = 1000 + N(C·T + K·Lf) = ' + fmt(vf, 0) + ' L para ' + pessoas + ' pessoas');
        add('filtro', 'Filtro anaeróbio pré-fabricado ' + fmt(vfilc, 0) + ' L', 'un', 1, 'NBR 13969: V = 1,6·N·C·T = ' + fmt(vfil, 0) + ' L');
        add('anelSumid', 'Anel de concreto Ø 1,50 m × 0,50 m (sumidouro)', 'un', 4, 'sumidouro de 2,0 m de profundidade (confirmar com teste de infiltração)');
        add('tampaSumid', 'Tampa de concreto Ø 1,50 m', 'un', 1, '');
        add('brita2', 'Brita 2', 'm³', 0.50, 'fundo drenante do sumidouro');
      }
    }

    // ================================================================ 8 ELÉTRICA
    etapa('eletrica', 'Instalações elétricas');
    {
      const run = 0.5 * (g.Lc + g.Wc) + 2.5;
      let luz = 0, interrS = 0, interrP = 0, tugG = 0, tug20 = 0, tv = 0;
      const tue = { chuveiro: nb, maquina: ns, micro: nc, ar: resp.arCondicionado ? nq + nsala + cont('conjugado') : 0 };
      for (const a of amb) {
        const t = a.tipo;
        const pl = 1 + (a.area > 20 ? 1 : 0);
        luz += pl;
        if (t === 'circulacao' && a.perimetro > 8) interrP += 2; else interrS += 1;
        if (t === 'sala' || t === 'quarto' || t === 'escritorio') { tugG += Math.max(1, ceil(a.perimetro / 5)); tv += 1; }
        else if (t === 'cozinha' || t === 'cozinha_servico') tug20 += ceil(a.perimetro / 3.5) + 1;
        else if (t === 'conjugado') { tugG += Math.max(1, ceil(a.perimetro / 5)); tug20 += 3; tv += 1; }
        else if (t === 'servico') tug20 += Math.max(1, ceil(a.perimetro / 3.5));
        else tugG += 1;
      }
      const luzExt = Math.max(2, ceil(g.P / 12));
      interrS += 1; // comando da iluminação externa
      const pontosLuz = luz + luzExt;
      const tueTot = tue.chuveiro + tue.maquina + tue.micro + tue.ar;
      const cIlum = ceil(luz / 10) + 1;
      const cTugG = Math.max(1, ceil(tugG / 8));
      const cTug20 = tug20 ? ceil(tug20 / 5) : 0;
      const memP = pontosLuz + ' pontos de luz, ' + (tugG + tug20) + ' tomadas de uso geral, ' + tueTot + ' tomadas/pontos de uso específico (NBR 5410)';

      // condutores
      const f15 = luz * 0.6 * run * 2 + luzExt * run * 0.8 * 2;
      const r15 = (interrS) * 3.5 + interrP * 3.5 * 1.5;
      const t15 = pontosLuz * 0.6 * run;
      const f25 = (tugG + tug20) * 0.6 * run;
      const ar25 = tue.ar * run + tue.maquina * run + tue.micro * run;
      const f6 = tue.chuveiro * run;
      add('fio15f', 'Cabo flexível 1,5 mm² 750 V — fase', 'm', f15 / 2 * 1.10, memP, EMB.rolo100);
      add('fio15n', 'Cabo flexível 1,5 mm² 750 V — neutro (azul)', 'm', f15 / 2 * 1.10, 'circuitos de iluminação', EMB.rolo100);
      add('fio15r', 'Cabo flexível 1,5 mm² 750 V — retorno', 'm', r15 * 1.10, 'interruptores', EMB.rolo100);
      add('fio15t', 'Cabo flexível 1,5 mm² 750 V — terra (verde)', 'm', t15 * 1.10, 'aterramento das luminárias', EMB.rolo100);
      add('fio25f', 'Cabo flexível 2,5 mm² 750 V — fase', 'm', (f25 + tue.ar * run * 2 + (tue.maquina + tue.micro) * run) * 1.10, 'tomadas e TUEs', EMB.rolo100);
      add('fio25n', 'Cabo flexível 2,5 mm² 750 V — neutro (azul)', 'm', (f25 + (tue.maquina + tue.micro) * run) * 1.10, 'tomadas', EMB.rolo100);
      add('fio25t', 'Cabo flexível 2,5 mm² 750 V — terra (verde)', 'm', (f25 + ar25) * 1.10, 'tomadas e TUEs', EMB.rolo100);
      if (f6) {
        add('fio6f', 'Cabo flexível 6 mm² 750 V — fase', 'm', f6 * 2 * 1.10, nb + ' chuveiro(s) 220 V', EMB.rolo100);
        add('fio6t', 'Cabo flexível 6 mm² 750 V — terra (verde)', 'm', f6 * 1.10, 'chuveiros', EMB.rolo100);
      }
      const ramal = num(resp.distRede, 10) / 2 + 8;
      add('cabo10', 'Cabo flexível 10 mm² 750 V (medidor → quadro)', 'm', ramal * 3 * 1.05, '2 fases + neutro, ' + fmt(ramal, 1) + ' m');
      add('cabo10t', 'Cabo flexível 10 mm² 750 V verde (aterramento)', 'm', 10, 'quadro → haste');
      // eletrodutos e caixas
      const pontos = pontosLuz + tugG + tug20 + tueTot + tv + interrS + interrP;
      const eletr = pontos * (0.6 * run + 1.5);
      add('eletroduto25', 'Eletroduto corrugado flexível 3/4" (25 mm) amarelo — parede', 'm', eletr * 0.6 * 1.10, pontos + ' pontos', EMB.rolo50);
      add('eletroduto25l', 'Eletroduto corrugado reforçado 3/4" (25 mm) laranja — laje/piso', 'm', eletr * 0.4 * 1.10, '', EMB.rolo50);
      add('eletroduto32', 'Eletroduto corrugado reforçado 1" (32 mm) — alimentação do quadro', 'm', ramal * 1.10, '', EMB.rolo50);
      const cx42 = tugG + tug20 + tueTot + tv + interrS + interrP;
      add('caixa42', 'Caixa de luz 4×2" PVC', 'un', cx42, 'tomadas, interruptores, TUEs e TV');
      add(temLaje ? 'caixaOct' : 'caixa44', temLaje ? 'Caixa octogonal 4×4" de laje' : 'Caixa 4×4" PVC (pontos de luz)', 'un', luz, 'pontos de luz internos');
      add('caixa44p', 'Caixa 4×4" PVC (passagem)', 'un', ceil(amb.length / 2) + 1, '');
      add('tomada10', 'Tomada 2P+T 10 A (módulo)', 'un', tugG, 'uso geral');
      add('tomada20', 'Tomada 2P+T 20 A (módulo)', 'un', tug20 + tue.maquina + tue.micro + tue.ar, 'cozinha, área de serviço e TUEs');
      add('interrS', 'Interruptor simples 10 A (módulo)', 'un', interrS, '');
      if (interrP) add('interrP', 'Interruptor paralelo (three-way) 10 A (módulo)', 'un', interrP, 'circulações');
      add('tomadaTv', 'Tomada de TV/dados (módulo coaxial ou RJ45)', 'un', tv, 'salas e quartos');
      add('caboCoax', 'Cabo coaxial RG-6 / cabo UTP', 'm', tv * run * 1.10, '');
      add('suporte42', 'Suporte 4×2" para módulos', 'un', cx42 - tue.chuveiro, '');
      add('placa42', 'Placa/espelho 4×2"', 'un', cx42, '1 por caixa (cega no chuveiro)');
      add('conectorChuv', 'Conector/borne para ligação do chuveiro', 'un', tue.chuveiro, '');
      add('plafon', 'Luminária plafon LED 18 W de sobrepor', 'un', luz, 'pontos internos');
      add('arandela', 'Arandela externa LED com lâmpada', 'un', luzExt, 'perímetro externo a cada 12 m');
      // quadro
      const polos = cIlum + cTugG + cTug20 + tue.maquina + tue.micro + tue.chuveiro * 2 + tue.ar * 2 + 2 + 2 + 3;
      const qd = escolher([12, 18, 24, 36, 48], polos + 2);
      add('qd', 'Quadro de distribuição de embutir ' + qd + ' disjuntores DIN com barramentos', 'un', 1, polos + ' polos ocupados');
      add('disj10', 'Disjuntor DIN monopolar 10 A', 'un', cIlum, 'iluminação');
      add('disj20', 'Disjuntor DIN monopolar 20 A', 'un', cTugG + cTug20 + tue.maquina + tue.micro, 'tomadas e TUEs 127 V');
      if (tue.chuveiro) add('disj40', 'Disjuntor DIN bipolar 40 A', 'un', tue.chuveiro, 'chuveiros');
      if (tue.ar) add('disj20b', 'Disjuntor DIN bipolar 20 A', 'un', tue.ar, 'ar-condicionado');
      add('disjGeral', 'Disjuntor DIN bipolar 63 A (geral do quadro)', 'un', 1, 'confirmar com a carga e a concessionária');
      add('dr', 'Interruptor diferencial residual (DR) bipolar 63 A 30 mA', 'un', 1, 'NBR 5410 (áreas molhadas e tomadas)');
      add('dps', 'DPS 275 V 20 kA', 'un', 3, 'fases e neutro');
      add('haste', 'Haste de aterramento cobreada 5/8" × 2,40 m', 'un', 1, '');
      add('conectorHaste', 'Conector cabo-haste (grampo)', 'un', 1, '');
      add('caixaAterr', 'Caixa de inspeção de aterramento', 'un', 1, '');
      add('padraoEntrada', 'Padrão de entrada de energia bifásico (caixa de medição, poste/pontalete, eletroduto e disjuntor conforme concessionária)', 'un', 1, 'kit da concessionária local');
      add('conectorAlav', 'Conector de emenda tipo alavanca 3 vias', 'un', ceil(pontos * 2), '2 por ponto');
      add('fitaIsol', 'Fita isolante 19 mm × 20 m', 'un', ceil(pontos / 20) + 1, '');
      add('fitaAuto', 'Fita de autofusão 19 mm × 10 m', 'un', 1, 'emendas do ramal');
    }

    // ================================================================ 9 IMPERMEABILIZAÇÃO
    etapa('impermeabilizacao', 'Impermeabilização');
    {
      let area = 0, cantos = 0;
      const mem = [];
      for (const a of amb) {
        if (a.tipo === 'banheiro') { const v = a.area + a.perimetro * 0.30 + 3.8; area += v; cantos += a.perimetro; mem.push(a.nome + ' ' + fmt(v, 1) + ' m² (piso + rodapé 30 cm + box até 1,80 m)'); }
        else if (a.tipo === 'servico' || a.tipo === 'lavabo' || a.tipo === 'cozinha_servico') { const v = a.area + a.perimetro * 0.30; area += v; cantos += a.perimetro; mem.push(a.nome + ' ' + fmt(v, 1) + ' m²'); }
        else if (a.tipo === 'varanda' && !temLaje) { /* coberta pelo telhado */ }
      }
      if (area > 0) {
        add('polimerica', 'Argamassa polimérica impermeabilizante bicomponente', 'kg', area * 3.0 * 1.05, mem.join('; ') + '; 3 kg/m² em 3 demãos', EMB.polimerica);
        add('telaPoli', 'Tela de poliéster para reforço de cantos e ralos', 'm', cantos * 1.10 + (nb + ns) * 1, 'cantos parede/piso e ralos');
      }
      // primeiras fiadas
      add('polimerica', 'Argamassa polimérica impermeabilizante bicomponente', 'kg', g.Ltot * 0.40 * 2 * 3.0, 'duas primeiras fiadas, as duas faces', EMB.polimerica);
    }

    // ================================================================ 10 REVESTIMENTO DE PAREDES E TETOS
    etapa('revestimentos', 'Revestimento de paredes e tetos');
    {
      const tetoReboco = temLaje && resp.teto === 'reboco';
      const chap = facesInt + facesExt + (tetoReboco ? areaTeto : 0);
      argamassa13(chap * C.chapisco, 'Chapisco em ' + fmt(chap, 1) + ' m² (paredes internas, externas' + (tetoReboco ? ' e teto' : '') + ')');
      argamassa128(facesInt * C.rebocoInt, 'Emboço/reboco interno ' + fmt(facesInt, 1) + ' m² × ' + fmt(C.rebocoInt * 100, 1) + ' cm', 'rev');
      argamassa128(facesExt * C.rebocoExt, 'Reboco externo ' + fmt(facesExt, 1) + ' m² × ' + fmt(C.rebocoExt * 100, 1) + ' cm', 'rev');
      if (tetoReboco) argamassa128(areaTeto * C.rebocoTeto, 'Reboco de teto ' + fmt(areaTeto, 1) + ' m²', 'rev');
      if (temLaje && resp.teto === 'gesso') add('gessoLiso', 'Gesso em pó para revestimento (gesso liso)', 'kg', areaTeto * 6, 'teto ' + fmt(areaTeto, 1) + ' m², 6 kg/m²', EMB.gesso40);
      add('telaReboco', 'Tela de aço galvanizada para reboco (ponte entre estrutura e alvenaria)', 'm', (npil * hAlv * 2 + g.Ltot * 2) * 0.5, 'faixas de 25 cm sobre pilares e cintas (face externa)');
      if (azulejo > 0) {
        add('azulejo', 'Revestimento cerâmico de parede 32×57 cm', 'm²', azulejo * (1 + C.perdaPiso), memAz.join('; '));
        add('colanteAC1', 'Argamassa colante AC-I (interna)', 'kg', azulejo * C.acParede, C.acParede + ' kg/m²', EMB.colante);
        add('rejunte', 'Rejunte cimentício flexível', 'kg', azulejo * rejunteKg(320, 570, 8, 2) * 1.15, 'junta 2 mm', EMB.rejunte);
        add('cantoneira', 'Cantoneira/perfil de acabamento para cantos de cerâmica', 'm', (nb + nl + nc + ns) * 2 * Math.min(h, 2.5), 'quinas vivas');
      }
    }
    function rejunteKg(A, B, esp, junta) { return (A + B) / (A * B) * esp * junta * 1.58; }

    // ================================================================ 11 PISOS
    etapa('pisos', 'Pisos, rodapés, soleiras e calçada');
    {
      const areaInt = amb.filter((a) => !TIPOS_AMBIENTE[a.tipo].externo).reduce((s, a) => s + a.area, 0);
      const areaExtC = amb.filter((a) => TIPOS_AMBIENTE[a.tipo].externo).reduce((s, a) => s + a.area, 0);
      const areaTot = areaInt + areaExtC;
      if (resp.fundacao !== 'radier') {
        add('lona', 'Lona plástica preta 150 µm', 'm²', areaTot * 1.15, 'sob o lastro do piso');
        add('brita1', 'Brita 1', 'm³', areaTot * C.lastroBrita * 1.05, 'lastro de brita ' + fmt(C.lastroBrita * 100, 0) + ' cm');
        concreto(areaTot * C.lastroConcreto, 'magro', 'Lastro de concreto do piso ' + fmt(C.lastroConcreto * 100, 0) + ' cm em ' + fmt(areaTot, 1) + ' m²');
      }
      argamassa14(areaTot * C.contrapiso, 'Contrapiso ' + fmt(C.contrapiso * 100, 0) + ' cm em ' + fmt(areaTot, 1) + ' m²');
      if (areaInt > 0) {
        if (resp.piso === 'porcelanato') {
          add('porcelanato', 'Porcelanato 60×60 cm (piso interno)', 'm²', areaInt * (1 + C.perdaPiso), 'ambientes internos ' + fmt(areaInt, 1) + ' m²');
          add('colanteAC3', 'Argamassa colante AC-III', 'kg', areaInt * C.acPorc, C.acPorc + ' kg/m² (dupla colagem)', EMB.colante);
          add('rejunte', 'Rejunte cimentício flexível', 'kg', areaInt * rejunteKg(600, 600, 9, 2) * 1.15, 'porcelanato, junta 2 mm', EMB.rejunte);
          add('nivelador', 'Kit nivelador de piso (clipe + cunha)', 'un', ceil(areaInt * 8), '8 por m²');
        } else {
          add('ceramicaPiso', 'Piso cerâmico 45×45 cm PEI-4 (interno)', 'm²', areaInt * (1 + C.perdaPiso), 'ambientes internos ' + fmt(areaInt, 1) + ' m²');
          add('colanteAC2', 'Argamassa colante AC-II', 'kg', areaInt * C.acPiso, C.acPiso + ' kg/m²', EMB.colante);
          add('rejunte', 'Rejunte cimentício flexível', 'kg', areaInt * rejunteKg(450, 450, 8, 3) * 1.15, 'junta 3 mm', EMB.rejunte);
        }
      }
      if (areaExtC > 0) {
        add('pisoExt', 'Piso cerâmico antiderrapante 45×45 cm (área externa coberta)', 'm²', areaExtC * (1 + C.perdaPiso), 'varanda/garagem ' + fmt(areaExtC, 1) + ' m²');
        add('colanteAC3', 'Argamassa colante AC-III', 'kg', areaExtC * C.acPiso, 'área externa', EMB.colante);
        add('rejunte', 'Rejunte cimentício flexível', 'kg', areaExtC * rejunteKg(450, 450, 8, 4) * 1.15, 'área externa, junta 4 mm', EMB.rejunte);
      }
      // rodapé: ambientes secos e cozinha com faixa
      let rod = 0;
      for (const a of amb) {
        const t = TIPOS_AMBIENTE[a.tipo];
        const azulejada = a.tipo === 'banheiro' || a.tipo === 'lavabo' || ((a.tipo === 'cozinha' || a.tipo === 'servico' || a.tipo === 'cozinha_servico') && resp.revCozinha !== 'faixa');
        if (!azulejada && !t.externo) rod += Math.max(0, a.perimetro - 0.85);
      }
      if (rod > 0) {
        add('rodape', resp.piso === 'porcelanato' ? 'Rodapé de porcelanato h = 7 cm' : 'Rodapé cerâmico h = 7 cm', 'm', rod * 1.10, 'perímetro dos ambientes sem revestimento de parede, menos portas');
        add(resp.piso === 'porcelanato' ? 'colanteAC3' : 'colanteAC2', resp.piso === 'porcelanato' ? 'Argamassa colante AC-III' : 'Argamassa colante AC-II', 'kg', rod * 0.40, 'rodapé', EMB.colante);
      }
      if (nPortas) add('soleira', 'Soleira de granito 2 cm, largura ' + fmt((e + 0.05) * 100, 0) + ' cm', 'm', larguraPortas + nPortas * 0.04, nPortas + ' portas');
      if (nJanelas) {
        let mp = 0; for (const o of g.ab) if (TIPOS_ABERTURA[o.tipo].janela) mp += (o.largura + 0.06) * o.qtd;
        add('peitoril', 'Peitoril de granito 2 cm com pingadeira, largura ' + fmt((e + 0.08) * 100, 0) + ' cm', 'm', mp, nJanelas + ' janelas');
      }
      if (nPortas || nJanelas) add('colanteAC3', 'Argamassa colante AC-III', 'kg', (larguraPortas + nJanelas * 1.2) * 1.5, 'assentamento de soleiras e peitoris', EMB.colante);
      const w = num(resp.calcada, 0);
      if (w > 0) {
        const ac = (g.P + 4 * w) * w;
        concreto(ac * 0.06, 'c20', 'Calçada perimetral ' + fmt(w) + ' m × 6 cm (' + fmt(ac, 1) + ' m²)');
        add('lona', 'Lona plástica preta 150 µm', 'm²', ac * 1.10, 'sob a calçada');
        add('sarrafo', 'Sarrafo de pinus 2,5×7 cm', 'm', g.P * 1.1 + (g.P / 1.5) * w, 'guias e juntas a cada 1,5 m');
      }
    }

    // ================================================================ 12 FORRO
    if (resp.teto === 'drywall' || resp.teto === 'pvc' || (!temLaje && (resp.teto === 'reboco' || resp.teto === 'gesso'))) {
      etapa('forro', 'Forro');
      if (!temLaje && (resp.teto === 'reboco' || resp.teto === 'gesso')) avisos.push('Sem laje não há teto rebocado: o forro foi considerado em gesso acartonado (drywall).');
      const tipoForro = resp.teto === 'pvc' ? 'pvc' : 'drywall';
      const perim = amb.reduce((s, a) => s + a.perimetro, 0);
      if (tipoForro === 'drywall') {
        const umido = amb.filter((a) => a.tipo === 'banheiro' || a.tipo === 'lavabo' || a.tipo === 'servico').reduce((s, a) => s + a.area, 0);
        const seco = areaTeto - umido;
        add('chapaST', 'Chapa de gesso acartonado ST 12,5 mm 1,20×1,80 m', 'un', ceil(seco * 1.10 / 2.16), 'teto ' + fmt(seco, 1) + ' m²');
        if (umido > 0) add('chapaRU', 'Chapa de gesso acartonado RU (verde) 12,5 mm 1,20×1,80 m', 'un', ceil(umido * 1.10 / 2.16), 'áreas úmidas ' + fmt(umido, 1) + ' m²');
        add('perfilF530', 'Perfil F-530 (barra 3 m)', 'm', areaTeto * 2.0, 'espaçamento 60 cm + travessas', EMB.barra3);
        add('cantoneiraTabica', 'Cantoneira/tabica perimetral (barra 3 m)', 'm', perim * 1.05, 'perímetro dos ambientes', EMB.barra3);
        add('regulador', 'Regulador para perfil F-530', 'un', ceil(areaTeto * 1.3), '');
        add('pendural', 'Arame galvanizado nº 10 (pendural)', 'kg', areaTeto * 1.3 * 0.6 * 0.06, '0,6 m por regulador');
        add('fixacaoPendural', temLaje ? 'Bucha + parafuso/pino para fixar pendural' : 'Parafuso para madeira (fixar pendural no madeiramento)', 'un', ceil(areaTeto * 1.3), '');
        add('parafusoGN25', 'Parafuso drywall GN25', 'un', ceil(areaTeto * 25), '25 por m²');
        add('fitaJunta', 'Fita de papel microperfurada para juntas (rolo 150 m)', 'm', areaTeto * 1.5, '', { nome: 'rolo 150 m', qtd: 150 });
        add('massaJunta', 'Massa para juntas de drywall', 'kg', areaTeto * 0.5, '', { nome: 'balde 15 kg', qtd: 15 });
      } else {
        add('reguaPvc', 'Forro de PVC em réguas 200 mm', 'm²', areaTeto * 1.07, 'teto ' + fmt(areaTeto, 1) + ' m²');
        add('perfilUPvc', 'Perfil U/arremate de PVC para forro (barra 6 m)', 'm', perim * 1.10, 'perímetro', EMB.barra6);
        add('metalon', 'Metalon 20×20 mm (estrutura do forro)', 'm', areaTeto * 1.8, 'espaçamento 55 cm', EMB.barra6);
        add('pendural', 'Arame galvanizado nº 10 (pendural)', 'kg', areaTeto * 0.8 * 0.06, '');
        add('parafusoPvc', 'Parafuso/grampo de fixação do forro', 'un', ceil(areaTeto * 15), '');
      }
    }

    // ================================================================ 13 ESQUADRIAS
    etapa('esquadrias', 'Esquadrias, portas e ferragens');
    {
      const grupos = {};
      for (const o of g.ab) { const k = o.tipo + '|' + o.largura + '|' + o.altura; grupos[k] = grupos[k] || Object.assign({}, o, { qtd: 0 }); grupos[k].qtd += o.qtd; }
      let portasMadeira = 0, portasInt = 0, nEsq = 0, nJan = 0;
      const marco = 'p/ parede de ' + fmt((e + 0.05) * 100, 0) + ' cm';
      for (const k in grupos) {
        const o = grupos[k], d = dim(o.largura, o.altura), q = o.qtd;
        nEsq += q;
        if (o.tipo === 'porta_int' || (o.tipo === 'porta_ext' && resp.portaExterna === 'madeira')) {
          const ext = o.tipo === 'porta_ext';
          add('porta_' + k, ext ? 'Porta de madeira maciça/almofadada ' + d + ' (folha)' : 'Porta de madeira semioca lisa ' + d + ' (folha)', 'un', q, '');
          add('batente_' + o.largura, 'Batente/marco de madeira ' + marco + ', vão ' + fmt(o.largura, 2) + ' m (jogo)', 'un', q, '');
          add('guarnicao', 'Guarnição/alizar de madeira (jogo de uma face)', 'un', q * 2, '2 faces por porta');
          add('dobradica', 'Dobradiça 3 1/2" × 3" (cartela com 3)', 'un', q, '');
          portasMadeira += q; if (!ext) portasInt += q;
          if (ext) add('fechExt', 'Fechadura externa com cilindro', 'un', q, '');
        } else if (o.tipo === 'porta_ext') {
          add('portaAl_' + k, 'Porta de alumínio de abrir ' + d + ' com fechadura', 'un', q, '');
        } else if (o.tipo === 'porta_correr') {
          add('portaCorrer_' + k, 'Porta de correr de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro ' + d + ' (completa)', 'un', q, '');
        } else if (o.tipo === 'portao') {
          add('portao_' + k, 'Portão de garagem em aço (basculante ou de correr) ' + d + ' com ferragens', 'un', q, '');
        } else if (o.tipo === 'basculante') {
          add('basc_' + k, 'Janela basculante de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro mini-boreal ' + d, 'un', q, '');
          nJan += q;
        } else {
          add('janela_' + k, 'Janela de correr 2 folhas de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro ' + d, 'un', q, '');
          nJan += q;
        }
      }
      const fechBanh = Math.min(portasInt, nb + nl);
      if (fechBanh) add('fechBanh', 'Fechadura de banheiro (tranqueta)', 'un', fechBanh, 'portas de banheiro/lavabo');
      if (portasInt - fechBanh > 0) add('fechInt', 'Fechadura interna (tipo tambor)', 'un', portasInt - fechBanh, '');
      if (portasMadeira) {
        add('espumaPU', 'Espuma expansiva de poliuretano 500 ml', 'un', ceil(portasMadeira / 2), 'fixação dos batentes');
        add('parafusoBatente', 'Parafuso 4,8×65 mm com bucha nº 8', 'un', portasMadeira * 8, '8 por batente');
      }
      if (nEsq - portasMadeira > 0) add('silicone', 'Selante de silicone neutro 280 g', 'un', ceil((nEsq - portasMadeira) / 2), 'vedação das esquadrias');
    }

    // ================================================================ 14 LOUÇAS E METAIS
    etapa('loucas', 'Louças, metais e bancadas');
    {
      const vasos = nb + nl;
      if (vasos) {
        add('vaso', 'Bacia sanitária com caixa acoplada', 'un', vasos, nb + ' banheiro(s) + ' + nl + ' lavabo(s)');
        add('assento', 'Assento sanitário', 'un', vasos, '');
        add('kitFixVaso', 'Kit de fixação para bacia sanitária', 'un', vasos, '');
        add('lavatorio', 'Lavatório de louça com coluna', 'un', vasos, '');
        add('torneiraLav', 'Torneira de mesa para lavatório', 'un', vasos, '');
        add('valvula1', 'Válvula de escoamento 1" para lavatório', 'un', vasos, '');
        add('sifao', 'Sifão sanfonado/copo universal', 'un', vasos + nc + ns, 'lavatórios, pias e tanques');
        add('flexivel', 'Engate flexível 40 cm', 'un', vasos * 2 + nc, 'vaso, lavatório e pia');
        add('espelho', 'Espelho 60×90 cm com fixação', 'un', vasos, '');
        add('papeleira', 'Kit de acessórios (papeleira, toalheiro, saboneteira, cabide)', 'un', vasos, '');
      }
      if (nb) {
        add('chuveiro', 'Chuveiro elétrico 220 V', 'un', nb, '');
        add('ducha', 'Ducha higiênica com registro', 'un', nb, '');
        add('box', 'Box de vidro temperado 8 mm (com ferragens)', 'm²', nb * 2.3, '1,20 × 1,90 m por banheiro');
        add('acabRegPressao', 'Acabamento para registro de pressão', 'un', nb, '');
      }
      add('acabRegGaveta', 'Acabamento para registro de gaveta', 'un', nb + nl + nc + ns, '');
      if (nc) {
        add('bancada', 'Bancada de granito 1,80×0,60 m com cuba de inox nº 2', 'un', nc, '');
        add('torneiraCoz', 'Torneira de cozinha (mesa ou parede)', 'un', nc, '');
        add('valvulaAmer', 'Válvula americana 3 1/2" para cuba', 'un', nc, '');
      }
      if (ns) {
        add('tanque', 'Tanque de louça/mármore sintético com coluna', 'un', ns, '');
        add('torneiraTanque', 'Torneira para tanque', 'un', ns, '');
        add('torneiraMaq', 'Torneira para máquina de lavar com bico', 'un', ns, '');
        add('valvulaTanque', 'Válvula de escoamento para tanque', 'un', ns, '');
      }
      add('torneiraJardim', 'Torneira de jardim 1/2" com bico', 'un', 2, 'frente e fundos');
    }

    // ================================================================ 15 PINTURA
    etapa('pintura', 'Pintura');
    {
      const pP = 1 + C.perdaPintura;
      const umidasPaint = amb.filter((a) => (a.tipo === 'banheiro' || a.tipo === 'lavabo') && resp.revBanheiro !== 'teto').reduce((s, a) => s + a.perimetro * (h - 1.5), 0);
      const secaPaint = Math.max(0, pinturaInt - umidasPaint);
      add('seladorInt', 'Fundo selador acrílico', 'L', (pinturaInt) * C.seladorInt * pP, 'paredes internas ' + fmt(pinturaInt, 1) + ' m²', EMB.lata18);
      add('massaCorrida', 'Massa corrida PVA', 'kg', secaPaint * C.massaCorrida * pP, 'paredes secas ' + fmt(secaPaint, 1) + ' m²', EMB.massa);
      if (umidasPaint > 0) add('massaAcrilica', 'Massa acrílica', 'kg', umidasPaint * C.massaAcrilica * pP, 'paredes de áreas úmidas acima da cerâmica', EMB.massa);
      add('tintaInt', 'Tinta acrílica fosca/acetinada interna', 'L', pinturaInt * C.tintaInt * pP, '2 demãos', EMB.lata18);
      if (resp.teto !== 'pvc') {
        const forrado = !temLaje || resp.teto === 'drywall';
        if (!forrado && resp.teto === 'reboco') add('massaCorrida', 'Massa corrida PVA', 'kg', areaTeto * 0.5 * pP, 'teto rebocado ' + fmt(areaTeto, 1) + ' m²', EMB.massa);
        add('seladorInt', 'Fundo selador acrílico', 'L', areaTeto * C.seladorInt * pP, 'teto', EMB.lata18);
        add('tintaTeto', 'Tinta acrílica para teto (branco fosco)', 'L', areaTeto * C.tintaTeto * pP, 'teto ' + fmt(areaTeto, 1) + ' m²', EMB.lata18);
      }
      add('seladorExt', 'Fundo selador acrílico (externo)', 'L', facesExt * C.seladorExt * pP, 'fachadas ' + fmt(facesExt, 1) + ' m²', EMB.lata18);
      if (resp.pinturaExterna === 'textura') {
        add('textura', 'Textura acrílica', 'kg', facesExt * C.textura * pP, C.textura + ' kg/m²', EMB.textura);
      } else {
        add('massaAcrilica', 'Massa acrílica', 'kg', facesExt * C.massaAcrilica * pP, 'fachadas', EMB.massa);
        add('tintaExt', 'Tinta acrílica premium externa', 'L', facesExt * C.tintaExt * pP, 'fachadas', EMB.lata18);
      }
      let aPortas = 0;
      for (const o of g.ab) if (o.tipo === 'porta_int' || (o.tipo === 'porta_ext' && resp.portaExterna === 'madeira')) aPortas += o.largura * o.altura * 2 * 1.25 * o.qtd;
      if (aPortas > 0) {
        add('fundoNiv', 'Fundo nivelador para madeira', 'L', aPortas * 0.08 * pP, 'portas, batentes e guarnições ' + fmt(aPortas, 1) + ' m²', EMB.galao);
        add('esmalte', 'Esmalte sintético acetinado', 'L', aPortas * 0.12 * pP, '2 demãos', EMB.galao);
        add('aguarras', 'Aguarrás (diluente)', 'L', aPortas * 0.04, '', { nome: 'lata 900 ml', qtd: 0.9 });
        add('lixa220', 'Lixa para madeira nº 220', 'folha', ceil(aPortas / 4), '');
      }
      if (resp.telha !== 'metalica') add('stain', 'Stain/verniz para madeiramento aparente do beiral', 'L', g.P * bei * 1.5 * 0.15 * pP, 'beiral', EMB.galao);
      add('lixa150', 'Lixa para massa nº 150', 'folha', ceil((secaPaint + areaTeto) / 8), '');
      add('fitaCrepe', 'Fita crepe 48 mm × 50 m', 'un', ceil((pinturaInt + facesExt) / 60), '');
      add('lonaPintura', 'Lona plástica para proteção de pisos', 'm²', areaTeto * 0.5, '');
    }

    // ================================================================ 16 LIMPEZA
    etapa('limpeza', 'Limpeza final');
    {
      const ap = amb.reduce((s, a) => s + a.area, 0);
      add('limpadorPos', 'Limpador pós-obra (removedor de cimento e rejunte) 5 L', 'un', Math.max(1, ceil(ap / 80)), 'pisos e revestimentos');
      add('detergente', 'Detergente neutro para limpeza (5 L)', 'un', Math.max(1, ceil(ap / 100)), '');
      add('sacoEntulho', 'Saco de ráfia para entulho', 'un', ceil(ap / 4), '');
    }

    // limpar itens vazios/mem auxiliar
    for (const et of etapas) {
      et.itens = et.itens.filter((i) => i.qtd > 1e-6 && i.key.indexOf('_formaMem') !== 0);
      for (const i of et.itens) { i.compra = compra(i); delete i.mapa; }
      delete et.mapa;
    }
    const final = etapas.filter((e2) => e2.itens.length);

    // consolidado
    const cons = {}; const ordem = [];
    for (const et of final) for (const i of et.itens) {
      if (!cons[i.key]) { cons[i.key] = { key: i.key, desc: i.desc, un: i.un, qtd: 0, emb: i.emb, etapas: [] }; ordem.push(i.key); }
      cons[i.key].qtd += i.qtd; cons[i.key].etapas.push(et.nome);
    }
    const consolidado = ordem.map((k) => { const c = cons[k]; c.compra = compra(c); return c; });

    return {
      etapas: final,
      consolidado,
      avisos,
      resumo: {
        areaConstruida: g.A, perimetro: g.P, comprimento: g.Lc, largura: g.Wc,
        paredesExternas: g.Lext, paredesInternas: g.Lint, pilares: npil,
        alvenaria: alvLiq, facesInternas: facesInt, facesExternas: facesExt, azulejo, pinturaInterna: pinturaInt,
        areaPiso: areaTeto, telhado: aInc, projecaoTelhado: proj, vaos: abTotal,
        pessoas, ambientes: amb.length, aberturas: g.ab.reduce((s, o) => s + o.qtd, 0)
      },
      respostas: resp
    };
  }

  function compra(i) {
    if (i.emb && i.emb.qtd > 0) {
      const n = ceil(i.qtd / i.emb.qtd);
      return n + ' ' + (n === 1 ? i.emb.nome : plural(i.emb.nome));
    }
    if (i.un === 'un' || i.un === 'folha') return ceil(i.qtd) + ' ' + i.un;
    if (i.un === 'm³') return fmt(Math.ceil(i.qtd * 10 - 1e-9) / 10, 1) + ' m³';
    return fmt(ceil(i.qtd), 0) + ' ' + i.un;
  }
  function plural(s) {
    return s.replace(/^saco/, 'sacos').replace(/^lata/, 'latas').replace(/^barra/, 'barras').replace(/^rolo/, 'rolos')
      .replace(/^galão/, 'galões').replace(/^balde/, 'baldes').replace(/^caixa/, 'caixas');
  }

  const API = { calcular, normalizar, TIPOS_AMBIENTE, TIPOS_ABERTURA, BLOCOS, RESPOSTAS_PADRAO, COEF, ACO, fmt, r2 };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.CasaEngine = API;
})(typeof self !== 'undefined' ? self : this);
