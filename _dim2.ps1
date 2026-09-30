$base = 'http://127.0.0.1:8790/api/lightd'
$live = Invoke-RestMethod -Uri "$base/live"
$results = @()
foreach ($d in $live.devices) {
    $body = @{ instance = 'brightness'; value = 2 } | ConvertTo-Json -Compress
    try {
        $r = Invoke-RestMethod -Uri "$base/devices/$($d.id)/capability?verify=true" -Method Post -ContentType 'application/json' -Body $body
        $results += [pscustomobject]@{ device = $d.device; ok = $true; resp = ($r | ConvertTo-Json -Compress -Depth 5) }
    } catch {
        $results += [pscustomobject]@{ device = $d.device; ok = $false; resp = $_.Exception.Message }
    }
}
$results | ConvertTo-Json -Depth 6
