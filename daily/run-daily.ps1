# run-daily.ps1 - build Daily Window days with Claude, unattended.
#
#   .\run-daily.ps1                         next Monday-Sunday (the weekly run)
#   .\run-daily.ps1 -Dates 2026-09-30,2026-10-01 -MaxNewScenes 4
#
# Runs Claude Code headless in this folder with WEEKLY_PROMPT.md as the brief.
# Permissions come from .claude\settings.local.json here (web yes, deletes no).
# The full event stream goes to logs\run-<stamp>.log; the result is days.json
# plus a review and PNGs in calendar\.
#   .\run-daily.ps1 -Daily                  today and tomorrow (the 4am task)
param([string[]]$Dates = @(), [int]$MaxNewScenes = 2, [switch]$Daily)
if ($Daily) {
    $Dates = @((Get-Date).ToString("yyyy-MM-dd"), (Get-Date).AddDays(1).ToString("yyyy-MM-dd"))
}
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$claude = "$env:USERPROFILE\.local\bin\claude.exe"
New-Item -ItemType Directory -Force "$here\logs", "$here\calendar" | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$log = "$here\logs\run-$stamp.log"
$today = Get-Date -Format "yyyy-MM-dd (dddd)"

if ($Dates.Count) { $scope = "Build exactly these dates: " + ($Dates -join ", ") + "." }
else { $scope = "Build the next Monday to Sunday week." }
if ($Daily) { $scope += " A date that already has its own finished scene or art can be kept as is; refresh its title and weather facts only if they changed. A date with no scene, or one using a default background, must get its own picture now." }

# No double quotes inside: Windows PowerShell 5.1 mangles them on the way to
# a native program's command line.
$prompt = "Read WEEKLY_PROMPT.md in this directory and carry it out in full. Today is $today. $scope " +
          "You may write at most $MaxNewScenes new illustrated scenes this run, each with a night version. " +
          "Existing scenes in scenes\ and reference\ may be reused. Merge the result into days.json."

if ($Daily) { $prompt += " Also add one new scene to the current default pool in cycle.json (section 8b) and pick up open scene work from TODO.md (section 8c)." }

# A run counts as done when it exits cleanly and every date it was given has a
# scene or art in days.json. Otherwise (usage limit, crash, network) wait an
# hour and go again, up to 6 tries; each retry resumes rather than restarts.
function Done {
    try { $d = Get-Content "$here\days.json" -Raw -Encoding utf8 | ConvertFrom-Json } catch { return $false }
    foreach ($k in $Dates) { $e = $d.$k; if (-not $e -or -not ($e.scene -or $e.art)) { return $false } }
    return $true
}
for ($try = 1; $try -le 6; $try++) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"; $log = "$here\logs\run-$stamp.log"
    "[$stamp] start (try $try): $scope max new scenes $MaxNewScenes" | Out-File "$here\logs\runs.txt" -Append -Encoding utf8
    $p = $prompt; if ($try -gt 1) { $p += " An earlier attempt today stopped partway; check what already exists and finish the rest." }
    & $claude -p $p --output-format stream-json --verbose `
        --allowedTools "Read,Glob,Grep,Write,Edit,WebFetch,WebSearch,PowerShell" > $log
    $code = $LASTEXITCODE
    "[$(Get-Date -Format yyyyMMdd-HHmmss)] end ($code): $log" | Out-File "$here\logs\runs.txt" -Append -Encoding utf8
    if ($code -eq 0 -and (Done)) { break }
    if ($try -lt 6) { Start-Sleep -Seconds 3600 }
}
