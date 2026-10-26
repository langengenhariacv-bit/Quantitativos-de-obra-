<#
.SYNOPSIS
  Instala o LANG ConfereAuto no PC: plugin do AutoCAD + executor usado pela Central Dots.
  Guarda a versao anterior como backup (use RESTAURAR.cmd para voltar).
#>
$ErrorActionPreference = 'Stop'
$aqui = $PSScriptRoot
$data = Get-Date -Format 'yyyyMMdd-HHmmss'

if (Get-Process acad -ErrorAction SilentlyContinue) { throw 'Feche o AutoCAD antes de instalar.' }

$plugins = Join-Path $env:APPDATA 'Autodesk\ApplicationPlugins'
$ferr = Join-Path $env:LOCALAPPDATA 'LANG\ConfereAuto'
New-Item -ItemType Directory -Force -Path $plugins, $ferr | Out-Null

$destinos = @(
  @{ de = Join-Path $aqui 'LANG_ConfereAuto.bundle'; para = Join-Path $plugins 'LANG_ConfereAuto.bundle' },
  @{ de = Join-Path $aqui 'ferramentas'; para = Join-Path $ferr 'ferramentas' },
  @{ de = Join-Path $aqui 'central'; para = Join-Path $ferr 'central' }
)
foreach ($d in $destinos) {
  if (Test-Path -LiteralPath $d.para) {
    $bkp = "$($d.para).backup-$data"
    Move-Item -LiteralPath $d.para -Destination $bkp
    Write-Host "Backup: $bkp"
  }
  Copy-Item -LiteralPath $d.de -Destination $d.para -Recurse
  Write-Host "Instalado: $($d.para)"
}

Write-Host ''
Write-Host 'Pronto. Abra o AutoCAD e digite CONFERESOMENTE num projeto gerado para testar.'
Write-Host "Executor para a Central Dots: $(Join-Path $ferr 'ferramentas\Conferir-Projeto.ps1')"
Write-Host "Modulo da Central Dots:       $(Join-Path $ferr 'central\autocad-tool.js')"
