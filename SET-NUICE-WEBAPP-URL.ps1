param(
  [Parameter(Mandatory=$true)]
  [string]$Url,

  [string]$HomeTarget =
    "D:\Viscode\HomeDashboard-Backup\HomeDashboard"
)

$ErrorActionPreference = "Stop"

if ($Url -notmatch '^https://script\.google\.com/macros/s/.+/exec') {
  throw "URL ต้องเป็น Google Apps Script Web App ที่ลงท้ายด้วย /exec"
}

$configPath = Join-Path $HomeTarget "nuice-expense-config.js"

if (-not (Test-Path -LiteralPath $configPath)) {
  throw "ไม่พบ nuice-expense-config.js ที่ $configPath"
}

$content = [System.IO.File]::ReadAllText(
  $configPath,
  [System.Text.Encoding]::UTF8
)

$content = [regex]::Replace(
  $content,
  'webAppUrl:\s*"[^"]*"',
  'webAppUrl: "' + $Url + '"'
)

$utf8 = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $configPath,
  $content,
  $utf8
)

Set-Location $HomeTarget

git add -- nuice-expense-config.js

git commit -m "Connect NuIce expense tracker to Google Apps Script"

if ($LASTEXITCODE -ne 0) {
  Write-Host "ถ้า Git แจ้ง nothing to commit ให้ตรวจ URL ในไฟล์ก่อน" -ForegroundColor Yellow
}

git push origin main

if ($LASTEXITCODE -ne 0) {
  throw "git push ไม่สำเร็จ"
}

Write-Host ""
Write-Host "SUCCESS - Nu'Ice Web App URL pushed to GitHub main" -ForegroundColor Green
