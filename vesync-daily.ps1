# vesync-daily.ps1 - the hourly task. Records calories and weigh-ins; if
# VeSync refuses the saved session, logs in again from .vesync.cred and retries.
$py = "D:\Apps\Python312\python.exe"
Set-Location $PSScriptRoot
$log = "$PSScriptRoot\vesync.log"
& $py vesync_daily.py *>> $log
if ($LASTEXITCODE -ne 0) {
    "[$(Get-Date -Format s)] session refused, logging in again" | Out-File $log -Append -Encoding utf8
    & powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot\vesync-run.ps1" vesync_probe.py *>> $log
    & $py vesync_daily.py *>> $log
}
