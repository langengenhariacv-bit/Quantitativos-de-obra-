<#
.SYNOPSIS
  Volta para o backup mais recente do LANG ConfereAuto (ou remove, se nao houver backup).
#>
$ErrorActionPreference = 'Stop'
if (Get-Process acad -ErrorAction SilentlyContinue) { throw 'Feche o AutoCAD antes de restaurar.' }
$alvos = @(
  (Join-Path $env:APPDATA 'Autodesk\ApplicationPlugins\LANG_ConfereAuto.bundle'),
  (Join-Path $env:LOCALAPPDATA 'LANG\ConfereAuto\ferramentas'),
  (Join-Path $env:LOCALAPPDATA 'LANG\ConfereAuto\central')
)
foreach ($alvo in $alvos) {
  $bkp = Get-Item -Path "$alvo.backup-*" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1
  if (Test-Path -LiteralPath $alvo) {
    $removido = "$alvo.removido-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Move-Item -LiteralPath $alvo -Destination $removido
    Write-Host "Versao atual guardada em: $removido"
  }
  if ($bkp) { Move-Item -LiteralPath $bkp.FullName -Destination $alvo; Write-Host "Restaurado: $alvo" }
}
