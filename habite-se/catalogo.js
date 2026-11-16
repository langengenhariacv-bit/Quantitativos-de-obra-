/* Catálogo do checklist de vistoria para habite-se — CBMSC.
 *
 * ATENÇÃO: os critérios abaixo são um ROTEIRO DE CONFERÊNCIA redigido a partir do
 * conteúdo usual das Instruções Normativas do CBMSC; NÃO são transcrição literal das INs
 * nem da instrução de vistoria do CBMSC. Antes de usar em obra, confira cada sistema com
 * o texto vigente (portal do CBMSC > SCI > Instruções Normativas) e ajuste aqui.
 * Valores numéricos foram evitados de propósito: a referência é sempre o projeto aprovado.
 *
 * Estrutura:
 *   k      chave do sistema (não alterar depois de haver vistorias salvas)
 *   n      nome completo; curto = nome no botão
 *   ref    norma de referência impressa no relatório
 *   regra  'sempre' = já vem marcado em toda vistoria nova
 *          'manual' = só entra se o usuário marcar (depende da ocupação, do risco e do PPCI)
 *   desc   exemplo de descritivo quali-quantitativo (aparece como dica no campo do Anexo J)
 *   itens  {id, t, se?}  id único e estável; `se` = só aparece se aquele sistema estiver marcado
 */
const BASE_NORMATIVA = 'Roteiro de conferência baseado nas Instruções Normativas do CBMSC (IN 1 Partes 1 e 2 e Anexos I e J, IN 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19 e 23). Catálogo de 16/11/2026, redigido sem acesso ao texto integral das INs (portal de documentos do CBMSC em manutenção na data): confira com a versão vigente de cada IN.';

// Linhas da tabela do Anexo I da IN 1 (Relatório de conformidade), na ordem do formulário oficial,
// e os sistemas do catálogo que respondem por cada linha.
const ANEXO_I = [
  {n:'Acesso de Viaturas', k:['via']},
  {n:'Materiais de acabamento e revestimento', k:['cmar']},
  {n:'Detecção automática de incêndio', k:['det']},
  {n:'Gás combustível', k:['gas']},
  {n:'Iluminação de Emergência', k:['ilu']},
  {n:'Plano de emergência', k:['pem']},
  {n:'Proteção estrutural contra incêndio', k:['comp']},
  {n:'Brigada de incêndio', k:['bri']},
  {n:'Alarme de incêndio', k:['ala']},
  {n:'Extintores', k:['ext']},
  {n:'Hidráulico preventivo', k:['shp']},
  {n:'Instalações elétricas', k:['ele']},
  {n:'Sinalização abandono de local', k:['sin']},
  {n:'Saídas de emergência', k:['sai']},
  {n:'Outros', k:['press','fum','spk','spda','ve'], outros:true}
];
const RISCOS = ['II','III','IV','V'];

const OCUPACOES = [
  {k:'A2', n:'A-2 — Residencial multifamiliar'},
  {k:'A3', n:'A-3 — Residencial coletiva'},
  {k:'B',  n:'B — Serviços de hospedagem'},
  {k:'C',  n:'C — Comercial'},
  {k:'D',  n:'D — Serviços profissionais'},
  {k:'E',  n:'E — Educacional e cultura física'},
  {k:'F',  n:'F — Reunião de público'},
  {k:'G',  n:'G — Garagens e serviços automotivos'},
  {k:'H',  n:'H — Saúde e institucional'},
  {k:'I',  n:'I — Industrial'},
  {k:'J',  n:'J — Depósito'},
  {k:'L',  n:'L — Explosivos'},
  {k:'M',  n:'M — Especial'},
  {k:'MX', n:'Mista (mais de uma ocupação)'}
];

const CATALOGO = [
  {k:'docs', n:'Documentação do processo', ref:'IN 1 – Parte 1', itens:[
    {id:'docs1', t:'PPCI/RPCI aprovado consta no processo do imóvel (e-SCI) e a obra executada corresponde ao projeto aprovado (áreas, ocupação e leiaute).'},
    {id:'docs2', t:'DRT (ART/RRT/TRT) de execução dos sistemas e medidas de segurança contra incêndio emitido e quitado (admite-se DRT único para todos os sistemas).'},
    {id:'docs3', t:'Taxa de vistoria de habite-se paga e comprovante disponível.'},
    {id:'docs4', t:'Requerimento de vistoria e termo de responsabilidade preenchidos no e-SCI.'},
    {id:'docs5', se:'gas', t:'Laudo do teste de estanqueidade da rede de gás, com DRT.'},
    {id:'docs6', se:'ele', t:'DRT de execução/inspeção das instalações elétricas.'},
    {id:'docs7', se:'spda', t:'DRT de execução do SPDA e registro das medições/inspeção.'},
    {id:'docs8', se:'press', t:'DRT e laudo de ensaio do sistema de pressurização de escada.'},
    {id:'docs9', se:'cmar', t:'Laudos, ensaios ou declarações dos materiais de acabamento e revestimento (CMAR), quando exigidos.'},
    {id:'docs10', se:'sai', t:'Laudo do coeficiente de atrito dos pisos antiderrapantes das rotas de fuga, quando exigido.'}
  ]},
  {k:'ext', n:'Sistema preventivo por extintores', curto:'Extintores', ref:'IN 6', desc:'Ex.: 6 extintores de pó químico ABC 4 kg (2-A:20-B:C) e 1 de CO2 6 kg, instalados conforme PPCI.', regra:'sempre', itens:[
    {id:'ext1', t:'Extintores instalados nos locais, quantidades, tipos e capacidades extintoras previstos no projeto aprovado.'},
    {id:'ext2', t:'Altura de instalação: alça a no máximo 1,60 m do piso, ou extintor sobre suporte de piso.'},
    {id:'ext3', t:'Local visível, de fácil acesso e desobstruído, com a sinalização do extintor instalada.'},
    {id:'ext4', t:'Carga dentro da validade, manômetro na faixa de operação, lacre e pino de segurança íntegros.'},
    {id:'ext5', t:'Selo de conformidade do Inmetro presente e teste hidrostático do cilindro dentro da validade.'},
    {id:'ext6', t:'Bom estado externo: sem corrosão ou amassados, mangueira, difusor e gatilho íntegros.'},
    {id:'ext7', t:'Agente extintor compatível com o risco protegido (casa de máquinas, quadros elétricos, central de gás, garagem etc.).'},
    {id:'ext8', t:'Todos os pavimentos e riscos especiais atendidos, respeitada a distância máxima a percorrer do projeto.'}
  ]},
  {k:'shp', n:'Sistema hidráulico preventivo', curto:'Hidrantes (SHP)', ref:'IN 7', desc:'Ex.: 4 hidrantes com mangueiras de 40 mm x 30 m, RTI de 12.000 L e bomba de 5 cv.', regra:'manual', itens:[
    {id:'shp1', t:'Hidrantes ou mangotinhos instalados nos locais e quantidades do projeto aprovado.'},
    {id:'shp2', t:'Abrigos completos e sinalizados: mangueiras (tipo, diâmetro e comprimento do projeto), esguicho e chave de mangueira; acesso desobstruído.'},
    {id:'shp3', t:'Mangueiras com marcação de conformidade, acondicionadas corretamente e sem danos.'},
    {id:'shp4', t:'Registros (válvulas) dos hidrantes operando, com adaptador e tampão de engate rápido.'},
    {id:'shp5', t:'Tubulação aparente identificada na cor prevista na IN 7, bem fixada e sem vazamentos.'},
    {id:'shp6', t:'Reserva técnica de incêndio com o volume do projeto e garantida contra o consumo predial.'},
    {id:'shp7', t:'Bomba de incêndio (quando prevista): instalada conforme projeto, com acionamento automático e manual, alimentação elétrica independente e painel identificado.'},
    {id:'shp8', t:'Teste de funcionamento: pressão e vazão compatíveis com o projeto no hidrante mais desfavorável.'},
    {id:'shp9', t:'Registro de recalque no passeio ou fachada, sinalizado, com tampa e acessível à viatura.'},
    {id:'shp10', t:'Válvula de retenção e registros de manobra instalados, acessíveis e na posição de operação.'}
  ]},
  {k:'gas', n:'Instalações de gás combustível', curto:'Gás (GLP/GN)', ref:'IN 8', desc:'Ex.: central de GLP com 2 P-45, rede em cobre e teste de estanqueidade aprovado.', regra:'manual', itens:[
    {id:'gas1', t:'Central de GLP ou abrigo de medidores no local e com a capacidade do projeto; afastamentos de segurança respeitados.'},
    {id:'gas2', t:'Central ventilada, com fechamento conforme projeto, sinalização de perigo/proibido fumar e extintor.'},
    {id:'gas3', t:'Rede de distribuição conforme projeto, identificada, protegida contra danos e sem passar por locais não permitidos.'},
    {id:'gas4', t:'Reguladores de pressão, registros de corte (geral, por unidade e por aparelho) e medidores instalados e acessíveis.'},
    {id:'gas5', t:'Ventilação permanente (superior e inferior) nos ambientes com aparelhos a gás, conforme projeto.'},
    {id:'gas6', t:'Aquecedores a gás com chaminé/exaustão para o exterior, conforme projeto.'},
    {id:'gas7', t:'Pontos de consumo sem aparelho instalado tamponados (plugados).'},
    {id:'gas8', t:'Teste de estanqueidade da rede realizado, sem vazamentos.'}
  ]},
  {k:'sai', n:'Sistema de saídas de emergência', curto:'Saídas de emergência', ref:'IN 9', desc:'Ex.: 2 saídas com portas de 1,60 m abrindo no sentido de fuga; rotas livres e desobstruídas.', regra:'sempre', itens:[
    {id:'sai1', t:'Rotas de fuga livres e desobstruídas, com larguras de corredores, escadas, rampas e portas conforme projeto aprovado.'},
    {id:'sai2', t:'Escadas do tipo previsto no projeto (comum, protegida, enclausurada ou à prova de fumaça), executadas conforme aprovado.'},
    {id:'sai3', t:'Degraus uniformes (piso e espelho conforme projeto) e com piso antiderrapante.'},
    {id:'sai4', t:'Corrimãos contínuos e firmes, nos lados previstos, com altura conforme IN 9.'},
    {id:'sai5', t:'Guarda-corpos com altura e vãos conforme IN 9, firmes e sem elementos escaláveis.'},
    {id:'sai6', t:'Portas das rotas de fuga abrindo no sentido da saída e com barra antipânico onde previsto; sem trancas que impeçam a saída.'},
    {id:'sai7', t:'Portas corta-fogo com identificação do fabricante/selo, fechamento automático, sem travas e com vedação adequada.'},
    {id:'sai8', t:'Antecâmaras, dutos de entrada e saída de ar e aberturas de ventilação das escadas conforme projeto.'},
    {id:'sai9', t:'Descarga das escadas conduzindo ao exterior, com saída final desobstruída.'},
    {id:'sai10', t:'Área de refúgio, local para resgate ou elevador de emergência executados conforme projeto, quando previstos.'}
  ]},
  {k:'press', n:'Pressurização de escada', curto:'Pressurização', ref:'IN 9 / NBR 14880', regra:'manual', itens:[
    {id:'press1', t:'Ventiladores, dutos, grelhas e tomada de ar externo instalados conforme projeto.'},
    {id:'press2', t:'Acionamento automático pelo sistema de detecção/alarme e acionamento manual funcionando.'},
    {id:'press3', t:'Fonte de energia de emergência (gerador) instalada e operando conforme projeto.'},
    {id:'press4', t:'Ensaio de pressão/velocidade do ar realizado, com laudo.'}
  ]},
  {k:'fum', n:'Sistema de controle de fumaça', curto:'Controle de fumaça', ref:'IN 10', regra:'manual', itens:[
    {id:'fum1', t:'Aberturas, exaustores, dutos e barreiras de fumaça instalados conforme projeto aprovado.'},
    {id:'fum2', t:'Acionamento automático e manual do sistema funcionando.'},
    {id:'fum3', t:'Alimentação elétrica de emergência conforme projeto.'},
    {id:'fum4', t:'Teste de funcionamento realizado e documentado.'}
  ]},
  {k:'ilu', n:'Sistema de iluminação de emergência', curto:'Iluminação de emergência', ref:'IN 11', desc:'Ex.: 12 blocos autônomos de LED com autonomia de 2 h nas rotas de fuga e saídas.', regra:'sempre', itens:[
    {id:'ilu1', t:'Luminárias instaladas nos locais e quantidades do projeto (rotas de fuga, escadas, mudanças de direção, halls, garagens e áreas técnicas).'},
    {id:'ilu2', t:'Teste de funcionamento: as luminárias acendem automaticamente na falta de energia (desligando o circuito).'},
    {id:'ilu3', t:'Autonomia mínima conforme IN 11 verificada (teste de descarga).'},
    {id:'ilu4', t:'Blocos autônomos ligados a circuito permanentemente energizado, ou central de baterias em local adequado conforme projeto.'},
    {id:'ilu5', t:'Iluminamento suficiente em toda a rota de fuga, sem trechos escuros.'},
    {id:'ilu6', t:'Luminárias íntegras e bem fixadas.'}
  ]},
  {k:'ala', n:'Sistema de alarme de incêndio', curto:'Alarme', ref:'IN 12', desc:'Ex.: central de alarme endereçável, 6 acionadores manuais e 6 sirenes audiovisuais.', regra:'manual', itens:[
    {id:'ala1', t:'Central de alarme instalada no local previsto no projeto, identificada e com fonte de alimentação auxiliar (baterias).'},
    {id:'ala2', t:'Acionadores manuais nos locais do projeto, em altura adequada, sinalizados e desobstruídos.'},
    {id:'ala3', t:'Avisadores sonoros e visuais instalados conforme projeto e audíveis em toda a edificação.'},
    {id:'ala5', t:'Teste de funcionamento: o acionamento é indicado corretamente na central (setor/laço) e dispara os avisadores.'},
    {id:'ala6', t:'Central sem indicação de falha e operando pelas baterias na falta de energia.'},
    {id:'ala7', t:'Infraestrutura e fiação conforme projeto (eletrodutos e circuito exclusivos).'}
  ]},
  {k:'det', n:'Sistema de detecção automática de incêndio', curto:'Detecção automática', ref:'IN 12', regra:'manual', itens:[
    {id:'ala4', t:'Detectores instalados nos ambientes previstos no projeto, com tipo e espaçamento conforme aprovado.'},
    {id:'det2', t:'Teste de funcionamento: a atuação do detector é indicada corretamente na central e dispara os avisadores.'},
    {id:'det3', t:'Detectores limpos, sem capas de proteção de obra e sem obstruções.'}
  ]},
  {k:'sin', n:'Sinalização para abandono de local', curto:'Sinalização', ref:'IN 13', desc:'Ex.: 9 placas fotoluminescentes de saída e orientação, mais sinalização dos extintores.', regra:'sempre', itens:[
    {id:'sin1', t:'Placas de saída instaladas nas rotas de fuga, sobre as portas e nas mudanças de direção, indicando o sentido correto, conforme projeto.'},
    {id:'sin2', t:'Placas fotoluminescentes ou luminosas no padrão da IN 13 (dimensões, cores e símbolos).'},
    {id:'sin3', t:'Placas visíveis de qualquer ponto da rota, na altura de instalação prevista na IN 13.'},
    {id:'sin4', t:'Indicação do número do pavimento no interior das escadas.'},
    {id:'sin5', t:'Sinalização dos equipamentos (extintores, hidrantes, acionadores de alarme) e das portas corta-fogo.'},
    {id:'sin6', t:'Sinalização de proibição e de risco onde prevista (elevadores, central de gás, casa de bombas, quadros elétricos).'}
  ]},
  {k:'comp', n:'Compartimentação, proteção estrutural e isolamento de risco', curto:'Compartimentação / TRRF', ref:'IN 14', regra:'manual', itens:[
    {id:'comp1', t:'Compartimentação horizontal e vertical (paredes, lajes e fachadas) executada conforme projeto aprovado.'},
    {id:'comp2', t:'Selagem corta-fogo de shafts, prumadas, dutos e passagens de instalações entre pavimentos e compartimentos.'},
    {id:'comp3', t:'Portas e demais elementos corta-fogo de compartimentação instalados, identificados e funcionando.'},
    {id:'comp4', t:'Afastamento ou isolamento entre edificações conforme projeto.'},
    {id:'comp5', t:'Elementos estruturais com o tempo de resistência ao fogo (TRRF) do projeto; proteção passiva aplicada e documentada, quando prevista.'}
  ]},
  {k:'spk', n:'Sistema de chuveiros automáticos', curto:'Chuveiros automáticos', ref:'IN 15', regra:'manual', itens:[
    {id:'spk1', t:'Chuveiros instalados em todas as áreas previstas, com tipo, temperatura e espaçamento do projeto, sem obstruções.'},
    {id:'spk2', t:'Válvula de governo e alarme instalada, identificada, com manômetros e registros na posição de operação.'},
    {id:'spk3', t:'Bombas, reserva de água e registro de recalque conforme projeto.'},
    {id:'spk4', t:'Teste de funcionamento (dreno/ensaio) com acionamento do alarme de fluxo.'},
    {id:'spk5', t:'Chuveiros sobressalentes e chave de instalação disponíveis.'}
  ]},
  {k:'cmar', n:'Controle de materiais de acabamento e revestimento', curto:'Materiais (CMAR)', ref:'IN 18', regra:'manual', itens:[
    {id:'cmar1', t:'Materiais de piso, parede/divisória e teto/forro das rotas de fuga e saídas de emergência conforme as classes do projeto aprovado.'},
    {id:'cmar2', t:'Ausência de materiais combustíveis não previstos no projeto nas rotas de fuga (forros, espumas, revestimentos e decoração).'},
    {id:'cmar3', t:'Documentação dos materiais aplicados (ensaios, laudos ou declarações do fabricante) disponível.'}
  ]},
  {k:'ele', n:'Instalações elétricas de baixa tensão', curto:'Instalações elétricas', ref:'IN 19', regra:'manual', itens:[
    {id:'ele1', t:'Quadros de distribuição identificados, com barreiras de proteção, sem partes vivas expostas e com circuitos identificados.'},
    {id:'ele2', t:'Dispositivos de proteção (disjuntores, DR e DPS) instalados conforme projeto.'},
    {id:'ele3', t:'Condutores em eletrodutos, eletrocalhas ou canaletas; sem fiação exposta nem emendas improvisadas.'},
    {id:'ele4', t:'Aterramento e equipotencialização executados conforme projeto.'},
    {id:'ele5', t:'Circuitos dos sistemas de segurança (bomba de incêndio, iluminação de emergência, alarme) independentes e identificados.'}
  ]},
  {k:'spda', n:'Sistema de proteção contra descargas atmosféricas', curto:'SPDA', ref:'IN 1 – Parte 2 / NBR 5419', regra:'manual', itens:[
    {id:'spda1', t:'Subsistemas de captação, descidas e aterramento executados conforme projeto.'},
    {id:'spda2', t:'Conexões, fixações e condutores íntegros e contínuos.'},
    {id:'spda3', t:'Equipotencialização das massas metálicas e caixas de inspeção acessíveis.'}
  ]},
  {k:'via', n:'Acesso de viaturas na edificação', curto:'Acesso de viaturas', ref:'IN 1 – Parte 2', regra:'manual', itens:[
    {id:'via1', t:'Via de acesso e portão com largura e altura livres conforme projeto, desobstruídos.'},
    {id:'via2', t:'Viatura alcança o registro de recalque e as fachadas previstas no projeto.'}
  ]},
  {k:'pem', n:'Plano de emergência', ref:'IN 1 – Parte 2', regra:'manual', itens:[
    {id:'pem1', t:'Plano de emergência elaborado e disponível, quando exigido para a ocupação.'}
  ]},
  {k:'bri', n:'Brigada de incêndio', ref:'IN 1 – Parte 2', regra:'manual', itens:[
    {id:'pem2', t:'Brigada de incêndio dimensionada e treinada, com comprovação, quando exigida (em geral, na vistoria de funcionamento).'}
  ]},
  {k:'ve', n:'Pontos de recarga de veículos elétricos', curto:'Recarga de veículos elétricos', ref:'IN 23', regra:'manual', itens:[
    {id:'ve1', t:'Pontos de recarga instalados nos locais e na quantidade do projeto aprovado.'},
    {id:'ve2', t:'Dispositivos de proteção e de desligamento de emergência instalados, identificados e acessíveis.'},
    {id:'ve3', t:'Sinalização e medidas de proteção previstas na IN 23 implantadas.'}
  ]}
];
