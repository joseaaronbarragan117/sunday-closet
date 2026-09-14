# ==============================================================================
# Script DevOps: Despliegue Directo a Rama gh-pages en GitHub
# Sunday Clóset Ecosystem
# ==============================================================================

$ErrorActionPreference = "Stop"

# 1. Localizar Git en el sistema
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($gitCmd) {
    $GIT_BIN = "git"
} elseif (Test-Path "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe") {
    $GIT_BIN = "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
} elseif (Test-Path "C:\Program Files\Git\cmd\git.exe") {
    $GIT_BIN = "C:\Program Files\Git\cmd\git.exe"
} else {
    Write-Error "No se encontró git.exe. Asegúrate de tener Git instalado o en el PATH."
    exit 1
}

$ROOT_DIR = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $ROOT_DIR

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 DEVOPS: DESPLIEGUE A GITHUB PAGES (SUNDAY CLÓSET)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Directorio raíz: $ROOT_DIR"
Write-Host "Git detectado: $GIT_BIN`n"

# 2. Verificar si es un repositorio git inicializado
$isGit = & $GIT_BIN rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Inicializando repositorio Git local..." -ForegroundColor Yellow
    & $GIT_BIN init
    & $GIT_BIN branch -M main
}

# 3. Obtener nombre del repositorio desde el remote
$remoteUrl = & $GIT_BIN config --get remote.origin.url 2>$null
$repoName = ""
if ($remoteUrl) {
    if ($remoteUrl -match "/([^/]+?)(\.git)?$") {
        $repoName = $matches[1]
        Write-Host "Repositorio remoto detectado: $repoName ($remoteUrl)" -ForegroundColor Green
    }
} else {
    Write-Host "Aviso: No hay remote origin configurado aún." -ForegroundColor Yellow
    Write-Host "Usa: git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git" -ForegroundColor Gray
}

# 4. Compilar y ensamblar los 3 proyectos
Write-Host "`n📦 Compilando y ensamblando sitios estáticos con Node.js..." -ForegroundColor Cyan
node "$ROOT_DIR\scripts\build-all.mjs" $repoName

$DIST_DIR = "$ROOT_DIR\dist_gh_pages"
if (-not (Test-Path "$DIST_DIR\index.html")) {
    Write-Error "Error: No se generó correctamente la carpeta de salida en $DIST_DIR"
    exit 1
}

# 5. Desplegar a la rama gh-pages usando un árbol temporal limpio
Write-Host "`n🚀 Preparando publicación en la rama gh-pages..." -ForegroundColor Cyan
Set-Location $DIST_DIR

& $GIT_BIN init -b gh-pages
& $GIT_BIN add -A
& $GIT_BIN commit -m "Deploy Sunday Closet Ecosystem to GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

if ($remoteUrl) {
    Write-Host "`nSubiendo a GitHub (rama gh-pages)..." -ForegroundColor Yellow
    & $GIT_BIN push -f $remoteUrl gh-pages:gh-pages
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================================" -ForegroundColor Green
        Write-Host "🎉 ¡DESPLIEGUE PUBLICADO CON ÉXITO EN GITHUB PAGES!" -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host "Verifica la publicación en: https://<tu-usuario>.github.io/$repoName/" -ForegroundColor Cyan
        Write-Host "1. Tienda Online:   https://<tu-usuario>.github.io/$repoName/web/"
        Write-Host "2. Dashboard PC:    https://<tu-usuario>.github.io/$repoName/dashboard/"
        Write-Host "3. Dashboard Móvil: https://<tu-usuario>.github.io/$repoName/mobile/"
    }
} else {
    Write-Host "`nLos archivos estáticos están listos en 'dist_gh_pages/'." -ForegroundColor Yellow
    Write-Host "Para publicarlos en GitHub, ejecuta:" -ForegroundColor Cyan
    Write-Host "  git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git" -ForegroundColor White
    Write-Host "  powershell scripts/deploy-gh-pages.ps1" -ForegroundColor White
}

Set-Location $ROOT_DIR
