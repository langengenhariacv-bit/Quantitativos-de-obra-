/* Sistemas e medidas de segurança contra incêndio, na ordem da tabela do Anexo I da IN 1 do CBMSC
 * (Relatório de conformidade e termo de responsabilidade — atestado para habite-se).
 *   k       chave (não alterar depois de haver vistorias salvas)
 *   n       nome exatamente como aparece no formulário oficial
 *   basico  já vem marcado como existente em toda vistoria nova
 *   desc    exemplo de descritivo quali-quantitativo para o Anexo J
 */
const SISTEMAS = [
  {k:'via',  n:'Acesso de Viaturas', desc:'Ex.: portão de 4,00 m de largura e via interna livre até o bloco.'},
  {k:'cmar', n:'Materiais de acabamento e revestimento', desc:'Ex.: piso cerâmico, paredes em alvenaria pintada e forro de gesso nas rotas de fuga.'},
  {k:'det',  n:'Detecção automática de incêndio', desc:'Ex.: 24 detectores de fumaça endereçáveis ligados à central de alarme.'},
  {k:'gas',  n:'Gás combustível', desc:'Ex.: central de GLP com 2 P-45, rede em cobre e teste de estanqueidade aprovado.'},
  {k:'ilu',  n:'Iluminação de Emergência', basico:true, desc:'Ex.: 12 blocos autônomos de LED com autonomia de 2 h nas rotas de fuga e saídas.'},
  {k:'pem',  n:'Plano de emergência', desc:'Ex.: plano de emergência elaborado e disponível na portaria.'},
  {k:'comp', n:'Proteção estrutural contra incêndio', desc:'Ex.: estrutura em concreto armado com TRRF de 60 min conforme projeto.'},
  {k:'bri',  n:'Brigada de incêndio', desc:'Ex.: 4 brigadistas treinados, com certificados válidos.'},
  {k:'ala',  n:'Alarme de incêndio', desc:'Ex.: central de alarme, 6 acionadores manuais e 6 sirenes audiovisuais.'},
  {k:'ext',  n:'Extintores', basico:true, desc:'Ex.: 6 extintores de pó químico ABC 4 kg e 1 de CO2 6 kg, instalados conforme PPCI.'},
  {k:'shp',  n:'Hidráulico preventivo', desc:'Ex.: 4 hidrantes com mangueiras de 40 mm x 30 m, RTI de 12.000 L e bomba de 5 cv.'},
  {k:'ele',  n:'Instalações elétricas', desc:'Ex.: quadros com DR e DPS, circuitos identificados e aterramento conforme projeto.'},
  {k:'sin',  n:'Sinalização abandono de local', basico:true, desc:'Ex.: 9 placas fotoluminescentes de saída e orientação nas rotas de fuga.'},
  {k:'sai',  n:'Saídas de emergência', basico:true, desc:'Ex.: 2 saídas com portas de 1,60 m abrindo no sentido de fuga; rotas livres.'},
  {k:'out',  n:'Outros', outros:true, desc:'Ex.: SPDA com 4 descidas e malha de aterramento conforme projeto.'}
];
const RISCOS = ['II','III','IV','V'];
const OCUPACOES = ['A-2 [residencial multifamiliar]','A-3 [residencial coletiva]','B-1 [hospedagem]','C-1 [comércio]','C-2 [comércio]','D-1 [serviços profissionais]','E-1 [educacional]','F-2 [reunião de público]','F-8 [restaurante]','G-1 [garagem]','G-4 [oficina]','H-3 [saúde]','I-1 [indústria]','I-2 [indústria]','J-2 [depósito]','J-3 [depósito]'];
