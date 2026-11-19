/* Lang Casa — motor de quantitativos de insumos por etapa.
 * Entrada: pavimentos (cada um com levantamento: ambientes, paredes, aberturas, contorno e nº de repetições),
 *          respostas, coeficientes.
 * Saída: etapas com itens (insumos), tabela consolidada, compras por fase e indicadores de conferência.
 * Só insumos/materiais: nada de ferramentas, equipamentos ou mão de obra.
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ catálogos
  const TIPOS_AMBIENTE = {
    sala: { nome: 'Sala', seco: true, permanencia: true },
    quarto: { nome: 'Quarto / suíte', seco: true, permanencia: true },
    escritorio: { nome: 'Escritório', seco: true, permanencia: true },
    circulacao: { nome: 'Circulação / hall', seco: true },
    cozinha: { nome: 'Cozinha', molhado: true, cozinha: true },
    conjugado: { nome: 'Sala + cozinha integradas (flat/living)', seco: true, cozinha: true, permanencia: true },
    cozinha_servico: { nome: 'Cozinha + área de serviço', molhado: true, cozinha: true, servico: true },
    banheiro: { nome: 'Banheiro', molhado: true },
    lavabo: { nome: 'Lavabo', molhado: true },
    servico: { nome: 'Área de serviço', molhado: true, servico: true },
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

  // pisos: peça (mm), espessura e junta (mm) para o rejunte, argamassa colante, perda, rodapé
  const PISOS = {
    ceramica: { nome: 'Piso cerâmico 45×45 cm PEI-4', A: 450, B: 450, esp: 8, junta: 3, colante: 'AC-II', kg: 5.0, perda: 0.10, rodape: 'ceramico' },
    porcelanato: { nome: 'Porcelanato 60×60 cm', A: 600, B: 600, esp: 9, junta: 2, colante: 'AC-III', kg: 6.0, perda: 0.10, rodape: 'porcelanato', nivelador: true },
    porcelanato_gg: { nome: 'Porcelanato grande formato 90×90 cm', A: 900, B: 900, esp: 9, junta: 2, colante: 'AC-III', kg: 7.0, perda: 0.12, rodape: 'porcelanato', nivelador: true },
    laminado: { nome: 'Piso laminado 7 mm (clique)', perda: 0.08, rodape: 'mdf', manta: true },
    vinilico: { nome: 'Piso vinílico em réguas 2 mm (colado)', perda: 0.06, rodape: 'mdf', cola: 0.35 },
    externo: { nome: 'Piso cerâmico antiderrapante 45×45 cm (externo)', A: 450, B: 450, esp: 8, junta: 4, colante: 'AC-III', kg: 5.0, perda: 0.10, rodape: 'ceramico' },
    cimentado: { nome: 'Piso cimentado desempenado (sem revestimento)', perda: 0, rodape: null }
  };

  // tensões admissíveis presuntivas (NBR 6122:1996, tabela de valores básicos), do mais ao menos resistente
  const SOLOS = [
    { id: 'rocha', nome: 'Rocha sã / rocha pouco alterada', kpa: 1000 },
    { id: 'pedregulho', nome: 'Pedregulho compacto a muito compacto', kpa: 600 },
    { id: 'areia_mc', nome: 'Areia muito compacta', kpa: 500 },
    { id: 'areia_c', nome: 'Areia compacta', kpa: 400 },
    { id: 'argila_dura', nome: 'Argila dura / silte duro', kpa: 300 },
    { id: 'argila_rija', nome: 'Argila rija / silte rijo / pedregulho fofo', kpa: 200 },
    { id: 'areia_m', nome: 'Areia medianamente compacta', kpa: 200 },
    { id: 'argila_media', nome: 'Argila média / silte médio', kpa: 100 },
    { id: 'mole', nome: 'Argila mole, areia fofa ou aterro', kpa: 50 }
  ];

  // massa linear do aço (kg/m)
  const ACO = { '5.0': 0.154, '6.3': 0.245, '8.0': 0.395, '10.0': 0.617, '12.5': 0.963 };

  const RESPOSTAS_PADRAO = {
    peDireito: 2.80,
    vedacao: 'ceramico14',
    fundacao: 'sapata',      // sapata | broca | radier
    solo: 'argila_media',    // ver SOLOS
    laje: 'trelicada',       // laje do último pavimento: trelicada | nenhuma
    teto: 'reboco',          // reboco | gesso | drywall | pvc
    telha: 'ceramica',       // ceramica | fibrocimento | metalica
    beiral: 0.60,
    calhas: true,
    manta: true,
    piso: 'porcelanato',     // chave de PISOS
    pisoQuartos: '',         // '' = igual ao piso; ou chave de PISOS
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
    unidades: 0,             // 0 = automático (uma por cozinha)
    moradores: 0,            // 0 = automático (2 por quarto)
    distRede: 10,
    canteiro: true
  };

  const PADROES_ACABAMENTO = {
    popular: { nome: 'Popular', resp: { piso: 'ceramica', pisoQuartos: '', revBanheiro: '1.50', revCozinha: 'faixa', teto: 'pvc', pinturaExterna: 'acrilica', janelas: 'aluminio', portaExterna: 'madeira' } },
    medio: { nome: 'Médio', resp: { piso: 'porcelanato', pisoQuartos: '', revBanheiro: 'teto', revCozinha: 'faixa', teto: 'reboco', pinturaExterna: 'textura', janelas: 'aluminio', portaExterna: 'madeira' } },
    alto: { nome: 'Alto', resp: { piso: 'porcelanato_gg', pisoQuartos: 'vinilico', revBanheiro: 'teto', revCozinha: 'teto', teto: 'drywall', pinturaExterna: 'textura', janelas: 'pvc', portaExterna: 'aluminio' } }
  };

  // coeficientes editáveis (consumos e perdas). valor, unidade, descrição.
  const COEF = {
    perdaBloco: [0.05, '', 'Perda de blocos'],
    perdaArgamassa: [0.10, '', 'Perda de argamassas'],
    perdaConcreto: [0.05, '', 'Perda de concreto'],
    perdaAco: [0.10, '', 'Perda e transpasse adicional do aço'],
    perdaPiso: [0.10, '', 'Perda de revestimento cerâmico de parede'],
    perdaPintura: [0.10, '', 'Perda de tintas e massas'],
    juntaBloco: [0.01, 'm', 'Espessura da junta de assentamento'],
    chapisco: [0.005, 'm', 'Espessura do chapisco'],
    rebocoInt: [0.020, 'm', 'Espessura do emboço/reboco interno'],
    rebocoExt: [0.025, 'm', 'Espessura do emboço/reboco externo'],
    rebocoTeto: [0.015, 'm', 'Espessura do reboco de teto'],
    contrapiso: [0.04, 'm', 'Espessura do contrapiso'],
    lastroConcreto: [0.05, 'm', 'Espessura do lastro de concreto do piso'],
    lastroBrita: [0.03, 'm', 'Espessura do lastro de brita do piso'],
    c25Cimento: [350, 'kg/m³', 'Cimento no concreto fck 25 MPa'],
    c25Areia: [0.72, 'm³/m³', 'Areia no concreto fck 25'],
    c25Brita: [0.82, 'm³/m³', 'Brita 1 no concreto fck 25'],
    c20Cimento: [300, 'kg/m³', 'Cimento no concreto fck 20 (calçada)'],
    c20Areia: [0.75, 'm³/m³', 'Areia no concreto fck 20'],
    c20Brita: [0.84, 'm³/m³', 'Brita 1 no concreto fck 20'],
    cmCimento: [210, 'kg/m³', 'Cimento no concreto magro'],
    cmAreia: [0.78, 'm³/m³', 'Areia no concreto magro'],
    cmBrita: [0.84, 'm³/m³', 'Brita 1 no concreto magro'],
    a128Cimento: [153, 'kg/m³', 'Cimento na argamassa 1:2:8'],
    a128Cal: [150, 'kg/m³', 'Cal hidratada na argamassa 1:2:8'],
    a128Areia: [1.02, 'm³/m³', 'Areia na argamassa 1:2:8'],
    a13Cimento: [420, 'kg/m³', 'Cimento no chapisco 1:3'],
    a13Areia: [1.05, 'm³/m³', 'Areia no chapisco 1:3'],
    a14Cimento: [324, 'kg/m³', 'Cimento no contrapiso 1:4'],
    a14Areia: [1.08, 'm³/m³', 'Areia no contrapiso 1:4'],
    argIndustr: [1700, 'kg/m³', 'Argamassa industrializada (pó) por m³ aplicado'],
    acParede: [4.5, 'kg/m²', 'Argamassa colante em parede (AC-I)'],
    seladorInt: [0.10, 'L/m²', 'Selador acrílico interno (1 demão)'],
    massaCorrida: [0.65, 'kg/m²', 'Massa corrida PVA (2 demãos)'],
    massaAcrilica: [0.65, 'kg/m²', 'Massa acrílica (2 demãos)'],
    tintaInt: [0.17, 'L/m²', 'Tinta acrílica interna (2 demãos)'],
    tintaTeto: [0.15, 'L/m²', 'Tinta para teto (2 demãos)'],
    seladorExt: [0.12, 'L/m²', 'Selador acrílico externo'],
    textura: [1.5, 'kg/m²', 'Textura acrílica'],
    tintaExt: [0.20, 'L/m²', 'Tinta acrílica externa (2–3 demãos)'],
    telhaCeramica: [16, 'un/m²', 'Telhas cerâmicas por m² de telhado'],
    ripa: [3.0, 'm/m²', 'Ripas por m² de telhado'],
    caibro: [2.0, 'm/m²', 'Caibros por m² de telhado'],
    terca: [0.60, 'm/m²', 'Terças por m² de telhado (telha cerâmica)'],
    vaoPilar: [3.5, 'm', 'Vão máximo entre pilares (estimativa sem desenho)'],
    cargaPav: [10, 'kN/m²', 'Carga por pavimento na fundação (laje + paredes + uso)'],
    cargaCob: [3, 'kN/m²', 'Carga da cobertura na fundação'],
    profFundacao: [1.00, 'm', 'Profundidade da base da sapata'],
    pilarLado: [0.30, 'm', 'Maior lado do pilar'],
    baldrameAltura: [0.30, 'm', 'Altura da viga baldrame'],
    cintaAltura: [0.25, 'm', 'Altura da cinta/viga de respaldo'],
    capaLaje: [0.055, 'm³/m²', 'Concreto da laje treliçada H12 (capa + nervuras)'],
    reusoForma: [2, 'vezes', 'Reaproveitamento das tábuas de fôrma'],
    consumoAgua: [150, 'L/pessoa', 'Consumo diário de água por pessoa']
  };

  // indicadores de conferência: faixas usuais em obras residenciais de alvenaria com estrutura de concreto
  const INDICADORES = [
    { id: 'acoConcreto', nome: 'Aço por m³ de concreto estrutural', un: 'kg/m³', min: 60, max: 130 },
    { id: 'concretoArea', nome: 'Concreto estrutural por m² construído', un: 'm³/m²', min: 0.08, max: 0.25 },
    { id: 'formaConcreto', nome: 'Fôrma por m³ de concreto (sem laje treliçada)', un: 'm²/m³', min: 5, max: 16 },
    { id: 'cimentoArea', nome: 'Cimento por m² construído', un: 'sacos/m²', min: 1.5, max: 4.5 },
    { id: 'alvenariaArea', nome: 'Alvenaria por m² construído', un: 'm²/m²', min: 1.2, max: 3.0 },
    { id: 'blocosParede', nome: 'Blocos por m² de alvenaria', un: 'un/m²', min: 11, max: 27 },
    { id: 'janelaPiso', nome: 'Janelas ÷ piso dos cômodos de permanência', un: '%', min: 12.5, max: 40, nota: 'mínimo usual de códigos de obras: 1/8 a 1/6 do piso' },
    { id: 'pontosArea', nome: 'Pontos elétricos por m² de piso', un: 'pt/m²', min: 0.4, max: 1.6 }
  ];

  // compras por fase da obra
  const FASES = [
    { id: 'f1', nome: '1. Mobilização e fundação', quando: 'antes do início da obra' },
    { id: 'f2', nome: '2. Estrutura e alvenaria', quando: 'ao concluir a fundação' },
    { id: 'f3', nome: '3. Cobertura e instalações embutidas', quando: 'durante a alvenaria (tubos e eletrodutos entram antes do reboco)' },
    { id: 'f4', nome: '4. Impermeabilização e revestimentos', quando: 'ao fechar a cobertura' },
    { id: 'f5', nome: '5. Acabamentos', quando: 'após o reboco e o contrapiso' },
    { id: 'f6', nome: '6. Entrega e limpeza', quando: 'na última semana' }
  ];
  const FASE_ETAPA = { preliminares: 'f1', fundacao: 'f1', estrutura: 'f2', alvenaria: 'f2', cobertura: 'f3', hidraulica: 'f3', esgoto: 'f3', eletrica: 'f3', impermeabilizacao: 'f4', revestimentos: 'f4', pisos: 'f4', forro: 'f5', esquadrias: 'f5', loucas: 'f5', pintura: 'f5', limpeza: 'f6' };
  // itens que mudam de fase ou pedem encomenda antecipada
  function faseDoItem(etapaId, key) {
    const k = key.split('|')[0];
    if (etapaId === 'eletrica' && /^(fio|cabo10|tomada|interr|suporte42|placa42|conectorChuv|plafon|arandela|qd|disj|dr|dps|conectorAlav|fitaIsol|fitaAuto|caboCoax|medidor|disjMedidor)/.test(k)) return 'f5';
    if (etapaId === 'hidraulica' && /^(caixaAgua|boia|flange|regEsfera40)/.test(k)) return 'f3';
    if (etapaId === 'pisos' && /^(porcelanato|ceramica|pisoExt|piso_|rodape|nivelador|soleira|peitoril|laminado|vinilico|manta|colaVinil|rodapeMdf)/.test(k)) return 'f5';
    if (etapaId === 'pisos' && /^(colante|rejunte)/.test(k)) return 'f5';
    if (etapaId === 'revestimentos' && /^(azulejo|colanteAC1|rejunteParede|cantoneira)/.test(k)) return 'f5';
    if (etapaId === 'estrutura' && /^escada/.test(k)) return 'f2';
    return FASE_ETAPA[etapaId] || 'f5';
  }
  function prazoDoItem(etapaId, key) {
    const k = key.split('|')[0];
    if (/^(porta_|portaAl_|portaCorrer_|portao_|janela_|basc_)/.test(k)) return 'sob medida: medir os vãos prontos e encomendar com 30–45 dias de antecedência';
    if (/^(box|bancada)/.test(k)) return 'medir na obra após o revestimento; 15–20 dias de fabricação';
    if (/^(vigota|eps|telaQ)/.test(k)) return 'encomendar com 7–10 dias de antecedência';
    if (/^concretoUsinado/.test(k)) return 'agendar com a concreteira 2–3 dias antes de cada concretagem';
    if (/^(padraoEntrada|medidor)/.test(k)) return 'solicitar a ligação à concessionária com antecedência';
    return '';
  }

  // ------------------------------------------------------------------ utilitários
  const ceil = (v) => Math.ceil(v - 1e-9);
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const fmt = (v, d = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });
  const dim = (w, h) => fmt(w, 2) + '×' + fmt(h, 2) + ' m';
  const escolher = (lista, v) => lista.find((x) => x >= v - 1e-9) || lista[lista.length - 1];
  const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

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
      perimetro: Math.max(0, num(a.perimetro)) || (num(a.area) > 0 ? 4.1 * Math.sqrt(num(a.area)) : 0),
      piso: a.piso && a.piso !== 'auto' && PISOS[a.piso] ? a.piso : null,
      parede: a.parede && a.parede !== 'auto' ? a.parede : null,
      teto: a.teto && a.teto !== 'auto' ? a.teto : null
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
      const somaPer = amb.filter((a) => !TIPOS_AMBIENTE[a.tipo].externo).reduce((s, a) => s + a.perimetro, 0);
      Lint = Math.max(0, (somaPer - Lext) / 2);
    }
    return { amb, ab, somaArea, A, P, Lc, Wc, Lext, Lint, Ltot: Lext + Lint, bl, nos: num(lev.nos) };
  }

  function pavimentosDe(projeto, resp) {
    const lista = projeto.pavimentos && projeto.pavimentos.length ? projeto.pavimentos : [{ nome: 'Térreo', lev: projeto.lev, rep: 1 }];
    return lista.map((p, i) => ({ nome: p.nome || (i ? i + 'º pavimento' : 'Térreo'), rep: Math.max(1, Math.round(num(p.rep, 1))), g: normalizar(p.lev, resp), i }));
  }

  // ------------------------------------------------------------------ cálculo
  function calcular(projeto) {
    const resp = Object.assign({}, RESPOSTAS_PADRAO, projeto.resp || {});
    const C = coefs(projeto.coef);
    const F = pavimentosDe(projeto, resp);
    const F0 = F[0], Ftop = F[F.length - 1];
    const nPav = F.reduce((s, f) => s + f.rep, 0);
    const multi = nPav > 1;
    const avisos = [];

    // ---- etapas em ordem fixa
    const ORDEM = [['preliminares', 'Serviços preliminares e canteiro'], ['fundacao', 'Fundação'], ['estrutura', 'Estrutura (pilares, vigas, vergas, lajes e escada)'], ['alvenaria', 'Alvenaria de vedação'], ['cobertura', 'Cobertura e águas pluviais'], ['hidraulica', 'Instalações hidráulicas (água fria)'], ['esgoto', 'Instalações sanitárias (esgoto)'], ['eletrica', 'Instalações elétricas'], ['impermeabilizacao', 'Impermeabilização'], ['revestimentos', 'Revestimento de paredes e tetos'], ['pisos', 'Pisos, rodapés, soleiras e calçada'], ['forro', 'Forro'], ['esquadrias', 'Esquadrias, portas e ferragens'], ['loucas', 'Louças, metais e bancadas'], ['pintura', 'Pintura'], ['limpeza', 'Limpeza final']];
    const etapas = ORDEM.map(([id, nome]) => ({ id, nome, itens: [], mapa: {} }));
    const porId = Object.fromEntries(etapas.map((e) => [e.id, e]));
    let atual = null, MULT = 1, PREF = '';
    const etapa = (id) => { atual = porId[id]; };
    const T = { concreto: 0, magro: 0, aco: 0, forma: 0, formaLaje: 0 }; // totais para indicadores
    function add(key, desc, un, qtd, mem, emb) {
      qtd *= MULT;
      if (!(qtd > 1e-6)) return;
      const k = key + '|' + un;
      let it = atual.mapa[k];
      if (!it) { it = { key: k, desc, un, qtd: 0, mem: [], emb: emb || null }; atual.mapa[k] = it; atual.itens.push(it); }
      it.qtd += qtd;
      const m = mem ? PREF + mem : '';
      if (m && !it.mem.includes(m)) it.mem.push(m);
    }
    function emPav(f, fn) { const m0 = MULT, p0 = PREF; MULT = f.rep; PREF = F.length > 1 || f.rep > 1 ? f.nome + (f.rep > 1 ? ' (×' + f.rep + ')' : '') + ': ' : ''; fn(); MULT = m0; PREF = p0; }

    const EMB = {
      cimento: { nome: 'saco 50 kg', qtd: 50 }, cal: { nome: 'saco 20 kg', qtd: 20 }, argInd: { nome: 'saco 20 kg', qtd: 20 },
      colante: { nome: 'saco 20 kg', qtd: 20 }, rejunte: { nome: 'saco 1 kg', qtd: 1 }, lata18: { nome: 'lata 18 L', qtd: 18 },
      galao: { nome: 'galão 3,6 L', qtd: 3.6 }, massa: { nome: 'lata 25 kg', qtd: 25 }, textura: { nome: 'balde 25 kg', qtd: 25 },
      rolo100: { nome: 'rolo 100 m', qtd: 100 }, rolo50: { nome: 'rolo 50 m', qtd: 50 }, barra6: { nome: 'barra 6 m', qtd: 6 },
      barra3: { nome: 'barra 3 m', qtd: 3 }, gesso40: { nome: 'saco 40 kg', qtd: 40 }, polimerica: { nome: 'caixa 18 kg', qtd: 18 }
    };
    const cimento = (kg, mem) => add('cimento', 'Cimento Portland CP-II', 'kg', kg, mem, EMB.cimento);
    const areia = (m3, mem) => add('areia', 'Areia média lavada', 'm³', m3, mem);
    const brita = (m3, mem) => add('brita1', 'Brita 1', 'm³', m3, mem);
    const cal = (kg, mem) => add('cal', 'Cal hidratada CH-III', 'kg', kg, mem, EMB.cal);

    function concreto(vol, tipo, mem) {
      if (!(vol > 0)) return;
      const v = vol * (1 + C.perdaConcreto);
      const m = mem + ': ' + fmt(vol, 3) + ' m³';
      if (tipo === 'magro') { T.magro += vol * MULT; cimento(v * C.cmCimento, m + ' (concreto magro)'); areia(v * C.cmAreia, m); brita(v * C.cmBrita, m); return; }
      if (tipo === 'c20') { cimento(v * C.c20Cimento, m + ' (fck 20)'); areia(v * C.c20Areia, m); brita(v * C.c20Brita, m); return; }
      T.concreto += vol * MULT;
      if (resp.concreto === 'usinado') { add('concretoUsinado', 'Concreto usinado fck 25 MPa', 'm³', v, m); return; }
      cimento(v * C.c25Cimento, m + ' (fck 25)'); areia(v * C.c25Areia, m); brita(v * C.c25Brita, m);
    }
    function argamassa128(vol, mem, uso) {
      if (!(vol > 0)) return;
      const v = vol * (1 + C.perdaArgamassa), m = mem + ': ' + fmt(vol, 3) + ' m³';
      if (resp.argamassa === 'industrializada') {
        add('arg_' + uso, uso === 'assent' ? 'Argamassa industrializada de assentamento' : 'Argamassa industrializada de revestimento (reboco)', 'kg', v * C.argIndustr, m, EMB.argInd);
        return;
      }
      cimento(v * C.a128Cimento, m + ' (traço 1:2:8)'); cal(v * C.a128Cal, m); areia(v * C.a128Areia, m);
    }
    function argamassa13(vol, mem) { const v = vol * (1 + C.perdaArgamassa), m = mem + ': ' + fmt(vol, 3) + ' m³ (traço 1:3)'; cimento(v * C.a13Cimento, m); areia(v * C.a13Areia, m); }
    function argamassa14(vol, mem) { const v = vol * (1 + C.perdaArgamassa), m = mem + ': ' + fmt(vol, 3) + ' m³ (traço 1:4)'; cimento(v * C.a14Cimento, m); areia(v * C.a14Areia, m); }
    const acoEtapa = {}, formaEtapa = {}, pecasEtapa = {};
    function aco(bitola, metros, mem) {
      if (!(metros > 0)) return;
      const kgm = ACO[bitola], tipo = bitola === '5.0' ? 'CA-60' : 'CA-50';
      const kg = metros * kgm * (1 + C.perdaAco);
      add('aco' + bitola, 'Aço ' + tipo + ' Ø ' + bitola.replace('.', ',') + ' mm', 'kg', kg, mem + ': ' + fmt(metros, 1) + ' m', { nome: 'barra 12 m', qtd: 12 * kgm });
      acoEtapa[atual.id] = (acoEtapa[atual.id] || 0) + kg * MULT; T.aco += kg * MULT;
    }
    function forma(area) { formaEtapa[atual.id] = (formaEtapa[atual.id] || 0) + area * MULT; T.forma += area * MULT; }
    function pecas(m) { pecasEtapa[atual.id] = (pecasEtapa[atual.id] || 0) + m * MULT; }
    function fecharEtapaEstrutural(id, nome) {
      etapa(id); const m0 = MULT, p0 = PREF; MULT = 1; PREF = '';
      const a = formaEtapa[id] || 0;
      if (a > 0) {
        add('tabuaForma', 'Tábua de pinus 2,5×30 cm (fôrma)', 'm', a / 0.30 / C.reusoForma * 1.10, nome + ': ' + fmt(a, 1) + ' m² de fôrma, ' + C.reusoForma + ' usos');
        add('sarrafo', 'Sarrafo de pinus 2,5×7 cm', 'm', a * 1.5 / C.reusoForma, 'travamento e gravatas das fôrmas');
        add('prego1727', 'Prego 17×27 com cabeça', 'kg', a * 0.12, '0,12 kg por m² de fôrma');
        add('desmoldante', 'Desmoldante para fôrmas', 'L', a * 0.05, '0,05 L por m² de fôrma');
      }
      const kg = acoEtapa[id] || 0;
      if (kg > 0) add('arame18', 'Arame recozido nº 18', 'kg', kg * 0.025, '0,025 kg por kg de aço (' + nome + ')');
      if (pecasEtapa[id] > 0) add('espacador', 'Espaçador plástico p/ armadura (cobrimento 2,5 cm)', 'un', ceil(pecasEtapa[id] * 2), '2 por metro de peça');
      MULT = m0; PREF = p0;
    }
    const rejunteKg = (A, B, esp, junta) => (A + B) / (A * B) * esp * junta * 1.58;

    // ---- grandezas gerais
    const h = num(resp.peDireito, 2.8);
    const hPiso = h + 0.20; // piso a piso
    const b = 0.14;
    const hC = C.cintaAltura;
    const temLajeTopo = resp.laje === 'trelicada';
    const lajeNoPav = (f) => f !== Ftop || temLajeTopo;
    const incl = resp.telha === 'ceramica' ? 0.35 : resp.telha === 'fibrocimento' ? 0.15 : 0.10;
    const bl = F0.g.bl, e = bl.e;
    const cont = (g, t) => g.amb.filter((a) => a.tipo === t).length;
    const contF = (g, pred) => g.amb.filter((a) => pred(TIPOS_AMBIENTE[a.tipo], a)).length;
    // totais do edifício (com repetições)
    const somaF = (fn) => F.reduce((s, f) => s + fn(f) * f.rep, 0);
    const NB = somaF((f) => cont(f.g, 'banheiro')), NL = somaF((f) => cont(f.g, 'lavabo'));
    const NC = somaF((f) => contF(f.g, (t) => t.cozinha)), NS = somaF((f) => contF(f.g, (t) => t.servico));
    const NQ = somaF((f) => cont(f.g, 'quarto'));
    const unidades = num(resp.unidades) > 0 ? Math.round(num(resp.unidades)) : Math.max(1, NC);
    const pessoas = num(resp.moradores) > 0 ? num(resp.moradores) : Math.max(2 * unidades, NQ * 2, 2);
    const areaTotal = somaF((f) => f.g.A);
    const ambTot = somaF((f) => f.g.amb.length);

    if (!ambTot) avisos.push('Nenhum ambiente informado: pisos, tetos, instalações e louças ficaram sem base. Desenhe ou informe os ambientes.');
    if (!somaF((f) => f.g.ab.length)) avisos.push('Nenhuma porta ou janela informada: as áreas de parede não tiveram desconto de vãos e as esquadrias ficaram de fora.');
    if (!NB) avisos.push('Nenhum banheiro informado.');
    if (multi && !temLajeTopo) avisos.push('Os pavimentos intermediários foram considerados com laje treliçada; “sem laje” vale só para o último pavimento.');

    // geometria por pavimento
    function geo(f) {
      const g = f.g;
      let abExt = 0, abInt = 0, abTotal = 0, mVerga = 0, mContra = 0, nVergas = 0, nJanelas = 0, nPortas = 0, larguraPortas = 0, aJanPerm = 0;
      for (const o of g.ab) {
        const a = o.largura * o.altura * o.qtd;
        abTotal += a; if (o.externa) abExt += a; else abInt += a;
        mVerga += (o.largura + 0.60) * o.qtd; nVergas += o.qtd;
        if (TIPOS_ABERTURA[o.tipo].janela) { mContra += (o.largura + 0.60) * o.qtd; nJanelas += o.qtd; if (o.tipo === 'janela') aJanPerm += a; }
        if (TIPOS_ABERTURA[o.tipo].porta) { nPortas += o.qtd; larguraPortas += o.largura * o.qtd; }
      }
      let npil = g.nos > 0 ? Math.round(g.nos) : ceil(g.Lext / C.vaoPilar) + ceil(g.Lint / (C.vaoPilar * 1.4));
      npil = Math.max(4, npil);
      const oitao = f === Ftop && resp.telha !== 'metalica' ? 2 * 0.5 * g.Wc * (g.Wc / 2 * incl) : 0;
      const hAlv = h - hC + 0.05;
      const areaPilaresParede = npil * C.pilarLado * hAlv;
      const alvLiq = Math.max(0, g.Ltot * hAlv + oitao - abTotal - areaPilaresParede);
      const facesInt = Math.max(0, (2 * g.Lint + g.Lext) * h - 2 * abInt - abExt);
      const hExt = f === Ftop ? h + (lajeNoPav(f) ? 0.45 : 0.30) : hPiso;
      const facesExt = Math.max(0, (g.P + 4 * g.bl.e) * hExt + oitao - abExt);
      return { abExt, abInt, abTotal, mVerga, mContra, nVergas, nJanelas, nPortas, larguraPortas, aJanPerm, npil, oitao, hAlv, areaPilaresParede, alvLiq, facesInt, hExt, facesExt };
    }
    const G = new Map(F.map((f) => [f, geo(f)]));

    // acabamentos resolvidos por cômodo
    function pisoDe(a) { if (a.piso) return a.piso; if (TIPOS_AMBIENTE[a.tipo].externo) return 'externo'; if ((a.tipo === 'quarto' || a.tipo === 'escritorio') && PISOS[resp.pisoQuartos]) return resp.pisoQuartos; return PISOS[resp.piso] ? resp.piso : 'porcelanato'; }
    function paredeDe(a) {
      if (a.parede) return a.parede;
      if (a.tipo === 'banheiro' || a.tipo === 'lavabo') return resp.revBanheiro === 'teto' ? 'teto' : '1.50';
      if (a.tipo === 'conjugado') return 'faixa';
      if (a.tipo === 'cozinha' || a.tipo === 'servico' || a.tipo === 'cozinha_servico') return resp.revCozinha;
      return 'nenhum';
    }
    function tetoDe(a, f) {
      let t = a.teto || resp.teto;
      if ((t === 'reboco' || t === 'gesso') && !lajeNoPav(f)) t = 'drywall';
      return t;
    }
    function azulejoDe(a) {
      const p = paredeDe(a);
      if (p === 'nenhum') return 0;
      if (p === 'faixa') return 0.60 * (a.tipo === 'cozinha' || a.tipo === 'conjugado' ? 2.40 : a.tipo === 'cozinha_servico' ? 3.60 : 1.20);
      const alt = p === 'teto' ? h : 1.50;
      return Math.max(0, a.perimetro * alt - (a.tipo === 'banheiro' || a.tipo === 'lavabo' ? 1.80 : 2.0));
    }

    // ================================================================ 1 PRELIMINARES
    etapa('preliminares');
    {
      const g = F0.g, pg = 2 * (g.Lc + 2 + g.Wc + 2);
      add('tabua15', 'Tábua de pinus 2,5×15 cm (gabarito)', 'm', pg * 1.10, 'gabarito de locação: perímetro ' + fmt(pg, 1) + ' m (afastado 1 m da obra)');
      add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', ceil(pg / 1.5) * 1.2, 'gabarito: 1 pontalete de 1,20 m a cada 1,5 m');
      add('prego1727', 'Prego 17×27 com cabeça', 'kg', 1.0, 'gabarito');
      add('linhaNylon', 'Linha de náilon para marcação (rolo 100 m)', 'un', 2, 'alinhamento dos eixos');
      if (resp.canteiro) {
        add('placaObra', 'Placa de obra (lona ou chapa) 2,0×1,0 m', 'un', 1, 'identificação do responsável técnico');
        add('compensado10', 'Chapa de compensado 10 mm 2,20×1,10 m (barracão)', 'un', multi ? 14 : 8, 'barracão para cimento e materiais');
        add('telhaFibro', 'Telha de fibrocimento 6 mm 2,44×1,10 m', 'un', multi ? 6 : 4, 'cobertura do barracão');
        add('pontalete', 'Pontalete de pinus 7,5×7,5 cm', 'm', multi ? 30 : 18, 'estrutura do barracão');
        add('lona', 'Lona plástica preta 150 µm', 'm²', 20, 'proteção de materiais e cura');
      }
      add('padraoProvisorio', 'Ligação provisória de água (kit cavalete + 20 m de mangueira/tubo 25 mm)', 'un', 1, 'água para a obra; usar o padrão de energia definitivo como provisório quando a concessionária permitir');
    }

    // ================================================================ 2 FUNDAÇÃO (térreo) — dimensionada pelo solo e pela carga
    etapa('fundacao');
    const solo = SOLOS.find((s) => s.id === resp.solo) || SOLOS.find((s) => s.id === 'argila_media');
    let fundTipo = resp.fundacao;
    const G0 = G.get(F0);
    const npil0 = G0.npil;
    const aInfl = F0.g.A / npil0;
    const cargaPilar = aInfl * (C.cargaPav * nPav + C.cargaCob) * 1.05; // kN, com peso próprio
    let sapataLado = 0, sapataH = 0;
    const memFund = { solo: solo.nome, kpa: solo.kpa, carga: cargaPilar, aInfl };
    if (fundTipo === 'sapata' && solo.kpa < 80) {
      fundTipo = 'broca';
      avisos.push('Solo “' + solo.nome + '”: sapata rasa não é recomendada. Adotadas estacas (broca) com blocos de coroamento; confirme com sondagem e projeto de fundação.');
    }
    if (fundTipo === 'radier') {
      const area = F0.g.A + F0.g.P * 0.10;
      const esp = nPav > 1 ? 0.15 : 0.12;
      const vol = area * esp + F0.g.P * 0.20 * 0.20;
      add('brita1', 'Brita 1', 'm³', area * 0.05 * 1.05, 'lastro de brita 5 cm sob o radier');
      add('lona', 'Lona plástica preta 150 µm', 'm²', area * 1.15, 'barreira de umidade sob o radier');
      concreto(vol, 'c25', 'Radier e=' + fmt(esp * 100, 0) + ' cm + borda engrossada 20×20');
      add('telaQ138', 'Tela soldada Q-138 (Ø 4,2 c/10) painel 2,0×3,0 m', 'un', ceil(area * 1.15 / 6) * (nPav > 1 ? 2 : 1), 'armadura do radier' + (nPav > 1 ? ' (2 camadas)' : '') + ', 15% de transpasse');
      add('espacadorTrel', 'Espaçador treliçado (caranguejo) para tela', 'un', ceil(area * 0.8), '0,8 por m²');
      aco('10.0', F0.g.P * 4 * 1.10, 'borda engrossada 4Ø10');
      aco('5.0', F0.g.P / 0.20 * 0.70, 'estribos da borda c/20');
      forma(F0.g.P * 0.20);
      aco('10.0', npil0 * 4 * 1.0, 'esperas dos pilares');
      pecas(F0.g.P);
      if (solo.kpa < 80) avisos.push('Radier sobre solo fraco: verifique recalques com projeto de fundação.');
      const q = (C.cargaPav * nPav + C.cargaCob);
      memFund.texto = 'Radier: pressão média ≈ ' + fmt(q, 0) + ' kPa para σadm ≈ ' + solo.kpa + ' kPa.';
      if (q > solo.kpa * 0.9) avisos.push('A pressão do radier (' + fmt(q, 0) + ' kPa) se aproxima da resistência do solo (' + solo.kpa + ' kPa).');
    } else {
      if (fundTipo === 'broca') {
        // capacidade aproximada de estaca broca Ø25 cm: ~60 kN por estaca de 3 m em solo médio
        const capEst = solo.kpa < 80 ? 50 : 70, comp = solo.kpa < 80 ? 6 : 3;
        const porPilar = Math.max(1, ceil(cargaPilar / capEst));
        const nest = npil0 * porPilar;
        const vol = nest * Math.PI * 0.125 * 0.125 * comp;
        concreto(vol, 'c25', nest + ' estacas broca Ø25 cm × ' + comp + ' m (' + porPilar + ' por pilar)');
        aco('8.0', nest * 4 * 2.0, 'armadura de topo 4Ø8 × 2 m');
        aco('5.0', nest * 10 * 0.55, 'estribos Ø5 c/20');
        const ladoBloco = porPilar > 1 ? 0.90 : 0.45;
        concreto(npil0 * ladoBloco * 0.45 * 0.50, 'c25', npil0 + ' blocos de coroamento');
        aco('10.0', npil0 * 8 * (ladoBloco + 0.3), 'blocos de coroamento');
        forma(npil0 * 2 * (ladoBloco + 0.45) * 0.50);
        pecas(nest * 2);
        memFund.texto = 'Carga por pilar ≈ ' + fmt(cargaPilar, 0) + ' kN → ' + porPilar + ' estaca(s) de ' + comp + ' m por pilar.';
      } else {
        // sapata isolada: área = carga / σadm
        const area = cargaPilar / solo.kpa;
        sapataLado = Math.max(0.60, Math.ceil(Math.sqrt(area) / 0.05 - 1e-9) * 0.05);
        sapataH = Math.max(0.25, Math.ceil(((sapataLado - C.pilarLado) / 3) / 0.05 - 1e-9) * 0.05);
        const lado = sapataLado, hs = sapataH;
        const bit = lado > 1.5 ? '12.5' : '10.0', esp = lado > 1.5 ? 0.12 : 0.15;
        memFund.texto = 'Área de influência ≈ ' + fmt(aInfl, 1) + ' m² × (' + nPav + ' pav. × ' + C.cargaPav + ' + cobertura ' + C.cargaCob + ' kN/m²) = ' + fmt(cargaPilar, 0) + ' kN por pilar; σadm ' + solo.kpa + ' kPa → sapata ' + fmt(lado, 2) + '×' + fmt(lado, 2) + ' m, h = ' + fmt(hs, 2) + ' m.';
        concreto(npil0 * (lado + 0.1) * (lado + 0.1) * 0.05, 'magro', 'Lastro das sapatas 5 cm');
        concreto(npil0 * lado * lado * hs, 'c25', npil0 + ' sapatas ' + dim(lado, lado) + ' × ' + fmt(hs) + ' m (solo: ' + solo.nome + ', ' + solo.kpa + ' kPa)');
        const nBar = ceil((lado - 0.10) / esp) + 1;
        aco(bit, npil0 * 2 * nBar * (lado - 0.10 + 0.30), 'malha das sapatas Ø' + bit.replace('.', ',') + ' c/' + fmt(esp * 100, 0) + ' nas 2 direções');
        forma(npil0 * 4 * lado * hs);
        const hPesc = C.profFundacao - hs - C.baldrameAltura;
        if (hPesc > 0) { concreto(npil0 * b * C.pilarLado * hPesc, 'c25', 'arranque dos pilares (pescoço)'); forma(npil0 * 2 * (b + C.pilarLado) * hPesc); }
        pecas(npil0 * 2);
      }
      const hb = C.baldrameAltura, g = F0.g;
      concreto(g.Ltot * (b + 0.10) * 0.05, 'magro', 'Lastro sob baldrame 5 cm');
      concreto(g.Ltot * b * hb, 'c25', 'Viga baldrame ' + fmt(b * 100, 0) + '×' + fmt(hb * 100, 0) + ' cm em ' + fmt(g.Ltot, 1) + ' m');
      aco('10.0', 4 * g.Ltot * 1.10, 'baldrame 4Ø10 (+10% ancoragens)');
      aco('5.0', ceil(g.Ltot / 0.20) * (2 * (b - 0.05 + hb - 0.05) + 0.10), 'estribos do baldrame Ø5 c/20');
      forma(2 * hb * g.Ltot);
      pecas(g.Ltot);
    }
    add('impermBaldrame', 'Emulsão asfáltica para fundações (balde 18 L)', 'L', fundTipo === 'radier' ? F0.g.P * 0.30 * 0.8 : F0.g.Ltot * (b + 2 * 0.15) * 0.8,
      fundTipo === 'radier' ? 'borda do radier' : 'topo e laterais do baldrame, 0,8 L/m² (2 demãos)', { nome: 'balde 18 L', qtd: 18 });
    fecharEtapaEstrutural('fundacao', 'fundação');

    // ================================================================ 3 ESTRUTURA (por pavimento)
    const pilarBit = nPav >= 3 ? '12.5' : '10.0';
    for (const f of F) emPav(f, () => {
      etapa('estrutura');
      const g = f.g, q = G.get(f);
      const hP = h - hC + 0.05;
      concreto(q.npil * b * C.pilarLado * hP, 'c25', q.npil + ' pilares ' + fmt(b * 100, 0) + '×' + fmt(C.pilarLado * 100, 0) + ' cm × ' + fmt(hP) + ' m' + (g.nos > 0 ? ' (nós do desenho)' : ''));
      const compBarra = f === F0 ? h + C.profFundacao + 0.70 : hPiso + 0.60;
      aco(pilarBit, q.npil * 4 * compBarra, 'pilares 4Ø' + pilarBit.replace('.', ',') + (f === F0 ? ' (da sapata à cinta)' : ' (com transpasse)'));
      aco('5.0', q.npil * ceil((f === F0 ? h + C.profFundacao : hPiso) / 0.15) * (2 * (b - 0.05 + C.pilarLado - 0.05) + 0.10), 'estribos dos pilares Ø5 c/15');
      forma(q.npil * 2 * (b + C.pilarLado) * hP);
      pecas(q.npil * (h + 1));
      const hv = lajeNoPav(f) && f !== Ftop ? 0.35 : hC; // vigas de piso dos pavimentos superiores mais altas
      concreto(g.Ltot * b * hv, 'c25', (f !== Ftop ? 'Vigas ' : 'Cinta de respaldo ') + fmt(b * 100, 0) + '×' + fmt(hv * 100, 0) + ' cm');
      aco('10.0', 2 * g.Ltot * 1.10, 'vigas/cinta 2Ø10 inferiores');
      aco('8.0', 2 * g.Ltot * 1.10, 'vigas/cinta 2Ø8 superiores');
      aco('5.0', ceil(g.Ltot / 0.15) * (2 * (b - 0.05 + hv - 0.05) + 0.10), 'estribos Ø5 c/15');
      forma(2 * hv * g.Ltot);
      pecas(g.Ltot);
      const mvc = q.mVerga + q.mContra;
      if (mvc > 0) {
        concreto(mvc * e * 0.10, 'c25', 'Vergas (' + q.nVergas + ') e contravergas (' + q.nJanelas + ') 10 cm, vão + 30 cm de cada lado');
        aco('8.0', mvc * 2, 'vergas/contravergas 2Ø8');
        forma(mvc * (2 * 0.10 + e));
        pecas(mvc);
      }
      if (lajeNoPav(f)) {
        const A = g.A, piso = f !== Ftop;
        add('vigota', 'Vigota treliçada ' + (piso ? 'TR 12645 (laje H16)' : 'TR 8644 (laje H12)'), 'm', A / 0.50 * 1.05, 'intereixo 50 cm, laje ' + fmt(A, 1) + ' m²');
        add(piso ? 'eps12' : 'eps', 'Enchimento de EPS ' + (piso ? 'H12' : 'H8') + ' × 40 × 100 cm', 'un', ceil(A * 2 * 1.03), '2 peças por m²');
        const capa = piso ? C.capaLaje + 0.02 : C.capaLaje;
        concreto(A * capa, 'c25', 'Capa e nervuras da laje (' + fmt(capa, 3) + ' m³/m²)');
        T.formaLaje += A * MULT;
        add('telaQ61', 'Tela soldada ' + (piso ? 'Q-92 (Ø 4,2 c/15)' : 'Q-61 (Ø 3,4 c/15)') + ' painel 2,0×3,0 m', 'un', ceil(A * 1.15 / 6), 'armadura de distribuição da capa');
        aco(piso ? '8.0' : '6.3', ceil(g.Lint / 0.20) * 1.20, 'armadura negativa sobre paredes internas c/20 × 1,20 m');
        forma(g.P * 0.16);
        add('escora', 'Escora de eucalipto Ø 8–10 cm × 3,0 m', 'un', ceil(A * 0.6), 'escoramento (pode ser alugado/reaproveitado)');
        add('tabuaForma', 'Tábua de pinus 2,5×30 cm (fôrma)', 'm', A / 1.2, 'guias do escoramento a cada 1,2 m');
      }
    });
    if (nPav > 1) {
      // escada de concreto por lance entre pavimentos
      etapa('estrutura');
      const n = nPav - 1, degraus = Math.round(hPiso / 0.175);
      const desenv = Math.sqrt(Math.pow(degraus * 0.28 / 2, 2) + Math.pow(hPiso / 2, 2)) * 2;
      const vol = desenv * 1.20 * 0.12 + degraus * 0.28 * 0.175 / 2 * 1.20 + 1.20 * 2.40 * 0.12;
      MULT = n;
      concreto(vol, 'c25', 'Escada em U: ' + degraus + ' degraus (e=17,5 cm, p=28 cm) × 1,20 m + patamar, ' + n + ' lance(s)');
      aco('8.0', desenv / 0.12 * 1.20 + (1.20 / 0.20) * desenv, 'escada: Ø8 c/12 longitudinal + distribuição');
      forma(desenv * 1.20 + degraus * 0.175 * 1.20 + 2 * desenv * 0.30 + 1.2 * 2.4);
      add('corrimao', 'Corrimão metálico Ø 1½" com suportes', 'm', desenv * 1.1, 'um lado da escada');
      MULT = 1;
    }
    fecharEtapaEstrutural('estrutura', 'estrutura');

    // ================================================================ 4 ALVENARIA (por pavimento)
    for (const f of F) emPav(f, () => {
      etapa('alvenaria');
      const g = f.g, q = G.get(f), j = C.juntaBloco;
      const porM2 = 1 / ((bl.c + j) * (bl.a + j));
      const memA = 'paredes ' + fmt(g.Ltot, 1) + ' m × ' + fmt(q.hAlv) + ' m' + (q.oitao ? ' + oitões ' + fmt(q.oitao, 1) + ' m²' : '') + ' − vãos ' + fmt(q.abTotal, 1) + ' m² − pilares ' + fmt(q.areaPilaresParede, 1) + ' m² = ' + fmt(q.alvLiq, 1) + ' m²';
      add('bloco', bl.nome, 'un', ceil(q.alvLiq * porM2 * (1 + C.perdaBloco)), memA + '; ' + fmt(porM2, 1) + ' blocos/m²');
      const vJunta = ((1 / (bl.a + j)) * j * bl.e + porM2 * bl.a * j * bl.e) * 1.15;
      argamassa128(q.alvLiq * vJunta, 'Assentamento (' + fmt(vJunta * 1000, 1) + ' L/m²)', 'assent');
      add('telaAmarr', 'Tela galvanizada 15×50 cm para ligação alvenaria/pilar', 'un', q.npil * 2 * ceil(q.hAlv / 0.40), '2 faces por pilar, a cada 2 fiadas');
      add('pinoAco', 'Pino de aço com arruela para fixar tela', 'un', q.npil * 2 * ceil(q.hAlv / 0.40) * 2, '2 por tela');
    });

    // ================================================================ 5 COBERTURA (sobre o último pavimento e o térreo descoberto)
    etapa('cobertura');
    const bei = num(resp.beiral, 0.6);
    const gT = Ftop.g;
    const descoberto = F.length > 1 ? Math.max(0, F0.g.A - gT.A) : 0;
    const proj = gT.A + gT.P * bei + 4 * bei * bei + descoberto;
    const fatorI = Math.sqrt(1 + incl * incl);
    const aInc = proj * fatorI;
    const cumeeira = gT.Lc + 2 * bei;
    const hExtTop = G.get(Ftop).hExt;
    {
      const memT = 'projeção ' + fmt(proj, 1) + ' m² (beiral ' + fmt(bei) + ' m' + (descoberto ? ', inclui ' + fmt(descoberto, 1) + ' m² do térreo sem pavimento acima' : '') + '), inclinação ' + fmt(incl * 100, 0) + '% → ' + fmt(aInc, 1) + ' m² de telhado';
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
        add('rufo', 'Rufo de chapa pré-pintada (corte 30 cm)', 'm', 2 * gT.Wc + 2 * bei * 2, 'arremates laterais');
      }
      add('tabeira', 'Tábua de madeira 2,5×20 cm (testeira/tabeira do beiral)', 'm', 2 * (gT.Lc + 2 * bei) + 4 * (gT.Wc / 2 + bei) * fatorI, 'perímetro do telhado');
      if (resp.telha !== 'metalica') add('imunizante', 'Imunizante/cupinicida para madeira', 'L', aInc * 0.15, '0,15 L/m² de telhado');
      if (resp.calhas) {
        const mc = 2 * (gT.Lc + 2 * bei);
        const ncond = Math.max(2, ceil(mc / 8));
        const altura = hExtTop + (nPav - 1) * hPiso;
        add('calha', 'Calha de chapa galvanizada (corte 33 cm)', 'm', mc * 1.05, 'beirais das 2 águas');
        add('suporteCalha', 'Suporte de calha', 'un', ceil(mc / 0.80), '1 a cada 80 cm');
        add('bocal', 'Bocal/saída de calha 100 mm', 'un', ncond, '1 por condutor');
        add('tubo100p', 'Tubo PVC esgoto/pluvial 100 mm', 'm', ncond * (altura + 0.5) + F0.g.P / 2, ncond + ' condutores de ' + fmt(altura, 1) + ' m + rede enterrada', EMB.barra6);
        add('joelho100p', 'Joelho 90° PVC 100 mm (pluvial)', 'un', ncond * 3, '3 por condutor');
        add('abracadeira100', 'Abraçadeira para tubo 100 mm', 'un', ncond * ceil(altura / 1.5 + 1), 'fixação a cada 1,5 m');
        add('caixaAreia', 'Caixa de areia/passagem pluvial 40×40 cm com grelha', 'un', ncond, '1 por condutor');
        add('selanteCalha', 'Selante de poliuretano para calhas (sachê 400 g)', 'un', ceil(mc / 6), 'emendas');
      }
    }

    // ================================================================ 6–15 SISTEMAS E ACABAMENTOS (por pavimento)
    const E = { pontosAgua: 0, molhados: 0, juntas: 0, regGaveta: 0, luz: 0, tugG: 0, tug20: 0, tv: 0, interrS: 0, interrP: 0, tue: { chuveiro: 0, maquina: 0, micro: 0, ar: 0 }, circ: { ilum: 0, tugG: 0, tug20: 0 }, alimentadores: 0, areaPiso: 0, areaPerm: 0, aJanPerm: 0, pontos: 0, alvenaria: 0, run: 0 };
    const run0 = 0.5 * (F0.g.Lc + F0.g.Wc) + 2.5;
    for (const f of F) emPav(f, () => {
      const g = f.g, q = G.get(f), amb = g.amb;
      const sup = f.i > 0; // pavimento superior: prumadas
      const nb = cont(g, 'banheiro'), nl = cont(g, 'lavabo');
      const nc = contF(g, (t) => t.cozinha), ns = contF(g, (t) => t.servico), nq = cont(g, 'quarto');
      const nsala = cont(g, 'sala') + cont(g, 'escritorio') + cont(g, 'conjugado');
      const molhados = nb + nl + nc + ns;
      const unidPav = unidades > 1 ? Math.max(1, nc) : 0;
      E.alvenaria += q.alvLiq * f.rep; E.areaPiso += g.somaArea * f.rep; E.aJanPerm += q.aJanPerm * f.rep;
      E.areaPerm += amb.filter((a) => TIPOS_AMBIENTE[a.tipo].permanencia).reduce((s, a) => s + a.area, 0) * f.rep;

      // ---- 6 HIDRÁULICA (pontos e ramais do pavimento)
      etapa('hidraulica');
      const pontosAgua = nb * 4 + nl * 2 + nc * 2 + ns * 2 + (f === F0 ? 2 : 0);
      E.pontosAgua += pontosAgua * f.rep; E.molhados += molhados * f.rep;
      if (pontosAgua) {
        const m25 = pontosAgua * 3.0 + molhados * 4.0;
        const m32 = molhados * 2.5 + (sup ? molhados * hPiso : 0);
        add('tubo25', 'Tubo PVC soldável 25 mm', 'm', m25 * 1.10, pontosAgua + ' pontos × 3 m + ramais', EMB.barra6);
        if (m32) add('tubo32', 'Tubo PVC soldável 32 mm', 'm', m32 * 1.10, sup ? 'distribuição e prumadas' : 'distribuição', EMB.barra6);
        add('joelho25', 'Joelho 90° PVC soldável 25 mm', 'un', pontosAgua * 2 + molhados, '2 por ponto + 1 por ambiente');
        add('joelhoAzul', 'Joelho 90° soldável com bucha de latão 25 mm × 1/2"', 'un', pontosAgua, '1 por ponto de utilização');
        add('te25', 'Tê 90° PVC soldável 25 mm', 'un', pontosAgua, 'derivações');
        add('luva25', 'Luva PVC soldável 25 mm', 'un', ceil(m25 * 1.1 / 6), '1 por barra');
        if (m32) { add('te32', 'Tê 90° PVC soldável 32 mm', 'un', molhados, 'derivação para cada ambiente'); add('luva32', 'Luva PVC soldável 32 mm', 'un', ceil(m32 * 1.1 / 6), '1 por barra'); add('bucha3225', 'Bucha de redução soldável 32×25 mm', 'un', molhados, ''); }
        add('regGaveta', 'Registro de gaveta bruto 3/4"', 'un', molhados, '1 por ambiente molhado');
        add('regPressao', 'Registro de pressão bruto 3/4" (chuveiro)', 'un', nb, '1 por banheiro');
        add('adapt25', 'Adaptador soldável curto com bolsa e rosca 25 mm × 3/4"', 'un', (molhados + nb) * 2, '2 por registro');
        E.juntas += (pontosAgua * 4 + molhados * 4) * f.rep; E.regGaveta += molhados * f.rep;
      }

      // ---- 7 ESGOTO
      etapa('esgoto');
      const vasos = nb + nl;
      const m100 = vasos * 2.5 + molhados * 3 + (sup ? vasos * hPiso : 0);
      const m50 = nc * 3 + ns * 4 + nb * 2 + (sup ? (nc + ns) * hPiso : 0) + nb * (f === Ftop ? h + 1.5 : hPiso);
      const m40 = (nb + nl) * 1.5 + nb * 1.5 + ns * 1.5;
      if (m100) add('tubo100', 'Tubo PVC esgoto 100 mm', 'm', m100 * 1.10, 'ramais dos vasos e subcoletores' + (sup ? ' + tubos de queda' : ''), EMB.barra6);
      if (m50) add('tubo50', 'Tubo PVC esgoto 50 mm', 'm', m50 * 1.10, 'pia, tanque, máquina, caixas sifonadas e ventilação', EMB.barra6);
      if (m40) add('tubo40e', 'Tubo PVC esgoto 40 mm', 'm', m40 * 1.10, 'lavatórios, ralos de box e tanque', EMB.barra6);
      add('joelho100', 'Joelho 90° PVC esgoto 100 mm', 'un', vasos + (molhados ? 1 : 0), '1 por vaso + mudanças de direção');
      add('joelho45_100', 'Joelho 45° PVC esgoto 100 mm', 'un', vasos * 2, '');
      add('juncao100', 'Junção simples PVC esgoto 100×100 mm', 'un', vasos, '');
      add('juncao10050', 'Junção simples PVC esgoto 100×50 mm', 'un', nb + nc + ns, '');
      add('joelho50', 'Joelho 90° PVC esgoto 50 mm', 'un', (nb + nc + ns) * 3, '');
      add('joelho40', 'Joelho 90° PVC esgoto 40 mm', 'un', (nb + nl) * 2 + nb + ns, '');
      add('caixaSif', 'Caixa sifonada PVC 150×150×50 mm com grelha', 'un', nb + ns, '1 por banheiro e área de serviço');
      const ralos = cont(g, 'varanda') + cont(g, 'garagem');
      add('ralo100', 'Ralo seco PVC 100 mm com grelha', 'un', ralos, 'varanda/garagem');
      if (f === F0) add('caixaGordura', 'Caixa de gordura PVC/polietileno 19 L', 'un', Math.max(1, ceil(NC / 4)), 'cozinhas (1 a cada 4)');
      add('terminalVent', 'Terminal de ventilação PVC 50 mm', 'un', f === Ftop ? Math.max(1, nb) : 0, '1 por coluna de ventilação');
      add('anelVed', 'Anel de vedação para saída de vaso sanitário', 'un', vasos, '');

      // ---- 8 ELÉTRICA (pontos do pavimento)
      etapa('eletrica');
      const run = run0 + (sup ? 1.0 : 0);
      let luz = 0, interrS = 0, interrP = 0, tugG = 0, tug20 = 0, tv = 0;
      const tue = { chuveiro: nb, maquina: ns, micro: nc, ar: resp.arCondicionado ? nq + nsala : 0 };
      for (const a of amb) {
        const t = a.tipo;
        luz += 1 + (a.area > 20 ? 1 : 0);
        if (t === 'circulacao' && a.perimetro > 8) interrP += 2; else interrS += 1;
        if (t === 'sala' || t === 'quarto' || t === 'escritorio') { tugG += Math.max(1, ceil(a.perimetro / 5)); tv += 1; }
        else if (t === 'cozinha' || t === 'cozinha_servico') tug20 += ceil(a.perimetro / 3.5) + 1;
        else if (t === 'conjugado') { tugG += Math.max(1, ceil(a.perimetro / 5)); tug20 += 3; tv += 1; }
        else if (t === 'servico') tug20 += Math.max(1, ceil(a.perimetro / 3.5));
        else tugG += 1;
      }
      const luzExt = f === F0 ? Math.max(2, ceil(F0.g.P / 12)) : 0;
      if (luzExt) interrS += 1;
      const pontosLuz = luz + luzExt;
      const tueTot = tue.chuveiro + tue.maquina + tue.micro + tue.ar;
      const memP = pontosLuz + ' pontos de luz, ' + (tugG + tug20) + ' tomadas de uso geral, ' + tueTot + ' pontos de uso específico (NBR 5410)';
      const f15 = luz * 0.6 * run * 2 + luzExt * run * 0.8 * 2;
      const r15 = interrS * 3.5 + interrP * 3.5 * 1.5;
      const t15 = pontosLuz * 0.6 * run;
      const f25 = (tugG + tug20) * 0.6 * run;
      const ar25 = (tue.ar + tue.maquina + tue.micro) * run;
      const f6 = tue.chuveiro * run;
      add('fio15f', 'Cabo flexível 1,5 mm² 750 V — fase', 'm', f15 / 2 * 1.10, memP, EMB.rolo100);
      add('fio15n', 'Cabo flexível 1,5 mm² 750 V — neutro (azul)', 'm', f15 / 2 * 1.10, 'circuitos de iluminação', EMB.rolo100);
      add('fio15r', 'Cabo flexível 1,5 mm² 750 V — retorno', 'm', r15 * 1.10, 'interruptores', EMB.rolo100);
      add('fio15t', 'Cabo flexível 1,5 mm² 750 V — terra (verde)', 'm', t15 * 1.10, 'aterramento das luminárias', EMB.rolo100);
      add('fio25f', 'Cabo flexível 2,5 mm² 750 V — fase', 'm', (f25 + tue.ar * run * 2 + (tue.maquina + tue.micro) * run) * 1.10, 'tomadas e TUEs', EMB.rolo100);
      add('fio25n', 'Cabo flexível 2,5 mm² 750 V — neutro (azul)', 'm', (f25 + (tue.maquina + tue.micro) * run) * 1.10, 'tomadas', EMB.rolo100);
      add('fio25t', 'Cabo flexível 2,5 mm² 750 V — terra (verde)', 'm', (f25 + ar25) * 1.10, 'tomadas e TUEs', EMB.rolo100);
      if (f6) { add('fio6f', 'Cabo flexível 6 mm² 750 V — fase', 'm', f6 * 2 * 1.10, nb + ' chuveiro(s) 220 V', EMB.rolo100); add('fio6t', 'Cabo flexível 6 mm² 750 V — terra (verde)', 'm', f6 * 1.10, 'chuveiros', EMB.rolo100); }
      const pontos = pontosLuz + tugG + tug20 + tueTot + tv + interrS + interrP;
      const eletr = pontos * (0.6 * run + 1.5);
      add('eletroduto25', 'Eletroduto corrugado flexível 3/4" (25 mm) amarelo — parede', 'm', eletr * 0.6 * 1.10, pontos + ' pontos', EMB.rolo50);
      add('eletroduto25l', 'Eletroduto corrugado reforçado 3/4" (25 mm) laranja — laje/piso', 'm', eletr * 0.4 * 1.10, '', EMB.rolo50);
      const cx42 = tugG + tug20 + tueTot + tv + interrS + interrP;
      add('caixa42', 'Caixa de luz 4×2" PVC', 'un', cx42, 'tomadas, interruptores, TUEs e TV');
      add(lajeNoPav(f) ? 'caixaOct' : 'caixa44', lajeNoPav(f) ? 'Caixa octogonal 4×4" de laje' : 'Caixa 4×4" PVC (pontos de luz)', 'un', luz, 'pontos de luz internos');
      add('caixa44p', 'Caixa 4×4" PVC (passagem)', 'un', ceil(amb.length / 2) + 1, '');
      add('tomada10', 'Tomada 2P+T 10 A (módulo)', 'un', tugG, 'uso geral');
      add('tomada20', 'Tomada 2P+T 20 A (módulo)', 'un', tug20 + tue.maquina + tue.micro + tue.ar, 'cozinha, área de serviço e TUEs');
      add('interrS', 'Interruptor simples 10 A (módulo)', 'un', interrS, '');
      add('interrP', 'Interruptor paralelo (three-way) 10 A (módulo)', 'un', interrP, 'circulações');
      add('tomadaTv', 'Tomada de TV/dados (módulo coaxial ou RJ45)', 'un', tv, 'salas e quartos');
      add('caboCoax', 'Cabo coaxial RG-6 / cabo UTP', 'm', tv * run * 1.10, '');
      add('suporte42', 'Suporte 4×2" para módulos', 'un', cx42 - tue.chuveiro, '');
      add('placa42', 'Placa/espelho 4×2"', 'un', cx42, '1 por caixa (cega no chuveiro)');
      add('conectorChuv', 'Conector/borne para ligação do chuveiro', 'un', tue.chuveiro, '');
      add('plafon', 'Luminária plafon LED 18 W de sobrepor', 'un', luz, 'pontos internos');
      add('arandela', 'Arandela externa LED com lâmpada', 'un', luzExt, 'perímetro externo a cada 12 m');
      add('conectorAlav', 'Conector de emenda tipo alavanca 3 vias', 'un', ceil(pontos * 2), '2 por ponto');
      E.luz += luz * f.rep; E.tugG += tugG * f.rep; E.tug20 += tug20 * f.rep; E.tv += tv * f.rep; E.pontos += pontos * f.rep;
      for (const k in tue) E.tue[k] += tue[k] * f.rep;
      // circuitos: por unidade quando há várias
      const un = Math.max(1, unidPav);
      E.circ.ilum += (unidades > 1 ? Math.max(un, ceil(luz / 8)) : luz / 10) * f.rep;
      E.circ.tugG += (unidades > 1 ? Math.max(un, ceil(tugG / 8)) : tugG / 8) * f.rep;
      E.circ.tug20 += (unidades > 1 ? (tug20 ? Math.max(Math.min(un, nc), ceil(tug20 / 5)) : 0) : tug20 / 5) * f.rep;
      if (unidades > 1) E.alimentadores += unidPav * (num(resp.distRede, 10) / 2 + 8 + f.i * hPiso) * f.rep;

      // ---- 9 IMPERMEABILIZAÇÃO
      etapa('impermeabilizacao');
      {
        let area = 0, cantos = 0; const mem = [];
        for (const a of amb) {
          if (a.tipo === 'banheiro') { const v = a.area + a.perimetro * 0.30 + 3.8; area += v; cantos += a.perimetro; mem.push(a.nome + ' ' + fmt(v, 1) + ' m²'); }
          else if (a.tipo === 'servico' || a.tipo === 'lavabo' || a.tipo === 'cozinha_servico') { const v = a.area + a.perimetro * 0.30; area += v; cantos += a.perimetro; mem.push(a.nome + ' ' + fmt(v, 1) + ' m²'); }
        }
        if (area > 0) {
          add('polimerica', 'Argamassa polimérica impermeabilizante bicomponente', 'kg', area * 3.0 * 1.05, mem.join('; ') + '; 3 kg/m² em 3 demãos', EMB.polimerica);
          add('telaPoli', 'Tela de poliéster para reforço de cantos e ralos', 'm', cantos * 1.10 + (nb + ns), 'cantos parede/piso e ralos');
        }
        if (f === F0) add('polimerica', 'Argamassa polimérica impermeabilizante bicomponente', 'kg', g.Ltot * 0.40 * 2 * 3.0, 'duas primeiras fiadas, as duas faces', EMB.polimerica);
      }

      // ---- 10 REVESTIMENTOS DE PAREDE E TETO
      etapa('revestimentos');
      const tetos = { reboco: 0, gesso: 0, drywall: 0, pvc: 0, drywallRU: 0 };
      const perimTeto = { drywall: 0, pvc: 0 };
      for (const a of amb) {
        const t = tetoDe(a, f); tetos[t] = (tetos[t] || 0) + a.area;
        if (t === 'drywall' && TIPOS_AMBIENTE[a.tipo].molhado && a.tipo !== 'cozinha') { tetos.drywallRU += a.area; }
        if (t === 'drywall' || t === 'pvc') perimTeto[t] += a.perimetro;
      }
      let azulejo = 0; const memAz = [];
      for (const a of amb) { const v = azulejoDe(a); if (v > 0) { azulejo += v; memAz.push(a.nome + ' ' + fmt(v, 1) + ' m²'); } }
      azulejo = Math.min(azulejo, q.facesInt);
      const chap = q.facesInt + q.facesExt + tetos.reboco;
      argamassa13(chap * C.chapisco, 'Chapisco em ' + fmt(chap, 1) + ' m²');
      argamassa128(q.facesInt * C.rebocoInt, 'Emboço/reboco interno ' + fmt(q.facesInt, 1) + ' m² × ' + fmt(C.rebocoInt * 100, 1) + ' cm', 'rev');
      argamassa128(q.facesExt * C.rebocoExt, 'Reboco externo ' + fmt(q.facesExt, 1) + ' m² × ' + fmt(C.rebocoExt * 100, 1) + ' cm', 'rev');
      if (tetos.reboco) argamassa128(tetos.reboco * C.rebocoTeto, 'Reboco de teto ' + fmt(tetos.reboco, 1) + ' m²', 'rev');
      if (tetos.gesso) add('gessoLiso', 'Gesso em pó para revestimento (gesso liso)', 'kg', tetos.gesso * 6, 'teto ' + fmt(tetos.gesso, 1) + ' m², 6 kg/m²', EMB.gesso40);
      add('telaReboco', 'Tela de aço galvanizada para reboco (ponte entre estrutura e alvenaria)', 'm', (q.npil * q.hAlv * 2 + g.Ltot * 2) * 0.5, 'faixas de 25 cm sobre pilares e cintas (face externa)');
      if (azulejo > 0) {
        add('azulejo', 'Revestimento cerâmico de parede 32×57 cm', 'm²', azulejo * (1 + C.perdaPiso), memAz.join('; '));
        add('colanteAC1', 'Argamassa colante AC-I (interna)', 'kg', azulejo * C.acParede, C.acParede + ' kg/m²', EMB.colante);
        add('rejunteParede', 'Rejunte cimentício flexível', 'kg', azulejo * rejunteKg(320, 570, 8, 2) * 1.15, 'parede, junta 2 mm', EMB.rejunte);
        add('cantoneira', 'Cantoneira/perfil de acabamento para cantos de cerâmica', 'm', amb.filter((a) => paredeDe(a) !== 'nenhum').length * 2 * Math.min(h, 2.5), 'quinas vivas');
      }

      // ---- 11 PISOS (por cômodo)
      etapa('pisos');
      const areaTot = g.somaArea;
      if (f === F0 && fundTipo !== 'radier' && areaTot > 0) {
        add('lona', 'Lona plástica preta 150 µm', 'm²', areaTot * 1.15, 'sob o lastro do piso');
        add('brita1', 'Brita 1', 'm³', areaTot * C.lastroBrita * 1.05, 'lastro de brita ' + fmt(C.lastroBrita * 100, 0) + ' cm');
        concreto(areaTot * C.lastroConcreto, 'magro', 'Lastro de concreto do piso ' + fmt(C.lastroConcreto * 100, 0) + ' cm em ' + fmt(areaTot, 1) + ' m²');
      }
      if (areaTot > 0) argamassa14(areaTot * C.contrapiso, 'Contrapiso ' + fmt(C.contrapiso * 100, 0) + ' cm em ' + fmt(areaTot, 1) + ' m²');
      const porPiso = {};
      for (const a of amb) { const k = pisoDe(a); (porPiso[k] = porPiso[k] || { area: 0, rod: 0, nomes: [] }); porPiso[k].area += a.area; porPiso[k].nomes.push(a.nome); const p = paredeDe(a); if ((p === 'nenhum' || p === 'faixa') && !TIPOS_AMBIENTE[a.tipo].externo) porPiso[k].rod += Math.max(0, a.perimetro - 0.85); }
      for (const k in porPiso) {
        const P = PISOS[k], o = porPiso[k], mem = fmt(o.area, 1) + ' m² (' + [...new Set(o.nomes)].slice(0, 6).join(', ') + (o.nomes.length > 6 ? '…' : '') + ')';
        if (k === 'cimentado') { add('endurecedor', 'Endurecedor/selador para piso cimentado', 'L', o.area * 0.25, mem); continue; }
        add('piso_' + k, P.nome, 'm²', o.area * (1 + P.perda), mem + ' + ' + fmt(P.perda * 100, 0) + '%');
        if (P.colante) {
          add('colante' + P.colante, 'Argamassa colante ' + P.colante, 'kg', o.area * P.kg, P.kg + ' kg/m²', EMB.colante);
          add('rejunte', 'Rejunte cimentício flexível', 'kg', o.area * rejunteKg(P.A, P.B, P.esp, P.junta) * 1.15, 'junta ' + P.junta + ' mm', EMB.rejunte);
          if (P.nivelador) add('nivelador', 'Kit nivelador de piso (clipe + cunha)', 'un', ceil(o.area * (k === 'porcelanato_gg' ? 5 : 8)), 'por m²');
        }
        if (P.manta) add('manta_lam', 'Manta de polietileno expandido 2 mm (sob piso laminado)', 'm²', o.area * 1.05, mem);
        if (P.cola) add('colaVinil', 'Cola acrílica para piso vinílico', 'kg', o.area * P.cola, P.cola + ' kg/m²', { nome: 'balde 4 kg', qtd: 4 });
        if (o.rod > 0 && P.rodape) {
          if (P.rodape === 'mdf') { add('rodapeMdf', 'Rodapé de poliestireno/MDF 7 cm', 'm', o.rod * 1.10, 'perímetro de ' + [...new Set(o.nomes)].length + ' cômodo(s) com ' + P.nome.toLowerCase()); add('colaRodape', 'Cola/adesivo para rodapé (tubo)', 'un', ceil(o.rod / 15), ''); }
          else { add('rodape_' + P.rodape, P.rodape === 'porcelanato' ? 'Rodapé de porcelanato h = 7 cm' : 'Rodapé cerâmico h = 7 cm', 'm', o.rod * 1.10, 'perímetro dos cômodos sem revestimento de parede, menos portas'); add('colante' + (P.colante || 'AC-II'), 'Argamassa colante ' + (P.colante || 'AC-II'), 'kg', o.rod * 0.40, 'rodapé', EMB.colante); }
        }
      }
      if (q.nPortas) add('soleira', 'Soleira de granito 2 cm, largura ' + fmt((e + 0.05) * 100, 0) + ' cm', 'm', q.larguraPortas + q.nPortas * 0.04, q.nPortas + ' portas');
      if (q.nJanelas) {
        let mp = 0; for (const o of g.ab) if (TIPOS_ABERTURA[o.tipo].janela) mp += (o.largura + 0.06) * o.qtd;
        add('peitoril', 'Peitoril de granito 2 cm com pingadeira, largura ' + fmt((e + 0.08) * 100, 0) + ' cm', 'm', mp, q.nJanelas + ' janelas');
      }
      if (q.nPortas || q.nJanelas) add('colanteAC-III', 'Argamassa colante AC-III', 'kg', (q.larguraPortas + q.nJanelas * 1.2) * 1.5, 'assentamento de soleiras e peitoris', EMB.colante);

      // ---- 12 FORRO
      etapa('forro');
      if (tetos.drywall > 0) {
        const seco = tetos.drywall - tetos.drywallRU;
        if (seco > 0) add('chapaST', 'Chapa de gesso acartonado ST 12,5 mm 1,20×1,80 m', 'un', ceil(seco * 1.10 / 2.16), 'teto ' + fmt(seco, 1) + ' m²');
        if (tetos.drywallRU > 0) add('chapaRU', 'Chapa de gesso acartonado RU (verde) 12,5 mm 1,20×1,80 m', 'un', ceil(tetos.drywallRU * 1.10 / 2.16), 'áreas úmidas ' + fmt(tetos.drywallRU, 1) + ' m²');
        const A = tetos.drywall;
        add('perfilF530', 'Perfil F-530 (barra 3 m)', 'm', A * 2.0, 'espaçamento 60 cm + travessas', EMB.barra3);
        add('cantoneiraTabica', 'Cantoneira/tabica perimetral (barra 3 m)', 'm', perimTeto.drywall * 1.05, 'perímetro dos ambientes', EMB.barra3);
        add('regulador', 'Regulador para perfil F-530', 'un', ceil(A * 1.3), '');
        add('pendural', 'Arame galvanizado nº 10 (pendural)', 'kg', A * 1.3 * 0.6 * 0.06, '0,6 m por regulador');
        add('fixacaoPendural', lajeNoPav(f) ? 'Bucha + parafuso/pino para fixar pendural' : 'Parafuso para madeira (fixar pendural no madeiramento)', 'un', ceil(A * 1.3), '');
        add('parafusoGN25', 'Parafuso drywall GN25', 'un', ceil(A * 25), '25 por m²');
        add('fitaJunta', 'Fita de papel microperfurada para juntas (rolo 150 m)', 'm', A * 1.5, '', { nome: 'rolo 150 m', qtd: 150 });
        add('massaJunta', 'Massa para juntas de drywall', 'kg', A * 0.5, '', { nome: 'balde 15 kg', qtd: 15 });
      }
      if (tetos.pvc > 0) {
        const A = tetos.pvc;
        add('reguaPvc', 'Forro de PVC em réguas 200 mm', 'm²', A * 1.07, 'teto ' + fmt(A, 1) + ' m²');
        add('perfilUPvc', 'Perfil U/arremate de PVC para forro (barra 6 m)', 'm', perimTeto.pvc * 1.10, 'perímetro', EMB.barra6);
        add('metalon', 'Metalon 20×20 mm (estrutura do forro)', 'm', A * 1.8, 'espaçamento 55 cm', EMB.barra6);
        add('pendural', 'Arame galvanizado nº 10 (pendural)', 'kg', A * 0.8 * 0.06, '');
        add('parafusoPvc', 'Parafuso/grampo de fixação do forro', 'un', ceil(A * 15), '');
      }

      // ---- 13 ESQUADRIAS
      etapa('esquadrias');
      {
        const grupos = {};
        for (const o of g.ab) { const k = o.tipo + '|' + o.largura + '|' + o.altura; grupos[k] = grupos[k] || Object.assign({}, o, { qtd: 0 }); grupos[k].qtd += o.qtd; }
        let portasMadeira = 0, portasInt = 0, nEsq = 0;
        const marco = 'p/ parede de ' + fmt((e + 0.05) * 100, 0) + ' cm';
        for (const k in grupos) {
          const o = grupos[k], d = dim(o.largura, o.altura), qd = o.qtd;
          nEsq += qd;
          if (o.tipo === 'porta_int' || (o.tipo === 'porta_ext' && resp.portaExterna === 'madeira')) {
            const ext = o.tipo === 'porta_ext';
            add('porta_' + k, ext ? 'Porta de madeira maciça/almofadada ' + d + ' (folha)' : 'Porta de madeira semioca lisa ' + d + ' (folha)', 'un', qd, '');
            add('batente_' + o.largura, 'Batente/marco de madeira ' + marco + ', vão ' + fmt(o.largura, 2) + ' m (jogo)', 'un', qd, '');
            add('guarnicao', 'Guarnição/alizar de madeira (jogo de uma face)', 'un', qd * 2, '2 faces por porta');
            add('dobradica', 'Dobradiça 3 1/2" × 3" (cartela com 3)', 'un', qd, '');
            portasMadeira += qd; if (!ext) portasInt += qd;
            if (ext) add('fechExt', 'Fechadura externa com cilindro', 'un', qd, '');
          } else if (o.tipo === 'porta_ext') add('portaAl_' + k, 'Porta de alumínio de abrir ' + d + ' com fechadura', 'un', qd, '');
          else if (o.tipo === 'porta_correr') add('portaCorrer_' + k, 'Porta de correr de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro ' + d + ' (completa)', 'un', qd, '');
          else if (o.tipo === 'portao') add('portao_' + k, 'Portão de garagem em aço (basculante ou de correr) ' + d + ' com ferragens', 'un', qd, '');
          else if (o.tipo === 'basculante') add('basc_' + k, 'Janela basculante de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro mini-boreal ' + d, 'un', qd, '');
          else add('janela_' + k, 'Janela de correr 2 folhas de ' + (resp.janelas === 'pvc' ? 'PVC' : 'alumínio') + ' com vidro ' + d, 'un', qd, '');
        }
        const fechBanh = Math.min(portasInt, nb + nl);
        add('fechBanh', 'Fechadura de banheiro (tranqueta)', 'un', fechBanh, 'portas de banheiro/lavabo');
        add('fechInt', 'Fechadura interna (tipo tambor)', 'un', portasInt - fechBanh, '');
        if (portasMadeira) { add('espumaPU', 'Espuma expansiva de poliuretano 500 ml', 'un', ceil(portasMadeira / 2), 'fixação dos batentes'); add('parafusoBatente', 'Parafuso 4,8×65 mm com bucha nº 8', 'un', portasMadeira * 8, '8 por batente'); }
        if (nEsq - portasMadeira > 0) add('silicone', 'Selante de silicone neutro 280 g', 'un', ceil((nEsq - portasMadeira) / 2), 'vedação das esquadrias');
      }

      // ---- 14 LOUÇAS E METAIS
      etapa('loucas');
      if (vasos) {
        add('vaso', 'Bacia sanitária com caixa acoplada', 'un', vasos, nb + ' banheiro(s) + ' + nl + ' lavabo(s)');
        add('assento', 'Assento sanitário', 'un', vasos, '');
        add('kitFixVaso', 'Kit de fixação para bacia sanitária', 'un', vasos, '');
        add('lavatorio', 'Lavatório de louça com coluna', 'un', vasos, '');
        add('torneiraLav', 'Torneira de mesa para lavatório', 'un', vasos, '');
        add('valvula1', 'Válvula de escoamento 1" para lavatório', 'un', vasos, '');
        add('espelho', 'Espelho 60×90 cm com fixação', 'un', vasos, '');
        add('papeleira', 'Kit de acessórios (papeleira, toalheiro, saboneteira, cabide)', 'un', vasos, '');
      }
      add('sifao', 'Sifão sanfonado/copo universal', 'un', vasos + nc + ns, 'lavatórios, pias e tanques');
      add('flexivel', 'Engate flexível 40 cm', 'un', vasos * 2 + nc, 'vaso, lavatório e pia');
      if (nb) {
        add('chuveiro', 'Chuveiro elétrico 220 V', 'un', nb, '');
        add('ducha', 'Ducha higiênica com registro', 'un', nb, '');
        add('box', 'Box de vidro temperado 8 mm (com ferragens)', 'm²', nb * 2.3, '1,20 × 1,90 m por banheiro');
        add('acabRegPressao', 'Acabamento para registro de pressão', 'un', nb, '');
      }
      add('acabRegGaveta', 'Acabamento para registro de gaveta', 'un', molhados, '');
      if (nc) { add('bancada', 'Bancada de granito 1,80×0,60 m com cuba de inox nº 2', 'un', nc, ''); add('torneiraCoz', 'Torneira de cozinha (mesa ou parede)', 'un', nc, ''); add('valvulaAmer', 'Válvula americana 3 1/2" para cuba', 'un', nc, ''); }
      if (ns) { add('tanque', 'Tanque de louça/mármore sintético com coluna', 'un', ns, ''); add('torneiraTanque', 'Torneira para tanque', 'un', ns, ''); add('torneiraMaq', 'Torneira para máquina de lavar com bico', 'un', ns, ''); add('valvulaTanque', 'Válvula de escoamento para tanque', 'un', ns, ''); }

      // ---- 15 PINTURA
      etapa('pintura');
      {
        const pP = 1 + C.perdaPintura;
        const pinturaInt = Math.max(0, q.facesInt - azulejo);
        const umidas = amb.filter((a) => (a.tipo === 'banheiro' || a.tipo === 'lavabo') && paredeDe(a) === '1.50').reduce((s, a) => s + a.perimetro * (h - 1.5), 0);
        const seca = Math.max(0, pinturaInt - umidas);
        add('seladorInt', 'Fundo selador acrílico', 'L', pinturaInt * C.seladorInt * pP, 'paredes internas ' + fmt(pinturaInt, 1) + ' m²', EMB.lata18);
        add('massaCorrida', 'Massa corrida PVA', 'kg', seca * C.massaCorrida * pP, 'paredes secas ' + fmt(seca, 1) + ' m²', EMB.massa);
        add('massaAcrilica', 'Massa acrílica', 'kg', umidas * C.massaAcrilica * pP, 'paredes de áreas úmidas acima da cerâmica', EMB.massa);
        add('tintaInt', 'Tinta acrílica fosca/acetinada interna', 'L', pinturaInt * C.tintaInt * pP, '2 demãos', EMB.lata18);
        const tetoPint = tetos.reboco + tetos.gesso + tetos.drywall;
        add('massaCorrida', 'Massa corrida PVA', 'kg', tetos.reboco * 0.5 * pP, 'teto rebocado ' + fmt(tetos.reboco, 1) + ' m²', EMB.massa);
        add('seladorInt', 'Fundo selador acrílico', 'L', tetoPint * C.seladorInt * pP, 'teto', EMB.lata18);
        add('tintaTeto', 'Tinta acrílica para teto (branco fosco)', 'L', tetoPint * C.tintaTeto * pP, 'teto ' + fmt(tetoPint, 1) + ' m²', EMB.lata18);
        add('seladorExt', 'Fundo selador acrílico (externo)', 'L', q.facesExt * C.seladorExt * pP, 'fachadas ' + fmt(q.facesExt, 1) + ' m²', EMB.lata18);
        if (resp.pinturaExterna === 'textura') add('textura', 'Textura acrílica', 'kg', q.facesExt * C.textura * pP, C.textura + ' kg/m²', EMB.textura);
        else { add('massaAcrilica', 'Massa acrílica', 'kg', q.facesExt * C.massaAcrilica * pP, 'fachadas', EMB.massa); add('tintaExt', 'Tinta acrílica premium externa', 'L', q.facesExt * C.tintaExt * pP, 'fachadas', EMB.lata18); }
        let aPortas = 0;
        for (const o of g.ab) if (o.tipo === 'porta_int' || (o.tipo === 'porta_ext' && resp.portaExterna === 'madeira')) aPortas += o.largura * o.altura * 2 * 1.25 * o.qtd;
        if (aPortas > 0) {
          add('fundoNiv', 'Fundo nivelador para madeira', 'L', aPortas * 0.08 * pP, 'portas, batentes e guarnições ' + fmt(aPortas, 1) + ' m²', EMB.galao);
          add('esmalte', 'Esmalte sintético acetinado', 'L', aPortas * 0.12 * pP, '2 demãos', EMB.galao);
          add('aguarras', 'Aguarrás (diluente)', 'L', aPortas * 0.04, '', { nome: 'lata 900 ml', qtd: 0.9 });
          add('lixa220', 'Lixa para madeira nº 220', 'folha', ceil(aPortas / 4), '');
        }
        add('lixa150', 'Lixa para massa nº 150', 'folha', ceil((seca + tetos.reboco) / 8), '');
        add('fitaCrepe', 'Fita crepe 48 mm × 50 m', 'un', ceil((pinturaInt + q.facesExt) / 60), '');
        add('lonaPintura', 'Lona plástica para proteção de pisos', 'm²', g.somaArea * 0.5, '');
      }
    });

    // ================================================================ PARTES GLOBAIS DAS INSTALAÇÕES
    etapa('hidraulica');
    {
      const alim = num(resp.distRede, 10) + h + 4 + (nPav - 1) * hPiso;
      add('tubo25', 'Tubo PVC soldável 25 mm', 'm', alim * 1.10, 'alimentação desde o cavalete até o reservatório', EMB.barra6);
      add('tubo32', 'Tubo PVC soldável 32 mm', 'm', 6 * 1.10, 'barrilete', EMB.barra6);
      add('tubo40', 'Tubo PVC soldável 40 mm', 'm', 3, 'extravasor e limpeza do reservatório', EMB.barra6);
      add('joelho32', 'Joelho 90° PVC soldável 32 mm', 'un', 4 + ceil(E.molhados / 2), 'barrilete');
      add('regGaveta', 'Registro de gaveta bruto 3/4"', 'un', 1 + (unidades > 1 ? unidades : 0), 'registro geral' + (unidades > 1 ? ' + 1 por unidade' : ''));
      add('regGaveta1', 'Registro de gaveta bruto 1" (saída do reservatório)', 'un', 1, '');
      add('adapt32', 'Adaptador soldável curto com bolsa e rosca 32 mm × 1"', 'un', 2, 'registro de saída da caixa');
      const vol = pessoas * C.consumoAgua;
      let nCx = 1, cx = escolher([500, 750, 1000, 1500, 2000, 3000, 5000], vol);
      if (vol > 5000) { nCx = ceil(vol / 5000); cx = 5000; }
      add('caixaAgua', 'Caixa d’água de polietileno ' + fmt(cx, 0) + ' L com tampa', 'un', nCx, pessoas + ' pessoas × ' + C.consumoAgua + ' L/dia = ' + fmt(vol, 0) + ' L');
      add('boia', 'Torneira de boia 3/4"', 'un', nCx, 'entrada da caixa');
      add('flange25', 'Adaptador com flange para caixa d’água 25 mm × 3/4"', 'un', nCx, 'entrada');
      add('flange32', 'Adaptador com flange para caixa d’água 32 mm × 1"', 'un', nCx, 'saída de consumo');
      add('flange40', 'Adaptador com flange para caixa d’água 40 mm × 1 1/4"', 'un', 2 * nCx, 'extravasor e limpeza');
      add('regEsfera40', 'Registro de esfera PVC soldável 40 mm', 'un', nCx, 'limpeza da caixa');
      add('cavalete', 'Kit cavalete PVC 3/4" com registro (padrão da concessionária)', 'un', unidades > 1 ? unidades : 1, unidades > 1 ? 'medição individualizada por unidade' : 'o hidrômetro é fornecido pela concessionária');
      if (nPav >= 3) avisos.push('Com ' + nPav + ' pavimentos a pressão da rede normalmente não alcança o reservatório superior: preveja reservatório inferior e bomba de recalque (não incluídos).');
      const juntas = E.juntas + 20;
      add('adesivoPvc', 'Adesivo para PVC (bisnaga 175 g)', 'un', ceil(juntas / 40) + 1, 'água fria e esgoto: ~40 juntas por bisnaga');
      add('solLimp', 'Solução limpadora para PVC (frasco 200 ml)', 'un', ceil(juntas / 60), '');
      add('vedaRosca', 'Fita veda-rosca 18 mm × 25 m', 'un', ceil((E.pontosAgua + E.regGaveta * 2) / 15), '');
      add('lixa100', 'Lixa d’água nº 100 (preparo das juntas)', 'folha', ceil(juntas / 40), '');
    }
    etapa('esgoto');
    {
      add('tubo100', 'Tubo PVC esgoto 100 mm', 'm', (F0.g.P / 2 + (resp.esgoto === 'rede' ? num(resp.distRede, 10) : 6)) * 1.10, 'rede externa e ligação ' + (resp.esgoto === 'rede' ? 'à rede pública' : 'à fossa'), EMB.barra6);
      add('caixaInsp', 'Caixa de inspeção pré-moldada de concreto 60×60 cm com tampa', 'un', 2 + ceil(F0.g.P / 20), 'mudanças de direção da rede externa');
      if (resp.esgoto === 'fossa') {
        const vf = 1000 + pessoas * (130 * 1 + 57);
        const vfc = escolher([1100, 1500, 2000, 3000, 5000, 10000], vf);
        const vfil = Math.max(1000, 1.6 * pessoas * 130);
        const vfilc = escolher([1000, 1500, 2000, 3000, 5000, 10000], vfil);
        add('fossa', 'Fossa séptica pré-fabricada ' + fmt(vfc, 0) + ' L', 'un', 1, 'NBR 7229: V = 1000 + N(C·T + K·Lf) = ' + fmt(vf, 0) + ' L para ' + pessoas + ' pessoas');
        add('filtro', 'Filtro anaeróbio pré-fabricado ' + fmt(vfilc, 0) + ' L', 'un', 1, 'NBR 13969: V = 1,6·N·C·T = ' + fmt(vfil, 0) + ' L');
        add('anelSumid', 'Anel de concreto Ø 1,50 m × 0,50 m (sumidouro)', 'un', 4 * Math.max(1, ceil(pessoas / 8)), 'sumidouro de 2,0 m de profundidade (confirmar com teste de infiltração)');
        add('tampaSumid', 'Tampa de concreto Ø 1,50 m', 'un', Math.max(1, ceil(pessoas / 8)), '');
        add('brita2', 'Brita 2', 'm³', 0.50 * Math.max(1, ceil(pessoas / 8)), 'fundo drenante do sumidouro');
      }
    }
    etapa('eletrica');
    {
      const tue = E.tue;
      const cIlum = Math.max(1, ceil(E.circ.ilum)) + 1, cTugG = Math.max(1, ceil(E.circ.tugG)), cTug20 = ceil(E.circ.tug20);
      const nQD = unidades > 1 ? unidades + 1 : 1;
      const polos = cIlum + cTugG + cTug20 + tue.maquina + tue.micro + tue.chuveiro * 2 + tue.ar * 2;
      const polosQD = polos / nQD + 2 + 2 + 3;
      const qd = escolher([12, 18, 24, 36, 48], polosQD + 2);
      add('qd', 'Quadro de distribuição de embutir ' + qd + ' disjuntores DIN com barramentos', 'un', nQD, unidades > 1 ? unidades + ' unidades + 1 de uso comum' : fmt(polos + 7, 0) + ' polos ocupados');
      add('disj10', 'Disjuntor DIN monopolar 10 A', 'un', cIlum, 'iluminação');
      add('disj20', 'Disjuntor DIN monopolar 20 A', 'un', cTugG + cTug20 + tue.maquina + tue.micro, 'tomadas e TUEs 127 V');
      add('disj40', 'Disjuntor DIN bipolar 40 A', 'un', tue.chuveiro, 'chuveiros');
      add('disj20b', 'Disjuntor DIN bipolar 20 A', 'un', tue.ar, 'ar-condicionado');
      add('disjGeral', 'Disjuntor DIN bipolar 63 A (geral do quadro)', 'un', nQD, 'confirmar com a carga e a concessionária');
      add('dr', 'Interruptor diferencial residual (DR) bipolar 63 A 30 mA', 'un', nQD, 'NBR 5410 (áreas molhadas e tomadas)');
      add('dps', 'DPS 275 V 20 kA', 'un', 3 * nQD, 'fases e neutro');
      add('haste', 'Haste de aterramento cobreada 5/8" × 2,40 m', 'un', unidades > 1 ? 3 : 1, unidades > 1 ? 'malha de 3 hastes' : '');
      add('conectorHaste', 'Conector cabo-haste (grampo)', 'un', unidades > 1 ? 3 : 1, '');
      add('caixaAterr', 'Caixa de inspeção de aterramento', 'un', 1, '');
      const ramal = num(resp.distRede, 10) / 2 + 8;
      if (unidades > 1) {
        add('padraoEntrada', 'Padrão de entrada coletivo (entrada de energia conforme concessionária)', 'un', 1, 'kit da concessionária local');
        add('medidor', 'Centro de medição / caixa para ' + unidades + ' medidores (padrão da concessionária)', 'un', 1, '');
        add('disjMedidor', 'Disjuntor de proteção do medidor bipolar 50 A', 'un', unidades, '1 por unidade');
        add('cabo10', 'Cabo flexível 10 mm² 750 V (medição → quadros)', 'm', E.alimentadores * 3 * 1.05, unidades + ' alimentadores com 2 fases + neutro');
        add('cabo10t', 'Cabo flexível 10 mm² 750 V verde (aterramento)', 'm', E.alimentadores * 1.05 + 10, 'terra dos alimentadores');
        add('eletroduto32', 'Eletroduto corrugado reforçado 1" (32 mm) — alimentadores', 'm', E.alimentadores * 1.10, '', EMB.rolo50);
      } else {
        add('padraoEntrada', 'Padrão de entrada de energia bifásico (caixa de medição, poste/pontalete, eletroduto e disjuntor conforme concessionária)', 'un', 1, 'kit da concessionária local');
        add('cabo10', 'Cabo flexível 10 mm² 750 V (medidor → quadro)', 'm', ramal * 3 * 1.05, '2 fases + neutro, ' + fmt(ramal, 1) + ' m');
        add('cabo10t', 'Cabo flexível 10 mm² 750 V verde (aterramento)', 'm', 10, 'quadro → haste');
        add('eletroduto32', 'Eletroduto corrugado reforçado 1" (32 mm) — alimentação do quadro', 'm', ramal * 1.10, '', EMB.rolo50);
      }
      add('fitaIsol', 'Fita isolante 19 mm × 20 m', 'un', ceil(E.pontos / 20) + 1, '');
      add('fitaAuto', 'Fita de autofusão 19 mm × 10 m', 'un', 1 + (unidades > 1 ? 1 : 0), 'emendas do ramal');
    }
    etapa('loucas');
    add('torneiraJardim', 'Torneira de jardim 1/2" com bico', 'un', 2, 'frente e fundos');
    if (nPav > 1) {
      // revestimento da escada
      etapa('pisos');
      const degraus = Math.round(hPiso / 0.175), n = nPav - 1;
      MULT = n;
      const aEsc = degraus * (0.28 + 0.175) * 1.20 + 1.20 * 2.40;
      add('piso_escada', 'Revestimento de escada (piso e espelho) em granito/porcelanato', 'm²', aEsc * 1.10, degraus + ' degraus × 1,20 m + patamar, por lance');
      add('colanteAC-III', 'Argamassa colante AC-III', 'kg', aEsc * 6, 'escada', EMB.colante);
      MULT = 1;
    }
    etapa('pisos');
    {
      const w = num(resp.calcada, 0);
      if (w > 0) {
        const ac = (F0.g.P + 4 * w) * w;
        concreto(ac * 0.06, 'c20', 'Calçada perimetral ' + fmt(w) + ' m × 6 cm (' + fmt(ac, 1) + ' m²)');
        add('lona', 'Lona plástica preta 150 µm', 'm²', ac * 1.10, 'sob a calçada');
        add('sarrafo', 'Sarrafo de pinus 2,5×7 cm', 'm', F0.g.P * 1.1 + (F0.g.P / 1.5) * w, 'guias e juntas a cada 1,5 m');
      }
    }
    etapa('pintura');
    if (resp.telha !== 'metalica') add('stain', 'Stain/verniz para madeiramento aparente do beiral', 'L', gT.P * bei * 1.5 * 0.15 * (1 + C.perdaPintura), 'beiral', EMB.galao);
    etapa('limpeza');
    {
      const ap = E.areaPiso;
      add('limpadorPos', 'Limpador pós-obra (removedor de cimento e rejunte) 5 L', 'un', Math.max(1, ceil(ap / 80)), 'pisos e revestimentos');
      add('detergente', 'Detergente neutro para limpeza (5 L)', 'un', Math.max(1, ceil(ap / 100)), '');
      add('sacoEntulho', 'Saco de ráfia para entulho', 'un', ceil(ap / 4), '');
    }

    // ================================================================ fechamento
    for (const et of etapas) { for (const i of et.itens) i.compra = compra(i); delete et.mapa; }
    const final = etapas.filter((e2) => e2.itens.length);

    const cons = {}; const ordem = [];
    for (const et of final) for (const i of et.itens) {
      if (!cons[i.key]) { cons[i.key] = { key: i.key, desc: i.desc, un: i.un, qtd: 0, emb: i.emb, etapas: [] }; ordem.push(i.key); }
      cons[i.key].qtd += i.qtd; cons[i.key].etapas.push(et.nome);
    }
    const consolidado = ordem.map((k) => { const c = cons[k]; c.compra = compra(c); return c; });

    // compras por fase
    const fases = FASES.map((f) => ({ id: f.id, nome: f.nome, quando: f.quando, itens: [], mapa: {} }));
    const fasePorId = Object.fromEntries(fases.map((f) => [f.id, f]));
    for (const et of final) for (const i of et.itens) {
      const fa = fasePorId[faseDoItem(et.id, i.key)];
      let it = fa.mapa[i.key];
      if (!it) { it = { key: i.key, desc: i.desc, un: i.un, qtd: 0, emb: i.emb, prazo: prazoDoItem(et.id, i.key), etapas: [] }; fa.mapa[i.key] = it; fa.itens.push(it); }
      it.qtd += i.qtd; if (!it.etapas.includes(et.nome)) it.etapas.push(et.nome);
    }
    for (const f of fases) { for (const i of f.itens) i.compra = compra(i); delete f.mapa; }
    const compras = fases.filter((f) => f.itens.length);

    // indicadores
    const somaC = (re) => consolidado.filter((i) => re.test(i.desc)).reduce((s, i) => s + i.qtd, 0);
    const vals = {
      acoConcreto: T.concreto ? T.aco / T.concreto : null,
      concretoArea: areaTotal ? T.concreto / areaTotal : null,
      formaConcreto: T.concreto - T.formaLaje * C.capaLaje > 0 ? T.forma / (T.concreto - T.formaLaje * C.capaLaje) : null,
      cimentoArea: areaTotal ? somaC(/^Cimento Portland/) / 50 / areaTotal : null,
      alvenariaArea: areaTotal ? E.alvenaria / areaTotal : null,
      blocosParede: E.alvenaria ? somaC(/^Bloco/) / E.alvenaria : null,
      janelaPiso: E.areaPerm ? E.aJanPerm / E.areaPerm * 100 : null,
      pontosArea: E.areaPiso ? E.pontos / E.areaPiso : null
    };
    if (resp.concreto === 'usinado' || resp.argamassa === 'industrializada') vals.cimentoArea = null;
    const indicadores = INDICADORES.map((d) => {
      const v = vals[d.id];
      const estado = v == null ? 'na' : v < d.min * 0.85 || v > d.max * 1.15 ? 'fora' : v < d.min || v > d.max ? 'atencao' : 'ok';
      return Object.assign({}, d, { valor: v, estado });
    });

    return {
      etapas: final, consolidado, compras, indicadores, avisos,
      fundacao: Object.assign(memFund, { tipo: fundTipo, lado: sapataLado, altura: sapataH, pilares: npil0 }),
      resumo: {
        areaConstruida: areaTotal, areaTerreo: F0.g.A, perimetro: F0.g.P, comprimento: F0.g.Lc, largura: F0.g.Wc,
        paredesExternas: somaF((f) => f.g.Lext), paredesInternas: somaF((f) => f.g.Lint), pilares: npil0,
        alvenaria: E.alvenaria, areaPiso: E.areaPiso, telhado: aInc, projecaoTelhado: proj,
        pessoas, unidades, pavimentos: nPav, ambientes: ambTot, aberturas: somaF((f) => f.g.ab.reduce((s, o) => s + o.qtd, 0)),
        concreto: T.concreto, aco: T.aco
      },
      respostas: resp
    };
  }

  function compra(i) {
    if (i.emb && i.emb.qtd > 0) { const n = ceil(i.qtd / i.emb.qtd); return n + ' ' + (n === 1 ? i.emb.nome : plural(i.emb.nome)); }
    if (i.un === 'un' || i.un === 'folha') return ceil(i.qtd) + ' ' + i.un;
    if (i.un === 'm³') return fmt(Math.ceil(i.qtd * 10 - 1e-9) / 10, 1) + ' m³';
    return fmt(ceil(i.qtd), 0) + ' ' + i.un;
  }
  function plural(s) {
    return s.replace(/^saco/, 'sacos').replace(/^lata/, 'latas').replace(/^barra/, 'barras').replace(/^rolo/, 'rolos')
      .replace(/^galão/, 'galões').replace(/^balde/, 'baldes').replace(/^caixa/, 'caixas');
  }

  // comparação entre duas revisões (listas consolidadas)
  function comparar(a, b) {
    const mapa = {};
    for (const i of a) mapa[i.key] = { key: i.key, desc: i.desc, un: i.un, a: i.qtd, b: 0 };
    for (const i of b) { mapa[i.key] = mapa[i.key] || { key: i.key, desc: i.desc, un: i.un, a: 0, b: 0 }; mapa[i.key].b = i.qtd; }
    return Object.values(mapa).map((x) => Object.assign(x, { dif: x.b - x.a, pct: x.a ? (x.b - x.a) / x.a * 100 : null }))
      .filter((x) => Math.abs(x.dif) > 1e-6).sort((x, y) => Math.abs(y.pct == null ? 1e9 : y.pct) - Math.abs(x.pct == null ? 1e9 : x.pct));
  }

  const API = { calcular, normalizar, comparar, TIPOS_AMBIENTE, TIPOS_ABERTURA, BLOCOS, PISOS, SOLOS, PADROES_ACABAMENTO, RESPOSTAS_PADRAO, COEF, INDICADORES, FASES, ACO, fmt, r2 };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.CasaEngine = API;
})(typeof self !== 'undefined' ? self : this);
