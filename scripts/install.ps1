$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Bin = Join-Path $env:USERPROFILE "bin"
New-Item -ItemType Directory -Force -Path $Bin | Out-Null
$Shim = Join-Path $Bin "zine.cmd"
@"
@echo off
node "$Root\src\cli\index.js" %*
"@ | Set-Content -Encoding ASCII $Shim
& $Shim --version
Write-Host "ZINE installed at $Shim"
