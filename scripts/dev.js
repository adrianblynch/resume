const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');
const { applyVariantToHtml, cssForVariant, normalizeVariant } = require('./theme-variants');

const cwd = path.join(__dirname, '..');
const envPath = path.join(cwd, '.env');
const resumePath = path.join(cwd, 'resume.json');
const htmlPath = path.join(cwd, 'resume.html');
const variantsDir = path.join(cwd, 'variants');
const buildVariantsPath = path.join(cwd, 'scripts', 'build-design-variants.js');

dotenv.config({ path: envPath });

const port = normalizePort(process.env.PORT || '3000');
const host = process.env.HOST || '127.0.0.1';
const theme = process.env.THEME || 'jsonresume-theme-flat-reordered';
const themeVariant = normalizeVariant(process.env.THEME_VARIANT);
const resumedBin = path.join(cwd, 'node_modules', 'resumed', 'bin', 'resumed.js');

buildResume();
startServer(host, port);

function normalizePort(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return parsed;
}

function buildResume() {
  runResumed(['validate', resumePath], 'Validation failed.');
  runResumed(
    ['render', resumePath, '--theme', theme, '--output', htmlPath],
    'Build failed.'
  );
  applyConfiguredVariant();
  runNodeScript(buildVariantsPath, 'Variant build failed.');
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

function runNodeScript(scriptPath, message) {
  try {
    execFileSync(process.execPath, [scriptPath], {
      cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(message);
    process.exit(error.status || 1);
  }
}

function applyConfiguredVariant() {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = cssForVariant(cwd, themeVariant);
  const variantHtml = applyVariantToHtml(html, css);

  fs.writeFileSync(htmlPath, variantHtml);
  console.log(`Applied theme variant: ${themeVariant}`);
}

function startServer(listenHost, listenPort) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/' || url.pathname === '/resume.html') {
      serveFile(response, htmlPath, 'text/html; charset=utf-8');
      return;
    }

    if (url.pathname === '/resume.json') {
      serveFile(response, resumePath, 'application/json; charset=utf-8');
      return;
    }

    if (url.pathname === '/variants') {
      response.writeHead(302, { location: '/variants/' });
      response.end();
      return;
    }

    if (url.pathname === '/variants/') {
      serveFile(response, path.join(variantsDir, 'index.html'), 'text/html; charset=utf-8');
      return;
    }

    if (url.pathname.startsWith('/variants/')) {
      serveVariantFile(response, url.pathname);
      return;
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });

  server.on('error', (error) => {
    console.error(`Unable to start preview server on http://${listenHost}:${listenPort}`);
    console.error(error.message);
    process.exit(1);
  });

  server.listen(listenPort, listenHost, () => {
    console.log(`Preview available at http://${listenHost}:${listenPort}`);
    console.log(`Using theme: ${theme}`);
    console.log(`Using theme variant: ${themeVariant}`);
  });
}

function serveFile(response, filename, contentType) {
  fs.readFile(filename, (error, content) => {
    if (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(`Unable to read ${path.basename(filename)}.`);
      return;
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': contentType
    });
    response.end(content);
  });
}

function serveVariantFile(response, requestPath) {
  const relativePath = requestPath.replace(/^\/variants\//, '');
  const normalizedPath = path.normalize(relativePath);
  const filename = path.join(variantsDir, normalizedPath);

  if (
    !normalizedPath ||
    normalizedPath.startsWith('..') ||
    path.isAbsolute(normalizedPath)
  ) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  serveFile(response, filename, contentTypeFor(filename));
}

function contentTypeFor(filename) {
  switch (path.extname(filename).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    default:
      return 'text/plain; charset=utf-8';
  }
}
