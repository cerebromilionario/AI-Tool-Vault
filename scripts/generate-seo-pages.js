const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = (process.env.SITE_URL || 'https://aitoolvault.netlify.app').replace(/\/$/, '');
const TOOLS_PATH = path.join(ROOT, 'data', 'tools.json');
const PAGE_LIMIT = 10000;
const COMPARISON_LIMIT = 8000;
const SITEMAP_CHUNK_SIZE = 5000;

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const titleCase = (value = '') => String(value).replace(/\b\w/g, (m) => m.toUpperCase());

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });
const writeFile = (relativePath, content) => {
  const fullPath = path.join(ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf8');
};

const pageTemplate = ({ title, description, canonicalPath, body }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${SITE_URL}${canonicalPath}" />
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
  <main class="container">
    ${body}
  </main>
  <footer>
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html"><span class="brand-icon">&#9889;</span> AI Tool Vault</a>
          <p>Your ultimate directory for discovering the best AI tools.</p>
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

const toolsData = JSON.parse(fs.readFileSync(TOOLS_PATH, 'utf8'));
const tools = toolsData.map((tool) => ({
  ...tool,
  name: tool.name || 'Untitled Tool',
  slug: tool.slug || slugify(tool.name || ''),
  category: tool.category || 'AI Tools',
  description: tool.description || `${tool.name || 'This tool'} helps teams automate workflows with AI.`,
  features: Array.isArray(tool.features) ? tool.features : ['Automation', 'Workflow support', 'Team productivity'],
  pricing: tool.pricing || 'Check vendor website',
}));

const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
const categoryMap = new Map();
for (const tool of tools) {
  const categorySlug = `${slugify(tool.category)}-tools`;
  if (!categoryMap.has(categorySlug)) {
    categoryMap.set(categorySlug, { name: tool.category, slug: categorySlug, tools: [] });
  }
  categoryMap.get(categorySlug).tools.push(tool);
}

const generatedPaths = [];
const comparePairs = [];

ensureDir(path.join(ROOT, 'tools'));
ensureDir(path.join(ROOT, 'compare'));
ensureDir(path.join(ROOT, 'alternatives'));
ensureDir(path.join(ROOT, 'category'));

const addGeneratedPath = (pathName) => {
  generatedPaths.push(pathName);
};

const renderInternalLinks = ({ home = '/index.html', categoryUrl, toolUrl, compareUrls = [] }) => `
<section class="content-section">
  <div class="section-heading"><h2>Internal Links</h2></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">
    <li><a class="text-blue-600" href="${home}">Home</a></li>
    ${categoryUrl ? `<li><a class="text-blue-600" href="${categoryUrl}">Category</a></li>` : ''}
    ${toolUrl ? `<li><a class="text-blue-600" href="${toolUrl}">Tool page</a></li>` : ''}
    ${compareUrls.map((url) => `<li><a class="text-blue-600" href="${url}">Compare page</a></li>`).join('')}
  </ul>
</section>`;

// 1) Tool pages
for (const tool of tools) {
  const categorySlug = `${slugify(tool.category)}-tools`;
  const categoryUrl = `/category/${categorySlug}.html`;
  const alternativesUrl = `/alternatives/alternatives-to-${tool.slug}.html`;
  const compareCandidates = tools.filter((t) => t.slug !== tool.slug);

  let compareWith = compareCandidates.slice(0, 2);
  if (tool.slug === 'chatgpt') {
    const preferred = ['jasper', 'copy-ai']
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .filter((item, idx, arr) => arr.findIndex((v) => v.slug === item.slug) === idx);
    if (preferred.length === 2) compareWith = preferred;
  }

  const compareLinks = compareWith.map((other) => `/compare/${tool.slug}-vs-${other.slug}.html`);

  const featuresHtml = tool.features.map((feature) => `<li>${esc(titleCase(feature))}</li>`).join('');
  const compareHtml = compareWith
    .map((other) => `<li><a class="text-blue-600" href="/compare/${tool.slug}-vs-${other.slug}.html">${esc(tool.name)} vs ${esc(other.name)}</a></li>`)
    .join('');

  const body = `
<section class="content-section">
  <div class="section-heading"><h1>What is ${esc(tool.name)}</h1></div>
  <p class="text-gray-700 mb-4">${esc(tool.description)}</p>
</section>

<section class="content-section">
  <div class="section-heading"><h2>Features</h2></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">${featuresHtml}</ul>
</section>

<section class="content-section">
  <div class="section-heading"><h2>Pricing</h2></div>
  <p class="text-gray-700">${esc(tool.pricing)}</p>
</section>

<section class="content-section">
  <div class="section-heading"><h2>Pros and Cons</h2></div>
  <div class="grid gap-6 md:grid-cols-2">
    <div>
      <h3 class="text-lg font-semibold mb-2">Pros</h3>
      <ul class="list-disc pl-6 space-y-2 text-gray-700">
        <li>Fast setup for ${esc(tool.category.toLowerCase())} workflows.</li>
        <li>Useful for teams shipping content consistently.</li>
      </ul>
    </div>
    <div>
      <h3 class="text-lg font-semibold mb-2">Cons</h3>
      <ul class="list-disc pl-6 space-y-2 text-gray-700">
        <li>Advanced capabilities may require premium plans.</li>
        <li>Outputs may require human review for quality.</li>
      </ul>
    </div>
  </div>
</section>

<section class="content-section">
  <div class="section-heading"><h2>Alternatives</h2></div>
  <p><a class="text-blue-600" href="${alternativesUrl}">Explore alternatives to ${esc(tool.name)}</a></p>
</section>

<section class="content-section">
  <div class="section-heading"><h2>Compare with</h2></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">${compareHtml}</ul>
</section>

${renderInternalLinks({
    categoryUrl,
    toolUrl: `/tools/${tool.slug}.html`,
    compareUrls: compareLinks,
  })}
`;

  const relativePath = `tools/${tool.slug}.html`;
  writeFile(
    relativePath,
    pageTemplate({
      title: `${tool.name} Review (Features, Pricing, Alternatives)`,
      description: tool.description,
      canonicalPath: `/${relativePath}`,
      body,
    })
  );
  addGeneratedPath(`/${relativePath}`);
}

// 2) Comparison pages (max 8,000 and global 10,000)
for (let i = 0; i < tools.length; i += 1) {
  for (let j = i + 1; j < tools.length; j += 1) {
    if (comparePairs.length >= COMPARISON_LIMIT) break;
    if (generatedPaths.length + comparePairs.length >= PAGE_LIMIT) break;
    comparePairs.push([tools[i], tools[j]]);
  }
  if (comparePairs.length >= COMPARISON_LIMIT) break;
  if (generatedPaths.length + comparePairs.length >= PAGE_LIMIT) break;
}

for (const [a, b] of comparePairs) {
  const rows = [
    ['Features', a.features.slice(0, 3).join(', '), b.features.slice(0, 3).join(', ')],
    ['Pricing', a.pricing, b.pricing],
    ['Ease of use', 'Beginner friendly with a short learning curve.', 'Beginner friendly with a short learning curve.'],
  ]
    .map(
      ([label, left, right]) =>
        `<tr><td class="p-3 border">${esc(label)}</td><td class="p-3 border">${esc(left)}</td><td class="p-3 border">${esc(right)}</td></tr>`
    )
    .join('');

  const winner = a.category === b.category ? `Tie: test both ${a.name} and ${b.name} on your own workflows.` : `${a.name} wins for ${a.category}, while ${b.name} is better for ${b.category}.`;
  const categoryUrl = `/category/${slugify(a.category)}-tools.html`;

  const body = `
<section class="content-section">
  <div class="section-heading"><h1>${esc(a.name)} vs ${esc(b.name)}</h1></div>
  <div class="overflow-x-auto mb-6">
    <table class="min-w-full border border-slate-200 text-left bg-white">
      <thead class="bg-slate-100"><tr><th class="p-3 border">Metric</th><th class="p-3 border">${esc(a.name)}</th><th class="p-3 border">${esc(b.name)}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</section>
<section class="content-section">
  <div class="section-heading"><h2>Winner</h2></div>
  <p class="text-gray-700">${esc(winner)}</p>
  <p class="text-gray-700 mt-3">Explore: <a class="text-blue-600" href="/tools/${a.slug}.html">/tools/${a.slug}</a> and <a class="text-blue-600" href="/tools/${b.slug}.html">/tools/${b.slug}</a>.</p>
</section>
${renderInternalLinks({
    categoryUrl,
    toolUrl: `/tools/${a.slug}.html`,
    compareUrls: [`/compare/${a.slug}-vs-${b.slug}.html`],
  })}
`;

  const relativePath = `compare/${a.slug}-vs-${b.slug}.html`;
  writeFile(
    relativePath,
    pageTemplate({
      title: `${a.name} vs ${b.name} – Best AI Writing Tool?`,
      description: `Compare ${a.name} and ${b.name} across features, pricing, and ease of use.`,
      canonicalPath: `/${relativePath}`,
      body,
    })
  );
  addGeneratedPath(`/${relativePath}`);
}

// 3) Alternatives pages
for (const tool of tools) {
  if (generatedPaths.length >= PAGE_LIMIT) break;

  const alternatives = tools
    .filter((t) => t.slug !== tool.slug)
    .sort((a, b) => {
      if (a.category === tool.category && b.category !== tool.category) return -1;
      if (a.category !== tool.category && b.category === tool.category) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);

  const listHtml = alternatives
    .map((alt) => `<li><a class="text-blue-600" href="/tools/${alt.slug}.html">${esc(alt.name)}</a></li>`)
    .join('');

  const body = `
<section class="content-section">
  <div class="section-heading"><h1>10 Best ${esc(tool.name)} Alternatives</h1></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">${listHtml}</ul>
</section>
${renderInternalLinks({
    categoryUrl: `/category/${slugify(tool.category)}-tools.html`,
    toolUrl: `/tools/${tool.slug}.html`,
    compareUrls: alternatives.slice(0, 2).map((alt) => `/compare/${tool.slug}-vs-${alt.slug}.html`),
  })}
`;

  const relativePath = `alternatives/alternatives-to-${tool.slug}.html`;
  writeFile(
    relativePath,
    pageTemplate({
      title: `10 Best ${tool.name} Alternatives`,
      description: `Top alternatives to ${tool.name} with links to each tool page.`,
      canonicalPath: `/${relativePath}`,
      body,
    })
  );

  addGeneratedPath(`/${relativePath}`);
}

// 4) Category pages + index
const categoryItems = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
for (const category of categoryItems) {
  if (generatedPaths.length >= PAGE_LIMIT) break;

  const toolCards = category.tools
    .map(
      (tool) =>
        `<li><a class="text-blue-600" href="/tools/${tool.slug}.html">${esc(tool.name)}</a> <span class="text-gray-600">– ${esc(tool.description)}</span></li>`
    )
    .join('');

  const firstTwo = category.tools.slice(0, 2);
  const compareLinks = [];
  if (firstTwo.length === 2) compareLinks.push(`/compare/${firstTwo[0].slug}-vs-${firstTwo[1].slug}.html`);

  const body = `
<section class="content-section">
  <div class="section-heading"><h1>${esc(category.name)} Tools</h1></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">${toolCards}</ul>
</section>
${renderInternalLinks({
    categoryUrl: `/category/${category.slug}.html`,
    toolUrl: firstTwo[0] ? `/tools/${firstTwo[0].slug}.html` : '',
    compareUrls: compareLinks,
  })}
`;

  const relativePath = `category/${category.slug}.html`;
  writeFile(
    relativePath,
    pageTemplate({
      title: `${category.name} Tools`,
      description: `Explore the best ${category.name} tools and software options.`,
      canonicalPath: `/${relativePath}`,
      body,
    })
  );

  addGeneratedPath(`/${relativePath}`);
}

const categoryIndexBody = `
<section class="content-section">
  <div class="section-heading"><h1>AI Tool Categories</h1></div>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">
    ${categoryItems.map((category) => `<li><a class="text-blue-600" href="/category/${category.slug}.html">${esc(category.name)} Tools</a></li>`).join('')}
  </ul>
</section>`;

writeFile(
  'category/index.html',
  pageTemplate({
    title: 'AI Tool Categories',
    description: 'Browse all AI tool categories.',
    canonicalPath: '/category/index.html',
    body: categoryIndexBody,
  })
);
addGeneratedPath('/category/index.html');

// 5) Sitemap update + split if needed
const readExistingSitemapUrls = () => {
  const sitemapFile = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapFile)) return [];
  const xml = fs.readFileSync(sitemapFile, 'utf8');
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
};

const allUrls = new Set(readExistingSitemapUrls());
for (const pagePath of generatedPaths) {
  allUrls.add(`${SITE_URL}${pagePath}`);
}

const sortedUrls = Array.from(allUrls).sort();
const sitemapFilesToWrite = [];

if (sortedUrls.length <= SITEMAP_CHUNK_SIZE) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sortedUrls
    .map((url) => `  <url><loc>${esc(url)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  writeFile('sitemap.xml', xml);
} else {
  const chunks = [];
  for (let i = 0; i < sortedUrls.length; i += SITEMAP_CHUNK_SIZE) {
    chunks.push(sortedUrls.slice(i, i + SITEMAP_CHUNK_SIZE));
  }

  chunks.forEach((chunk, index) => {
    const fileName = `sitemap-${index + 1}.xml`;
    sitemapFilesToWrite.push(fileName);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunk
      .map((url) => `  <url><loc>${esc(url)}</loc></url>`)
      .join('\n')}\n</urlset>\n`;
    writeFile(fileName, xml);
  });

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapFilesToWrite
    .map((fileName) => `  <sitemap><loc>${SITE_URL}/${fileName}</loc></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`;
  writeFile('sitemap.xml', indexXml);
}

console.log(`Generated ${generatedPaths.length} pages.`);
console.log(`Tool pages: ${tools.length}`);
console.log(`Comparison pages: ${comparePairs.length}`);
console.log(`Alternative pages: ${tools.length}`);
console.log(`Category pages: ${categoryItems.length + 1}`);
console.log('Run with: node scripts/generate-seo-pages.js');
