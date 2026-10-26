// Imita o Conferir-Projeto.ps1: recebe os mesmos argumentos e devolve uma linha JSON.
const a = process.argv.slice(2);
const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
const arquivo = val('-Arquivo');
const espera = Number(process.env.ESPERA_MS || 50);
const marca = process.env.MARCA;
if (marca) require('fs').appendFileSync(marca, `inicio ${arquivo}\n`);
setTimeout(() => {
  if (marca) require('fs').appendFileSync(marca, `fim ${arquivo}\n`);
  if (arquivo.includes('falha')) { process.stderr.write('AutoCAD nao abriu'); process.exit(1); }
  console.log('log qualquer');
  console.log(JSON.stringify({
    ok: true, pasta: 'C:/saida', corrigido: a.includes('-SomenteConferir') ? null : 'C:/saida/x-CORRIGIDO.dwg',
    relatorio_txt: 'C:/saida/relatorio.txt',
    relatorio: { camadas: { camadas_fora_do_padrao: [{ camada: 'LANG-PA-PL-PAREDE' }], objetos_com_espessura_propria: 3 },
      cotas: { cotas_movidas: [{}, {}], cotas_com_colisao_sem_solucao: null },
      esquadrias: { material_preenchido: null, material_a_definir: [{}] },
      pendencias: { usa_fossa: null, campos_a_definir: [{}, {}, {}], objetos_na_camada_0: 0 },
      material: val('-Material') || null }
  }));
}, espera);
