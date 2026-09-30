# render.ps1 <page.html or URL> <out.png> [width] [height]
# Headless Edge screenshot at device scale 1. Overwrites <out.png> in place
# (no deletes) and keeps one throwaway browser profile in %TEMP%.
param([string]$Src, [string]$Out, [int]$W = 2560, [int]$H = 720)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$e = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not $Src.StartsWith("http")) {
  $qs = ""; if ($Src.Contains("?")) { $qs = $Src.Substring($Src.IndexOf("?")); $Src = $Src.Substring(0, $Src.IndexOf("?")) }
  $Src = ([Uri](Resolve-Path $Src).Path).AbsoluteUri + $qs
}
$outPath = if ([IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path $here $Out }
$before = if (Test-Path $outPath) { (Get-Item $outPath).LastWriteTime } else { [datetime]::MinValue }
$prof = Join-Path $env:TEMP "daily-render-profile"
$args = @('--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  "--user-data-dir=$prof", "--window-size=$W,$H", '--force-device-scale-factor=1',
  '--virtual-time-budget=12000', "--screenshot=$outPath", $Src)
Start-Process -FilePath $e -ArgumentList $args -Wait -WindowStyle Hidden | Out-Null
if ((Test-Path $outPath) -and (Get-Item $outPath).LastWriteTime -gt $before) { "$Out ok $((Get-Item $outPath).Length)" }
else { "$Out NOT WRITTEN" }
