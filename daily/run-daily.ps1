# run-daily.ps1 - build Daily Window days with Claude, unattended.
#
#   .\run-daily.ps1                         next Monday-Sunday (the weekly run)
#   .\run-daily.ps1 -Dates 2026-09-30,2026-10-01 -MaxNewScenes 4
#
# Runs Claude Code headless in this folder with WEEKLY_PROMPT.md as the brief.
# Permissions come from .claude\settings.local.json here (web yes, deletes no).
# The full event stream goes to logs\run-<stamp>.log; the result is days.json
# plus a review and PNGs in calendar\.
param([string[]]$Dates = @(), [int]$MaxNewScenes = 2)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$claude = "C:\Users\user\.local\bin\claude.exe"
New-Item -ItemType Directory -Force "$here\logs", "$here\calendar" | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$log = "$here\logs\run-$stamp.log"
$today = Get-Date -Format "yyyy-MM-dd (dddd)"

if ($Dates.Count) { $scope = "Build exactly these dates: " + ($Dates -join ", ") + "." }
else { $scope = "Build the next Monday to Sunday week." }

# No double quotes inside: Windows PowerShell 5.1 mangles them on the way to
# a native program's command line.
$prompt = "Read WEEKLY_PROMPT.md in this directory and carry it out in full. Today is $today. $scope " +
          "You may write at most $MaxNewScenes new illustrated scenes this run, each with a night version. " +
          "Existing scenes in scenes\ and reference\ may be reused. Merge the result into days.json."

"[$stamp] start: $scope max new scenes $MaxNewScenes" | Out-File "$here\logs\runs.txt" -Append -Encoding utf8
& $claude -p $prompt --output-format stream-json --verbose `
    --allowedTools "Read,Glob,Grep,Write,Edit,WebFetch,WebSearch,PowerShell" > $log
"[$(Get-Date -Format yyyyMMdd-HHmmss)] end ($LASTEXITCODE): $log" | Out-File "$here\logs\runs.txt" -Append -Encoding utf8
