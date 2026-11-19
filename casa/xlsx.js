/* Lang Quantitativos — gerador mínimo de planilha .xlsx (Office Open XML) sem dependências.
 * gerarXlsx([{ nome, colunas:[larguras], linhas:[[celula,...]], congelar:1, filtro:true }]) -> Uint8Array
 * celula: string | number | null | { v, f (fórmula sem '='), s ('cab'|'num'|'int'|'txt'|'neg'|'pct') }
 */
(function (root) {
  'use strict';
  const ESTILOS = { padrao: 0, cab: 1, num: 2, int: 3, txt: 4, neg: 5, pct: 6, tit: 7 };
  const escXml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  const col = (i) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };

  function planilhaXml(p) {
    const linhas = p.linhas || [];
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
    if (p.congelar) xml += '<sheetViews><sheetView workbookViewId="0"><pane ySplit="' + p.congelar + '" topLeftCell="A' + (p.congelar + 1) + '" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>';
    if (p.colunas && p.colunas.length) xml += '<cols>' + p.colunas.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols>';
    xml += '<sheetData>';
    let maxC = 0;
    linhas.forEach((ln, r) => {
      xml += '<row r="' + (r + 1) + '">';
      ln.forEach((c, ci) => {
        if (c == null || c === '') return;
        maxC = Math.max(maxC, ci + 1);
        const ref = col(ci) + (r + 1);
        const o = typeof c === 'object' ? c : { v: c };
        const s = ESTILOS[o.s] != null ? ESTILOS[o.s] : typeof o.v === 'number' ? ESTILOS.num : 0;
        const st = s ? ' s="' + s + '"' : '';
        if (o.f) {
          const v = typeof o.v === 'number' && Number.isFinite(o.v) ? '<v>' + o.v + '</v>' : '';
          xml += '<c r="' + ref + '"' + st + '><f>' + escXml(o.f) + '</f>' + v + '</c>';
        } else if (typeof o.v === 'number' && Number.isFinite(o.v)) xml += '<c r="' + ref + '"' + st + '><v>' + o.v + '</v></c>';
        else xml += '<c r="' + ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' + escXml(o.v == null ? '' : o.v) + '</t></is></c>';
      });
      xml += '</row>';
    });
    xml += '</sheetData>';
    if (p.filtro && linhas.length > 1 && maxC) xml += '<autoFilter ref="A' + (p.congelar || 1) + ':' + col(maxC - 1) + linhas.length + '"/>';
    xml += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/>';
    return xml + '</worksheet>';
  }

  const ESTILOS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0%"/></numFmts>' +
    '<fonts count="4"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF171717"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFE5E0DA"/></bottom><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="8">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>' +
    '<xf numFmtId="3" fontId="2" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>' +
    '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  function gerarXlsx(planilhas) {
    const arquivos = [];
    const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      planilhas.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>';
    arquivos.push(['[Content_Types].xml', ct]);
    arquivos.push(['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']);
    arquivos.push(['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      planilhas.map((p, i) => '<sheet name="' + escXml(p.nome.slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>']);
    arquivos.push(['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      planilhas.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') +
      '<Relationship Id="rId' + (planilhas.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>']);
    arquivos.push(['xl/styles.xml', ESTILOS_XML]);
    planilhas.forEach((p, i) => arquivos.push(['xl/worksheets/sheet' + (i + 1) + '.xml', planilhaXml(p)]));
    return zipar(arquivos);
  }

  // ---- ZIP sem compressão (método 0)
  const TAB = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TAB[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function utf8(s) { return new TextEncoder().encode(s); }
  function zipar(arquivos) {
    const partes = [], central = []; let off = 0;
    const d = new Date(); const tempo = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1); const data = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const [nome, conteudo] of arquivos) {
      const n = utf8(nome), dados = typeof conteudo === 'string' ? utf8(conteudo) : conteudo, crc = crc32(dados);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, tempo, true); h.setUint16(12, data, true); h.setUint32(14, crc, true); h.setUint32(18, dados.length, true); h.setUint32(22, dados.length, true);
      h.setUint16(26, n.length, true); h.setUint16(28, 0, true);
      partes.push(new Uint8Array(h.buffer), n, dados);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, tempo, true); c.setUint16(14, data, true); c.setUint32(16, crc, true); c.setUint32(20, dados.length, true); c.setUint32(24, dados.length, true);
      c.setUint16(28, n.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), n);
      off += 30 + n.length + dados.length;
    }
    const tamCentral = central.reduce((s, p) => s + p.length, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true); fim.setUint32(12, tamCentral, true); fim.setUint32(16, off, true);
    const tudo = partes.concat(central, [new Uint8Array(fim.buffer)]);
    const out = new Uint8Array(tudo.reduce((s, p) => s + p.length, 0)); let k = 0;
    for (const p of tudo) { out.set(p, k); k += p.length; }
    return out;
  }

  const API = { gerarXlsx, col };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.Xlsx = API;
})(typeof self !== 'undefined' ? self : this);
