const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');

const cwd = path.join(__dirname, '..');
const envPath = path.join(cwd, '.env');
const resumePath = path.join(cwd, 'resume.json');
const htmlPath = path.join(cwd, 'resume.html');

dotenv.config({ path: envPath });

const port = normalizePort(process.env.PORT || '3000');
const host = process.env.HOST || '127.0.0.1';
const theme = process.env.THEME || 'jsonresume-theme-flat-reordered';
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
