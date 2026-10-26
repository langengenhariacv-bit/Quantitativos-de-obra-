'use strict';
// Ferramenta "conferir_projeto_autocad" para a Central Dots.
// O bot chama conferirProjeto(); os pedidos entram numa fila e rodam um de cada vez,
// porque o AutoCAD so aguenta um trabalho por vez (o script tambem tem trava propria).

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const RUNNER_PADRAO = process.env.LANG_CONFERE_RUNNER ||
  path.join(process.env.LOCALAPPDATA || 'C:\\Users\\Public', 'LANG', 'ConfereAuto', 'ferramentas', 'Conferir-Projeto.ps1');

const definicao = {
  name: 'conferir_projeto_autocad',
  description:
    'Abre um projeto (DWG ou DXF) do LANG ProjetoAuto no AutoCAD, confere e corrige o que for seguro ' +
    '(espessuras/cores das camadas, cotas encostando em textos, material das esquadrias) e devolve um relatorio. ' +
    'Trabalha sempre numa copia: o arquivo original nunca e alterado. Fossa, campos da prefeitura e cotas sem ' +
    'lugar livre so sao apontados para o responsavel decidir.',
  input_schema: {
    type: 'object',
    properties: {
      arquivo: { type: 'string', description: 'Caminho completo do .dwg ou .dxf no PC, ex. D:\\Projetos\\Casa\\croqui.dwg' },
      somente_conferir: { type: 'boolean', description: 'true para so gerar o relatorio, sem corrigir', default: false },
      material: { type: 'string', description: 'Material padrao para esquadrias "A definir", ex. "Aluminio preto". Vazio mantem "A definir".' },
      gerar_projeto: { type: 'boolean', description: 'Rodar o PROJETO antes de conferir. O questionario do PROJETO pode exigir alguem no PC.', default: false }
    },
    required: ['arquivo']
  }
};

let fila = Promise.resolve();
const estado = { rodando: null, aguardando: [], historico: [] };

function validar(args) {
  if (!args || typeof args.arquivo !== 'string' || !args.arquivo.trim()) throw new Error('Informe o caminho do arquivo.');
  const ext = path.extname(args.arquivo).toLowerCase();
  if (ext !== '.dwg' && ext !== '.dxf') throw new Error('O arquivo precisa ser .dwg ou .dxf.');
  if (args.material && /[\r\n=]/.test(args.material)) throw new Error('Material invalido.');
}

function montarArgs(args, runner) {
  const a = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', runner, '-Arquivo', args.arquivo];
  if (args.material) a.push('-Material', args.material);
  if (args.somente_conferir) a.push('-SomenteConferir');
  if (args.gerar_projeto) a.push('-GerarProjeto');
  if (args.saida) a.push('-Saida', args.saida);
  return a;
}

function executar(args, opcoes = {}) {
  const runner = opcoes.runner || RUNNER_PADRAO;
  const comando = opcoes.comando || 'powershell.exe';
  const prefixo = opcoes.prefixo || [];
  const limiteMs = opcoes.limiteMs || 30 * 60 * 1000;
  return new Promise((resolve) => {
    const filho = spawn(comando, [...prefixo, ...montarArgs(args, runner)], { windowsHide: true });
    let saida = '', erro = '';
    const relogio = setTimeout(() => filho.kill(), limiteMs);
    filho.stdout.on('data', (d) => { saida += d; });
    filho.stderr.on('data', (d) => { erro += d; });
    filho.on('error', (e) => { clearTimeout(relogio); resolve({ ok: false, erro: `Nao consegui iniciar o PowerShell: ${e.message}` }); });
    filho.on('close', (codigo) => {
      clearTimeout(relogio);
      const linha = saida.trim().split(/\r?\n/).filter(Boolean).pop() || '';
      try { resolve(JSON.parse(linha)); }
      catch { resolve({ ok: false, erro: (erro || saida || `Saiu com codigo ${codigo}`).trim().slice(0, 2000) }); }
    });
  });
}

function conferirProjeto(args, opcoes = {}) {
  try { validar(args); } catch (e) { return Promise.resolve({ ok: false, erro: e.message }); }
  if (!opcoes.runner && !fs.existsSync(RUNNER_PADRAO)) {
    return Promise.resolve({ ok: false, erro: `Executor nao instalado em ${RUNNER_PADRAO}. Rode autocad\\instalar.ps1.` });
  }
  const pedido = { arquivo: args.arquivo, desde: new Date().toISOString() };
  estado.aguardando.push(pedido);
  const vez = fila.then(async () => {
    estado.aguardando.splice(estado.aguardando.indexOf(pedido), 1);
    estado.rodando = pedido;
    const r = await executar(args, opcoes);
    estado.rodando = null;
    estado.historico.unshift({ ...pedido, fim: new Date().toISOString(), ok: !!r.ok, pasta: r.pasta || null });
    estado.historico.length = Math.min(estado.historico.length, 20);
    return r;
  });
  fila = vez.catch(() => {});
  return vez;
}

// Texto curto para o bot responder ao usuario.
function resumir(r) {
  if (!r || !r.ok) return `Nao consegui conferir o projeto: ${(r && r.erro) || 'erro desconhecido'}`;
  const rel = r.relatorio || {};
  const n = (v) => (Array.isArray(v) ? v.length : typeof v === 'number' ? v : v ? 1 : 0);
  const c = rel.camadas || {}, k = rel.cotas || {}, e = rel.esquadrias || {}, p = rel.pendencias || {};
  return [
    `Projeto conferido. Corrigido: ${n(c.camadas_fora_do_padrao)} camadas, ${n(c.objetos_com_espessura_propria)} objetos com espessura propria, ` +
      `${n(k.cotas_movidas)} cotas afastadas, ${n(e.material_preenchido)} materiais de esquadria.`,
    `Para voce decidir: ${n(k.cotas_com_colisao_sem_solucao)} cotas ainda encostando, ${n(e.material_a_definir)} esquadrias "A definir", ` +
      `${n(p.usa_fossa)} itens de fossa, ${n(p.campos_a_definir)} campos "A DEFINIR".`,
    r.corrigido ? `Arquivo corrigido: ${r.corrigido}` : 'Nada foi alterado (modo so conferir).',
    `Relatorio: ${r.relatorio_txt}`
  ].join('\n');
}

// Rotas opcionais para servidores no estilo Express.
function registrarRotas(app, prefixo = '/api/autocad') {
  app.post(`${prefixo}/conferir`, async (req, res) => {
    const r = await conferirProjeto(req.body || {});
    res.status(r.ok ? 200 : 400).json({ ...r, resumo: resumir(r) });
  });
  app.get(`${prefixo}/fila`, (req, res) => res.json(estado));
}

async function chamarFerramenta(nome, args) {
  if (nome !== definicao.name) return null;
  const r = await conferirProjeto(args);
  return { resultado: r, texto: resumir(r) };
}

module.exports = { definicao, conferirProjeto, resumir, registrarRotas, chamarFerramenta, estado, _montarArgs: montarArgs };
