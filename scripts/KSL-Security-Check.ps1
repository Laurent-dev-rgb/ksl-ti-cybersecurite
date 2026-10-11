param(
  [string[]]$Urls = @(
    "https://technologies.kslgroupe.ca/",
    "https://technologies.kslgroupe.ca/confidentialite.html",
    "https://technologies.kslgroupe.ca/produits.html"
  )
)

$ErrorActionPreference = "Stop"
$required = @(
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy"
)

Write-Host "=== KSL Security Check — site Technologies ===" -ForegroundColor Cyan
$failed = $false

foreach ($url in $Urls) {
  Write-Host ""
  Write-Host "Vérification: $url" -ForegroundColor Yellow
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -MaximumRedirection 5 -TimeoutSec 20
    if ($r.BaseResponse.ResponseUri.Scheme -ne "https") {
      Write-Host "[FAIL] HTTPS non actif" -ForegroundColor Red
      $failed = $true
    } else {
      Write-Host "[PASS] HTTPS" -ForegroundColor Green
    }

    $headers = @{}
    foreach($k in $r.Headers.Keys){ $headers[$k.ToLowerInvariant()] = [string]$r.Headers[$k] }

    foreach($h in $required){
      if($headers.ContainsKey($h) -and $headers[$h]){
        Write-Host "[PASS] $h" -ForegroundColor Green
      } else {
        Write-Host "[WARN] En-tête absent: $h" -ForegroundColor DarkYellow
        $failed = $true
      }
    }

    if($headers["content-security-policy"] -match "unsafe-eval"){
      Write-Host "[WARN] CSP autorise unsafe-eval" -ForegroundColor DarkYellow
      $failed = $true
    }
  } catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $failed = $true
  }
}

Write-Host ""
foreach($path in @("/.env","/.git/config")){
  try {
    $test = Invoke-WebRequest -Uri ("https://technologies.kslgroupe.ca"+$path) -Method Get -MaximumRedirection 0 -TimeoutSec 10 -ErrorAction Stop
    if($test.StatusCode -eq 200){
      Write-Host "[FAIL] Fichier sensible accessible: $path" -ForegroundColor Red
      $failed = $true
    }
  } catch {
    Write-Host "[PASS] Fichier sensible non accessible: $path" -ForegroundColor Green
  }
}

if($failed){
  Write-Host ""
  Write-Host "Résultat: points à corriger." -ForegroundColor DarkYellow
  exit 1
}
Write-Host ""
Write-Host "Résultat: contrôles automatisables réussis." -ForegroundColor Green
exit 0
