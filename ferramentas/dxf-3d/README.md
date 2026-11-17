# LANG DXF → 3D — protótipo v0.1

Página experimental em `ferramentas/dxf-3d/index.html`.

## Como testar
1. Abra a página por um servidor estático ou use a visualização do branch.
2. No AutoCAD, salve uma cópia da planta como **DXF ASCII**.
3. Carregue o DXF, confira/unifique as unidades e indique os layers que realmente representam paredes.
4. Defina altura e espessura de parede e gere o modelo.
5. Exporte GLB ou OBJ para inspeção em um visualizador 3D compatível.

## O que esta primeira entrega faz
- Lê entidades `LINE` e `LWPOLYLINE` no espaço ENTITIES de DXF ASCII.
- Tenta identificar layers de parede pelo nome, ou permite escolher layers explicitamente.
- Extruda segmentos selecionados em prismas 3D e permite orbitar a visualização.
- Exporta o resultado como GLB ou OBJ.
- Processa o arquivo localmente no navegador.

## Limitações conhecidas
- Ainda não reconhece portas, janelas, arcos, blocos, referências externas, paredes curvas, níveis, escadas ou telhados.
- Não une nem faz miter nos encontros de paredes; segmentos sobrepostos podem produzir geometria duplicada.
- A espessura é aplicada como valor padrão uniforme, não inferida de pares de linhas.
- A detecção automática de unidade depende de `$INSUNITS`; arquivos sem unidade exigem seleção manual.
- O parser inicial é para DXF ASCII; DWG e DXF binário não são suportados nesta página.
- Não deve ser usado para cálculo estrutural, aprovação ou execução sem revisão técnica.

## Próximos incrementos
1. Testes com DXFs reais da LANG e correção de escala/layers.
2. Detectar pares de linhas paralelas e inferir espessura/eixo de parede.
3. Reconhecer vãos por layers de esquadrias e interromper paredes em portas/janelas.
4. Agrupar elementos por layer e pavimento, melhorar junções e adicionar cotas de conferência.
5. Exportar também geometria intermediária editável e, depois, integrar o motor à tela principal do Quantitativos.
