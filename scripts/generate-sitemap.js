const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://aitoolvault.netlify.app';
const generatedPagesPath = path.join(root, 'data/generated-pages.json');

if (!fs.existsSync(generatedPagesPath)) {
  console.error('data/generated-pages.json not found. Run: node scripts/generate-pages.js');
  process.exit(1);
}

const pages = JSON.parse(fs.readFileSync(generatedPagesPath, 'utf8'));
const entries = pages
  .map((url) => {
    const priority = url === '/' ? '1.0' : url.startsWith('/best/') ? '0.9' : '0.8';
    return `  <url>\n    <loc>${siteUrl}${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);

console.log(`Sitemap generated with ${pages.length} URLs.`);
