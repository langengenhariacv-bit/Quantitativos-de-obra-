// node tests/casa-engine.cjs — verificação do motor de quantitativos da Lang Casa
const assert = require('assert');
const E = require('../casa/engine.js');
const casa = {
  lev: {
    ambientes: [
      { nome: 'Sala/estar', tipo: 'sala', area: 18, perimetro: 17 },
      { nome: 'Cozinha', tipo: 'cozinha', area: 10, perimetro: 13 },
      { nome: 'Quarto 1', tipo: 'quarto', area: 10.5, perimetro: 13 },
      { nome: 'Quarto 2', tipo: 'quarto', area: 9, perimetro: 12 },
      { nome: 'Banheiro', tipo: 'banheiro', area: 3.6, perimetro: 7.8 },
      { nome: 'Circulação', tipo: 'circulacao', area: 3, perimetro: 8 },
      { nome: 'Área de serviço', tipo: 'servico', area: 4, perimetro: 8 },
      { nome: 'Varanda', tipo: 'varanda', area: 6, perimetro: 10 }
    ],
    paredes: { externas: 36, internas: 22 },
    envelope: { area: 72, perimetro: 36, comprimento: 10, largura: 8 },
    aberturas: [
      { tipo: 'porta_ext', qtd: 2 }, { tipo: 'porta_int', qtd: 4 },
      { tipo: 'janela', qtd: 4 }, { tipo: 'basculante', qtd: 1 }
    ]
  },
  resp: {}
};
function total(r, re) { return r.consolidado.filter((i) => re.test(i.desc)).reduce((s, i) => s + i.qtd, 0); }
const variantes = [{}, { fundacao: 'radier', laje: 'nenhuma', teto: 'pvc', telha: 'fibrocimento', esgoto: 'fossa', concreto: 'usinado' },
  { fundacao: 'broca', telha: 'metalica', teto: 'drywall', piso: 'ceramica', revCozinha: 'teto', pinturaExterna: 'acrilica', vedacao: 'concreto14' }];
for (const v of variantes) {
  const r = E.calcular({ lev: casa.lev, resp: v });
  for (const et of r.etapas) for (const i of et.itens) {
    assert(Number.isFinite(i.qtd) && i.qtd > 0, 'qtd inválida: ' + i.desc);
    assert(i.compra && !/NaN|undefined/.test(i.compra + i.desc), 'texto inválido: ' + i.desc);
  }
  assert(r.etapas.length >= 14, 'etapas: ' + r.etapas.length);
}
const r = E.calcular(casa);
const cim = total(r, /^Cimento/) / 50, areia = total(r, /^Areia/), blocos = total(r, /^Bloco/), aco = total(r, /^Aço/);
console.log('Etapas:', r.etapas.map((e) => e.nome + ' (' + e.itens.length + ')').join(' | '));
console.log('Cimento', cim.toFixed(0), 'sacos | areia', areia.toFixed(1), 'm³ | blocos', blocos, '| aço', aco.toFixed(0), 'kg | pilares', r.resumo.pilares);
console.log('Resumo', JSON.stringify(r.resumo));
// faixas de sanidade para casa de ~72 m² (referências de mercado)
assert(cim > 120 && cim < 450, 'cimento fora da faixa');
assert(areia > 15 && areia < 70, 'areia fora da faixa');
assert(blocos > 1800 && blocos < 4500, 'blocos fora da faixa');
assert(aco / 72 > 8 && aco / 72 < 40, 'taxa de aço fora da faixa');
// sem ambientes não pode quebrar
const vazio = E.calcular({ lev: {}, resp: {} });
assert(vazio.avisos.length > 0);
console.log('OK —', r.consolidado.length, 'insumos consolidados');

// ---- pavimentos, unidades, solo e acabamento por cômodo
{
  const sobrado = E.calcular({ pavimentos: [{ nome: 'Térreo', lev: casa.lev, rep: 1 }, { nome: 'Superior', lev: casa.lev, rep: 1 }], resp: {} });
  const terrea = E.calcular(casa);
  const cim2 = total(sobrado, /^Cimento/), cim1 = total(terrea, /^Cimento/);
  assert(cim2 > cim1 * 1.5 && cim2 < cim1 * 2.3, 'sobrado deveria ter ~2x o cimento');
  assert(total(sobrado, /^Telha cerâmica/) === total(terrea, /^Telha cerâmica/), 'telhado só no último pavimento');
  assert(sobrado.consolidado.some((i) => /^Corrimão/.test(i.desc)), 'sobrado tem escada');
  assert(sobrado.fundacao.lado > terrea.fundacao.lado, 'sapata maior com mais pavimentos');
  console.log('Sapata térrea', terrea.fundacao.lado, '| sobrado', sobrado.fundacao.lado, '|', sobrado.fundacao.texto);
  // solo: rocha < argila média < mole (vira estaca)
  const rocha = E.calcular({ lev: casa.lev, resp: { solo: 'rocha' } }), mole = E.calcular({ lev: casa.lev, resp: { solo: 'mole' } });
  assert(rocha.fundacao.lado <= terrea.fundacao.lado, 'rocha não pode pedir sapata maior');
  assert(mole.fundacao.tipo === 'broca' && mole.avisos.some((a) => /sapata rasa/.test(a)), 'solo mole vira estaca');
  for (let i = 1; i < E.SOLOS.length; i++) assert(E.SOLOS[i].kpa <= E.SOLOS[i - 1].kpa, 'solos em ordem de resistência');
  // prédio com 4 unidades
  const ap = { ambientes: [{ nome: 'Flat', tipo: 'conjugado', area: 25, perimetro: 21 }, { nome: 'BWC', tipo: 'banheiro', area: 3, perimetro: 7 }], paredes: { externas: 22, internas: 8 }, envelope: { area: 32, perimetro: 23 }, aberturas: [{ tipo: 'porta_int', qtd: 2 }, { tipo: 'janela', qtd: 2 }, { tipo: 'basculante', qtd: 1 }] };
  const predio = E.calcular({ pavimentos: [{ nome: 'Térreo', lev: ap, rep: 1 }, { nome: 'Tipo', lev: ap, rep: 3 }], resp: {} });
  assert(predio.resumo.unidades === 4 && predio.resumo.pavimentos === 4);
  assert(total(predio, /^Quadro de distribuição/) === 5, 'quadro por unidade + comum');
  assert(total(predio, /^Disjuntor de proteção do medidor/) === 4);
  assert(predio.avisos.some((a) => /recalque/.test(a)));
  // acabamento por cômodo
  const lev2 = JSON.parse(JSON.stringify(casa.lev)); lev2.ambientes[2].piso = 'laminado'; lev2.ambientes[0].teto = 'pvc';
  const r2 = E.calcular({ lev: lev2, resp: {} });
  assert(r2.consolidado.some((i) => /laminado/.test(i.desc)) && r2.consolidado.some((i) => /Forro de PVC/.test(i.desc)) && r2.consolidado.some((i) => /Rodapé de poliestireno/.test(i.desc)));
  // compras por fase e indicadores
  assert(terrea.compras.length >= 5 && terrea.compras[0].itens.length > 3);
  const qtdFases = terrea.compras.reduce((s, f) => s + f.itens.reduce((t, i) => t + (i.key.startsWith('cimento') ? i.qtd : 0), 0), 0);
  assert(Math.abs(qtdFases - total(terrea, /^Cimento/)) < 1e-6, 'fases somam o total');
  console.log('Indicadores:', terrea.indicadores.map((i) => i.id + '=' + (i.valor == null ? '-' : i.valor.toFixed(2)) + '(' + i.estado + ')').join(' '));
  const cmp = E.comparar(terrea.consolidado, sobrado.consolidado);
  assert(cmp.length > 20);
  console.log('OK — pavimentos, solo, acabamentos, fases e indicadores');
}

// ---- área externa e embalagens reais
{
  const r = E.calcular({ lev: casa.lev, resp: { muroComp: 40, muroAlt: 2, portaoGaragem: 3, portaoSocial: 1, aterroAltura: 0.3, terrenoArea: 300, pisoExtArea: 40, pisoExtTipo: 'paver', jardimArea: 60, testada: 12, interfone: true, pisoDiagonal: true } });
  const base = E.calcular(casa);
  const ex = r.etapas.find((e) => e.id === 'externa');
  assert(ex && ex.itens.length > 25, 'etapa área externa');
  for (const re of [/muro\)$/, /^Portão de garagem/, /^Portão social/, /^Saibro/, /^Bloco intertravado/, /^Grama/, /^Piso podotátil/, /^Caixa de correio/, /^Kit porteiro/, /^Capa de muro/]) assert(ex.itens.some((i) => re.test(i.desc)), 'faltou ' + re);
  assert(!base.etapas.some((e) => e.id === 'externa' && e.itens.some((i) => /Portão|Saibro|Grama|muro/.test(i.desc))), 'sem área externa por padrão');
  assert(JSON.stringify(base.indicadores.map((i) => i.valor)) === JSON.stringify(r.indicadores.map((i) => i.valor)), 'indicadores só da casa');
  assert(total(r, /^Porcelanato/) > total(base, /^Porcelanato/), 'diagonal aumenta perda');
  const pc = r.consolidado.find((i) => /^Porcelanato/.test(i.desc)); assert(/caixas 1,44 m²$/.test(pc.compra), pc.compra);
  const tl = r.consolidado.find((i) => /^Telha cerâmica/.test(i.desc)); assert(/milheiros?$/.test(tl.compra), tl.compra);
  const ti = r.consolidado.find((i) => /^Tinta acrílica fosca/.test(i.desc)); assert(/lata|galão/.test(ti.compra), ti.compra);
  assert(r.compras.some((f) => f.id === 'f55' && f.itens.length > 10));
  console.log('OK — área externa e embalagens:', pc.compra, '|', tl.compra, '|', ti.compra);
}

// ---- muro lado a lado, capa e quintal em brita
{
  const base = { muroComp: 30, muroAlt: 2 };
  const ex = (resp) => E.calcular({ lev: casa.lev, resp: Object.assign({}, base, resp) }).etapas.find((e) => e.id === 'externa');
  const kg = (et, re) => et.itens.filter((i) => re.test(i.desc)).reduce((s, i) => s + i.qtd, 0);
  const dois = ex({}), umLado = ex({ muroLado2: 'chapisco', muroPint2: false });
  assert(kg(umLado, /^Areia fina/) < kg(dois, /^Areia fina/) * 0.6, 'reboco só de um lado usa metade da areia fina');
  assert(kg(umLado, /^Tinta acrílica/) < kg(dois, /^Tinta acrílica/) * 0.6, 'pintura só de um lado');
  assert(ex({ muroCapa: 'ceramica' }).itens.some((i) => /^Capa de muro cerâmica/.test(i.desc)));
  assert(!ex({ muroCapa: 'nenhuma' }).itens.some((i) => /^Capa de muro/.test(i.desc)));
  const br = ex({ muroComp: 0, pisoExtArea: 50, pisoExtTipo: 'brita' });
  assert(!br.itens.some((i) => /^Manta geotêxtil/.test(i.desc)) && kg(br, /^Brita 1/) > 2.5 && !br.itens.some((i) => /^Cimento/.test(i.desc)), 'quintal só brita, sem manta');
  assert(ex({ muroComp: 0, pisoExtArea: 50, pisoExtTipo: 'brita_manta' }).itens.some((i) => /^Manta geotêxtil/.test(i.desc)), 'brita sobre manta');
  const rad = E.calcular({ lev: casa.lev, resp: { fundacao: 'radier' } });
  const fu = rad.etapas.find((e) => e.id === 'fundacao');
  assert(rad.fundacao.tipo === 'radier' && fu.itens.some((i) => /^Tela soldada Q-138/.test(i.desc)) && fu.itens.some((i) => /^Brita graduada/.test(i.desc)), 'radier');
  assert(!rad.etapas.find((e) => e.id === 'pisos').itens.some((i) => /lastro do piso/.test(i.mem.join(' '))), 'radier dispensa lastro do piso');
  console.log('Radier:', rad.fundacao.texto);
  console.log('OK — muro lado a lado, capa e quintal em brita');
}

// ---- alvenaria estrutural: sem pilares e vigas
{
  for (const ved of ['estrutural_ceramico14', 'estrutural_concreto14']) {
    const r = E.calcular({ lev: casa.lev, resp: { vedacao: ved } });
    const est = r.etapas.find((e) => e.id === 'estrutura');
    const mem = est.itens.map((i) => i.mem.join(' ')).join(' ');
    assert(!/pilares|Vigas|Cinta de respaldo 14/.test(mem), 'sem pilares/vigas de concreto: ' + ved);
    assert(/graute vertical/.test(mem) && est.itens.some((i) => /^Brita 0/.test(i.desc)), 'graute');
    const alv = r.etapas.find((e) => e.id === 'alvenaria');
    assert(alv.itens.some((i) => /^Canaleta/.test(i.desc)) && alv.itens.some((i) => /^Meio-bloco/.test(i.desc)) && !alv.itens.some((i) => /^Tela galvanizada/.test(i.desc)), 'família de blocos');
    assert(r.fundacao.tipo === 'corrida' && r.fundacao.estrutural, 'sapata corrida');
    assert(r.avisos.some((a) => /Alvenaria estrutural/.test(a)));
    assert(total(r, /^Aço/) < total(E.calcular(casa), /^Aço/), 'menos aço que concreto armado');
    console.log(ved, '| aço', total(r, /^Aço/).toFixed(0), 'kg | graute', r.resumo.graute.toFixed(2), 'm³ |', r.fundacao.texto);
  }
  const radier = E.calcular({ lev: casa.lev, resp: { vedacao: 'estrutural_concreto14', fundacao: 'radier' } });
  assert(radier.fundacao.tipo === 'radier');
  const broca = E.calcular({ lev: casa.lev, resp: { vedacao: 'estrutural_concreto14', fundacao: 'broca' } });
  assert(/ao longo das paredes/.test(broca.fundacao.texto));
  const sob = E.calcular({ pavimentos: [{ nome: 'T', lev: casa.lev }, { nome: 'S', lev: casa.lev }], resp: { vedacao: 'estrutural_ceramico14' } });
  assert(sob.etapas.find((e) => e.id === 'estrutura').itens.some((i) => /^Vigota/.test(i.desc)), 'laje mantida');
  console.log('OK — alvenaria estrutural');
}

// ---- reboco sempre de cimento + areia fina; argamassa industrializada só no piso
{
  const r = E.calcular({ lev: casa.lev, resp: { argamassa: 'industrializada', muroComp: 20 } });
  assert(!r.consolidado.some((i) => /industrializada/i.test(i.desc)), 'sem argamassa industrializada');
  const rev = r.etapas.find((e) => e.id === 'revestimentos');
  assert(rev.itens.some((i) => /^Areia fina/.test(i.desc)) && rev.itens.some((i) => /^Cimento/.test(i.desc) && /areia fina/.test(i.mem.join(' '))), 'reboco cimento + areia fina');
  assert(!rev.itens.some((i) => /^Cal hidratada/.test(i.desc)), 'reboco sem cal');
  assert(r.etapas.find((e) => e.id === 'externa').itens.some((i) => /^Areia fina/.test(i.desc)), 'reboco do muro');
  assert(r.consolidado.some((i) => /^Argamassa colante/.test(i.desc)), 'colante no piso');
  console.log('OK — reboco de cimento e areia fina');
}

// ---- escadas: uma por casa geminada
{
  const lev = JSON.parse(JSON.stringify(casa.lev)); lev.escadas = 6;
  const um = E.calcular({ pavimentos: [{ nome: 'T', lev: casa.lev }, { nome: 'S', lev: casa.lev }], resp: {} });
  const seis = E.calcular({ pavimentos: [{ nome: 'T', lev }, { nome: 'S', lev: casa.lev }], resp: {} });
  assert(Math.abs(total(seis, /^Corrimão/) - 6 * total(um, /^Corrimão/)) < 1e-6, '6 escadas = 6 corrimãos');
  console.log('OK — escadas por pavimento');
}

// ---- paredes com cerâmica informadas na cozinha
{
  const lev = JSON.parse(JSON.stringify(casa.lev));
  const coz = lev.ambientes.find((a) => a.tipo === 'cozinha' || a.tipo === 'cozinha_servico' || a.tipo === 'conjugado');
  assert(coz, 'tem cozinha');
  coz.parede = '1.50';
  const todas = E.calcular({ lev, resp: {} });
  coz.paredeCer = 3.0;
  const tres = E.calcular({ lev, resp: {} });
  assert(total(tres, /^Revestimento de parede/) < total(todas, /^Revestimento de parede/), 'menos azulejo com 3 m');
  assert(total(tres, /^Rodapé/) > total(todas, /^Rodapé/), 'rodapé nas paredes sem cerâmica');
  coz.parede = 'faixa'; coz.paredeCer = 4.0; const f4 = E.calcular({ lev, resp: {} });
  coz.paredeCer = 2.0; const f2 = E.calcular({ lev, resp: {} });
  assert(Math.abs(total(f4, /^Revestimento de parede/) - total(f2, /^Revestimento de parede/) - 2 * 0.6 * 1.1) < 0.01, 'faixa 0,60 × comprimento');
  console.log('OK — paredes com cerâmica por cômodo');
}

// ---- piso da escada
{
  const lev = JSON.parse(JSON.stringify(casa.lev)); lev.escadaLargura = 0.9;
  const pav = [{ nome: 'T', lev }, { nome: 'S', lev: casa.lev }];
  const gr = E.calcular({ pavimentos: pav, resp: { pisoEscada: 'granito' } });
  assert(total(gr, /^Piso de degrau em granito 0,9/) > 0 && total(gr, /^Espelho de degrau/) > 0, 'granito por peça, largura lida');
  const ce = E.calcular({ pavimentos: pav, resp: { pisoEscada: 'retificado59' } });
  assert(total(ce, /^Revestimento da escada/) > 0 && total(ce, /^Rodapé da escada/) > 0 && total(ce, /^Perfil de alumínio/) > 0, 'cerâmico com rodapé e perfil');
  assert(total(E.calcular({ lev: casa.lev, resp: {} }), /escada/i) === 0, 'térrea sem escada');
  console.log('OK — piso da escada');
}
