import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { isDeepStrictEqual, promisify } from 'node:util';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', error => console.error('Conexão ociosa com Postgres', error.code));
const derivar = promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const origem = 'https://langengenhariacv-bit.github.io';
const chaveId = /^[a-z0-9-]{1,64}$/i;
const nomeLogin = nome => String(nome ?? '').trim().normalize('NFC').toLowerCase();
const imagem = value => typeof value === 'string' && value.length <= 400000 &&
  /^data:image\/(?:jpeg|png);base64,[a-z0-9+/]+={0,2}$/i.test(value);
const mapear = list => new Map(list.map(row => [row.id, row]));

class Falha extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function exigir(ok, message = 'Dados inválidos.', status = 400) {
  if (!ok) throw new Falha(status, message);
}

function validarSenha(senha) {
  exigir(typeof senha === 'string' && senha.length >= 10 && senha.length <= 128,
    'A senha precisa ter entre 10 e 128 caracteres.');
}

async function protegerSenha(senha, tipo = 'senha') {
  if (tipo === 'pin') {
    exigir(typeof senha === 'string' && /^\d{4}$/.test(senha), 'O PIN precisa ter 4 dígitos.');
  } else {
    validarSenha(senha);
  }
  const sal = randomBytes(16).toString('hex');
  const valor = await derivar(senha, sal, 64);
  return sal + ':' + valor.toString('hex');
}

async function compararSenha(senha, credencial) {
  const [sal, esperado] = (credencial || '00000000000000000000000000000000:' + '0'.repeat(128)).split(':');
  const valor = await derivar(senha, sal, 64);
  return timingSafeEqual(valor, Buffer.from(esperado, 'hex')) && Boolean(credencial);
}

async function transacao(executar) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const resultado = await executar(db);
    await db.query('COMMIT');
    return resultado;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}

function validarLista(lista) {
  exigir(Array.isArray(lista));
  const ids = new Set();
  for (const row of lista) {
    exigir(row && typeof row.id === 'string' && chaveId.test(row.id) &&
      !Object.hasOwn(Object.prototype, row.id) && !ids.has(row.id));
    ids.add(row.id);
  }
}

function validarTextos(objeto, campos) {
  exigir(campos.every(campo => objeto[campo] == null || typeof objeto[campo] === 'string'));
}

function validarDados(dados) {
  exigir(dados && typeof dados.empresa === 'string' && typeof dados.ultimoResp === 'string');
  exigir(Number.isSafeInteger(dados.seq) && dados.seq >= 0);
  for (const lista of [dados.pessoas, dados.materiais, dados.obras, dados.movs]) validarLista(lista);
  const nomes = new Set();
  for (const pessoa of dados.pessoas) {
    const nome = nomeLogin(pessoa.nome);
    exigir(typeof pessoa.nome === 'string' && nome && nome.length <= 120);
    exigir(!nomes.has(nome), 'Use um nome diferente para cada pessoa.');
    exigir(typeof pessoa.admin === 'boolean' && !('pin' in pessoa) && !('senha' in pessoa));
    exigir(!pessoa.foto || imagem(pessoa.foto));
    nomes.add(nome);
  }
  exigir(dados.pessoas.some(p => p.admin && p.ativo !== false), 'Mantenha um administrador ativo.');
  for (const material of dados.materiais) {
    exigir(typeof material.nome === 'string' && material.nome.trim());
    validarTextos(material, ['cat', 'un', 'local']);
    exigir(!material.foto || imagem(material.foto));
    exigir(!material.ic || (typeof material.ic === 'string' && !/[<>&"'\u0000-\u001f]/.test(material.ic)));
    exigir(material.min == null || material.min === '' || Number.isFinite(material.min));
    exigir(material.preco == null || material.preco === '' || Number.isFinite(material.preco));
  }
  for (const obra of dados.obras) {
    exigir(typeof obra.nome === 'string' && obra.nome.trim());
    exigir(/^#[0-9a-f]{6}$/i.test(obra.cor));
    exigir(obra.status === 'ativa' || obra.status === 'concluida');
    validarTextos(obra, ['end', 'resp']);
  }
  for (const mov of dados.movs) {
    exigir(['entrada', 'saida', 'devolucao', 'ajuste'].includes(mov.tipo));
    exigir(typeof mov.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(mov.data));
    exigir(!mov.obra || (typeof mov.obra === 'string' && chaveId.test(mov.obra)));
    exigir(!mov.por || (typeof mov.por === 'string' && chaveId.test(mov.por)));
    exigir(!mov.n || (Number.isSafeInteger(mov.n) && mov.n > 0));
    validarTextos(mov, ['resp', 'doc', 'forn', 'obs', 'porNome']);
    exigir(Array.isArray(mov.itens) && mov.itens.length > 0);
    const itens = new Set();
    for (const item of mov.itens) {
      exigir(item && typeof item.m === 'string' && chaveId.test(item.m) && !itens.has(item.m));
      exigir(Number.isFinite(item.q) && (mov.tipo === 'ajuste' ? item.q !== 0 : item.q > 0));
      exigir(item.v == null || Number.isFinite(item.v));
      itens.add(item.m);
    }
  }
}

function verificarAlteracoes(antes, depois, pessoa, restaurar) {
  exigir(!restaurar || pessoa.admin, 'Acesso restrito ao administrador.', 403);
  if (restaurar) return;
  const anteriores = mapear(antes.movs);
  const novos = depois.movs.filter(mov => !anteriores.has(mov.id));
  if (!pessoa.admin) {
    const copia = mapear(depois.movs);
    exigir(isDeepStrictEqual(antes.pessoas, depois.pessoas) && antes.empresa === depois.empresa &&
      antes.catalogo === depois.catalogo && antes.materiais.every(x => depois.materiais.some(y => x.id === y.id)) &&
      antes.obras.every(x => depois.obras.some(y => x.id === y.id)) &&
      antes.movs.every(x => isDeepStrictEqual(x, copia.get(x.id))),
    'Ação restrita ao administrador.', 403);
  }
  exigir(novos.length <= 1 && depois.seq === antes.seq + novos.length);
  for (const mov of novos) {
    exigir(mov.por === pessoa.id && mov.porNome === pessoa.nome && mov.n === depois.seq);
    exigir(mov.tipo !== 'ajuste' || pessoa.admin, 'Ação restrita ao administrador.', 403);
    exigir(!mov.obra || depois.obras.some(o => o.id === mov.obra));
    exigir(!['saida', 'devolucao'].includes(mov.tipo) || mov.obra);
    const materiais = mapear(depois.materiais);
    const saldo = new Map();
    const recebido = new Map();
    for (const anterior of antes.movs) {
      const deposito = anterior.tipo === 'saida' ? -1 : anterior.tipo === 'entrada' && anterior.obra ? 0 : 1;
      const obra = anterior.obra !== mov.obra || anterior.tipo === 'ajuste' ? 0 : anterior.tipo === 'devolucao' ? -1 : 1;
      for (const item of anterior.itens) {
        saldo.set(item.m, (saldo.get(item.m) || 0) + deposito * item.q);
        recebido.set(item.m, (recebido.get(item.m) || 0) + obra * item.q);
      }
    }
    for (const item of mov.itens) {
      exigir(materiais.has(item.m));
      const disponivel = mov.tipo === 'saida' ? saldo.get(item.m) : recebido.get(item.m);
      if (['saida', 'devolucao'].includes(mov.tipo)) {
        exigir(item.q <= (disponivel || 0) + 1e-9, 'O saldo disponível mudou. Confira as quantidades.', 409);
      }
    }
  }
}

async function criarSessao(db, pessoa) {
  const token = randomBytes(32).toString('hex');
  await db.query("DELETE FROM sessoes WHERE expira < now()");
  await db.query("INSERT INTO sessoes VALUES ($1, $2, now() + interval '8 hours')", [hash(token), pessoa]);
  return token;
}

async function carregar(db, token, bloquear = false) {
  exigir(typeof token === 'string' && /^[a-f0-9]{64}$/.test(token), 'Acesse com sua senha.', 401);
  const resultado = await db.query(
    'SELECT versao, dados, pessoa FROM estoque JOIN sessoes ON token = $1 AND expira > now()' +
    (bloquear ? ' FOR UPDATE OF estoque' : ''), [hash(token)]);
  const registro = resultado.rows[0];
  const pessoa = registro?.dados.pessoas.find(p => p.id === registro.pessoa && p.ativo !== false);
  exigir(pessoa, 'Sua sessão terminou. Entre novamente.', 401);
  return { ...registro, pessoa };
}

async function limitar(chave, maximo, janela = '10 minutes') {
  const { rows: [row] } = await pool.query(`
    INSERT INTO tentativas VALUES ($1, 1, now())
    ON CONFLICT (chave) DO UPDATE SET
      total = CASE WHEN tentativas.janela < now() - $2::interval THEN 1 ELSE tentativas.total + 1 END,
      janela = CASE WHEN tentativas.janela < now() - $2::interval THEN now() ELSE tentativas.janela END
    RETURNING total`, [chave, janela]);
  exigir(row.total <= maximo, 'Limite de tentativas atingido. Aguarde ou peça ao administrador para redefinir o acesso.', 429);
}

async function guardarFotos(db, fotos, dados) {
  const movs = mapear(dados.movs);
  exigir(fotos && typeof fotos === 'object' && !Array.isArray(fotos));
  for (const [id, imagemFoto] of Object.entries(fotos)) {
    exigir(movs.get(id)?.foto && imagem(imagemFoto), 'Há uma foto inválida no envio.');
  }
  await db.query(`
    INSERT INTO fotos SELECT key, value FROM jsonb_each_text($1)
    ON CONFLICT (movimento) DO UPDATE SET imagem = EXCLUDED.imagem`, [JSON.stringify(fotos)]);
}

async function atender(body) {
  exigir(body && typeof body === 'object');
  if (body.acao === 'estado') {
    const { rows: [registro] } = await pool.query("SELECT dados->'pessoas' AS pessoas FROM estoque");
    if (!registro) return { ativo: false };
    const { rows } = await pool.query('SELECT pessoa, tipo FROM credenciais');
    const tipos = new Map(rows.map(row => [row.pessoa, row.tipo]));
    const pessoas = registro.pessoas.filter(p => p.ativo !== false && tipos.has(p.id)).map(p => ({
      id: p.id, nome: p.nome, foto: p.foto, admin: p.admin, tipo: tipos.get(p.id)
    }));
    return { ativo: true, pessoas };
  }
  if (body.acao === 'ativar') {
    const esperado = process.env.ESTOQUE_SETUP_SHA;
    exigir(esperado && typeof body.codigo === 'string' &&
      timingSafeEqual(Buffer.from(hash(body.codigo), 'hex'), Buffer.from(esperado, 'hex')),
    'Código de ativação incorreto.', 403);
    validarDados(body.dados);
    const pessoa = body.dados.pessoas.find(p => p.id === body.pessoa && p.admin && p.ativo !== false);
    exigir(pessoa);
    const senha = await protegerSenha(body.senha);
    return transacao(async db => {
      const resultado = await db.query(
        'INSERT INTO estoque (dados) VALUES ($1) ON CONFLICT DO NOTHING RETURNING versao',
        [JSON.stringify(body.dados)]);
      exigir(resultado.rowCount, 'O estoque compartilhado já foi ativado.', 409);
      await db.query('INSERT INTO credenciais VALUES ($1, $2)', [pessoa.id, senha]);
      await guardarFotos(db, body.fotos || {}, body.dados);
      return { dados: body.dados, versao: 1, pessoa, token: await criarSessao(db, pessoa.id) };
    });
  }
  if (body.acao === 'entrar') {
    const porPerfil = typeof body.pessoa === 'string' && chaveId.test(body.pessoa);
    exigir((porPerfil || (typeof body.nome === 'string' && body.nome.length <= 120)) &&
      typeof body.senha === 'string' && body.senha.length <= 128, 'Acesso incorreto.', 401);
    const { rows: [registro] } = await pool.query('SELECT versao, dados FROM estoque');
    const mesmoPerfil = p => p.ativo !== false && (porPerfil ? p.id === body.pessoa : nomeLogin(p.nome) === nomeLogin(body.nome));
    const pessoa = registro?.dados.pessoas.find(mesmoPerfil);
    const { rows: [cred] } = pessoa ?
      await pool.query('SELECT senha, tipo FROM credenciais WHERE pessoa=$1', [pessoa.id]) : { rows: [] };
    const chave = pessoa ? 'p:' + pessoa.id : 'desconhecido';
    const pin = cred?.tipo === 'pin';
    await limitar(chave, pin ? 5 : pessoa ? 10 : 25, pin ? '15 minutes' : '10 minutes');
    if (pin) await limitar('dia:' + pessoa.id, 10, '1 day');
    exigir(await compararSenha(body.senha, cred?.senha), 'Senha ou PIN incorreto.', 401);
    return transacao(async db => {
      const { rows: [atual] } = await db.query('SELECT versao, dados FROM estoque FOR UPDATE');
      const perfil = atual.dados.pessoas.find(p => p.id === pessoa.id && mesmoPerfil(p));
      const { rows: [credAtual] } = await db.query('SELECT senha FROM credenciais WHERE pessoa=$1', [pessoa.id]);
      exigir(perfil && credAtual?.senha === cred.senha, 'Senha ou PIN incorreto.', 401);
      await db.query('DELETE FROM tentativas WHERE chave=ANY($1::text[])', [[chave, 'dia:' + pessoa.id]]);
      return { ...atual, pessoa: perfil, token: await criarSessao(db, pessoa.id) };
    });
  }
  if (body.acao === 'salvar') {
    return transacao(async db => {
      const registro = await carregar(db, body.token, true);
      exigir(registro.versao === body.versao, 'Outro aparelho salvou alterações. Atualize e tente novamente.', 409);
      validarDados(body.dados);
      verificarAlteracoes(registro.dados, body.dados, registro.pessoa, body.restaurar === true);
      const perfil = body.dados.pessoas.find(p => p.id === registro.pessoa.id && p.ativo !== false);
      exigir(perfil, 'Mantenha sua conta ativa ao salvar.');
      const anteriores = mapear(registro.dados.pessoas);
      for (const pessoa of body.dados.pessoas) {
        const anterior = anteriores.get(pessoa.id);
        if (anterior && anterior.admin !== pessoa.admin) {
          exigir(body.credencial?.id === pessoa.id, 'Defina uma nova senha ou PIN ao mudar o tipo de acesso.');
        }
      }
      if (body.credencial) {
        exigir(registro.pessoa.admin, 'Acesso restrito ao administrador.', 403);
        const alvo = body.credencial.id;
        const conta = body.dados.pessoas.find(p => p.id === alvo);
        exigir(conta);
        const tipo = conta.admin ? 'senha' : 'pin';
        const senha = await protegerSenha(body.credencial.senha, tipo);
        await db.query(`INSERT INTO credenciais (pessoa, senha, tipo) VALUES ($1, $2, $3)
          ON CONFLICT (pessoa) DO UPDATE SET senha=EXCLUDED.senha, tipo=EXCLUDED.tipo`, [alvo, senha, tipo]);
        await db.query('DELETE FROM sessoes WHERE pessoa=$1 AND token<>$2', [alvo, hash(body.token)]);
        await db.query('DELETE FROM tentativas WHERE chave=ANY($1::text[])', [['p:' + alvo, 'dia:' + alvo]]);
      }
      const pessoas = body.dados.pessoas.filter(p => p.ativo !== false).map(p => p.id);
      await db.query('DELETE FROM sessoes WHERE NOT (pessoa=ANY($1::text[]))', [pessoas]);
      await db.query('DELETE FROM credenciais WHERE NOT (pessoa=ANY($1::text[]))', [body.dados.pessoas.map(p => p.id)]);
      const fotos = body.fotos || {};
      if (!body.restaurar) {
        const ids = new Set(registro.dados.movs.map(mov => mov.id));
        exigir(Object.keys(fotos).every(id => !ids.has(id)));
      }
      await guardarFotos(db, fotos, body.dados);
      await db.query('DELETE FROM fotos WHERE NOT (movimento=ANY($1::text[]))',
        [body.dados.movs.filter(mov => mov.foto).map(mov => mov.id)]);
      const { rows: [atual] } = await db.query(
        'UPDATE estoque SET dados=$1, versao=versao+1 RETURNING versao', [JSON.stringify(body.dados)]);
      return { ...atual, pessoa: perfil };
    });
  }
  const registro = await carregar(pool, body.token);
  if (body.acao === 'ler') {
    return registro.versao === body.versao ? { versao: registro.versao } : registro;
  }
  if (body.acao === 'foto') {
    const { rows: [foto] } = await pool.query('SELECT imagem FROM fotos WHERE movimento=$1', [body.id]);
    return foto || {};
  }
  if (body.acao === 'backup') {
    exigir(registro.pessoa.admin, 'Acesso restrito ao administrador.', 403);
    const { rows } = await pool.query('SELECT movimento, imagem FROM fotos');
    return Object.fromEntries(rows.map(foto => [foto.movimento, foto.imagem]));
  }
  if (body.acao === 'sair') {
    await pool.query('DELETE FROM sessoes WHERE token=$1', [hash(body.token)]);
    return {};
  }
  throw new Falha(400, 'Operação inválida.');
}

export default {
  async fetch(request) {
    const headers = {
      'Access-Control-Allow-Origin': origem,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return Response.json({ erro: 'Método inválido.' }, { status: 405, headers });
    try {
      let bytes = 0;
      const partes = [];
      for await (const parte of request.body ?? []) {
        bytes += parte.byteLength;
        exigir(bytes <= 24 * 1024 * 1024, 'O envio excede 24 MB.', 413);
        partes.push(parte);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(partes).toString('utf8')); }
      catch { throw new Falha(400, 'Conteúdo inválido.'); }
      return Response.json(await atender(body), { headers });
    } catch (error) {
      if (!(error instanceof Falha)) console.error('Erro na API do estoque', error.code || error.name);
      return Response.json({ erro: error instanceof Falha ? error.message : 'Serviço temporariamente indisponível.' },
        { status: error.status || 500, headers });
    }
  }
};
