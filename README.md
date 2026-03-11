# AI Tool Vault

Static AI directory with a programmatic SEO generator for tools, categories, alternatives, and best-of pages.

## What this generates

From `data/tools.json`, the generator creates static HTML pages in:

- `tools/*.html`
- `categories/*.html` (+ `categories/index.html`)
- `alternatives/*-alternatives.html`
- `best/*.html`
- `sitemap.xml`
- `data/generated-pages.json`

## Run page generation

```bash
node scripts/generate-pages.js
```

This command is Netlify-safe (pure static output, no server runtime required).

## Data format

`data/tools.json` expects an array of tools. Supported fields:

- `name` (required)
- `slug` (optional, auto-generated if missing)
- `category` (optional, defaults to `AI Tools`)
- `description` (optional)
- `url` or `website` (optional)

## Templates

The generator uses reusable templates in `templates/`:

- `tool-template.html`
- `category-template.html`
- `alternatives-template.html`
- `best-template.html`

All rendered pages include Tailwind + existing site CSS (`/public/css/styles.css`) to preserve UI consistency.

## Deploy with Netlify

Use this build command:

```bash
node scripts/generate-pages.js
```

Publish directory remains:

```bash
.
```
