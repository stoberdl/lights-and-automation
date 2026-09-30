# Let a phone or the wall tablet reach the dashboard.
#
# serve.py binds 0.0.0.0:8790, but Windows Firewall drops inbound connections
# from other machines by default - so the page loads on this laptop and simply
# times out on the tablet, with nothing in any log to say why.
#
# Scoped to the local subnet, not Any: the dashboard has no auth of its own,
# and anything that can load it can drive the lights.
#
# The subnet is WORKED OUT, not hardcoded. It used to say 192.168.0.0/24, which
# is the apartment - so on any other network the rule silently matched nothing
# and the phone timed out exactly as if no rule existed. It also reported "the
# first 192.168.* address on the box", which on this machine is a VMware
# adapter, not the Wi-Fi.
#
# Virtual adapters are excluded on purpose, and that is a security property
# rather than tidiness: VMnet1/VMnet8 are the VM's networks, and the VM must
# not be able to reach this.
#
# RUN THIS ELEVATED:  right-click -> Run with PowerShell (as administrator)

$ErrorActionPreference = 'Stop'
$name = 'Lights Dashboard 8790'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
        ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "This needs to run as administrator." -ForegroundColor Red
    Write-Host "Right-click the file and choose 'Run with PowerShell' from an admin account."
    exit 1
}

# The real network adapter: up, with a gateway, and not one of VMware's.
$nic = Get-NetIPConfiguration |
       Where-Object { $_.IPv4DefaultGateway -and
                      $_.InterfaceAlias -notmatch 'VMware|VirtualBox|Hyper-V|Loopback' } |
       Select-Object -First 1
if (-not $nic) {
    Write-Host "No connected network adapter with a gateway - is Wi-Fi on?" -ForegroundColor Red
    exit 1
}

$ip     = $nic.IPv4Address.IPAddress
$prefix = $nic.IPv4Address.PrefixLength
$octets = $ip.Split('.')
$subnet = "{0}.{1}.{2}.0/{3}" -f $octets[0], $octets[1], $octets[2], $prefix

# A /24 is the normal home or phone-hotspot case. Anything wider is a network
# shared with strangers - a hotel, an office, a coffee shop - and opening the
# lights to all of it is not something to do without being asked twice.
if ($prefix -lt 24) {
    Write-Host "This network is a /$prefix, which is wider than one household." -ForegroundColor Yellow
    Write-Host "Opening the dashboard to all of $subnet would expose it to every"
    Write-Host "other device on it. Press Ctrl+C to stop, or Enter to continue."
    Read-Host | Out-Null
}

# The profile has to match the one Windows has assigned this network, or the
# rule exists and never applies. A new Wi-Fi network is often filed as Public.
$profileName = (Get-NetConnectionProfile -InterfaceAlias $nic.InterfaceAlias).NetworkCategory
Write-Host "Adapter  $($nic.InterfaceAlias)  $ip/$prefix  ($profileName)"

$existing = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Rule '$name' already exists - removing and recreating so the scope is current."
    Remove-NetFirewallRule -DisplayName $name
}

New-NetFirewallRule -DisplayName $name `
    -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8790 `
    -RemoteAddress $subnet `
    -Profile $profileName `
    -Description "Apartment lighting dashboard, LAN only. Re-run this script after changing networks." | Out-Null

Write-Host "Opened TCP 8790 to $subnet on the $profileName profile." -ForegroundColor Green
Write-Host ""
Write-Host "On the phone or tablet, open:  http://$ip`:8790/" -ForegroundColor Cyan
Write-Host ""
Write-Host "That address is a DHCP lease. It changes when you change networks,"
Write-Host "and can change on the same one - re-run this script when it does,"
Write-Host "or reserve the address on the router at home to stop it moving."
