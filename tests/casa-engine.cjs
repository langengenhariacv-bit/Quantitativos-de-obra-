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
const variantes = [{}, { fundacao: 'radier', laje: 'nenhuma', teto: 'pvc', telha: 'fibrocimento', esgoto: 'fossa', argamassa: 'industrializada', concreto: 'usinado' },
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
