# Resume Site

This project generates a static HTML resume page from [JSON Resume](https://jsonresume.org/) data stored in [`resume.json`](./resume.json).

It uses:

- `resumed` for validation and rendering
- `jsonresume-theme-even` as the HTML theme

## Requirements

- Node.js 18+ should work for rendering
- Node.js 20+ is recommended to avoid an `npm` engine warning from one transitive dependency during install

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

`npm run render` is an alias for the same command.

Run the local preview server with automatic rebuilds:

```bash
npm run dev
```

This uses Node's built-in watch mode to watch `dev.js`, `resume.json`, and `.env`. On each change it:

1. validates `resume.json`
2. regenerates `resume.html`
3. starts a local HTTP server

Set the preview host and port in [`.env`](./.env):

```dotenv
HOST=127.0.0.1
PORT=3000
```

This writes the generated site page to:

```text
resume.html
```

You can also run the underlying CLI directly:

```bash
npx resumed render resume.json --theme jsonresume-theme-even --output resume.html
```

## Typical Workflow

1. Edit [`resume.json`](./resume.json)
2. Run `npm run dev`
3. Open `http://127.0.0.1:3000` or your configured host and port
4. Save changes and let Node restart, validate, and rebuild automatically
5. Deploy or copy `resume.html` to your personal website hosting setup

## Project Files

- [`dev.js`](./dev.js): local preview server and rebuild entrypoint
- [`.env`](./.env): local preview configuration
- [`resume.json`](./resume.json): source resume data
- [`resume.html`](./resume.html): generated static HTML output
- [`package.json`](./package.json): project scripts and dependencies
