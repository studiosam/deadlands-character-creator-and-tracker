param(
  [string]$Source = "assets\studiosam.gif",
  [string]$Output = "electron\build-resources\installerSidebar.bmp"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Output))
$outputDirectory = [System.IO.Path]::GetDirectoryName($outputPath)
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$canvas = New-Object System.Drawing.Bitmap 164, 314, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)

try {
  $sourceImage.SelectActiveFrame([System.Drawing.Imaging.FrameDimension]::Time, 0) | Out-Null
  $graphics.Clear([System.Drawing.Color]::FromArgb(18, 18, 18))
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $imageSize = 156
  $destination = New-Object System.Drawing.Rectangle 4, 79, $imageSize, $imageSize
  $graphics.DrawImage($sourceImage, $destination)
  $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Bmp)
  Write-Output "Generated installer sidebar: $outputPath"
}
finally {
  $graphics.Dispose()
  $canvas.Dispose()
  $sourceImage.Dispose()
}
