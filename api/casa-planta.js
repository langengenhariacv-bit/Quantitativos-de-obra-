// Lang Casa — leitura de planta baixa com Claude (visão + saída estruturada).
// Requer a variável de ambiente ANTHROPIC_API_KEY no projeto Vercel.
const sdk = require('@anthropic-ai/sdk');
const Anthropic = sdk.Anthropic || sdk.default || sdk;

const rate = globalThis.__LANG_CASA_RATE || (globalThis.__LANG_CASA_RATE = new Map());
function permitido(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '?').split(',')[0].trim();
  const agora = Date.now(); let r = rate.get(ip);
  if (!r || agora - r.t > 10 * 60 * 1000) r = { t: agora, n: 0 };
  r.n++; rate.set(ip, r); return r.n <= 20;
}
function mesmaOrigem(req) {
  const o = String(req.headers.origin || ''), h = String(req.headers.host || '');
  if (!o) return true; try { return new URL(o).host === h; } catch { return false; }
}

const AMB = ['sala', 'quarto', 'escritorio', 'circulacao', 'cozinha', 'banheiro', 'lavabo', 'servico', 'deposito', 'varanda', 'garagem'];
const ABE = ['porta_int', 'porta_ext', 'porta_correr', 'portao', 'janela', 'basculante'];
const nOuNulo = { anyOf: [{ type: 'number' }, { type: 'null' }] };
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['e_planta_baixa', 'pe_direito_m', 'contorno', 'paredes', 'ambientes', 'aberturas', 'observacoes'],
  properties: {
    e_planta_baixa: { type: 'boolean' },
    pe_direito_m: nOuNulo,
    contorno: { type: 'object', additionalProperties: false, required: ['area_construida_m2', 'perimetro_m', 'comprimento_m', 'largura_m'],
      properties: { area_construida_m2: { type: 'number' }, perimetro_m: { type: 'number' }, comprimento_m: { type: 'number' }, largura_m: { type: 'number' } } },
    paredes: { type: 'object', additionalProperties: false, required: ['externas_m', 'internas_m'],
      properties: { externas_m: { type: 'number' }, internas_m: { type: 'number' } } },
    ambientes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['nome', 'tipo', 'area_m2', 'perimetro_m'],
      properties: { nome: { type: 'string' }, tipo: { type: 'string', enum: AMB }, area_m2: { type: 'number' }, perimetro_m: { type: 'number' } } } },
    aberturas: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['tipo', 'largura_m', 'altura_m', 'peitoril_m', 'quantidade', 'externa'],
      properties: { tipo: { type: 'string', enum: ABE }, largura_m: { type: 'number' }, altura_m: { type: 'number' }, peitoril_m: nOuNulo, quantidade: { type: 'integer' }, externa: { type: 'boolean' } } } },
    observacoes: { type: 'array', items: { type: 'string' } }
  }
};

const INSTRUCOES = `Você lê plantas baixas de casas brasileiras para levantamento de quantitativos de obra.
Extraia da imagem somente o que a planta mostra, em metros:
- ambientes: cada cômodo com nome como escrito na planta, tipo (${AMB.join(', ')}), área interna (use a área escrita no ambiente; se não houver, calcule pelas cotas internas) e perímetro interno.
- paredes: comprimento total, medido pelo eixo, das paredes externas (contorno) e das paredes internas. Calcule pelas cotas. Não conte cotas, eixos, mobiliário, hachuras, textos ou carimbo como parede.
- contorno: área construída (externa, incluindo paredes; use o quadro de áreas se houver), perímetro externo e as dimensões externas totais (comprimento e largura).
- aberturas: agrupe portas e janelas iguais com a quantidade. Use legendas como P1 0,80×2,10 ou J1 1,20×1,20/1,00 (largura×altura/peitoril). Tipos: ${ABE.join(', ')}. Portas de banheiro e de quartos são porta_int; janelas pequenas e altas de banheiro são basculante. externa = está numa parede do contorno.
- pe_direito_m: só se estiver escrito em corte ou nota; senão null.
Se uma medida não estiver legível, estime pela escala gráfica ou pelas cotas vizinhas e registre isso em observacoes. Escreva observacoes em português, curtas.
Se a imagem não for uma planta baixa, responda e_planta_baixa=false com listas vazias e zeros.`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }); }
  if (!mesmaOrigem(req)) return res.status(403).json({ error: 'Origem não permitida.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'A leitura por IA não está configurada neste servidor (falta a variável ANTHROPIC_API_KEY no Vercel).' });
  if (!permitido(req)) return res.status(429).json({ error: 'Muitas leituras seguidas. Aguarde alguns minutos.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const image = String(body.image || '');
  const mediaType = ['image/jpeg', 'image/png', 'image/webp'].includes(body.mediaType) ? body.mediaType : 'image/jpeg';
  if (!image || image.length > 6_000_000) return res.status(400).json({ error: 'Imagem ausente ou grande demais.' });

  const client = new Anthropic();
  try {
    const msg = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
      system: INSTRUCOES,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
        { type: 'text', text: 'Faça o levantamento desta planta baixa.' }
      ] }]
    });
    if (msg.stop_reason === 'refusal') return res.status(422).json({ error: 'O modelo não conseguiu analisar esta imagem.' });
    if (msg.stop_reason === 'max_tokens') return res.status(502).json({ error: 'A resposta da leitura ficou incompleta. Tente novamente.' });
    const txt = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const dados = JSON.parse(txt);
    if (!dados.e_planta_baixa) return res.status(422).json({ error: 'A imagem não parece ser uma planta baixa. Escolha a página certa do PDF.' });
    return res.status(200).json(dados);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'Chave da API inválida no servidor.' });
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Limite de uso da API atingido. Tente mais tarde.' });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: 'Erro do serviço de IA (' + err.status + ').' });
    if (err instanceof SyntaxError) return res.status(502).json({ error: 'Resposta da IA em formato inesperado.' });
    return res.status(500).json({ error: 'Falha na leitura: ' + String(err.message || err) });
  }
};
module.exports.config = { maxDuration: 120, api: { bodyParser: { sizeLimit: '8mb' } } };
