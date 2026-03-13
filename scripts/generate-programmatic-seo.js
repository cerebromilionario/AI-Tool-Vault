const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = process.env.SITE_URL || 'https://aitoolvault.netlify.app';
const tools = JSON.parse(fs.readFileSync(path.join(root, 'data/tools.json'), 'utf8'));

const ensureDir = (dir) => fs.mkdirSync(path.join(root, dir), { recursive: true });
const fileExists = (p) => fs.existsSync(path.join(root, p));
const writeNewFile = (relativePath, content) => {
  const absolute = path.join(root, relativePath);
  if (fs.existsSync(absolute)) return false;
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
  return true;
};

const toSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const uniqueTools = tools.map((tool) => ({
  ...tool,
  slug: tool.slug || toSlug(tool.name),
  name: tool.name || 'Untitled Tool',
  description: tool.description || 'AI tool description',
  category: tool.category || 'AI Tools',
}));

const html = (title, description, body, canonicalPath) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${siteUrl}${canonicalPath}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta name="google-adsense-account" content="ca-pub-4613426749830025" />
  <link rel="stylesheet" href="/public/css/styles.css">
</head>
<body>
  <header>
    <div class="container nav">
      <a class="brand" href="/index.html">
        <span class="brand-icon">&#9889;</span>
        AI Tool Vault
      </a>
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>
      <nav class="menu" id="main-menu" aria-label="Main navigation">
        <a href="/index.html">Home</a>
        <a href="/categories/index.html">Categories</a>
        <a href="/about.html">About</a>
        <a href="/contact.html" class="btn-nav">Contact</a>
      </nav>
    </div>
  </header>
  <main class="container">${body}</main>
  <footer>
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html"><span class="brand-icon">&#9889;</span> AI Tool Vault</a>
          <p>Your ultimate directory for discovering the best AI tools.</p>
        </div>
        <div>
          <h3 class="footer-title">Categories</h3>
          <div class="footer-links">
            <a href="/categories/ai-writing.html">Writing</a>
            <a href="/categories/image-generation.html">Image</a>
            <a href="/categories/index.html">All Categories</a>
          </div>
        </div>
        <div>
          <h3 class="footer-title">Company</h3>
          <div class="footer-links">
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
            <a href="/privacy-policy.html">Privacy Policy</a>
            <a href="/terms-of-use.html">Terms of Use</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">&copy; 2026 AI Tool Vault. All rights reserved.</span>
        <div class="footer-legal">
          <a href="/privacy-policy.html">Privacy Policy</a>
          <a href="/terms-of-use.html">Terms of Use</a>
        </div>
      </div>
    </div>
  </footer>
  <div id="cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>We use cookies to improve your experience. <a href="/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-actions">
      <button id="cookie-decline" class="btn btn-secondary btn-sm">Decline</button>
      <button id="cookie-accept" class="btn btn-sm">Accept All</button>
    </div>
  </div>
  <script src="/public/js/main.js" defer></script>
</body>
</html>`;

ensureDir('best');
ensureDir('compare');
ensureDir('alternatives');

const created = [];

// Task 2: alternatives pages for every tool
for (const tool of uniqueTools) {
  const alternatives = uniqueTools.filter((t) => t.slug !== tool.slug).slice(0, 8);
  const intro = `${tool.name} is a well-known option, but there are many strong alternatives depending on your budget, team size, and workflow. Some tools are better for long-form writing, while others focus on speed, collaboration, automation, or specialty use cases. If you are evaluating options, compare feature depth, output quality, integrations, pricing tiers, and reliability in production workflows. You should also review onboarding time and support quality before committing. The list below highlights strong tools from our directory that can replace or complement ${tool.name}. Use this guide to discover solutions for freelancers, agencies, startups, and enterprise teams. Every option links directly to its tool page so you can quickly review capabilities and decide which platform best matches your goals.`;
  const list = alternatives
    .map(
      (alt) => `<li class="py-2"><a class="text-blue-600 hover:underline" href="/tools/${alt.slug}.html">${esc(alt.name)}</a> <span class="text-slate-500">(${esc(alt.category)})</span></li>`
    )
    .join('');
  const body = `
    <article class="bg-white rounded-xl shadow p-6">
      <h1 class="text-3xl font-bold mb-4">Best ${esc(tool.name)} Alternatives</h1>
      <p class="text-slate-700 leading-7 mb-6">${esc(intro)}</p>
      <h2 class="text-2xl font-semibold mb-3">Top Alternatives</h2>
      <ul class="list-disc pl-6">${list}</ul>
    </article>`;

  const rel = `alternatives/${tool.slug}-alternatives.html`;
  if (writeNewFile(rel, html(`Best ${tool.name} Alternatives`, `Top alternatives to ${tool.name}.`, body, `/${rel}`))) {
    created.push(`/${rel}`);
  }
}

// Task 3: specific best pages with 20 tools each
const bestSpecs = [
  ['best-ai-writing-tools', 'AI Writing'],
  ['best-ai-image-generators', 'Image'],
  ['best-ai-video-tools', 'Video'],
  ['best-ai-marketing-tools', 'Marketing'],
  ['best-ai-productivity-tools', 'Productivity'],
];

for (const [slug, keyword] of bestSpecs) {
  const picks = uniqueTools
    .filter((tool) => `${tool.category} ${tool.name} ${tool.description}`.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 20);
  const filled = picks.length >= 20 ? picks : [...picks, ...uniqueTools.filter((t) => !picks.includes(t)).slice(0, 20 - picks.length)];
  const cards = filled
    .map(
      (tool, i) => `<li class="border rounded-lg p-4 bg-slate-50"><span class="font-semibold">#${i + 1} ${esc(tool.name)}</span><p class="text-slate-600">${esc(tool.description)}</p><a class="text-blue-600" href="/tools/${tool.slug}.html">View tool</a></li>`
    )
    .join('');
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const body = `<section class="bg-white rounded-xl shadow p-6"><h1 class="text-3xl font-bold mb-4">${esc(title)}</h1><p class="mb-6 text-slate-700">A curated list of top AI tools in this segment.</p><ol class="grid md:grid-cols-2 gap-4">${cards}</ol></section>`;
  const rel = `best/${slug}.html`;
  if (writeNewFile(rel, html(title, `${title} curated list.`, body, `/${rel}`))) {
    created.push(`/${rel}`);
  }
}

// Task 4: comparison pages (generate enough to approach 1000 pages)
const requiredPairs = [
  ['chatgpt', 'claude'],
  ['chatgpt', 'perplexity'],
  ['midjourney', 'dall-e'],
];

const bySlug = new Map(uniqueTools.map((t) => [t.slug, t]));
const pairSet = new Set();

for (const [a, b] of requiredPairs) {
  if (bySlug.has(a) && bySlug.has(b)) pairSet.add(`${a}::${b}`);
}

// add deterministic pair matrix capped for volume
for (let i = 0; i < uniqueTools.length; i++) {
  for (let j = i + 1; j < uniqueTools.length; j++) {
    pairSet.add(`${uniqueTools[i].slug}::${uniqueTools[j].slug}`);
    if (pairSet.size >= 1000) break;
  }
  if (pairSet.size >= 1000) break;
}

for (const pair of pairSet) {
  const [aSlug, bSlug] = pair.split('::');
  const a = bySlug.get(aSlug);
  const b = bySlug.get(bSlug);
  if (!a || !b) continue;
  const rel = `compare/${a.slug}-vs-${b.slug}.html`;

  const body = `
    <article class="bg-white rounded-xl shadow p-6">
      <h1 class="text-3xl font-bold mb-6">${esc(a.name)} vs ${esc(b.name)}</h1>
      <div class="overflow-x-auto mb-8">
        <table class="min-w-full border border-slate-200 text-left">
          <thead class="bg-slate-100"><tr><th class="p-3 border">Criteria</th><th class="p-3 border">${esc(a.name)}</th><th class="p-3 border">${esc(b.name)}</th></tr></thead>
          <tbody>
            <tr><td class="p-3 border">Category</td><td class="p-3 border">${esc(a.category)}</td><td class="p-3 border">${esc(b.category)}</td></tr>
            <tr><td class="p-3 border">Positioning</td><td class="p-3 border">${esc(a.description)}</td><td class="p-3 border">${esc(b.description)}</td></tr>
            <tr><td class="p-3 border">Pricing</td><td class="p-3 border">${esc(a.pricing || 'N/A')}</td><td class="p-3 border">${esc(b.pricing || 'N/A')}</td></tr>
          </tbody>
        </table>
      </div>
      <section class="grid md:grid-cols-2 gap-6 mb-6">
        <div><h2 class="text-xl font-semibold mb-2">${esc(a.name)} Pros and Cons</h2><ul class="list-disc pl-6"><li>Strong for ${esc(a.category.toLowerCase())} workflows.</li><li>May vary by pricing and integrations.</li></ul></div>
        <div><h2 class="text-xl font-semibold mb-2">${esc(b.name)} Pros and Cons</h2><ul class="list-disc pl-6"><li>Strong for ${esc(b.category.toLowerCase())} workflows.</li><li>May vary by pricing and integrations.</li></ul></div>
      </section>
      <p>Explore both tools: <a class="text-blue-600" href="/tools/${a.slug}.html">${esc(a.name)}</a> and <a class="text-blue-600" href="/tools/${b.slug}.html">${esc(b.name)}</a>.</p>
    </article>`;

  if (writeNewFile(rel, html(`${a.name} vs ${b.name}`, `Compare ${a.name} and ${b.name}.`, body, `/${rel}`))) {
    created.push(`/${rel}`);
  }
}

// Task 5: add all generated pages to sitemap.xml without removing existing URLs
const sitemapPath = path.join(root, 'sitemap.xml');
const current = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const existingUrls = new Set(Array.from(current.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]));
for (const rel of created) existingUrls.add(`${siteUrl}${rel}`);

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  Array.from(existingUrls)
    .sort()
    .map((url) => `  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>${url.endsWith('/index.html') || url.endsWith('/') ? '1.0' : '0.8'}</priority></url>`)
    .join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(sitemapPath, xml);

console.log(`Created ${created.length} new pages.`);
console.log('Sample created pages:', created.slice(0, 10));
