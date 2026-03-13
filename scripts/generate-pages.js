const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = process.env.SITE_URL || 'https://aitoolvault.netlify.app';
const DEFAULT_BEST_PAGES = [
  'best-ai-tools-for-marketing',
  'best-ai-tools-for-seo',
  'best-ai-tools-for-students',
  'best-ai-tools-for-programming',
  'best-ai-tools-for-design',
  'best-ai-tools-for-video',
  'best-ai-tools-for-startups'
];

const toPosix = (value) => value.replace(/\\/g, '/');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const readTemplate = (name) => fs.readFileSync(path.join(root, 'templates', name), 'utf8');
const ensureDir = (relativeDir) => fs.mkdirSync(path.join(root, relativeDir), { recursive: true });
const writeFile = (relativePath, content) => {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const titleFromSlug = (slug = '') =>
  String(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const chunk = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

const renderTemplate = (template, vars) =>
  template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => (vars[key] == null ? '' : String(vars[key])));

const htmlDoc = ({ title, description, canonicalPath, content }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${siteUrl}${canonicalPath}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteUrl}${canonicalPath}">
  <meta name="google-adsense-account" content="ca-pub-4613426749830025">
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
    ${content}
  </main>
  <footer>
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html">
            <span class="brand-icon">&#9889;</span>
            AI Tool Vault
          </a>
          <p>Your ultimate directory for discovering the best AI tools. Curated, organized, and always up to date.</p>
        </div>
        <div>
          <h3 class="footer-title">Categories</h3>
          <div class="footer-links">
            <a href="/categories/ai-writing.html">Writing</a>
            <a href="/categories/image-generation.html">Image Generation</a>
            <a href="/categories/video-creation.html">Video</a>
            <a href="/categories/coding.html">Coding</a>
            <a href="/categories/index.html">All Categories</a>
          </div>
        </div>
        <div>
          <h3 class="footer-title">Top Tools</h3>
          <div class="footer-links">
            <a href="/tools/chatgpt.html">ChatGPT</a>
            <a href="/tools/claude.html">Claude</a>
            <a href="/tools/midjourney.html">Midjourney</a>
            <a href="/tools/github-copilot.html">GitHub Copilot</a>
            <a href="/best/best-ai-tools-for-productivity.html">Best Of</a>
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
          <a href="/contact.html">Contact</a>
        </div>
      </div>
    </div>
  </footer>
  <div id="cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>We use cookies and similar technologies to improve your experience, analyze traffic, and serve personalized ads. By clicking &ldquo;Accept&rdquo;, you consent to our use of cookies as described in our <a href="/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-actions">
      <button id="cookie-decline" class="btn btn-secondary btn-sm">Decline</button>
      <button id="cookie-accept" class="btn btn-sm">Accept All</button>
    </div>
  </div>
  <script src="/public/js/main.js" defer></script>
</body>
</html>
`;

const rawTools = readJson('data/tools.json');
const tools = rawTools.map((tool) => {
  const name = tool.name || 'Untitled Tool';
  const category = tool.category || 'AI Tools';
  const slug = tool.slug || slugify(name);
  const description = tool.description || `${name} is an AI tool for ${category} workflows.`;
  const url = tool.url || tool.website || '#';

  return {
    ...tool,
    name,
    category,
    slug,
    description,
    url,
    categorySlug: slugify(category)
  };
});

const categoryMap = new Map();
for (const tool of tools) {
  if (!categoryMap.has(tool.categorySlug)) categoryMap.set(tool.categorySlug, { name: tool.category, tools: [] });
  categoryMap.get(tool.categorySlug).tools.push(tool);
}

const toolTemplate = readTemplate('tool-template.html');
const categoryTemplate = readTemplate('category-template.html');
const alternativesTemplate = readTemplate('alternatives-template.html');
const bestTemplate = readTemplate('best-template.html');

ensureDir('tools');
ensureDir('categories');
ensureDir('alternatives');
ensureDir('best');

const generatedUrls = new Set(['/index.html', '/']);

for (const tool of tools) {
  const related = (categoryMap.get(tool.categorySlug)?.tools || []).filter((item) => item.slug !== tool.slug).slice(0, 6);
  const alternatives = tools.filter((item) => item.slug !== tool.slug).slice(0, 10);

  const pageBody = renderTemplate(toolTemplate, {
    tool_name: escapeHtml(tool.name),
    description: escapeHtml(tool.description),
    category_name: escapeHtml(tool.category),
    category_slug: escapeHtml(tool.categorySlug),
    official_url: escapeHtml(tool.url),
    related_tools: related
      .map(
        (item) => `<a href="/tools/${item.slug}.html" class="tool-card bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"><h3 class="text-xl font-semibold">${escapeHtml(item.name)}</h3><p class="text-gray-600">${escapeHtml(item.description)}</p><span class="text-blue-600 font-semibold">View tool</span></a>`
      )
      .join(''),
    related_fallback: related.length ? '' : '<p class="text-gray-600">More tools will be listed here as the directory grows.</p>',
    alternative_links: alternatives
      .slice(0, 5)
      .map((item) => `<li><a class="text-blue-600" href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></li>`)
      .join(''),
    alternatives_page: `/alternatives/${tool.slug}-alternatives.html`
  });

  const outputPath = `tools/${tool.slug}.html`;
  writeFile(
    outputPath,
    htmlDoc({
      title: `${tool.name} AI Tool`,
      description: tool.description,
      canonicalPath: `/${toPosix(outputPath)}`,
      content: pageBody
    })
  );
  generatedUrls.add(`/${toPosix(outputPath)}`);
}

for (const [categorySlug, categoryData] of categoryMap.entries()) {
  const categoryTools = categoryData.tools;
  const intro = `${categoryData.name} tools help teams move faster with better automation, quality, and execution.`;
  const cards = categoryTools
    .map(
      (tool) => `<a href="/tools/${tool.slug}.html" class="tool-card bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"><h2 class="text-xl font-semibold">${escapeHtml(tool.name)}</h2><p class="text-gray-600">${escapeHtml(tool.description)}</p><span class="text-blue-600 font-semibold">Open tool page</span></a>`
    )
    .join('');

  const body = renderTemplate(categoryTemplate, {
    category_name: escapeHtml(categoryData.name),
    category_slug: escapeHtml(categorySlug),
    category_intro: escapeHtml(intro),
    tool_cards: cards,
    category_size: String(categoryTools.length)
  });

  const outputPath = `categories/${categorySlug}.html`;
  writeFile(
    outputPath,
    htmlDoc({
      title: `${categoryData.name} AI Tools`,
      description: `Browse ${categoryData.name} AI tools and compare options.`,
      canonicalPath: `/${toPosix(outputPath)}`,
      content: body
    })
  );
  generatedUrls.add(`/${toPosix(outputPath)}`);
}

const categoriesIndex = `<section class="content-section"><div class="section-heading"><h1>All AI Tool Categories</h1></div><p class="text-gray-600 mb-6">Browse every category generated from the data file.</p><div class="tool-grid">${Array.from(categoryMap.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([categorySlug, categoryData]) => `<a href="/categories/${categorySlug}.html"><span>${escapeHtml(categoryData.name)}</span></a>`)
  .join('')}</div></section>`;

writeFile(
  'categories/index.html',
  htmlDoc({
    title: 'AI Tool Categories Directory',
    description: 'Explore all AI tool categories in AI Tool Vault.',
    canonicalPath: '/categories/index.html',
    content: categoriesIndex
  })
);
generatedUrls.add('/categories/index.html');

for (const tool of tools) {
  const alternatives = tools.filter((item) => item.slug !== tool.slug).slice(0, 10);
  const list = alternatives
    .map((item, index) => `<tr><td class="py-2 px-3 border">${index + 1}</td><td class="py-2 px-3 border"><a class="text-blue-600" href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></td><td class="py-2 px-3 border">${escapeHtml(item.category)}</td></tr>`)
    .join('');

  const body = renderTemplate(alternativesTemplate, {
    tool_name: escapeHtml(tool.name),
    tool_slug: escapeHtml(tool.slug),
    category_name: escapeHtml(tool.category),
    category_slug: escapeHtml(tool.categorySlug),
    alternatives_list: alternatives
      .map((item) => `<li><a class="text-blue-600" href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a> <span class="text-gray-500">(${escapeHtml(item.category)})</span></li>`)
      .join(''),
    comparison_rows: list
  });

  const outputPath = `alternatives/${tool.slug}-alternatives.html`;
  writeFile(
    outputPath,
    htmlDoc({
      title: `${tool.name} Alternatives`,
      description: `Top 10 alternatives to ${tool.name} with internal links and a comparison table.`,
      canonicalPath: `/${toPosix(outputPath)}`,
      content: body
    })
  );
  generatedUrls.add(`/${toPosix(outputPath)}`);
}

for (const bestSlug of DEFAULT_BEST_PAGES) {
  const topic = bestSlug.replace('best-ai-tools-for-', '').replace(/-/g, ' ');
  const keywordParts = topic.split(' ');
  const picks = tools
    .filter((tool) => `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(keywordParts[0]))
    .slice(0, 10);
  const finalPicks = picks.length ? picks : tools.slice(0, 10);

  const columns = chunk(finalPicks, 5)
    .map(
      (group) => `<div class="space-y-4">${group
        .map(
          (tool) => `<a href="/tools/${tool.slug}.html" class="tool-card block bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"><h2 class="text-xl font-semibold">${escapeHtml(tool.name)}</h2><p class="text-gray-600">${escapeHtml(tool.description)}</p></a>`
        )
        .join('')}</div>`
    )
    .join('');

  const body = renderTemplate(bestTemplate, {
    page_title: escapeHtml(titleFromSlug(bestSlug)),
    topic: escapeHtml(topic),
    tool_columns: columns,
    internal_links: finalPicks
      .slice(0, 5)
      .map((tool) => `<li><a class="text-blue-600" href="/alternatives/${tool.slug}-alternatives.html">${escapeHtml(tool.name)} alternatives</a></li>`)
      .join('')
  });

  const outputPath = `best/${bestSlug}.html`;
  writeFile(
    outputPath,
    htmlDoc({
      title: `${titleFromSlug(bestSlug)} | AI Tool Vault`,
      description: `Discover top AI tools for ${topic}.`,
      canonicalPath: `/${toPosix(outputPath)}`,
      content: body
    })
  );
  generatedUrls.add(`/${toPosix(outputPath)}`);
}

const orderedUrls = Array.from(generatedUrls).sort((a, b) => a.localeCompare(b));
writeFile('data/generated-pages.json', `${JSON.stringify(orderedUrls, null, 2)}\n`);

const sitemapEntries = orderedUrls
  .map((url) => {
    const normalizedUrl = url === '/index.html' ? '/' : url;
    const priority = normalizedUrl === '/' ? '1.0' : normalizedUrl.startsWith('/best/') ? '0.9' : '0.8';
    return `  <url>\n    <loc>${siteUrl}${normalizedUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
writeFile('sitemap.xml', sitemapXml);

console.log(`Generated ${orderedUrls.length} pages + sitemap.xml from ${tools.length} tools.`);
