$ErrorActionPreference = "Stop"

$scriptDir = "c:/Users/r0912/Desktop/AntiGravity_develop/riggievoice"

$types = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/src/types.ts"
$audio = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/src/audio.ts"
$components = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/src/components.ts"
$app = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/src/app.ts"
$test = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/src/test.ts"

# index.htmlのビルド
$indexTemplate = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/index.template.html"
$indexScripts = "<script type=`"text/babel`" data-presets=`"typescript`">`n$types`n$audio`n$components`n$app`n</script>"
$indexBuilt = $indexTemplate.Replace("<!-- INLINE_SCRIPTS_PLACEHOLDER -->", $indexScripts)
[System.IO.File]::WriteAllText("$scriptDir/index.html", $indexBuilt, [System.Text.Encoding]::UTF8)

# test.htmlのビルド
$testTemplate = Get-Content -Raw -Encoding utf8 -Path "$scriptDir/test.template.html"
$testScripts = "<script type=`"text/babel`" data-presets=`"typescript`">`n$types`n$audio`n$components`n$app`n$test`n</script>"
$testBuilt = $testTemplate.Replace("<!-- INLINE_SCRIPTS_PLACEHOLDER -->", $testScripts)
[System.IO.File]::WriteAllText("$scriptDir/test.html", $testBuilt, [System.Text.Encoding]::UTF8)

Write-Output "Build completed successfully!"
