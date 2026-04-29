const fs = require('node:fs');
const path = require('node:path');

const baseStyleBlockPattern = /(<style type="text\/css" data-base-css>\n)([\s\S]*?)(\n    <\/style>)/;
const themeStyleBlockPattern = /(<style type="text\/css" data-theme-css>\n)([\s\S]*?)(\n    <\/style>)/;

const variants = [
  'original',
  'editorial',
  'atlas',
  'blueprint',
  'chrome',
  'compact',
  'coral',
  'executive',
  'folio',
  'graphite',
  'high-contrast',
  'ledger',
  'lab',
  'magazine',
  'mint',
  'monochrome',
  'newsroom',
  'prism',
  'signal',
  'studio',
  'swiss',
  'warm-minimal',
  'terminal'
];

function normalizeVariant(value) {
  const variant = value || 'original';

  if (!variants.includes(variant)) {
    throw new Error(`Unknown THEME_VARIANT "${variant}". Expected one of: ${variants.join(', ')}`);
  }

  return variant;
}

function filenameFor(slug) {
  return `${slug}.html`;
}

function labelFor(slug) {
  return slug
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function cssForVariant(cwd, slug) {
  const themeDir = path.join(cwd, 'themes', 'jsonresume-theme-flat-reordered');
  const variantStylesDir = path.join(themeDir, 'variants');

  if (slug === 'original') {
    return fs.readFileSync(path.join(variantStylesDir, 'original.css'), 'utf8').trimEnd();
  }

  const cssPath = path.join(variantStylesDir, `${slug}.css`);
  const sharedVariantCssPath = path.join(variantStylesDir, 'work-skills.css');
  const css = fs.readFileSync(cssPath, 'utf8').trimEnd();
  const sharedCss = fs.readFileSync(sharedVariantCssPath, 'utf8').trimEnd();

  return `${css}\n\n${sharedCss}`;
}

function applyVariantToHtml(html, css) {
  if (!themeStyleBlockPattern.test(html)) {
    throw new Error('Could not find the embedded theme CSS block in resume.html.');
  }

  return html.replace(themeStyleBlockPattern, `$1${css}$3`);
}

function applyBaseCssToHtml(html, css) {
  if (!baseStyleBlockPattern.test(html)) {
    throw new Error('Could not find the embedded base CSS block in resume.html.');
  }

  return html.replace(baseStyleBlockPattern, `$1${css}$3`);
}

module.exports = {
  applyBaseCssToHtml,
  applyVariantToHtml,
  cssForVariant,
  filenameFor,
  labelFor,
  normalizeVariant,
  variants
};
