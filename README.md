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

Os dados ficam salvos só no aparelho: use a engrenagem para fazer **backup** (e restaurar em outro aparelho) e exportar as planilhas. O botão *Ver com dados de exemplo* mostra o app preenchido.
