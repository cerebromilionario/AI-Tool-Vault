# AI Tool Vault

Programmatic SEO architecture for generating 1,000+ static pages from AI tool data.

## Run locally

```bash
node scripts/generate-pages.js
node scripts/generate-sitemap.js
```

Generated files are written to `pages/` and `sitemap.xml`.

## Deploy (GitHub + Netlify)

- Push this repository to GitHub.
- In Netlify, set build command:
  - `node scripts/generate-pages.js && node scripts/generate-sitemap.js`
- Publish directory: `.`

