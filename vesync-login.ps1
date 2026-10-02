# vesync-login.ps1 - ask once for the VeSync account and keep it encrypted
# with Windows DPAPI (readable only by this user on this machine).
$c = Get-Credential -Message "VeSync app login (email and password)"
if ($c) {
    $c | Export-Clixml "$PSScriptRoot\.vesync.cred"
    "saved" | Out-File "$PSScriptRoot\.vesync.ok" -Encoding ascii
}
