Add-Type -AssemblyName System.Drawing

$src = "F:\src\keep-it-greasy\img_res\552467997_122103453405021812_5621404526153512135_n.jpg"
$dst = "F:\src\keep-it-greasy\public\assets\images\logo-mascot.png"

$img = [System.Drawing.Bitmap]::FromFile($src)
$w = $img.Width
$h = $img.Height

# Crop the top graphic portion
$cropX = [int]($w * 0.12)
$cropY = [int]($h * 0.01)
$cropW = [int]($w * 0.76)
$cropH = [int]($h * 0.48)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$cropped.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$cropped.Dispose()

Write-Host "Mascot cropped and saved to $dst"
