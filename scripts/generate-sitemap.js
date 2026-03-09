const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://aitoolvault.example.com';
const urls = JSON.parse(fs.readFileSync(path.join(root, 'data/generated-pages.json'), 'utf8'));
const entries = urls.map(u => `<url><loc>${siteUrl}${u}</loc><changefreq>weekly</changefreq><priority>${u==='/index.html'?'1.0':'0.7'}</priority></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Sitemap generated with ${urls.length} URLs.`);
