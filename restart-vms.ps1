# Restart the two VMware Workstation VMs (Home Assistant and Ubuntu) cleanly.
# Run from "Restart VMs.bat" on the desktop. -DryRun prints the steps only.
#
#   1. stop each VM: a soft shutdown first, a hard power-off if it hangs
#   2. close Workstation and any VM process still holding a lock
#   3. delete the *.lck lock folders - left behind, they make Workstation
#      ask "this virtual machine appears to be in use" and wait for a click
#   4. set msg.autoAnswer so any other dialog answers itself
#   5. start both VMs in Workstation
param([switch]$DryRun)
$ErrorActionPreference = "Continue"

$WS = "D:\Program Files (x86)\VMware\VMware Workstation"
$VMRUN = Join-Path $WS "vmrun.exe"
# Home Assistant first: the lights need it, and it is the slower to boot.
$VMS = @(
  "D:\VMs\HomeAssistant\HomeAssistant.vmx",
  "D:\Users\$env:USERNAME\Documents\Virtual Machines\Ubuntu 64-bit\Ubuntu 64-bit.vmx"
)

function Say($m){ Write-Host ("[{0}] {1}" -f (Get-Date -Format HH:mm:ss), $m) }
function Running(){ (& $VMRUN -T ws list) | Select-Object -Skip 1 }
function Do-It($what, [scriptblock]$act){ if($DryRun){ Say "DRY RUN: $what" } else { Say $what; & $act } }

if(-not (Test-Path $VMRUN)){ Say "vmrun.exe not found at $VMRUN"; exit 1 }

# ---- 1. stop
foreach($vmx in $VMS){
  $name = [IO.Path]::GetFileNameWithoutExtension($vmx)
  if(-not ((Running) -contains $vmx)){ Say "$name is not running"; continue }
  Do-It "Shutting down $name (up to 90 s)" {
    $j = Start-Job { param($r, $v) & $r -T ws stop $v soft } -ArgumentList $VMRUN, $vmx
    if(-not (Wait-Job $j -Timeout 90)){ Say "  soft shutdown hung" }
    Remove-Job $j -Force
  }
  if(-not $DryRun -and ((Running) -contains $vmx)){
    Say "  powering $name off"
    & $VMRUN -T ws stop $vmx hard | Out-Null
  }
}

# ---- 2. close Workstation and anything still holding a VM
Do-It "Closing VMware Workstation" {
  Get-Process vmware -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  foreach($vmx in $VMS){
    Get-CimInstance Win32_Process -Filter "Name='vmware-vmx.exe'" |
      Where-Object { $_.CommandLine -like "*$vmx*" } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  }
  Start-Sleep -Seconds 3
}

# ---- 3 + 4. locks and dialogs
foreach($vmx in $VMS){
  $dir = Split-Path $vmx
  Get-ChildItem $dir -Filter *.lck -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $p = $_.FullName
    Do-It "Deleting lock $($_.Name)" { Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue }
  }
  if(-not (Select-String -Path $vmx -Pattern '^msg\.autoAnswer' -Quiet)){
    Do-It "Turning on auto-answer for $([IO.Path]::GetFileName($vmx))" {
      Add-Content -Path $vmx -Value 'msg.autoAnswer = "TRUE"' -Encoding ascii
    }
  }
}

# ---- 5. start
foreach($vmx in $VMS){
  $name = [IO.Path]::GetFileNameWithoutExtension($vmx)
  Do-It "Starting $name" { & $VMRUN -T ws start $vmx gui | Out-Host; Start-Sleep -Seconds 5 }
}

if(-not $DryRun){
  Start-Sleep -Seconds 5
  $up = Running
  foreach($vmx in $VMS){
    $name = [IO.Path]::GetFileNameWithoutExtension($vmx)
    if($up -contains $vmx){ Say "OK  $name is running" } else { Say "FAIL  $name did not start" }
  }
  Say "Home Assistant takes a minute or two to answer after boot; the lights follow on their own."
}
