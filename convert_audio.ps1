$barkPath = "c:/Users/r0912/Desktop/AntiGravity_develop/riggievoice/data/bark.m4a"
$shushPath = "c:/Users/r0912/Desktop/AntiGravity_develop/riggievoice/data/shush.m4a"
$barkOut = "c:/Users/r0912/Desktop/AntiGravity_develop/riggievoice/data/bark_base64.txt"
$shushOut = "c:/Users/r0912/Desktop/AntiGravity_develop/riggievoice/data/shush_base64.txt"

try {
    Write-Output "Reading $barkPath"
    if (-not (Test-Path $barkPath)) { throw "Bark file not found at $barkPath" }
    $barkBytes = [System.IO.File]::ReadAllBytes($barkPath)
    Write-Output "Converting bark, size: $($barkBytes.Length)"
    $barkBase64 = [System.Convert]::ToBase64String($barkBytes)
    Write-Output "Writing bark base64 to $barkOut"
    [System.IO.File]::WriteAllText($barkOut, $barkBase64, [System.Text.Encoding]::UTF8)

    Write-Output "Reading $shushPath"
    if (-not (Test-Path $shushPath)) { throw "Shush file not found at $shushPath" }
    $shushBytes = [System.IO.File]::ReadAllBytes($shushPath)
    Write-Output "Converting shush, size: $($shushBytes.Length)"
    $shushBase64 = [System.Convert]::ToBase64String($shushBytes)
    Write-Output "Writing shush base64 to $shushOut"
    [System.IO.File]::WriteAllText($shushOut, $shushBase64, [System.Text.Encoding]::UTF8)

    Write-Output "Successfully converted both files."
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
