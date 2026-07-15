param(
  [switch]$Watch,
  [int]$PollSeconds = 2,
  [int]$DeleteRetrySeconds = 600
)

$ErrorActionPreference = "SilentlyContinue"

if (-not $Watch) {
  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    ('"{0}"' -f $PSCommandPath),
    "-Watch",
    "-PollSeconds",
    $PollSeconds,
    "-DeleteRetrySeconds",
    $DeleteRetrySeconds
  )

  Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -WindowStyle Hidden
  Write-Output "Cleanup watcher started. It will remove release\win-unpacked.tmp after VS Code closes."
  exit 0
}

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$target = [IO.Path]::GetFullPath((Join-Path $projectRoot "release\win-unpacked.tmp"))
$expectedTarget = [IO.Path]::GetFullPath((Join-Path $projectRoot "release\win-unpacked.tmp"))

if (-not $target.Equals($expectedTarget, [StringComparison]::OrdinalIgnoreCase)) {
  exit 2
}

$editorProcessNames = @("Code", "Code - Insiders", "Cursor", "VSCodium")

while (
  Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessName -in $editorProcessNames }
) {
  Start-Sleep -Seconds $PollSeconds
}

$deadline = (Get-Date).AddSeconds($DeleteRetrySeconds)
do {
  if (-not (Test-Path -LiteralPath $target)) {
    exit 0
  }

  Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path -LiteralPath $target)) {
    exit 0
  }

  Start-Sleep -Seconds $PollSeconds
} while ((Get-Date) -lt $deadline)

exit 1
