# LANG ConfereAuto 0.1.0

O bot da Central Dots abre um projeto no AutoCAD, confere e corrige o que for seguro, e devolve um relatório.
Ele trabalha **sempre numa cópia**: o arquivo original nunca é alterado.

## O que tem aqui

| Pasta/arquivo | Para que serve |
|---|---|
| `LANG_ConfereAuto.bundle/` | Plugin do AutoCAD com os comandos `CONFEREPROJETO`, `CONFERESOMENTE` e `PROJETOSEGURO` |
| `ferramentas/Conferir-Projeto.ps1` | Executor: copia o arquivo, abre o AutoCAD, converte DXF para DWG, roda o PROJETO (opcional), confere/corrige e salva o relatório |
| `ferramentas/Relatorio-Texto.ps1` | Transforma o `relatorio.json` em texto simples |
| `central/autocad-tool.js` | Ferramenta `conferir_projeto_autocad` para o bot da Central Dots, com fila (um trabalho por vez) |
| `INSTALAR.cmd` / `RESTAURAR.cmd` | Instala com backup da versão anterior / volta ao backup |

## O que ele corrige sozinho

- **Camadas das plantas** fora do padrão do ProjetoAuto 0.5.9 (cor e espessura): parede 0,50, esquadria 0,35, projeção 0,18, hachura e quadro 0,13.
- **Objetos com espessura própria** nessas camadas voltam a usar a espessura da camada.
- **Cotas encostando** em textos, balões, círculos ou blocos: o número é afastado da linha, ou deslizado ao longo dela, até achar um lugar livre.
- **Material das esquadrias "A definir"**: preenchido quando você informa um material padrão (ex.: "Alumínio preto").

## O que ele só aponta no relatório (você decide)

- Cotas que não acharam lugar livre.
- Desenho com **fossa/sumidouro**: confirmar se continua fossa ou passa para rede pública.
- Campos **"A DEFINIR"**, como zona, recuos e taxas da prefeitura. Os parâmetros de Guabiruba ainda não foram cadastrados.
- Objetos soltos na camada 0.

## Os 4 itens pedidos

1. **DXF não gera a planta.** Resolvido por fora do ProjetoAuto: o executor sempre salva a cópia em DWG antes de rodar o PROJETO. No AutoCAD, use `PROJETOSEGURO` no lugar de `PROJETO`: se o croqui estiver em DXF, ele salva em DWG e só então gera. A causa dentro do ProjetoAuto continua lá, porque o código dele está só no PC (`D:\Desenvolvimento de Software\Projeto arquitetônico automatizado - LISP`).
2. **AutoCAD sem janela.** O executor usa o AutoCAD **com janela**, aberto e controlado pelo Windows (o mesmo método dos testes de 21/10). Ele não depende do modo sem janela, onde o ProjetoAuto não gera as pranchas. Os logs ficam em `%LOCALAPPDATA%\LANG\ConfereAuto\logs`, fora da pasta do plugin.
3. **Conferir e corrigir projeto.** Comando `CONFEREPROJETO`, também chamado pelo executor.
4. **Ligação com a Central Dots.** Módulo `central/autocad-tool.js`, com fila e trava do Windows: nunca rodam dois trabalhos de AutoCAD ao mesmo tempo.

## Instalação no PC

1. Feche o AutoCAD.
2. Dê dois cliques em `autocad\INSTALAR.cmd`. A versão anterior, se houver, vira backup.
3. Abra o AutoCAD, abra um projeto já gerado e digite `CONFERESOMENTE`. Ele só lista o que acharia, sem alterar nada.
4. Teste o executor num projeto qualquer:
   ```powershell
   & "$env:LOCALAPPDATA\LANG\ConfereAuto\ferramentas\Conferir-Projeto.ps1" -Arquivo "D:\caminho\croqui.dwg" -SomenteConferir
   ```
   O resultado fica em `Documentos\LANG ConfereAuto\<nome>-<data>\`.

## Ligar na Central Dots

No servidor da Central (Node):

```js
const autocad = require(process.env.LOCALAPPDATA + '\\LANG\\ConfereAuto\\central\\autocad-tool.js');

// 1) Registrar a ferramenta para o bot (formato de ferramenta da API do Claude):
tools.push(autocad.definicao);

// 2) Quando o bot pedir a ferramenta:
const r = await autocad.chamarFerramenta(nome, argumentos); // { resultado, texto }

// 3) Opcional: rotas HTTP (servidor no estilo Express)
autocad.registrarRotas(app); // POST /api/autocad/conferir   GET /api/autocad/fila
```

Exemplo de pedido ao bot: *"confere o projeto D:\Projetos\Casa Silva\croqui.dwg, esquadrias em alumínio preto"*.

## Opções do executor

| Opção | Efeito |
|---|---|
| `-SomenteConferir` | Só gera o relatório e não salva o corrigido |
| `-Material "Alumínio preto"` | Preenche as esquadrias "A definir" |
| `-GerarProjeto` | Roda o PROJETO antes de conferir, com as respostas do questionário já salvas no croqui (PROJETO › ALL › Aceitar) |
| `-Saida <pasta>` | Onde salvar os resultados (padrão: `Documentos\LANG ConfereAuto`) |
| `-TempoLimiteMin 20` | Tempo máximo de cada etapa |

## Limites conhecidos

- Ainda **não foi testado num AutoCAD de verdade**: o pacote foi feito na nuvem, onde não há AutoCAD nem PowerShell. Aqui só foram testados os parênteses do LISP e a ferramenta da Central (6 testes com um AutoCAD simulado). O primeiro uso no PC precisa ser acompanhado.
- O executor abre o AutoCAD na tela e manda comandos para a aba dele. **Não use o AutoCAD enquanto ele roda**: se você trocar de aba, os comandos podem ir para o desenho errado. Ele fecha só a aba que abriu.
- Cotas omitidas pelo ProjetoAuto (quando não havia espaço) não existem no desenho, então ele não tem como recolocá-las.
- O AutoCAD instalado é a versão educacional. Para entregar trabalhos, é preciso a licença comercial.
- Para desfazer as correções feitas com `CONFEREPROJETO` no AutoCAD, use `U`.

## Testes

```bash
node --test autocad/central/test/*.test.js
python3 autocad/ferramentas/testes/checar_lisp.py autocad/LANG_ConfereAuto.bundle/Contents/LANG_ConfereAuto.lsp
```
