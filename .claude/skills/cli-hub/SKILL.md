---
name: cli-hub
description: Usa o CLI-Hub (projeto CLI-Anything) para instalar e operar programas de desktop (FreeCAD, LibreOffice, Blender, GIMP, etc.) por linha de comando. Use quando uma tarefa de quantitativos de obra, orçamento, BIM/CAD ou planilhas precisar operar um programa externo, ou quando o usuário pedir "cli-hub", "CLI-Anything" ou "instalar um CLI".
---

# CLI-Hub (CLI-Anything)

O CLI-Anything cria "pontes" de linha de comando para programas feitos para mouse e tela,
para que um agente de IA consiga operá-los com comandos de texto e respostas em JSON.
O `cli-hub` é o gerenciador dessas pontes: busca, instala, atualiza e executa.

## 1. Garantir a instalação

A sessão na nuvem é temporária, então confira sempre antes de usar:

```bash
command -v cli-hub || pip install cli-anything-hub
cli-hub --version
```

Requer Python >= 3.10.

## 2. Encontrar o CLI certo

```bash
cli-hub can "extrair áreas de um modelo IFC" --json   # busca por tarefa
cli-hub search cad                                    # busca por nome/categoria
cli-hub list                                          # lista tudo
cli-hub info <nome>                                   # detalhes de um CLI
```

Termos úteis para este projeto: `cad`, `bim`, `ifc`, `freecad`, `spreadsheet`, `libreoffice`,
`pdf`, `dxf`.

## 3. Instalar e usar

```bash
cli-hub install <nome>
cli-hub launch <nome> --help          # sempre ler a ajuda antes de usar
cli-hub launch <nome> <args...>
cli-hub update <nome>
cli-hub uninstall <nome>
```

Prefira saídas em JSON (`--json`, quando o CLI oferecer) para ler e conferir os resultados.

## 4. Regras

- Antes de instalar um CLI novo, diga ao usuário qual é e para que serve.
- Muitos CLIs exigem que o programa real (ex.: FreeCAD, LibreOffice) esteja instalado.
  Se faltar, avise em vez de instalar pacotes grandes do sistema sem perguntar.
- Quantitativos gerados por um CLI devem ser conferidos (unidades, áreas, volumes)
  antes de entrar no orçamento.

## 5. Problemas conhecidos

- `Failed to fetch registry ... hkuds.github.io ... 403`: a rede do ambiente bloqueia o
  catálogo. Peça ao usuário para liberar o host `hkuds.github.io` (e o GitHub de onde os
  CLIs são baixados) nas configurações de rede do ambiente, ou rode no computador dele.
- Se `pip install` for bloqueado pelas permissões, explique ao usuário e peça autorização.
