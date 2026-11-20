---
name: acesso-a-software-de-computador
description: Opera programas de computador (AutoCAD, FreeCAD, LibreOffice, etc.) para tarefas de obra. Extrai quantitativos de DWG/DXF (comprimento por layer, áreas, contagem de blocos), orienta a instalação dos servidores MCP de AutoCAD e usa o CLI-Hub (CLI-Anything). Use quando uma tarefa de quantitativos, orçamento, BIM/CAD ou planilhas precisar de um programa externo ou de um arquivo DWG/DXF, ou quando o usuário pedir "acesso a software de computador", "AutoCAD MCP", "cli-hub", "CLI-Anything" ou "instalar um CLI".
---

# Acesso a software de computador

Escolha o caminho pela tarefa:

| Tarefa | Caminho |
|---|---|
| Quantitativos de um DWG/DXF (tubos, áreas, peças) | Seção A: script `quantitativos_dxf.py` |
| Claude operando o AutoCAD do usuário | Seção B: AutoCAD MCP (no PC do usuário) |
| Outros programas (FreeCAD, LibreOffice, Blender...) | Seção C: CLI-Hub |

## A. Quantitativos de DWG/DXF (funciona aqui na nuvem)

1. Peça o arquivo em **DXF**. Se o usuário só tiver DWG: no AutoCAD, `SALVARCOMO` > DXF,
   ou converter com o ODA File Converter.
2. Rode:
   ```bash
   pip install ezdxf   # se faltar
   python tools/dxf-quantitativos/quantitativos_dxf.py desenho.dxf
   python tools/dxf-quantitativos/quantitativos_dxf.py desenho.dxf --layers "HID*,ESG*" --csv saida.csv
   ```
3. Saída: comprimento (m) e área (m²) por layer, e quantidade de cada bloco por layer.
4. **Confira antes de usar no orçamento:**
   - a unidade do desenho (linha "unidade" na saída). Se vier "desconhecido", pergunte
     ao usuário e rode com `--unidade mm|cm|m`;
   - se os tubos estão mesmo separados por layer (ex.: água fria, esgoto);
   - blocos dentro de blocos não são abertos: um bloco "banheiro" conta como 1, não
     conta as peças de dentro;
   - o script lê só o espaço do modelo, não os layouts/pranchas;
   - tubulação vertical (prumadas) desenhada só em planta não tem comprimento: some à parte.
5. Some perdas/folgas conforme o critério do orçamento e diga qual usou.

## B. AutoCAD MCP (Claude dentro do AutoCAD)

Só roda no **computador do usuário** (Windows + AutoCAD), não nesta sessão na nuvem.
Comparação dos dois projetos, recomendação, cuidados e passo a passo de instalação:
leia [autocad-mcp.md](autocad-mcp.md).

## C. CLI-Hub (CLI-Anything)

O CLI-Anything cria "pontes" de linha de comando para programas feitos para mouse e tela,
para que um agente de IA consiga operá-los com comandos de texto e respostas em JSON.
O `cli-hub` é o gerenciador dessas pontes: busca, instala, atualiza e executa.

### C1. Garantir a instalação

A sessão na nuvem é temporária, então confira sempre antes de usar:

```bash
command -v cli-hub || pip install cli-anything-hub
cli-hub --version
```

Requer Python >= 3.10.

### C2. Encontrar o CLI certo

```bash
cli-hub can "extrair áreas de um modelo IFC" --json   # busca por tarefa
cli-hub search cad                                    # busca por nome/categoria
cli-hub list                                          # lista tudo
cli-hub info <nome>                                   # detalhes de um CLI
```

Termos úteis para este projeto: `cad`, `bim`, `ifc`, `freecad`, `spreadsheet`, `libreoffice`,
`pdf`, `dxf`.

### C3. Instalar e usar

```bash
cli-hub install <nome>
cli-hub launch <nome> --help          # sempre ler a ajuda antes de usar
cli-hub launch <nome> <args...>
cli-hub update <nome>
cli-hub uninstall <nome>
```

Prefira saídas em JSON (`--json`, quando o CLI oferecer) para ler e conferir os resultados.

## Regras gerais

- Antes de instalar um CLI novo, diga ao usuário qual é e para que serve.
- Muitos CLIs exigem que o programa real (ex.: FreeCAD, LibreOffice) esteja instalado.
  Se faltar, avise em vez de instalar pacotes grandes do sistema sem perguntar.
- Quantitativos gerados por um CLI devem ser conferidos (unidades, áreas, volumes)
  antes de entrar no orçamento.

## Problemas conhecidos

- `Failed to fetch registry ... hkuds.github.io ... 403`: a rede do ambiente bloqueia o
  catálogo. Peça ao usuário para liberar o host `hkuds.github.io` (e o GitHub de onde os
  CLIs são baixados) nas configurações de rede do ambiente, ou rode no computador dele.
- Se `pip install` for bloqueado pelas permissões, explique ao usuário e peça autorização.
