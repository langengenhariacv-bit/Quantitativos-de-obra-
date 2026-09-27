# LANG Quantitativos — versão revisada

Aplicativo de levantamento preliminar e conferência de quantitativos de construção.

## Como usar

1. Abra o link publicado ou extraia o ZIP e abra `index.html` em um navegador atualizado. O leitor de PDF acompanha o aplicativo em arquivos locais; não precisa de API, chave ou CDN.
2. Informe área construída, pavimentos, unidades, sistemas e acabamentos. Confira os coeficientes: valores iniciais são hipóteses de orçamento.
3. Carregue PDF, JPG, PNG ou WebP. Calibre com dois pontos de uma cota conhecida. Em PDFs com escalas diferentes ou digitalizados, calibre cada página utilizada.
4. Confira as marcações automáticas. Corrija paredes omitidas manualmente; escolha somar ou substituir a leitura. Não desenhe novamente uma parede já detectada no modo somar.
5. Em imagens sem texto, informe os ambientes e suas áreas. A ferramenta de polígono mede área de piso após a calibração. Fotografias em perspectiva não são métricas sem retificação prévia.
6. Informe quantidades de projetos complementares. Há calculadora por dimensões para volumes de concreto e massa de aço. Ela quantifica elementos dimensionados; não dimensiona fundações, peças ou armaduras.
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

## Alcance e limitações

O catálogo original contempla as etapas principais e componentes opcionais. Nenhuma planta arquitetônica contém todos os insumos executivos. Componentes sem base mensurável ficam identificados para conferência; ausência de dados não significa ausência do componente. Somente sistemas expressamente desligados ou quantidade zero confirmada são tratados como excluídos quando há essa informação.

Os índices históricos do código original foram preservados como cenários de referência. Não há validação estatística de sua adequação à obra atual. Quantidades de estrutura, fundação e instalações devem ser substituídas pelos projetos respectivos. Bitolas e dispositivos elétricos de referência não servem para dimensionamento ou compra definitiva. Aço e concreto não são desdobrados em peças/traços sem especificação executiva.

A detecção de paredes usa análise de pixels e linhas, não compreensão integral do projeto ou OCR. Textos, móveis, hachuras, cortes, outras vistas e paredes diagonais podem gerar omissões ou falsos positivos. A máscara precisa ser conferida. PDFs de múltiplas vistas ou escalas exigem medição manual ou páginas separadas.

Dados ficam no navegador/dispositivo; não há sincronização em nuvem nem envio de plantas para uma conversa do ChatGPT. Limpar dados do navegador remove o projeto; exporte backup.

## Validação desta entrega

Dez verificações automatizadas fornecidas com esta revisão cobrem inicialização, cálculos, composição do contrapiso, ausência de duplicidade, parâmetros desativados, substituição por zero, estados de conferência, salvamento e massa de aço. Resultados em `VALIDACAO.json`.

A execução de navegador foi bloqueada pelo ambiente (criação de socket não permitida). Portanto, importação/renderização visual de PDF e imagem e layout móvel não foram validados de ponta a ponta nesta entrega. Não foi aferido um erro percentual de levantamento contra uma planta real.

## Referências

- CAIXA/SINAPI, finalidade das composições paramétricas: https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx
- Sika, execução de contrapiso e referência de traço 1:4: https://bra.sika.com/portokoll/pt/noticias/4-dicas-essenciais-sobre-como-fazer-contrapiso.html
- Os demais links das referências históricas estão na aba Coeficientes. Não são uma certificação das estimativas para esta obra.
- PDF.js: Mozilla, licença Apache-2.0; avisos de licença preservados nos arquivos em `vendor/`.