# Arranque automático del portafolio al iniciar sesión en Windows.
# 1. Abre Docker Desktop si no está corriendo.
# 2. Espera al motor Docker (hasta 4 minutos).
# 3. Levanta el contenedor del portafolio (:8083) — operación idempotente.

$composeDir = 'C:\xampp\htdocs\Programas\ProgramacionV_2026-II\portafolio-web'
$dockerExe  = Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\Docker Desktop.exe'

if (-not (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
    if (Test-Path $dockerExe) { Start-Process -FilePath $dockerExe }
}

$listo = $false
for ($i = 0; $i -lt 48; $i++) {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $listo = $true; break }
    Start-Sleep -Seconds 5
}

if ($listo) {
    Set-Location $composeDir
    docker compose up -d 2>$null | Out-Null
}
