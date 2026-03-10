# AI Tool Vault

Programmatic SEO architecture for generating 1,000+ static pages from AI tool data.

## Run locally

Generate pages in batches (recommended to keep commits small):

```bash
# Batch 1
node scripts/generate-pages.js --offset=0 --limit=50

# Batch 2
node scripts/generate-pages.js --offset=50 --limit=50

# Generate sitemap after all batches
node scripts/generate-sitemap.js
```

Routes are generated in extensionless format:

- `/tools/{tool}`
- `/alternatives/{tool}`
- `/compare/{tool}-vs-{tool}`
- `/category/{category}`

Generated files are written to `pages/` as `index.html` files and tracked in `data/generated-pages.json`.

## Deploy (GitHub + Netlify)

- Push this repository to GitHub.
- In Netlify, set build command:
  - `node scripts/generate-pages.js && node scripts/generate-sitemap.js`
- Publish directory: `.`
