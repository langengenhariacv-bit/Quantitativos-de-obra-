// node tests/casa-leitor.cjs — leitor de PDF vetorial: quadro de esquadrias e tipos por nome
const assert = require('assert');
const L = require('../casa/leitor-vetorial.js');
const T = (s, x, y) => ({ s, x, y, ux: 1, uy: 0, h: 2 });
// tabela de esquadrias em formatos variados
const q = L.lerQuadro([T('P1', 10, 100), T('0,80 x 2,10', 30, 100.3), T('MADEIRA', 60, 100), T('P2', 10, 110), T('90', 30, 110), T('210', 45, 110),
  T('J1', 10, 120), T('1,50 x 1,20 / 1,00', 30, 120), T('J3', 10, 130), T('60', 30, 130), T('60', 40, 130), T('160', 50, 130)]);
assert.deepStrictEqual(q.P1, { l: 0.8, a: 2.1, p: null });
assert.deepStrictEqual(q.P2, { l: 0.9, a: 2.1, p: null });
assert.deepStrictEqual(q.J1, { l: 1.5, a: 1.2, p: 1 });
assert.deepStrictEqual(q.J3, { l: 0.6, a: 0.6, p: 1.6 });
// rótulos soltos na planta perto de cotas e números de degraus não podem virar quadro
assert.deepStrictEqual(L.lerQuadro([T('P1', 10, 10), T('3.55', 20, 10), T('J1', 300, 80), T('02', 310, 80), T('01', 320, 80)]), {});
// tipos de ambiente pelo nome
const casos = { 'BWC': 'banheiro', 'Lavabo': 'lavabo', 'Cozinha/ Área de serviço': 'cozinha_servico', 'Flat': 'conjugado', 'Living': 'conjugado', 'Suíte master': 'quarto', 'Sala de TV/ Sala de Jantar': 'sala', 'Hall': 'circulacao', 'Garagem': 'garagem', 'Sacada': 'varanda' };
for (const [n, t] of Object.entries(casos)) assert.strictEqual(L.tipoPorNome(n), t, n);
console.log('OK — leitor: quadro de esquadrias e tipos por nome');
