<#
.SYNOPSIS
  Converte o relatorio.json do LANG ConfereAuto num texto simples para o responsavel.
#>
param(
  [Parameter(Mandatory = $true)][string]$Relatorio,
  [Parameter(Mandatory = $true)][string]$Destino
)
$ErrorActionPreference = 'Stop'
$r = Get-Content -LiteralPath $Relatorio -Raw -Encoding UTF8 | ConvertFrom-Json
function Qtd($v) { if ($null -eq $v) { 0 } elseif ($v -is [array]) { $v.Count } elseif ($v -is [int] -or $v -is [long]) { $v } else { 1 } }
function Itens($lista) { foreach ($i in @($lista)) { if ($i) { "    - $($i.texto) (camada $($i.camada), handle $($i.handle))" } } }

$l = New-Object System.Collections.Generic.List[string]
$l.Add("LANG ConfereAuto $($r.versao) - $($r.desenho)")
$l.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm')   Modo: $($r.modo)")
$l.Add('')
if ($r.erro) {
  $l.Add("ERRO: $($r.erro)")
} else {
  $l.Add('CORRIGIDO AUTOMATICAMENTE')
  $l.Add("  Camadas das plantas ajustadas ao padrao: $(Qtd $r.camadas.camadas_fora_do_padrao)")
  $l.Add("  Objetos com espessura propria (voltaram para a da camada): $(Qtd $r.camadas.objetos_com_espessura_propria)")
  $l.Add("  Cotas afastadas de textos/blocos: $(Qtd $r.cotas.cotas_movidas)")
  $l.Add("  Material de esquadria preenchido: $(Qtd $r.esquadrias.material_preenchido)")
  $l.Add('')
  $l.Add('PARA VOCE CONFERIR OU DECIDIR')
  $l.Add("  Cotas ainda encostando (nao achei lugar livre): $(Qtd $r.cotas.cotas_com_colisao_sem_solucao)")
  Itens $r.cotas.cotas_com_colisao_sem_solucao | ForEach-Object { $l.Add($_) }
  $l.Add("  Esquadrias com material 'A definir': $(Qtd $r.esquadrias.material_a_definir)")
  $l.Add("  Itens de fossa/sumidouro (confirmar se continua fossa ou rede publica): $(Qtd $r.pendencias.usa_fossa)")
  Itens $r.pendencias.usa_fossa | ForEach-Object { $l.Add($_) }
  $l.Add("  Campos 'A DEFINIR' (prefeitura, zona, recuos, taxas...): $(Qtd $r.pendencias.campos_a_definir)")
  Itens $r.pendencias.campos_a_definir | ForEach-Object { $l.Add($_) }
  $l.Add("  Objetos na camada 0: $(Qtd $r.pendencias.objetos_na_camada_0)")
  if ($r.formato_dxf -eq $true) { $l.Add('  O arquivo veio em DXF; o corrigido foi salvo em DWG.') }
}
$l.Add('')
$l.Add('O arquivo original nao foi alterado. Para localizar um item no AutoCAD use o handle (comando _SELECT e (handent "...")).')
[IO.File]::WriteAllLines($Destino, $l, (New-Object Text.UTF8Encoding($true)))
