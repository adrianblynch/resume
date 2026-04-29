const fs = require('node:fs');
const path = require('node:path');
const {
  applyVariantToHtml,
  cssForVariant,
  filenameFor,
  labelFor,
  variants
} = require('./theme-variants');

const cwd = process.cwd();
const sourceHtmlPath = path.join(cwd, 'resume.html');
const variantsDir = path.join(cwd, 'variants');
const sourceHtml = fs.readFileSync(sourceHtmlPath, 'utf8');

fs.mkdirSync(variantsDir, { recursive: true });

for (const slug of variants) {
  const filename = filenameFor(slug);
  const css = cssForVariant(cwd, slug);
  const html = applyVariantToHtml(sourceHtml, css);
  fs.writeFileSync(path.join(variantsDir, filename), html);
}

writeIndex();

console.log(`Wrote ${variants.length} design variants and index.html to ${variantsDir}`);

function writeIndex() {
  const originalPath = filenameFor('original');
  const mainPath = '../resume.html';
  const variantLinks = variants
    .filter((slug) => slug !== 'original')
    .map((slug) => {
      const filename = filenameFor(slug);
      const label = labelFor(slug);
      return `          <a href="${escapeHtml(filename)}" target="preview" data-file="${escapeHtml(filename)}" data-slug="${escapeHtml(slug)}">${escapeHtml(label)}</a>`;
    })
    .join('\n');

  const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Resume Design Variants</title>
    <style>
      :root {
        --bg: #f4f5f7;
        --panel: #ffffff;
        --ink: #171a1f;
        --muted: #616975;
        --rule: #d9dee7;
        --accent: #246bfe;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: var(--bg);
        color: var(--ink);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        overflow: hidden;
      }

      header {
        align-items: center;
        background: var(--panel);
        border-bottom: 1px solid var(--rule);
        display: flex;
        gap: 18px;
        justify-content: space-between;
        min-height: 72px;
        padding: 16px 22px;
      }

      h1 {
        font-size: 19px;
        line-height: 1.2;
        margin: 0;
      }

      p {
        color: var(--muted);
        line-height: 1.4;
        margin: 4px 0 0;
      }

      .layout {
        display: grid;
        grid-template-columns: 230px minmax(0, 1fr);
        height: calc(100vh - 72px);
        overflow: hidden;
      }

      nav {
        background: var(--panel);
        border-right: 1px solid var(--rule);
        min-height: 0;
        overflow-y: auto;
        padding: 16px;
      }

      .group-label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        margin: 18px 0 8px;
        text-transform: uppercase;
      }

      .group-label:first-child {
        margin-top: 0;
      }

      a {
        border: 1px solid transparent;
        border-radius: 8px;
        color: var(--ink);
        display: block;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 6px;
        padding: 10px 12px;
        text-decoration: none;
      }

      a:hover,
      a:focus {
        background: #eef3ff;
        border-color: #c9d8ff;
        color: var(--accent);
        outline: none;
      }

      a.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      main {
        display: flex;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        padding: 18px;
      }

      .frame-shell {
        background: var(--panel);
        border: 1px solid var(--rule);
        border-radius: 8px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      iframe {
        border: 0;
        height: 100%;
        width: 100%;
      }

      .open-link {
        border-color: var(--rule);
        flex: 0 0 auto;
        margin: 0;
      }

      @media (max-width: 760px) {
        body {
          overflow: auto;
        }

        header {
          align-items: flex-start;
          display: block;
        }

        .open-link {
          display: inline-block;
          margin-top: 12px;
        }

        .layout {
          display: block;
          height: auto;
          overflow: visible;
        }

        nav {
          border-bottom: 1px solid var(--rule);
          border-right: 0;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 12px;
        }

        .group-label {
          display: none;
        }

        nav a {
          flex: 0 0 auto;
          margin: 0;
          white-space: nowrap;
        }

        main {
          padding: 12px;
        }

        .frame-shell {
          flex: none;
          height: calc(100vh - 172px);
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div>
        <h1>Resume Design Variants</h1>
        <p>Compare the configured main resume with the CSS-only variants.</p>
      </div>
      <a class="open-link" href="${mainPath}" target="_blank" id="open-current">Open current view</a>
    </header>
    <div class="layout">
      <nav aria-label="Resume variants">
        <div class="group-label">Baseline</div>
        <a href="${mainPath}" target="preview" class="active" data-file="${mainPath}" data-slug="main">Main</a>
        <a href="${originalPath}" target="preview" data-file="${originalPath}" data-slug="original">Original</a>
        <div class="group-label">Variants</div>
${variantLinks}
      </nav>
      <main>
        <div class="frame-shell">
          <iframe src="${mainPath}" name="preview" title="Resume preview" id="preview"></iframe>
        </div>
      </main>
    </div>
    <script>
      const links = Array.from(document.querySelectorAll('nav a'));
      const nav = document.querySelector('nav');
      const openCurrent = document.getElementById('open-current');
      const preview = document.getElementById('preview');

      for (const link of links) {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          selectLink(link);
        });
      }

      nav.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
          return;
        }

        const currentIndex = links.indexOf(document.activeElement);

        if (currentIndex === -1) {
          return;
        }

        event.preventDefault();

        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + direction + links.length) % links.length;
        const nextLink = links[nextIndex];

        nextLink.focus();
        selectLink(nextLink);
      });

      function selectLink(selectedLink) {
        for (const item of links) {
          item.classList.toggle('active', item === selectedLink);
        }

        const href = selectedLink.getAttribute('href');

        openCurrent.href = href;
        preview.src = href;
      }
    </script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(variantsDir, 'index.html'), indexHtml);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
