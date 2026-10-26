<#
.SYNOPSIS
  Confere e corrige um projeto do LANG ProjetoAuto no AutoCAD, sem tocar no arquivo original.

.DESCRIPTION
  1. Copia o DWG/DXF para uma pasta de trabalho (o original nunca e aberto para gravacao).
  2. Usa uma trava do Windows para nunca rodar dois trabalhos de AutoCAD ao mesmo tempo.
  3. Abre a copia no AutoCAD com janela (a geracao do ProjetoAuto nao funciona sem janela).
  4. DXF vira DWG antes de qualquer coisa (o PROJETO para em "LAYOUT IMPLANTACAO" com DXF).
  5. Opcional: roda o PROJETO (-GerarProjeto) com as respostas do questionario ja salvas no croqui.
  6. Roda o LANG ConfereAuto e salva <nome>-CORRIGIDO.dwg + relatorio.json + relatorio.txt.
  Ao final imprime o relatorio em JSON na saida padrao (para a Central Dots ler).

.EXAMPLE
  .\Conferir-Projeto.ps1 -Arquivo "D:\Projetos\Casa Silva\croqui.dwg" -Material "Aluminio preto"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Arquivo,
  [string]$Saida = (Join-Path $env:USERPROFILE 'Documents\LANG ConfereAuto'),
  [string]$Material = '',
  [switch]$SomenteConferir,
  [switch]$GerarProjeto,
  [string]$ComandoProjeto = 'PROJETO',
  [int]$TempoLimiteMin = 20,
  [string]$Lisp = ''
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
$logDir = Join-Path $env:LOCALAPPDATA 'LANG\ConfereAuto\logs'   # logs fora da pasta do plugin
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir ("{0:yyyyMMdd}.log" -f (Get-Date))
function Log([string]$m) { Add-Content -Path $log -Encoding UTF8 -Value ("{0:HH:mm:ss} {1}" -f (Get-Date), $m) }
function CaminhoLisp([string]$p) { $p -replace '\\', '/' -replace '"', '' }

# O AutoCAD recusa chamadas COM enquanto esta ocupado (RPC_E_CALL_REJECTED / RPC_E_SERVERCALL_RETRYLATER).
# Repete por ate 2 minutos antes de desistir.
function Com([scriptblock]$chamada) {
  $fim = (Get-Date).AddMinutes(2)
  while ($true) {
    try { return (& $chamada) }
    catch {
      $h = $_.Exception.HResult; if ($_.Exception.InnerException) { $h = $_.Exception.InnerException.HResult }
      if (($h -ne -2147418111 -and $h -ne -2147417846) -or (Get-Date) -gt $fim) { throw }
      Start-Sleep -Milliseconds 500
    }
  }
}

function Resultado($obj, [int]$codigo) {
  $obj | ConvertTo-Json -Depth 12 -Compress | Write-Output
  exit $codigo
}

if (-not (Test-Path -LiteralPath $Arquivo -PathType Leaf)) { Resultado @{ ok = $false; erro = "Arquivo nao encontrado: $Arquivo" } 2 }
$ext = [IO.Path]::GetExtension($Arquivo).ToLowerInvariant()
if ($ext -notin '.dwg', '.dxf') { Resultado @{ ok = $false; erro = 'Use um arquivo .dwg ou .dxf' } 2 }

if (-not $Lisp) {
  $candidatos = @(
    (Join-Path $env:APPDATA 'Autodesk\ApplicationPlugins\LANG_ConfereAuto.bundle\Contents\LANG_ConfereAuto.lsp'),
    (Join-Path $PSScriptRoot '..\LANG_ConfereAuto.bundle\Contents\LANG_ConfereAuto.lsp')
  )
  $Lisp = $candidatos | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $Lisp) { Resultado @{ ok = $false; erro = 'LANG_ConfereAuto.lsp nao encontrado; rode instalar.ps1' } 2 }
}
$Lisp = (Resolve-Path -LiteralPath $Lisp).Path

# Uma trava para todos: Central, bot e uso manual do script.
$trava = New-Object System.Threading.Mutex($false, 'Global\LANG_ConfereAuto_AutoCAD')
Log "aguardando trava: $Arquivo"
if (-not $trava.WaitOne([TimeSpan]::FromMinutes($TempoLimiteMin))) { Resultado @{ ok = $false; erro = 'Outro trabalho de AutoCAD ainda esta rodando' } 3 }

$acad = $null; $doc = $null; $abrimosAcad = $false
try {
  $base = [IO.Path]::GetFileNameWithoutExtension($Arquivo)
  $pasta = Join-Path $Saida ("{0}-{1:yyyyMMdd-HHmmss}" -f $base, (Get-Date))
  New-Item -ItemType Directory -Force -Path $pasta | Out-Null
  $copia = Join-Path $pasta ("$base-ORIGINAL$ext")
  Copy-Item -LiteralPath $Arquivo -Destination $copia
  # No modo so conferir o DWG salvo e so a copia convertida, sem correcoes.
  $corrigido = Join-Path $pasta ("$base-{0}.dwg" -f $(if ($SomenteConferir) { 'COPIA' } else { 'CORRIGIDO' }))
  $relJson = Join-Path $pasta 'relatorio.json'
  $param = Join-Path $pasta 'parametros.txt'
  $modo = if ($SomenteConferir) { 'conferir' } else { 'corrigir' }
  [IO.File]::WriteAllText($param, "modo=$modo`r`nmaterial=$Material`r`n", (New-Object Text.UTF8Encoding($false)))
  Log "copia em $pasta (modo $modo)"

  function Esperar([scriptblock]$pronto, [string]$etapa) {
    $fim = (Get-Date).AddMinutes($TempoLimiteMin)
    while (-not (& $pronto)) {
      if ((Get-Date) -gt $fim) { throw "Tempo esgotado em: $etapa" }
      Start-Sleep -Milliseconds 800
    }
  }
  function Quieto { try { $acad.GetAcadState().IsQuiescent } catch { $false } }
  function Lisp([string]$expr) { Esperar { Quieto } 'AutoCAD ocupado'; Com { $doc.SendCommand("$expr`n") } }

  # Usa o AutoCAD aberto; se ele falhar (por exemplo, estava fechando), espera ele sair e tenta uma vez num novo.
  for ($tentativa = 1; ; $tentativa++) {
    try {
      if ($tentativa -eq 1) { try { $acad = [Runtime.InteropServices.Marshal]::GetActiveObject('AutoCAD.Application') } catch { $acad = $null } }
      if (-not $acad) {
        $fimFechar = (Get-Date).AddSeconds(90)
        while ((Get-Process acad -ErrorAction SilentlyContinue) -and (Get-Date) -lt $fimFechar) { Start-Sleep 1 }
        $acad = New-Object -ComObject 'AutoCAD.Application'; $abrimosAcad = $true; Start-Sleep 5
      }
      Com { $acad.Visible = $true }
      $doc = Com { $acad.Documents.Open($copia, $false) }
      if (-not $doc) { throw 'O AutoCAD nao abriu o desenho.' }
      break
    }
    catch {
      if ($tentativa -ge 2 -or $abrimosAcad) { throw }
      Log "AutoCAD aberto nao respondeu ($($_.Exception.Message)); abrindo outro"
      $acad = $null; $doc = $null
    }
  }
  Com { $doc.Activate() }
  Esperar { Quieto } 'abrir desenho'
  Lisp "(load `"$(CaminhoLisp $Lisp)`")"

  # DXF -> DWG antes de gerar ou conferir.
  Lisp "(lang-confere:salvar-dwg `"$(CaminhoLisp $corrigido)`")"
  Esperar { (Quieto) -and (Test-Path -LiteralPath $corrigido) } 'salvar DWG'

  if ($GerarProjeto) {
    # Mesmo roteiro usado nos testes de 21/10: o questionario usa as respostas ja salvas no desenho
    # (so neste documento; cada desenho tem o proprio espaco LISP), depois PROJETO > ALL > Aceitar.
    Log "rodando $ComandoProjeto"
    Lisp '(if lcq:ler (defun lcq:questionario () (lcq:ler)))'
    Esperar { Quieto } 'preparar questionario'
    Com { $doc.SendCommand("$ComandoProjeto`nALL`n`nAceitar`n`n`n") }
    Start-Sleep 3
    Esperar { Quieto } 'gerar projeto'
  }

  Lisp "(lang-confere:executar `"$(CaminhoLisp $param)`" `"$(CaminhoLisp $relJson)`")"
  Esperar { (Quieto) -and (Test-Path -LiteralPath $relJson) } 'conferir'

  if (-not $SomenteConferir) { Com { $doc.Save() }; Esperar { Quieto } 'salvar correcoes' }
  Com { $doc.Close($false) }; $doc = $null

  $rel = Get-Content -LiteralPath $relJson -Raw -Encoding UTF8 | ConvertFrom-Json
  $texto = Join-Path $pasta 'relatorio.txt'
  & (Join-Path $PSScriptRoot 'Relatorio-Texto.ps1') -Relatorio $relJson -Destino $texto
  Log "ok: $pasta"
  Resultado @{
    ok = (-not $rel.erro); pasta = $pasta; original = $Arquivo
    corrigido = $(if ($SomenteConferir) { $null } else { $corrigido })
    relatorio_json = $relJson; relatorio_txt = $texto; relatorio = $rel
  } 0
}
catch {
  Log "erro: $($_.Exception.Message)"
  Resultado @{ ok = $false; erro = $_.Exception.Message; pasta = $pasta } 1
}
finally {
  if ($doc) { try { $doc.Close($false) } catch {} }
  if ($abrimosAcad -and $acad) {
    try { $acad.Quit() } catch {}
    # So libera a trava quando o AutoCAD fechou: o proximo trabalho nao pode pegar a instancia fechando.
    $fimQuit = (Get-Date).AddSeconds(90)
    while ((Get-Process acad -ErrorAction SilentlyContinue) -and (Get-Date) -lt $fimQuit) { Start-Sleep 1 }
  }
  $trava.ReleaseMutex(); $trava.Dispose()
}
