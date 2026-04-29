const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');
const { applyBaseCssToHtml, applyVariantToHtml, normalizeVariant } = require('./theme-variants');
const { buildOptimizedCss } = require('./build-css');

const cwd = process.cwd();
const envPath = path.join(cwd, '.env');
const resumePath = path.join(cwd, 'resume.json');
const htmlPath = path.join(cwd, 'resume.html');
const resumedBin = path.join(cwd, 'node_modules', 'resumed', 'bin', 'resumed.js');

dotenv.config({ path: envPath });

const theme = process.env.THEME || 'jsonresume-theme-flat-reordered';
const themeVariant = normalizeVariant(process.env.THEME_VARIANT);

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  runResumed(['validate', resumePath], 'Validation failed.');
  runResumed(['render', resumePath, '--theme', theme, '--output', htmlPath], 'Build failed.');
  await applyConfiguredVariant();
}

function runResumed(args, message) {
  try {
    execFileSync(process.execPath, [resumedBin, ...args], {
      cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(message);
    process.exit(error.status || 1);
  }
}

async function applyConfiguredVariant() {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const { baseCss, themeCss } = await buildOptimizedCss(cwd, themeVariant);
  const withBaseCss = applyBaseCssToHtml(html, baseCss);
  const variantHtml = applyVariantToHtml(withBaseCss, themeCss);

  fs.writeFileSync(htmlPath, variantHtml);
  console.log(`Applied optimized Bootstrap and theme variant: ${themeVariant}`);
}
