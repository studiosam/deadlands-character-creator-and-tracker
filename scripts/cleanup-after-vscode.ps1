param(
  [switch]$Watch,
  [switch]$SkipEditorWait,
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
  Write-Output "Cleanup watcher started. It will remove locked build folders after VS Code closes."
  exit 0
}

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$releaseRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot "release"))
$buildResources = [IO.Path]::GetFullPath((Join-Path $projectRoot "electron\build-resources"))
$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$editorProcessNames = @("Code", "Code - Insiders", "Cursor", "VSCodium")

function Get-CleanupTargets {
  $targets = @()
  $releaseTemporary = Join-Path $releaseRoot "win-unpacked.tmp"
  if (Test-Path -LiteralPath $releaseTemporary) {
    $targets += $releaseTemporary
  }
  if (Test-Path -LiteralPath $buildResources) {
    $targets += $buildResources
  }

  $targets += Get-ChildItem -LiteralPath $temporaryRoot -Directory -Filter "deadlands-electron-*" |
    ForEach-Object { $_.FullName }

  return $targets | Sort-Object -Unique
}

function Test-SafeCleanupTarget([string]$Target) {
  $fullTarget = [IO.Path]::GetFullPath($Target)
  $releaseTemporary = [IO.Path]::GetFullPath((Join-Path $releaseRoot "win-unpacked.tmp"))
  if ($fullTarget.Equals($releaseTemporary, [StringComparison]::OrdinalIgnoreCase)) {
    return $true
  }
  if ($fullTarget.Equals($buildResources, [StringComparison]::OrdinalIgnoreCase)) {
    return $true
  }

  $temporaryPrefix = $temporaryRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
  $relativeName = $fullTarget.Substring($temporaryPrefix.Length)
  return $fullTarget.StartsWith($temporaryPrefix, [StringComparison]::OrdinalIgnoreCase) -and
    -not $relativeName.Contains([IO.Path]::DirectorySeparatorChar) -and
    $relativeName.StartsWith("deadlands-electron-", [StringComparison]::OrdinalIgnoreCase)
}

if (-not $SkipEditorWait) {
  while (
    Get-Process -ErrorAction SilentlyContinue |
      Where-Object { $_.ProcessName -in $editorProcessNames }
  ) {
    Start-Sleep -Seconds $PollSeconds
  }
}

$deadline = (Get-Date).AddSeconds($DeleteRetrySeconds)
do {
  $remaining = @()
  foreach ($target in Get-CleanupTargets) {
    if (-not (Test-SafeCleanupTarget $target)) {
      continue
    }

    Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $target) {
      $remaining += $target
    }
  }

  if ($remaining.Count -eq 0) {
    exit 0
  }

  Start-Sleep -Seconds $PollSeconds
} while ((Get-Date) -lt $deadline)

exit 1
