const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const { transform } = require('lightningcss');
const { cssForVariant, normalizeVariant } = require('./theme-variants');

const defaultSafelist = [
  'container',
  'row',
  'pull-right',
  'col-sm-3',
  'col-sm-6',
  'col-sm-9',
  'col-sm-12',
  'col-sm-push-3'
];

async function buildOptimizedCss(cwd, variantName) {
  const themeVariant = normalizeVariant(variantName);
  const bootstrapCssPath = path.join(cwd, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.css');
  const htmlPath = path.join(cwd, 'resume.html');
  const themeTemplatePath = path.join(cwd, 'themes', 'jsonresume-theme-flat-reordered', 'index.js');
  const bootstrapCss = fs.readFileSync(bootstrapCssPath, 'utf8');
  const themeCss = cssForVariant(cwd, themeVariant);
  const purgedBootstrapCss = await purgeBootstrapCss(bootstrapCss, [htmlPath, themeTemplatePath]);

  return {
    baseCss: minifyCss(purgedBootstrapCss, 'bootstrap.purged.css'),
    themeCss: minifyCss(themeCss, `${themeVariant}.css`)
  };
}

async function purgeBootstrapCss(css, contentPaths) {
  const result = await postcss([
    purgecss({
      content: contentPaths,
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: defaultSafelist
    })
  ]).process(css, { from: undefined });

  return result.css;
}

function minifyCss(css, filename) {
  return transform({
    filename,
    code: Buffer.from(css),
    minify: true
  }).code.toString();
}

module.exports = {
  buildOptimizedCss
};
