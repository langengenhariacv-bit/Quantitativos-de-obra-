#!/usr/bin/env python3
"""Extrai quantitativos de um arquivo DXF, sem precisar do AutoCAD.

Por layer:
  - comprimento total de linhas, polilinhas, arcos, círculos e splines (m)
  - área de polilinhas fechadas, círculos, elipses e hachuras (m²)
  - contagem de blocos inseridos (por nome do bloco)

Uso:
  python quantitativos_dxf.py desenho.dxf                 # tabela no terminal
  python quantitativos_dxf.py desenho.dxf --json          # saída JSON
  python quantitativos_dxf.py desenho.dxf --csv saida.csv # planilha CSV
  python quantitativos_dxf.py desenho.dxf --layers "HID*,ESG*"
  python quantitativos_dxf.py desenho.dxf --unidade mm    # força a unidade do desenho

DWG: salve como DXF no AutoCAD (SALVARCOMO > DXF) ou converta com o
ODA File Converter antes de rodar.

Requer: pip install ezdxf
"""
from __future__ import annotations

import argparse
import csv
import fnmatch
import json
import math
import sys
from collections import defaultdict

import ezdxf

# Código $INSUNITS -> metros por unidade do desenho
INSUNITS_PARA_M = {1: 0.0254, 2: 0.3048, 4: 0.001, 5: 0.01, 6: 1.0, 14: 0.1}
UNIDADES = {"mm": 0.001, "cm": 0.01, "dm": 0.1, "m": 1.0, "in": 0.0254, "ft": 0.3048}


def _area_poligono(pts) -> float:
    s = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i][0], pts[i][1]
        x2, y2 = pts[(i + 1) % n][0], pts[(i + 1) % n][1]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2.0


def _pts_polilinha(e):
    """Pontos aproximados (incluindo arcos/bulges) de LWPOLYLINE/POLYLINE."""
    from ezdxf.path import make_path

    return [(v.x, v.y) for v in make_path(e).flattening(0.01)]


def _comprimento(pts, fechada=False) -> float:
    total = sum(math.dist(pts[i][:2], pts[i + 1][:2]) for i in range(len(pts) - 1))
    if fechada and len(pts) > 2:
        total += math.dist(pts[-1][:2], pts[0][:2])
    return total


def medir(e) -> tuple[float, float]:
    """Retorna (comprimento, área) da entidade, em unidades do desenho."""
    t = e.dxftype()
    if t == "LINE":
        return math.dist(e.dxf.start, e.dxf.end), 0.0
    if t == "ARC":
        ang = (e.dxf.end_angle - e.dxf.start_angle) % 360 or 360
        return math.radians(ang) * e.dxf.radius, 0.0
    if t == "CIRCLE":
        r = e.dxf.radius
        return 2 * math.pi * r, math.pi * r * r
    if t in ("LWPOLYLINE", "POLYLINE"):
        if t == "POLYLINE" and not (e.is_2d_polyline or e.is_3d_polyline):
            return 0.0, 0.0  # malhas/polyface não entram
        fechada = e.closed if t == "LWPOLYLINE" else e.is_closed
        pts = _pts_polilinha(e)
        comp = _comprimento(pts)
        if fechada and pts and math.dist(pts[0], pts[-1]) > 1e-9:
            comp += math.dist(pts[-1], pts[0])
        return comp, (_area_poligono(pts) if fechada else 0.0)
    if t in ("SPLINE", "ELLIPSE"):
        from ezdxf.path import make_path

        pts = [(v.x, v.y, v.z) for v in make_path(e).flattening(0.01)]
        comp = _comprimento(pts)
        area = 0.0
        if t == "ELLIPSE" and abs(e.dxf.end_param - e.dxf.start_param - 2 * math.pi) < 1e-6:
            maior = math.hypot(*e.dxf.major_axis[:2])
            area = math.pi * maior * maior * e.dxf.ratio
        return comp, area
    if t == "HATCH":
        area = 0.0
        try:
            from ezdxf.path import from_hatch

            for p in from_hatch(e):
                pts = [(v.x, v.y) for v in p.flattening(0.01)]
                if len(pts) > 2:
                    area += _area_poligono(pts)
        except Exception:
            pass
        return 0.0, area
    return 0.0, 0.0


def extrair(caminho: str, filtros: list[str] | None, unidade: str | None) -> dict:
    doc = ezdxf.readfile(caminho)
    msp = doc.modelspace()

    if unidade:
        fator = UNIDADES[unidade]
        origem_unidade = f"informada: {unidade}"
    else:
        cod = doc.header.get("$INSUNITS", 0)
        fator = INSUNITS_PARA_M.get(cod)
        if fator is None:
            fator = 1.0
            origem_unidade = f"$INSUNITS={cod} desconhecido; assumido metro — confira!"
        else:
            origem_unidade = f"$INSUNITS={cod}"

    def passa(layer: str) -> bool:
        return not filtros or any(fnmatch.fnmatchcase(layer.upper(), f.upper()) for f in filtros)

    comp = defaultdict(float)
    area = defaultdict(float)
    qtd_ent = defaultdict(int)
    blocos = defaultdict(int)  # (layer, bloco) -> quantidade

    for e in msp:
        layer = e.dxf.get("layer", "0")
        if not passa(layer):
            continue
        if e.dxftype() == "INSERT":
            blocos[(layer, e.dxf.name)] += 1
            continue
        c, a = medir(e)
        if c or a:
            comp[layer] += c * fator
            area[layer] += a * fator * fator
            qtd_ent[layer] += 1

    layers = sorted(set(comp) | set(area))
    return {
        "arquivo": caminho,
        "unidade_desenho": origem_unidade,
        "metros_por_unidade": fator,
        "por_layer": [
            {
                "layer": ly,
                "entidades": qtd_ent[ly],
                "comprimento_m": round(comp[ly], 3),
                "area_m2": round(area[ly], 3),
            }
            for ly in layers
        ],
        "blocos": [
            {"layer": ly, "bloco": nome, "quantidade": n}
            for (ly, nome), n in sorted(blocos.items())
        ],
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dxf")
    ap.add_argument("--layers", help="filtro de layers separado por vírgula, aceita * (ex.: 'HID*,ESG*')")
    ap.add_argument("--unidade", choices=sorted(UNIDADES), help="força a unidade do desenho")
    ap.add_argument("--json", action="store_true", help="saída JSON")
    ap.add_argument("--csv", metavar="ARQ", help="grava CSV (layers e blocos)")
    a = ap.parse_args()

    filtros = [f.strip() for f in a.layers.split(",")] if a.layers else None
    r = extrair(a.dxf, filtros, a.unidade)

    if a.json:
        json.dump(r, sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print(f"Arquivo: {r['arquivo']}  |  unidade: {r['unidade_desenho']}")
        print(f"\n{'LAYER':30} {'ENT':>5} {'COMPR. (m)':>12} {'ÁREA (m²)':>12}")
        for x in r["por_layer"]:
            print(f"{x['layer'][:30]:30} {x['entidades']:>5} {x['comprimento_m']:>12.2f} {x['area_m2']:>12.2f}")
        if r["blocos"]:
            print(f"\n{'LAYER':30} {'BLOCO':30} {'QTD':>5}")
            for b in r["blocos"]:
                print(f"{b['layer'][:30]:30} {b['bloco'][:30]:30} {b['quantidade']:>5}")

    if a.csv:
        with open(a.csv, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f, delimiter=";")
            w.writerow(["tipo", "layer", "bloco", "entidades", "comprimento_m", "area_m2", "quantidade"])
            for x in r["por_layer"]:
                w.writerow(["medida", x["layer"], "", x["entidades"],
                            str(x["comprimento_m"]).replace(".", ","), str(x["area_m2"]).replace(".", ","), ""])
            for b in r["blocos"]:
                w.writerow(["bloco", b["layer"], b["bloco"], "", "", "", b["quantidade"]])
        print(f"\nCSV gravado em {a.csv}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
