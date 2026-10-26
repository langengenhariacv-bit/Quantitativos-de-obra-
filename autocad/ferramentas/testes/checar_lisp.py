"""Confere parenteses e strings de arquivos AutoLISP (sem AutoCAD)."""
import sys

def checar(caminho):
    texto = open(caminho, encoding="utf-8").read()
    nivel, linha, em_string, escape, inicio = 0, 1, False, False, None
    formas = 0
    i = 0
    while i < len(texto):
        c = texto[i]
        if c == "\n":
            linha += 1
        if em_string:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == '"':
                em_string = False
        elif c == ";":
            while i < len(texto) and texto[i] != "\n":
                i += 1
            continue
        elif c == '"':
            em_string = True
        elif c == "(":
            if nivel == 0:
                inicio = linha
            nivel += 1
        elif c == ")":
            nivel -= 1
            if nivel < 0:
                return f"{caminho}:{linha}: ')' sobrando"
            if nivel == 0:
                formas += 1
        i += 1
    if em_string:
        return f"{caminho}: string sem fechar"
    if nivel:
        return f"{caminho}:{inicio}: forma sem fechar ({nivel} '(' abertos)"
    return f"{caminho}: ok, {formas} formas"

erros = 0
for arq in sys.argv[1:]:
    r = checar(arq)
    print(r)
    erros += "ok" not in r
sys.exit(1 if erros else 0)
