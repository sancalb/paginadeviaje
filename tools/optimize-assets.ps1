$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$JpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" }

function Join-ProjectPath {
  param([string] $RelativePath)
  return Join-Path $ProjectRoot $RelativePath
}

function Ensure-ParentDirectory {
  param([string] $Path)
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Save-OptimizedJpeg {
  param(
    [string] $Source,
    [string] $Destination,
    [int] $MaxWidth = 1600,
    [int] $Quality = 82
  )

  $sourcePath = Join-ProjectPath $Source
  $destinationPath = Join-ProjectPath $Destination
  Ensure-ParentDirectory $destinationPath

  $image = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $targetWidth = [Math]::Min($MaxWidth, $image.Width)
    $targetHeight = [int][Math]::Round($image.Height * ($targetWidth / $image.Width))

    $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($image, 0, 0, $targetWidth, $targetHeight)
      }
      finally {
        $graphics.Dispose()
      }

      $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality,
        [int64]$Quality
      )
      $bitmap.Save($destinationPath, $JpegCodec, $encoderParameters)
    }
    finally {
      $bitmap.Dispose()
    }
  }
  finally {
    $image.Dispose()
  }
}

function Get-AlphaBounds {
  param([System.Drawing.Bitmap] $Bitmap)

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 10) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    return New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $Bitmap.Width, $Bitmap.Height
  }

  $padding = 28
  $left = [Math]::Max(0, $minX - $padding)
  $top = [Math]::Max(0, $minY - $padding)
  $right = [Math]::Min($Bitmap.Width - 1, $maxX + $padding)
  $bottom = [Math]::Min($Bitmap.Height - 1, $maxY + $padding)

  $width = $right - $left + 1
  $height = $bottom - $top + 1

  return New-Object System.Drawing.Rectangle -ArgumentList $left, $top, $width, $height
}

function Save-TrimmedPng {
  param(
    [string] $Source,
    [string] $Destination,
    [int] $MaxWidth = 640
  )

  $sourcePath = Join-ProjectPath $Source
  $destinationPath = Join-ProjectPath $Destination
  Ensure-ParentDirectory $destinationPath

  $image = New-Object System.Drawing.Bitmap($sourcePath)
  try {
    $bounds = Get-AlphaBounds $image
    $targetWidth = [Math]::Min($MaxWidth, $bounds.Width)
    $targetHeight = [int][Math]::Round($bounds.Height * ($targetWidth / $bounds.Width))

    $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage(
          $image,
          (New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)),
          $bounds,
          [System.Drawing.GraphicsUnit]::Pixel
        )
      }
      finally {
        $graphics.Dispose()
      }

      $bitmap.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $bitmap.Dispose()
    }
  }
  finally {
    $image.Dispose()
  }
}

$jpegAssets = @(
  @{ Source = "Imagenes\Tokyo-5+.jpg"; Destination = "public\assets\photos\hero-japan.jpg"; MaxWidth = 2200; Quality = 84 },
  @{ Source = "Imagenes\Roma in breve.jpg"; Destination = "public\assets\photos\hero-rome.jpg"; MaxWidth = 2200; Quality = 84 },
  @{ Source = "Imagenes\playa-coche-cuba.jpg"; Destination = "public\assets\photos\hero-caribbean.jpg"; MaxWidth = 2200; Quality = 84 },
  @{ Source = "Imagenes\egypt-ancient-wonders-legendary-nile-header-03.jpg"; Destination = "public\assets\photos\hero-egypt.jpg"; MaxWidth = 2200; Quality = 84 },
  @{ Source = "Imagenes\Tokyo-5+.jpg"; Destination = "public\assets\photos\japan.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\Roma in breve.jpg"; Destination = "public\assets\photos\europe.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\istockphoto-2211711751-612x612.jpg"; Destination = "public\assets\photos\paris.jpg"; MaxWidth = 900; Quality = 82 },
  @{ Source = "Imagenes\cc91fe1c0af0fb3e3de4e95373fa3fd8b99e23c5-1600x1066.jpg"; Destination = "public\assets\photos\las-vegas.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\caption.jpg"; Destination = "public\assets\photos\las-vegas-sign.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\passage-egypt-oberoi-philae-hero.jpg"; Destination = "public\assets\photos\egypt.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\egypt-ancient-wonders-legendary-nile-header-03.jpg"; Destination = "public\assets\photos\egypt-wide.jpg"; MaxWidth = 1800; Quality = 82 },
  @{ Source = "Imagenes\playa-coche-cuba.jpg"; Destination = "public\assets\photos\caribbean.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\Rio-e1475557951839.jpg"; Destination = "public\assets\photos\south-america.jpg"; MaxWidth = 1200; Quality = 82 },
  @{ Source = "Imagenes\falls-sunset.jpg"; Destination = "public\assets\photos\falls.jpg"; MaxWidth = 1800; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-04 at 3.06.59 PM.jpeg"; Destination = "public\assets\characters\diego.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-05 at 1.14.08 PM (1).jpeg"; Destination = "public\assets\characters\diana.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-05 at 2.03.38 PM.jpeg"; Destination = "public\assets\characters\frida.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-04 at 3.46.19 PM.jpeg"; Destination = "public\assets\characters\chente.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-05 at 2.14.56 PM (1).jpeg"; Destination = "public\assets\characters\minerva.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\ChatGPT Image 6 ago 2026, 10_27_33 p.m..png"; Destination = "public\assets\characters\tenoch.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-06 at 3.55.05 PM.jpeg"; Destination = "public\assets\characters\group-las-vegas.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Personajes\WhatsApp Image 2026-08-06 at 5.10.37 PM.jpeg"; Destination = "public\assets\characters\planning-room.jpg"; MaxWidth = 1200; Quality = 84 },
  @{ Source = "Sucursales\MTY.jpeg"; Destination = "public\assets\branches\mty.jpg"; MaxWidth = 1300; Quality = 82 },
  @{ Source = "Sucursales\GDL.jpeg"; Destination = "public\assets\branches\gdl.jpg"; MaxWidth = 1300; Quality = 82 }
)

$pngAssets = @(
  @{ Source = "Logos\RGB\01. Primario - Amarillo\03. PNG\01. Amarillo\02. Imagotipo H_" + "D" + "eviaje.png"; Destination = "public\assets\brand\logo-yellow.png"; MaxWidth = 620 },
  @{ Source = "Logos\RGB\03. Blanco & Negro\03. PNG\01. Blanco\02. Imagotipo H_" + "D" + "eviaje.png"; Destination = "public\assets\brand\logo-white.png"; MaxWidth = 620 },
  @{ Source = "Logos\RGB\03. Blanco & Negro\03. PNG\02. Negro\02. Imagotipo H_" + "D" + "eviaje.png"; Destination = "public\assets\brand\logo-black.png"; MaxWidth = 620 },
  @{ Source = "Logos\RGB\01. Primario - Amarillo\03. PNG\01. Amarillo\01. Isotipo_" + "D" + "eviaje.png"; Destination = "public\assets\brand\mark-yellow.png"; MaxWidth = 256 }
)

foreach ($asset in $jpegAssets) {
  Save-OptimizedJpeg @asset
}

foreach ($asset in $pngAssets) {
  Save-TrimmedPng @asset
}

Write-Host "Optimized $($jpegAssets.Count + $pngAssets.Count) web assets into public/assets."
