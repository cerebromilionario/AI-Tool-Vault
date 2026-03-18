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
node scripts/upgrade-editorial-pages.js
```

These commands are Netlify-safe (pure static output, no server runtime required). The editorial upgrade pass rewrites the programmatic tools, best-of, and compare pages with richer sections such as who the tool is for, pros, cons, alternatives, verdicts, and transparent editorial notes.

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
node scripts/generate-pages.js && node scripts/generate-sitemap.js && node scripts/upgrade-editorial-pages.js
```

Publish directory remains:

```bash
.
```

## Programmatic SEO generator (10,000+ pages)

To generate tool, comparison, alternatives, and category pages with sitemap updates:

```bash
node scripts/generate-seo-pages.js
```

This script creates/updates:

- `tools/*.html`
- `compare/*.html`
- `alternatives/alternatives-to-*.html`
- `category/*.html`
- `category/index.html`
- `sitemap.xml` (and split sitemap files when URL count exceeds 5000)
