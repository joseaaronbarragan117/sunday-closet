import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Nombre del repositorio en GitHub (opcional desde argumento o por defecto 'sunday-closet')
const repoName = process.argv[2] ? process.argv[2].replace(/^\/+|\/+$/g, '') : '';
const basePrefix = repoName ? `/${repoName}` : '';

const outputDir = path.join(rootDir, 'dist_gh_pages');

console.log('========================================================');
console.log('🚀 SUNDAY CLÓSET — BUILD MONOREPO PARA GITHUB PAGES');
console.log(`📦 Repositorio objetivo: ${repoName ? repoName : '(Raíz de dominio personalizado)'}`);
console.log(`📂 Directorio de salida: ${outputDir}`);
console.log('========================================================\n');

// 1. Limpiar directorio de salida
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 2. Crear archivo .nojekyll (CRÍTICO para que GitHub Pages no bloquee _next/)
fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');

// 3. Copiar portal principal y 404 router
const portalIndex = path.join(rootDir, 'portal', 'index.html');
const portal404 = path.join(rootDir, 'portal', '404.html');

if (fs.existsSync(portalIndex)) {
  let portalHtml = fs.readFileSync(portalIndex, 'utf8');
  // Ajustar enlaces del portal si se especificó nombre de repo
  if (repoName) {
    portalHtml = portalHtml
      .replace(/href="\.\/web\/"/g, `href="/${repoName}/web/"`)
      .replace(/href="\.\/dashboard\/"/g, `href="/${repoName}/dashboard/"`)
      .replace(/href="\.\/mobile\/"/g, `href="/${repoName}/mobile/"`)
      .replace(/href="\.\/web-mobile\/"/g, `href="/${repoName}/web-mobile/"`);
  }
  fs.writeFileSync(path.join(outputDir, 'index.html'), portalHtml);
}

if (fs.existsSync(portal404)) {
  fs.copyFileSync(portal404, path.join(outputDir, '404.html'));
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

// 4. Compilar Sunday Closet Web
console.log('🛍️  [1/3] Compilando Tienda Online (sunday-closet-web)...');
try {
  const env = {
    ...process.env,
    OUTPUT_MODE: 'export',
    NEXT_PUBLIC_BASE_PATH: `${basePrefix}/web`,
  };
  execSync('npm run build', {
    cwd: path.join(rootDir, 'sunday-closet-web'),
    stdio: 'inherit',
    env,
  });

  const webOut = path.join(rootDir, 'sunday-closet-web', 'out');
  if (fs.existsSync(webOut)) {
    copyRecursiveSync(webOut, path.join(outputDir, 'web'));
    console.log('✅ Tienda Online ensamblada correctamente en dist_gh_pages/web/\n');
  }
} catch (err) {
  console.warn('⚠️ Advertencia en compilación de web:', err.message);
}

// 5. Compilar Dashboard Escritorio
console.log('💻 [2/3] Compilando Dashboard Escritorio (sunday-closet-dashboard)...');
try {
  const dashDir = path.join(rootDir, 'sunday-closet-dashboard');
  const apiDir = path.join(dashDir, 'app', 'api');
  const apiTemp = path.join(dashDir, 'app', '_api_temp');
  const nextCache = path.join(dashDir, '.next');

  if (fs.existsSync(apiDir)) fs.renameSync(apiDir, apiTemp);
  if (fs.existsSync(nextCache)) fs.rmSync(nextCache, { recursive: true, force: true });

  try {
    const env = {
      ...process.env,
      OUTPUT_MODE: 'export',
      NEXT_PUBLIC_BASE_PATH: `${basePrefix}/dashboard`,
    };
    execSync('npm run build', {
      cwd: dashDir,
      stdio: 'inherit',
      env,
    });
  } finally {
    if (fs.existsSync(apiTemp)) fs.renameSync(apiTemp, apiDir);
  }

  const dashOut = path.join(dashDir, 'out');
  if (fs.existsSync(dashOut)) {
    copyRecursiveSync(dashOut, path.join(outputDir, 'dashboard'));
    console.log('✅ Dashboard Escritorio ensamblado en dist_gh_pages/dashboard/\n');
  }
} catch (err) {
  console.warn('⚠️ Advertencia en compilación de dashboard:', err.message);
}

// 6. Compilar Dashboard Celular
console.log('📱 [3/3] Compilando Dashboard Celular (sunday-closet-mobile)...');
try {
  const mobDir = path.join(rootDir, 'sunday-closet-mobile');
  const apiDir = path.join(mobDir, 'app', 'api');
  const apiTemp = path.join(mobDir, 'app', '_api_temp');
  const nextCache = path.join(mobDir, '.next');

  if (fs.existsSync(apiDir)) fs.renameSync(apiDir, apiTemp);
  if (fs.existsSync(nextCache)) fs.rmSync(nextCache, { recursive: true, force: true });

  try {
    const env = {
      ...process.env,
      OUTPUT_MODE: 'export',
      NEXT_PUBLIC_BASE_PATH: `${basePrefix}/mobile`,
    };
    execSync('npm run build', {
      cwd: mobDir,
      stdio: 'inherit',
      env,
    });
  } finally {
    if (fs.existsSync(apiTemp)) fs.renameSync(apiTemp, apiDir);
  }

  const mobOut = path.join(mobDir, 'out');
  if (fs.existsSync(mobOut)) {
    copyRecursiveSync(mobOut, path.join(outputDir, 'mobile'));
    console.log('✅ Dashboard Celular ensamblado en dist_gh_pages/mobile/\n');
  }
// 7. Compilar Tienda Móvil
console.log('📱 [4/4] Compilando Tienda Móvil (sunday-closet-web-mobile)...');
try {
  const env = {
    ...process.env,
    OUTPUT_MODE: 'export',
    NEXT_PUBLIC_BASE_PATH: `${basePrefix}/web-mobile`,
  };
  execSync('npm run build', {
    cwd: path.join(rootDir, 'sunday-closet-web-mobile'),
    stdio: 'inherit',
    env,
  });

  const webMobOut = path.join(rootDir, 'sunday-closet-web-mobile', 'out');
  if (fs.existsSync(webMobOut)) {
    copyRecursiveSync(webMobOut, path.join(outputDir, 'web-mobile'));
    console.log('✅ Tienda Móvil ensamblada en dist_gh_pages/web-mobile/\n');
  }
} catch (err) {
  console.warn('⚠️ Advertencia en compilación de web-mobile:', err.message);
}

console.log('========================================================');
console.log('🎉 ¡ENSAMBLAJE COMPLETADO CON ÉXITO!');
console.log(`📁 Contenido listo para desplegar en: ${outputDir}`);
console.log('========================================================');
