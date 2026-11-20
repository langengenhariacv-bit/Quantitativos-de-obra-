# AutoCAD MCP: análise e instalação

Análise feita em 20/11/2026 a partir do código dos dois projetos citados em
posts.curtasolucoes.com.br/cano. Os dois são de terceiros, com licença MIT, e não
encontramos envio de dados para a internet.

## Comparação

| | **puran-water/autocad-mcp** (v3.2.0) | **Porta048/AutoCad-MCP** (v1.0.0) |
|---|---|---|
| Programas | AutoCAD LT 2024+ (Windows) **ou sem AutoCAD** (modo `ezdxf`, só DXF) | AutoCAD completo, GstarCAD, ZWCAD (Windows) |
| AutoCAD LT | Sim (é o foco) | Não (usa COM, o LT não tem) |
| Ler o desenho | listar, contar e consultar entidades; layers; blocos; capturas de tela | listar entidades (tipo, layer, cor, caixa) e layers |
| Medir comprimento/área | Não direto; possível via `execute_lisp` | Não |
| Desenhar/editar | Muito completo (P&ID, revisões com histórico) | Básico (linha, círculo, texto, hachura, cota) |
| Complexidade | Alta (muitas regras de segurança, fila de jobs) | Baixa (instala em 3 passos) |
| Atividade | 29 commits, atualizado em 16/11/2026 | Pequeno, atualizado em 22/10/2026 |

**Recomendação:**
- **Quantitativos:** use o script `tools/dxf-quantitativos/quantitativos_dxf.py` deste
  repositório. Ele lê um DXF e devolve comprimento por layer, área e contagem de blocos,
  funciona até na nuvem e não depende de nenhum dos dois MCPs.
- **Quer o Claude dentro do AutoCAD:** com AutoCAD LT, use o **puran-water**. Com AutoCAD
  completo e uso simples, o **Porta048** é mais fácil.

## Cuidados

- Trabalhe sempre numa **cópia** do DWG. Os dois conseguem alterar e salvar o desenho.
- No puran-water, `drawing.create` **apaga** o desenho ativo; `execute_lisp` roda qualquer
  código AutoLISP. Só aprove esses comandos sabendo o que fazem.
- Nenhum deles "aprova" um projeto: confira os números antes do orçamento.

## Instalação no Windows: Porta048 (AutoCAD completo)

```powershell
git clone https://github.com/Porta048/AutoCad-MCP.git
cd AutoCad-MCP
pip install -e .
```

Em `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{ "mcpServers": { "autocad": { "command": "autocad-mcp" } } }
```

Reinicie o Claude Desktop. Teste: "liste os layers do desenho".

## Instalação no Windows: puran-water (AutoCAD LT 2024+)

1. Instale o Python 3.10+ (Windows, não WSL) e o `uv` (docs.astral.sh/uv).
2. ```powershell
   git clone https://github.com/puran-water/autocad-mcp.git
   cd autocad-mcp
   uv sync
   ```
3. Em `claude_desktop_config.json` (troque o caminho):
   ```json
   {
     "mcpServers": {
       "autocad-mcp": {
         "command": "C:\\caminho\\autocad-mcp\\.venv\\Scripts\\python.exe",
         "args": ["-m", "autocad_mcp"],
         "env": { "AUTOCAD_MCP_BACKEND": "file_ipc" }
       }
     }
   }
   ```
4. Reinicie o Claude Desktop e peça `system(operation="status")`; deve aparecer
   `backend: "file_ipc"`.
5. Antes de editar, siga o fluxo de "job" isolado do README do projeto
   (abre uma cópia do DWG num processo separado).

Para usar com o Claude Code em vez do Claude Desktop:
`claude mcp add autocad -- autocad-mcp` (Porta048) ou o mesmo comando/args do JSON acima.
