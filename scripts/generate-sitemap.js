const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://aitoolvault.netlify.app';

function listHtmlFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  return fs
    .readdirSync(absoluteDir)
    .filter((name) => name.endsWith('.html'))
    .sort()
    .map((name) => `/${relativeDir}/${name}`);
}

const urls = [
  { path: '/', priority: '1.0' },
  ...listHtmlFiles('tools').map((p) => ({ path: p, priority: '0.8' })),
  ...listHtmlFiles('categories').map((p) => ({ path: p, priority: p.endsWith('/index.html') ? '0.7' : '0.8' })),
  ...listHtmlFiles('alternatives').map((p) => ({ path: p, priority: '0.8' })),
];

const entries = urls
  .map(
    ({ path: pagePath, priority }) =>
      `  <url>\n    <loc>${siteUrl}${pagePath}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);

console.log(`Sitemap generated with ${urls.length} URLs.`);
