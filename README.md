# Resume Site

This project generates a static HTML resume page from [JSON Resume](https://jsonresume.org/) data stored in [`resume.json`](./resume.json).

It uses:

- `resumed` for validation and rendering
- `jsonresume-theme-flat-reordered` as the HTML theme
- build-time Bootstrap CSS purging and minification for the final static page

## Install

```bash
npm install
```

## Important Commands

Validate the resume JSON:

```bash
npm run validate
```

Generate the HTML page:

```bash
npm run build
```

`npm run render` is an alias for the same command and it uses the active `THEME` and `THEME_VARIANT` from [`.env`](./.env).

The build now:

1. validates `resume.json`
2. renders the HTML with the local theme
3. pulls Bootstrap from the local npm dependency
4. purges unused Bootstrap selectors based on the generated resume markup and theme template
5. minifies the Bootstrap subset and the active theme CSS
6. inlines the optimized CSS into `resume.html`

Generate the design variant HTML files and comparison index:

```bash
npm run variants
```

Run the local preview server with automatic rebuilds:

```bash
npm run dev
```

This uses Node's built-in watch mode to watch:

- `scripts/dev.js`
- `scripts/build-html.js`
- `scripts/build-css.js`
- `scripts/build-design-variants.js`
- `scripts/theme-variants.js`
- `resume.json`
- `.env`
- `themes/jsonresume-theme-flat-reordered/index.js`
- `themes/jsonresume-theme-flat-reordered/variants/`

On each change it:

1. validates `resume.json`
2. regenerates `resume.html`
3. starts a local HTTP server

Set the preview host, port, theme and main theme variant in [`.env`](./.env):

```dotenv
HOST=127.0.0.1
PORT=3000
THEME=jsonresume-theme-flat-reordered
THEME_VARIANT=original
```

Use any CSS file slug from `themes/jsonresume-theme-flat-reordered/variants/` as `THEME_VARIANT`. The default is `original`, which uses `themes/jsonresume-theme-flat-reordered/variants/original.css`.

This writes the generated site page to:

```text
resume.html
```

Variant pages are written to:

```text
variants/
```

You can also run the underlying CLI directly:

```bash
npx resumed render resume.json --theme jsonresume-theme-flat-reordered --output resume.html
```

## Typical Workflow

1. Edit [`resume.json`](./resume.json)
2. Run `npm run dev`
3. Open `http://127.0.0.1:3000` or your configured host and port
4. Save changes and let Node restart, validate, rebuild `resume.html` using the configured `THEME_VARIANT` and refresh the generated variant pages automatically
5. Open `http://127.0.0.1:3000/variants/` when you want to compare design variants
6. Deploy or copy `resume.html` to your personal website hosting setup; a GitHub Action publishes the resume.html to the root only

## Project Files

- [`scripts/build-design-variants.js`](./scripts/build-design-variants.js): generates the design variants and comparison index
- [`scripts/build-css.js`](./scripts/build-css.js): purges and minifies Bootstrap plus theme CSS for the final page
- [`scripts/theme-variants.js`](./scripts/theme-variants.js): shared variant list and CSS injection helpers
- [`scripts/dev.js`](./scripts/dev.js): local preview server and rebuild entrypoint
- [`.env`](./.env): local preview configuration
- [`resume.json`](./resume.json): source resume data
- [`resume.html`](./resume.html): generated static HTML output
- [`variants/`](./variants): generated design variants and comparison page
- [`package.json`](./package.json): project scripts and dependencies
