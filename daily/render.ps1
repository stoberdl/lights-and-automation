param([string]$Src, [string]$Out, [int]$W = 2560, [int]$H = 720)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$e = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not $Src.StartsWith("http")) {
  $qs = ""; if ($Src.Contains("?")) { $qs = $Src.Substring($Src.IndexOf("?")); $Src = $Src.Substring(0, $Src.IndexOf("?")) }
  $Src = ([Uri](Resolve-Path $Src).Path).AbsoluteUri + $qs
}
$outPath = Join-Path $here $Out
if (Test-Path $outPath) { Remove-Item $outPath -Confirm:$false }
$prof = Join-Path $here ("prof-" + [IO.Path]::GetFileNameWithoutExtension($Out))
$args = @('--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  "--user-data-dir=$prof", "--window-size=$W,$H", '--force-device-scale-factor=1',
  '--virtual-time-budget=12000', "--screenshot=$outPath", $Src)
Start-Process -FilePath $e -ArgumentList $args -Wait -WindowStyle Hidden | Out-Null
if (Test-Path $outPath) { "$Out ok $((Get-Item $outPath).Length)" } else { "$Out MISSING" }
