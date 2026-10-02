# vesync-run.ps1 <script.py> - run a VeSync script with the saved login in its
# environment only (never on the command line or in a file).
param([string]$Script = "vesync_probe.py")
$c = Import-Clixml "$PSScriptRoot\.vesync.cred"
$env:VS_USER = $c.UserName
$env:VS_PASS = $c.GetNetworkCredential().Password
& D:\Apps\Python312\python.exe "$PSScriptRoot\$Script"
Remove-Item Env:VS_PASS, Env:VS_USER
