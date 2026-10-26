const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const tool = require('../autocad-tool');

const falso = path.join(__dirname, '..', 'fixtures', 'executor-falso.js');
// O executor falso ignora os 4 primeiros argumentos do PowerShell (-NoProfile ... -File <runner>).
const opcoes = { comando: process.execPath, prefixo: [falso], runner: 'runner.ps1' };

test('recusa arquivo que nao e DWG/DXF', async () => {
  const r = await tool.conferirProjeto({ arquivo: 'C:/x/planta.pdf' }, opcoes);
  assert.equal(r.ok, false);
  assert.match(r.erro, /dwg ou \.dxf/);
});

test('repassa material e modo para o executor e resume o resultado', async () => {
  const r = await tool.conferirProjeto({ arquivo: 'C:/x/casa.dwg', material: 'Aluminio preto' }, opcoes);
  assert.equal(r.ok, true);
  assert.equal(r.relatorio.material, 'Aluminio preto');
  const texto = tool.resumir(r);
  assert.match(texto, /1 camadas, 2 cotas afastadas, 0 materiais/);
  assert.match(texto, /3 objetos com espessura diferente do padrao/);
  assert.match(texto, /1 esquadrias "A definir", 0 itens de fossa, 3 campos/);
  assert.match(texto, /Arquivo corrigido: C:\/saida\/x-CORRIGIDO.dwg/);
});

test('somente conferir nao gera arquivo corrigido', async () => {
  const r = await tool.conferirProjeto({ arquivo: 'C:/x/casa.dxf', somente_conferir: true }, opcoes);
  assert.equal(r.corrigido, null);
  assert.match(tool.resumir(r), /Nada foi alterado/);
});

test('falha do executor vira erro legivel', async () => {
  const r = await tool.conferirProjeto({ arquivo: 'C:/x/falha.dwg' }, opcoes);
  assert.equal(r.ok, false);
  assert.match(r.erro, /AutoCAD nao abriu/);
  assert.match(tool.resumir(r), /^Nao consegui conferir/);
});

test('fila roda um trabalho de cada vez', async () => {
  const marca = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fila-')), 'ordem.txt');
  process.env.MARCA = marca; process.env.ESPERA_MS = '150';
  try {
    await Promise.all(['a.dwg', 'b.dwg', 'c.dwg'].map((f) => tool.conferirProjeto({ arquivo: f }, opcoes)));
  } finally { delete process.env.MARCA; delete process.env.ESPERA_MS; }
  const linhas = fs.readFileSync(marca, 'utf8').trim().split('\n');
  assert.deepEqual(linhas, ['inicio a.dwg', 'fim a.dwg', 'inicio b.dwg', 'fim b.dwg', 'inicio c.dwg', 'fim c.dwg']);
  assert.equal(tool.estado.rodando, null);
  assert.equal(tool.estado.aguardando.length, 0);
});

test('argumentos do PowerShell', () => {
  const a = tool._montarArgs({ arquivo: 'D:/p/c.dwg', gerar_projeto: true, somente_conferir: true }, 'R.ps1');
  assert.deepEqual(a, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'R.ps1', '-Arquivo', 'D:/p/c.dwg', '-SomenteConferir', '-GerarProjeto']);
});
