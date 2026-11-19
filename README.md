# LANG Quantitativos — versão revisada

Aplicativo de levantamento preliminar e conferência de quantitativos de construção.

## Como usar

1. Abra o link publicado em Vercel. O leitor local de PDF acompanha o aplicativo e funciona como fallback; na versão v4.6, a leitura semântica por IA usa a rota server-side `/api/analyze-plan`, sem expor credenciais no navegador.
2. Informe área construída, pavimentos, unidades, sistemas e acabamentos. Confira os coeficientes: valores iniciais são hipóteses de orçamento.
3. Carregue PDF, JPG, PNG ou WebP. O app seleciona as páginas mais prováveis de conter planta baixa, rasteriza em alta definição e solicita leitura multimodal estruturada ao GPT-5.6 Sol. Calibre com dois pontos de uma cota conhecida quando a escala não puder ser confirmada.
4. Confira as marcações automáticas. Corrija paredes omitidas manualmente; escolha somar ou substituir a leitura. Não desenhe novamente uma parede já detectada no modo somar.
5. Em imagens sem texto, informe os ambientes e suas áreas. A ferramenta de polígono mede área de piso após a calibração. Fotografias em perspectiva não são métricas sem retificação prévia.
6. Informe quantidades de projetos complementares quando existirem. Para o levantamento preliminar, o app aplica as premissas estruturais configuradas: sapatas, vigas e pilares são desdobrados em concreto, barras/comprimentos de aço, massa de aço e fôrmas. Quantidades informadas pelo usuário substituem as estimativas automáticas.
7. Calcule, confira materiais e escopo. Exporte CSV, relatório ou backup JSON. O backup preserva dados e parâmetros; o arquivo original da planta precisa ser anexado novamente para visualizar. Reanexar arquivo de mesmo nome preserva correções manuais.

## Alterações

- Inicialização independente do leitor PDF e tratamento de erros de importação.
- PDF.js 4.10.38 incorporado; JPG/PNG/WebP continuam funcionando sem ele.
- Calibração por página, atualização de paredes manuais após mudança de escala e fallback de detecção de linhas para PDF preto e branco.
- Leitura automática explicitamente preliminar; sem alegação de precisão percentual comprovada.
- Medição de área por polígono, cadastro de ambientes e perímetro real opcional.
- Quantificação de concreto por volume e aço pela seção, comprimento, quantidade e massa específica de 7.850 kg/m³.
- Substituição de estimativas por entradas complementares sem duplicidade; quantidade confirmada para qualquer componente, incluindo zero explícito.
- Cimento e areia de contrapiso, argamassa e rejunte de paredes, impermeabilizante, arame recozido, desmoldante e espaçadores com coeficientes editáveis.
- Correção de escadas indevidas em edificação térrea e respeito às opções de pintura e revestimento.
- Exportação CSV, pesquisa de materiais, recuperação de dados locais inválidos e conservação dos parâmetros no backup.
- Cache com caminho relativo, compatível com publicação em subpastas.
- v4.5: filtro de cotas reforçado por espessura/conectividade e preferência pela malha estrutural filtrada; sapatas/pilares podem ser estimados pelos apoios da malha e vigas pelo comprimento reconhecido de paredes.
- v4.5: padrão paramétrico estrutural adotado quando não houver substituição manual: sapata 1,00×1,00 m com Ø10 c/15 cm e dobra 15 cm; vigas 12×40 cm com 2Ø10 inferiores + 2Ø8 superiores; pilares 12×35 cm com 4Ø10.
- v4.6: leitura multimodal server-side via Vercel AI Gateway e GPT-5.6 Sol. O prompt proíbe explicitamente interpretar cotas, eixos, chamadas, textos, mobiliário, hachuras, carimbo e moldura como paredes.
- v4.6: saída da IA usa JSON Schema rígido para área, paredes, ambientes, vãos, estrutura, acabamentos, confiança, base da medição e avisos. Dados sem evidência devem retornar `null`, não um valor inventado.
- v4.6: o algoritmo geométrico local permanece como conferência e fallback. Divergências relevantes podem disparar uma segunda leitura no modelo de produção.
- v4.6: falha em uma página não invalida as páginas já lidas; falha do serviço de IA mantém automaticamente a leitura geométrica local.
- v4.7: modo gratuito sem API paga: botão **1. Preparar para análise no ChatGPT** compartilha a planta (quando o navegador permite) e copia o prompt padronizado; botão **2. Importar resultado do ChatGPT** recebe `ANALISE_LANG.json` e aplica paredes, áreas, ambientes, vãos e estrutura ao quantitativo.
- v4.7: o upload não chama mais o AI Gateway automaticamente. Sem `ANALISE_LANG.json`, a leitura geométrica local é apenas auxiliar e não pode assumir silenciosamente o comprimento de paredes no cálculo.

## Alcance e limitações

O catálogo original contempla as etapas principais e componentes opcionais. Nenhuma planta arquitetônica contém todos os insumos executivos. Componentes sem base mensurável ficam identificados para conferência; ausência de dados não significa ausência do componente. Somente sistemas expressamente desligados ou quantidade zero confirmada são tratados como excluídos quando há essa informação.

Os índices históricos do código original foram preservados como cenários de referência. Não há validação estatística de sua adequação à obra atual. Quantidades de estrutura, fundação e instalações devem ser conferidas e substituídas pelos projetos respectivos quando disponíveis. As premissas estruturais do app são critérios paramétricos de quantitativo, não cálculo estrutural executivo. Estribos, cobrimentos, ancoragens e emendas não são inventados quando não houver parâmetro.

A leitura principal v4.6 combina compreensão multimodal da prancha com análise geométrica local. O leitor local de pixels/linhas continua sujeito a omissões e falsos positivos; por isso a IA recebe instrução específica para distinguir paredes reais de cotas, textos, mobiliário, hachuras, eixos e carimbos. Ainda assim, o resultado é quantitativo preliminar e deve ser conferido quando houver projeto executivo.

Os dados do projeto continuam salvos no navegador/dispositivo. Na versão publicada, as imagens das páginas selecionadas são enviadas temporariamente ao backend Vercel para análise pelo modelo via AI Gateway; não são enviadas para esta conversa do ChatGPT. Limpar dados do navegador remove o projeto; exporte backup.

## Validação desta entrega

Em 27/09/2026 foi executada uma bateria atualizada sobre a base fixa de projetos públicos da internet:

- **50/50** casos passaram no runner geométrico/fallback `/api/regression100`.
- Qualidade média do runner nesses 50 casos: **0,9425**; mediana **0,9515**; faixa **0,787–0,998**.
- Na checagem direta das fontes, **52 de 55** imagens foram baixadas e decodificadas como JPEG, PNG ou WebP. Três respostas rápidas do Wikimedia retornaram HTTP 429; o runner principal possui retry/backoff e os mesmos casos passaram posteriormente.
- A rota de IA foi publicada e sua autenticação OIDC foi validada (`auth: true`, `authType: oidc`).
- A primeira inferência real pelo AI Gateway recebeu HTTP 403 porque a conta Vercel ainda exige cadastro de cartão para liberar requisições/créditos. Por isso, **não há alegação de 50 inferências de IA executadas**. O app mantém o fallback local até a cobrança do Gateway ser habilitada.
- Resultado detalhado e auditável em `AI_INTEGRATION_TEST_50_2026-09-27.json`.

A bateria mede robustez do carregamento, decodificação e reconhecimento geométrico; não constitui certificação de exatidão métrica contra projeto estrutural executivo.

## Referências

- CAIXA/SINAPI, finalidade das composições paramétricas: https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx
- Sika, execução de contrapiso e referência de traço 1:4: https://bra.sika.com/portokoll/pt/noticias/4-dicas-essenciais-sobre-como-fazer-contrapiso.html
- Os demais links das referências históricas estão na aba Coeficientes. Não são uma certificação das estimativas para esta obra.
- PDF.js: Mozilla, licença Apache-2.0; avisos de licença preservados nos arquivos em `vendor/`.

## v4.8 — PDF + DXF + DWG

- A entrada principal agora aceita PDF, DXF e DWG; JPG/PNG/WebP foram removidos do seletor principal.
- DXF ASCII é lido diretamente no navegador: entidades, layers, unidades e coordenadas são preservados.
- O motor CAD ignora entidades de dimensão, texto e hachura na busca de paredes; layers com nomes de cotas, mobiliário, eixos, esquadrias e instalações também são excluídos.
- Quando existem layers explícitos de paredes (ex.: PAREDE, ALVENARIA, A-WALL), eles têm prioridade. Sem padrão de layers, o app procura pares de linhas paralelas compatíveis com espessura de parede e gera o eixo central.
- DWG é lido localmente no navegador com LibreDWG/WebAssembly. O arquivo não precisa ser enviado a uma API paga. Se uma versão/entidade DWG não puder ser normalizada, o app pede uma cópia em DXF ASCII em vez de inventar geometria.
- A visualização CAD destaca em azul somente os eixos de paredes usados no quantitativo.
- Arquivos CAD passam a poder alimentar diretamente o cálculo de paredes, sem depender do fluxo ChatGPT/JSON.

## Visita Técnica (`/vistoria/`)

App de celular (PWA, funciona offline) para registrar visitas técnicas com fotos e gerar o relatório em PDF em nome da **Absolut Construtora**, tendo como vistoriador o **Eng. Civil Geovane Lang — CREA 152359-1**.

1. **Nova visita** → digite o endereço (o cursor já abre nesse campo). Unidade, cliente/proprietário e as demais informações são opcionais.
2. **Câmera** tira a foto e já abre a ficha (local, constatação, gravidade e recomendação). **Galeria** importa várias fotos de uma vez.
3. Toque no ✓ de cada foto para escolher quais entram no relatório. A numeração (Foto 01, 02…) conta só as fotos selecionadas; use ↑/↓ para reordenar.
4. **✏️ Marcar na foto**: setas, círculos e traço livre (a foto original fica guardada).
5. **Relatório** → escolha o layout (foto ao lado do texto, foto grande ou grade 2×2) e gere o PDF para compartilhar ou baixar.

Na engrenagem da tela inicial ficam a empresa, o logo do cabeçalho, os dados do vistoriador, o objetivo padrão, a cidade, o texto de ressalva, a assinatura desenhada com o dedo e o backup. As fotos ficam salvas só no aparelho: exporte o backup periodicamente.

## Lang PPCI — vistoria de habite-se CBMSC (`/habite-se/`)

App de celular (PWA, funciona offline) para a vistoria de habite-se do Corpo de Bombeiros Militar de Santa Catarina. Você responde um questionário de 4 passos e o app entrega prontos, em PDF, os dois formulários da IN 1:

- **Anexo I — Relatório de conformidade e termo de responsabilidade (atestado para habite-se)**, com a tabela dos 15 sistemas já marcada.
- **Anexo J — Termo de entrega do imóvel**, com o descritivo de cada sistema instalado e as fotos legendadas.

Antes da primeira vistoria, abra a engrenagem e preencha uma vez os dados do responsável técnico (CPF, RG, endereço, telefone, e-mail) e o responsável pelo imóvel padrão. Esses dados ficam só no aparelho.

1. **Imóvel** — endereço, RE, protocolo, ocupação, risco, área, pavimentos e blocos. O botão **Puxar dados do atestado (PDF)** lê o Atestado de Aprovação de Projeto emitido pelo e-SCI e preenche o imóvel, o responsável e os sistemas aprovados (os demais sistemas passam a "Não tem"). A leitura é feita no aparelho; o protocolo não é puxado, porque o do atestado é o da aprovação do projeto, não o do habite-se.
2. **Sistemas** — para cada sistema, um toque: *Não tem*, *Conforme* ou *Não conforme* (com a justificativa). Um botão marca todos os não respondidos como "Não tem".
3. **Fotos** — para cada sistema instalado, o descritivo e o botão **Tirar foto**, que abre a câmera; a legenda é pedida logo após cada foto e **Outra foto** volta direto para a câmera.
4. **PDF** — o app lista o que falta (com atalho para corrigir) e gera os dois PDFs para compartilhar, abrir ou baixar.

Regra da tabela do Anexo I: *Conforme* sai Sim/Sim; *Não conforme* sai Não/Não com a justificativa digitada; *Não tem* sai Não/Não com "NÃO SE APLICA".

**Importante:** os PDFs reproduzem o texto dos Anexos I e J da IN 1 a partir dos modelos de 2025; confira se o CBMSC não publicou versão nova do formulário. A lista de sistemas fica em `habite-se/catalogo.js` (ao editar, aumente a versão do cache em `habite-se/service-worker.js`).

## Lang Estoque — almoxarifado de obras (`/estoque/`)

App de celular e computador (PWA, funciona offline) para controlar o estoque de materiais da construtora e para qual obra cada material foi.

- **Início**: três botões grandes — **Entrada** (chegou material), **Saída** (enviar para obra) e **Devolução** (voltou da obra) —, os materiais que precisam ser comprados, o gráfico de quanto foi para cada obra nos últimos 30 dias e as últimas movimentações.
- **Estoque**: saldo de cada material no depósito, com barra de nível e aviso de *Estoque baixo* / *Sem estoque* conforme o estoque mínimo. Ao tocar no material: custo médio, valor em estoque, em quais obras foi usado, histórico e **Corrigir saldo** (inventário).
- **Obras**: cada obra tem uma cor. A página da obra mostra o valor em material, a divisão por tipo, a tabela de material enviado − devolvido e o histórico, além do **Relatório** para imprimir/PDF.
- **Movimentações**: histórico com filtros por tipo, obra e período, e exportação para planilha (CSV).

**Movimentar (entrada, saída ou devolução)** é uma tela de ícones pensada para celular e tablet: todos os materiais aparecem em grade, com busca e filtro por categoria, e os mais usados primeiro. Toque no material, digite a quantidade no teclado numérico grande, escolha a obra e toque em **Dar saída**. Para lançar vários materiais de uma vez, use **＋ Mais itens**; cada material escolhido fica marcado com a quantidade. Na devolução aparecem só os materiais que a obra recebeu. Cada material pode ter um ícone (escolhido automaticamente pelo nome) ou uma foto tirada no celular.

Uma movimentação pode ter vários materiais. A saída não deixa enviar mais do que há no depósito, e a devolução não deixa devolver mais do que a obra recebeu. A **entrada direto na obra** (compra entregue no canteiro) conta para a obra sem passar pelo saldo do depósito. Depois de cada saída o app oferece a **guia de remessa** para imprimir e colher a assinatura de quem recebeu.

A **lista padrão de materiais** da LANG (conexões, fios, elétrica, ferramentas, máquinas, pintura, EPI…) fica em `estoque/catalogo.js` e entra sozinha no app de cada aparelho, com saldo zero e sem duplicar nomes já cadastrados. Para lançar o que já existe no depósito, use **Entrada** → Depósito. Ao alterar a lista, aumente `CATALOGO_VERSAO` e a versão do cache em `estoque/service-worker.js`.

**Login e permissões.** No estoque compartilhado, cada pessoa entra com o nome cadastrado e sua própria senha de pelo menos 10 caracteres. Em **Configurações → Pessoas**, o administrador cadastra usuários, define senhas e desativa acessos. Todos podem consultar o estoque, lançar entradas, saídas e devoluções e cadastrar materiais e obras. A correção de saldo, a exclusão de registros e as configurações exigem acesso de administrador. As movimentações registram quem lançou e guardam a selfie quando tirada. O app encerra a sessão após 3 minutos sem uso ou pelo botão **Concluir e sair**.

**Aparelhos antigos (iPad mini 1 / iOS 9).** O código do app fica em `estoque/app.js`. Para o Safari do iOS 9, que não entende JavaScript moderno nem CSS grid, o app carrega `estoque/app-legacy.js` — a mesma lógica convertida para ES5 por `tools/estoque-legacy/build.js` (Babel) — e usa um layout alternativo (classe `nogrid`). O site gera esse arquivo sozinho a cada publicação; para gerar à mão: `cd tools/estoque-legacy && npm ci && node build.js`. Nesses aparelhos o app precisa de internet para abrir (o iOS 9 não guarda páginas offline) e a selfie é tirada pelo botão **Abrir câmera do aparelho**.

**Ativação.** No aparelho que já contém os dados, abra **Ativar estoque compartilhado**, informe o código de ativação, confirme o PIN atual do administrador e defina a nova senha. A ativação copia os cadastros e o histórico para o banco e preserva a cópia local. Depois, defina as senhas dos outros usuários em **Configurações → Pessoas**. Se os dados já estiverem em um arquivo, o administrador pode usar **Restaurar backup** depois de ativar e recriar ou ajustar os acessos pelo próprio app.

No modo compartilhado, o app precisa de internet para entrar e salvar. Os cadastros, as movimentações e as fotos ficam disponíveis aos usuários autorizados mesmo com o iPad desligado. A engrenagem oferece backup e exportação de planilhas. O backup do estoque compartilhado contém os dados e as fotos, sem as senhas.

## Lang Quantitativos — quantitativo de insumos por etapa (`/casa/`)

Ícone e marca seguem a identidade da Lang Engenharia: esquadro em “L” com régua, blocos laranja (#ff5a00) e linha de cota sobre fundo escuro (`casa/assets/icon.svg`, com PNGs 180/192/512 e versão maskable para Android).

App (PWA) que gera o quantitativo completo de **insumos** de uma casa térrea a partir da planta baixa, separado por etapa da obra e com a tabela total consolidada. Ferramentas, equipamentos e mão de obra não entram.

1. **Planta**: importe a planta baixa (PDF, JPG, PNG ou WebP) ou use *Desenhar sem planta* (grade de 1 m).
   **PDF exportado do CAD é lido automaticamente, sem IA** (`casa/leitor-vetorial.js`):
   - A escala sai das cotas, comparando o número com o comprimento da linha.
   - As paredes saem da camada de traço mais escura e comprida, com a espessura medida entre as faces.
   - Os cômodos saem do preenchimento entre paredes: nome e área vêm dos textos ("Quarto · Área: 9,40 m²") e o perímetro vem do contorno.
   - As portas e janelas saem dos rótulos P/J e dos vãos entre arremates (face interrompida = porta; caixilho dentro da parede = janela).
   - A área construída vem do quadro de áreas, quando existir.
   - Folha com mais de uma planta (ex.: pavimento inferior e superior lado a lado): cada planta vira um pavimento, com o nome tirado do título.
   - Escadas: degraus desenhados na camada de paredes são reconhecidos (linhas paralelas iguais, espaçadas de 22 a 34 cm) e não contam como parede; o número de escadas por pavimento vai para o cálculo (uma por casa em geminados).
   - Quadro de esquadrias com cabeçalho (LARGURA, ALTURA, PEITORIL em qualquer ordem, em m ou cm) é lido pelas colunas.
   - O resultado aparece colorido sobre a planta (laranja = paredes externas, azul = internas, verde = vãos) e vai para o levantamento, onde pode ser corrigido.
   Para imagem ou PDF escaneado, trace por cima: Calibre a escala clicando nas pontas de uma cota conhecida e trace por cima: paredes externas (contorno), paredes internas, ambientes (retângulo ou polígono, com o tipo), portas e janelas (clique sobre a parede). O ímã prende nos pontos e paredes, e o modo ortogonal trava em 0°/90°. Opcional: **Ler planta com IA**, que envia a página ao servidor e devolve ambientes, paredes, contorno e vãos lidos das cotas.
2. **Levantamento**: confira e corrija áreas, perímetros, comprimentos de parede e a lista de portas e janelas.
3. **Perguntas**: pé-direito, tipo de parede, fundação, laje, teto, telhado, piso e esgoto, já com respostas comuns. Acabamentos e coeficientes ficam em seções opcionais.
4. **Quantitativos**: 16 etapas (preliminares, fundação, estrutura, alvenaria, cobertura, água fria, esgoto, elétrica, impermeabilização, revestimentos, pisos, forro, esquadrias, louças e metais, pintura, limpeza), cada insumo com quantidade, unidade de compra (sacos, barras de 12 m, latas, rolos…) e memória de cálculo, além do **total consolidado**. Exporta CSV, imprime/gera PDF e faz backup em JSON.

Concretos e argamassas são decompostos em cimento, cal, areia e brita (ou concreto usinado, se escolhido). Reboco e emboço são sempre de cimento e areia fina (traço 1:4); argamassa industrializada entra só como argamassa colante de pisos e revestimentos. O aço sai por bitola em kg e em barras. Estrutura e fundação seguem critérios paramétricos de pré-dimensionamento, como sapata 0,80×0,80 m, pilares 14×30 cm com 4Ø10 e baldrame e cinta com 4 barras: confira com o projeto estrutural. Os consumos e perdas ficam editáveis em *Coeficientes*.

- **Pavimentos e unidades:** cada pavimento tem a sua planta e o seu levantamento (botão *＋ Pavimento*, com opção de copiar outro) e pode se repetir (pavimento tipo). Lajes entre pavimentos, escada de concreto com revestimento e corrimão, prumadas de água e esgoto, telhado só sobre o último pavimento (e sobre o térreo descoberto), e um quadro de luz, medidor e cavalete por unidade.
- **Acabamento por cômodo:** no passo 2, cada cômodo pode ter piso (retificado 59×59, cerâmica, porcelanato 60 ou 90, laminado, vinílico, cimentado), parede (sem cerâmica, faixa, 1,50 m ou até o teto) e teto (reboco, gesso, drywall, PVC) próprios. No passo 3 há os padrões Popular, Médio e Alto e a peça da parede (retificado 30×58 ou cerâmica 32×57). O rodapé vai em todo o piso, menos nas paredes com cerâmica até o chão e atrás das bancadas, com desconto das portas.
- **Quadro de esquadrias:** se a prancha tem a tabela (ex.: “P1 0,80 x 2,10”, “J1 1,50 x 1,20 / 1,00”), a leitura automática usa largura, altura e peitoril dela.
- **Alvenaria estrutural:** blocos cerâmicos ou de concreto estruturais 14 cm. Com ela não há pilares, vigas nem vergas de concreto: entram canaletas (cinta de respaldo, vergas e contravergas), graute vertical armado nos cantos, encontros e bordas dos vãos, meios-blocos, argamassa estrutural 1:0,5:4,5 e, na fundação, sapata corrida sob as paredes (ou estacas ao longo das paredes, ou radier). As lajes continuam.
- **Fundação pelo solo:** escolha o solo numa lista do mais ao menos resistente, com tensões admissíveis presuntivas da NBR 6122:1996. A sapata é dimensionada pela carga por pilar (área de influência × pavimentos). Em solo mole, a sapata rasa é trocada por estacas, com aviso.
- **Área externa (opcional, passo 3):** muro de divisa (brocas, baldrame, pilaretes, cinta, blocos; revestimento e pintura escolhidos para cada lado; capa de concreto ou cerâmica), portão de garagem (com ou sem automatizador), portões sociais, aterro sob a casa, drenagem do quintal, quintal ou piso externo (concreto com tela, paver, só brita ou brita sobre manta), jardim (grama, terra vegetal, adubo e mudas), calçada pública com piso podotátil, caixa de correio, lixeira, número, interfone/porteiro eletrônico e entrada de telefonia/internet. Os indicadores de conferência consideram só a casa.
- **Embalagens reais de compra:** piso e revestimento em caixas (m² por caixa), blocos e telhas em milheiros, tintas em latas de 18 L mais galões de 3,6 L com a menor sobra, aço em barras de 12 m. A perda do piso sobe 5% no assentamento diagonal.
- **Conferência:** indicadores com faixa usual (aço/m³, concreto/m², fôrma/m³, cimento/m², alvenaria/m², blocos/m², janelas ÷ piso e pontos elétricos/m²), mais a memória da fundação.
- **Compras por fase:** lista de compras na ordem da obra (mobilização e fundação → estrutura → instalações embutidas → revestimentos → acabamentos → área externa → entrega), com prazos de encomenda (esquadrias sob medida, granito, laje, concreto usinado) e marcação do que já foi comprado.
- **Revisões:** salve o quantitativo como revisão (ex.: “Rev 03”) e compare com outra ou com o atual.
- **Excel e relatório:** planilha .xlsx com fórmulas (SOMASE no consolidado, ARREDONDAR.PARA.CIMA na compra e coluna de preço para preencher), compras por fase, levantamento e coeficientes. A impressão/PDF sai com logotipo, empresa, responsável técnico, ART e assinatura.
- Motor de cálculo: `casa/engine.js` (teste: `node tests/casa-engine.cjs`). Leitor de PDF vetorial: `casa/leitor-vetorial.js` (teste: `node tests/casa-leitor.cjs`). Planilha: `casa/xlsx.js`.
- Leitura por IA: rota `api/casa-planta.js` com Claude. Para ativar, cadastre a variável de ambiente `ANTHROPIC_API_KEY` no projeto Vercel. Sem a chave, o app funciona normalmente pelo desenho.
- Os dados ficam no aparelho (localStorage e IndexedDB para a imagem da planta). Use o backup.
