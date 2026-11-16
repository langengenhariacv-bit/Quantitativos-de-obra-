/* Leitura do "Atestado de Aprovação de Projeto" emitido pelo e-SCI do CBMSC (PDF digital).
 * Tudo acontece no aparelho: o PDF não é enviado a nenhum servidor. */

// nomes de sistema do atestado -> chave em SISTEMAS (catalogo.js)
const MAPA_SISTEMAS = [
  [/ilumina..o de emerg.ncia/i, 'ilu'], [/extintor/i, 'ext'], [/g.s combust.vel|\bGLP\b/i, 'gas'],
  [/sinaliza..o/i, 'sin'], [/sa.das? de emerg.ncia/i, 'sai'], [/hidr.ulico preventivo|hidrante/i, 'shp'],
  [/detec..o/i, 'det'], [/alarme/i, 'ala'], [/plano de emerg.ncia/i, 'pem'], [/brigada/i, 'bri'],
  [/acesso de viatura/i, 'via'], [/materia(l|is) de (acabamento|revestimento)|\bCMAR\b/i, 'cmar'],
  [/instala..es el.tricas/i, 'ele'], [/prote..o estrutural|\bTRRF\b|compartimenta..o/i, 'comp']
];

// extrai as linhas de texto do PDF, reconstruídas pela posição de cada trecho
async function lerPdfTexto(file){
  const pdfjs = await import('./vendor/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.mjs';
  const doc = await pdfjs.getDocument({data: await file.arrayBuffer()}).promise;
  const linhas = [];
  for (let n = 1; n <= doc.numPages; n++){
    const tc = await (await doc.getPage(n)).getTextContent(), rows = [];
    for (const it of tc.items){
      if (!it.str || !it.str.trim()) continue;
      const x = it.transform[4], y = it.transform[5];
      let r = rows.find(r => Math.abs(r.y - y) < 2.5);
      if (!r) rows.push(r = {y, parts: []});
      r.parts.push({x, s: it.str});
    }
    rows.sort((a, b) => b.y - a.y).forEach(r => linhas.push(r.parts.sort((a, b) => a.x - b.x).map(p => p.s).join(' ').replace(/\s+/g, ' ').trim()));
  }
  return linhas.join('\n');
}

// interpreta o texto do atestado; devolve só o que encontrou
function parseAtestado(t){
  t = String(t).replace(/[ \t]+:/g, ':');             // o leitor pode separar o rótulo dos dois-pontos
  const g = (re, i = 1) => { const m = t.match(re); return m ? m[i].trim() : ''; };
  const o = {campos: {}, sistemas: [], outros: [], avisos: []};
  if (!/ATESTADO DE APROVA..O DE PROJETO/i.test(t)) o.avisos.push('O arquivo não parece ser um Atestado de Aprovação de Projeto do CBMSC; confira os dados puxados.');
  const c = o.campos;
  c.re = g(/Registro de Endere.o \(RE\):\s*(\S+)/i);
  const blocos = [...t.matchAll(/^3\.3\.\d+\.\s*(.+)$/gm)].map(m => m[1].trim()).filter(Boolean);
  c.empreendimento = blocos.join(' / ') || g(/Nome da Edifica..o:\s*(.+)/i);
  const log = g(/Logradouro p.blico:\s*(.*?)\s*N.:/i), nro = g(/Logradouro p.blico:.*?N.:[ \t]*([^\n]*)/i);
  c.endereco = [log, nro].filter(Boolean).join(', ');
  c.bairro = g(/Bairro:\s*(.*?)\s*Munic.pio:/i);
  c.cidade = g(/Munic.pio:\s*(.*?)\s*CEP:/i).replace(/\s*\/\s*[A-Z]{2}$/, '');
  c.cep = g(/CEP:\s*(\d{5}-?\d{3})/i);
  const resp = t.match(/RESPONS.VEIS PELO IM.VEL[\s\S]*?\n\s*1\s+(.+?)\s+((?:\d{3}\.\d{3}\.\d{3}-\d{2})|(?:\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})|(?:[\d*]{3}\.[\d*]{3}\.[\d*]{3}-[\d*]{2}))\s*$/m);
  if (resp){ c.rNome = resp[1].trim(); if (!/\*/.test(resp[2])){ c.rDoc = resp[2]; c.cnpj = resp[2]; } }
  c.blocos = g(/N. de Blocos:\s*(\d+)/i);
  const area = g(/.rea total da solicita..o:\s*([\d.]+,\d+|\d+)/i);
  if (area) c.area = area.replace(/\./g, '').replace(',', '.');
  c.risco = g(/Risco do processo:\s*(?:Risco\s*)?(II|III|IV|V)\b/);
  const pavs = [...t.matchAll(/N. de pavimentos:\s*(\d+)/gi)].map(m => +m[1]);
  if (pavs.length) c.pavimentos = String(Math.max(...pavs));
  const ocs = [...new Set([...t.matchAll(/\b([A-M]-\d{1,2})\s*\[([^\]]+)\]/g)].map(m => m[1] + ' [' + m[2].trim() + ']'))];
  c.ocupacao = ocs.join(', ');
  for (const k in c) if (!c[k]) delete c[k];
  // 3.1 sistemas e medidas aprovados: "( x ) Nome"
  const sec = (t.match(/3\.1\.[^\n]*\n([\s\S]*?)(?:\n[^\n]*3\.2\.|\n3\.3\.|$)/) || [])[1] || '';
  const partes = sec.split(/\(\s*([xX]?)\s*\)/);          // [antes, marca, nome, marca, nome, ...]
  for (let i = 1; i < partes.length; i += 2){
    const nome = (partes[i + 1] || '').replace(/\s+/g, ' ').replace(/^[-> ]+|[-> ]+$/g, '').trim();
    if (!partes[i] || !nome) continue;
    const hit = MAPA_SISTEMAS.find(([re]) => re.test(nome));
    if (hit){ if (!o.sistemas.includes(hit[1])) o.sistemas.push(hit[1]); } else o.outros.push(nome);
  }
  const res = g(/Resultado\s*:\s*(\S+)/i);
  if (res && !/^DEFERIDO$/i.test(res)) o.avisos.push('Resultado da solicitação no atestado: ' + res + '.');
  o.protocoloProjeto = g(/Protocolo:\s*(\S+)/i);
  return o;
}
if (typeof module !== 'undefined') module.exports = {parseAtestado};
