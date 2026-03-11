const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteName = 'AI Tool Vault';

const tools = JSON.parse(fs.readFileSync(path.join(root, 'data/tools.json'), 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(path.join(root, 'data/categories.json'), 'utf8'));

const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const logoUrl = (name = '') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=e5e7eb&size=96&rounded=true`;

const categoryMap = new Map();
for (const category of categoriesData) {
  const staticSlug = slugify(category.name);
  categoryMap.set(category.slug, { ...category, staticSlug });
  categoryMap.set(category.name, { ...category, staticSlug });
  categoryMap.set(staticSlug, { ...category, staticSlug });
}

const toolsWithCategory = tools.map((tool) => {
  const resolvedCategory = categoryMap.get(tool.category) || categoryMap.get(slugify(tool.category)) || {
    name: tool.category || 'Uncategorized',
    slug: slugify(tool.category || 'uncategorized'),
    staticSlug: slugify(tool.category || 'uncategorized')
  };
  return {
    ...tool,
    categoryName: resolvedCategory.name,
    categorySlug: resolvedCategory.staticSlug
  };
});

const byCategory = toolsWithCategory.reduce((acc, tool) => {
  acc[tool.categorySlug] = acc[tool.categorySlug] || [];
  acc[tool.categorySlug].push(tool);
  return acc;
}, {});

const footer = () => `<footer>
  <div class="container">
    <div class="footer-grid">
      <div><h3 class="footer-title">AI Tool Categories</h3><div class="footer-links"><a href="/categories/ai-writing.html">Writing</a><a href="/categories/image-generation.html">Image</a><a href="/categories/video-creation.html">Video</a></div></div>
      <div><h3 class="footer-title">Top Tools</h3><div class="footer-links"><a href="/tools/chatgpt.html">ChatGPT</a><a href="/tools/claude.html">Claude</a><a href="/tools/midjourney.html">Midjourney</a></div></div>
      <div><h3 class="footer-title">Resources</h3><div class="footer-links"><a href="/categories/index.html">Categories</a><a href="/best/best-ai-tools-for-productivity.html">Best Of</a><a href="/contact.html">Contact</a></div></div>
      <div><h3 class="footer-title">About</h3><div class="footer-links"><a href="/about.html">Our Mission</a><a href="/index.html">Directory Home</a></div></div>
    </div>
    <div class="footer-copy">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</div>
  </div>
</footer>`;

const pageShell = ({ title, description, canonicalPath, body }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="https://aitoolvault.example.com${escapeHtml(canonicalPath)}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/public/css/styles.css">
</head>
<body>
  <header>
    <div class="container nav">
      <a class="brand" href="/index.html">${siteName}</a>
      <nav class="menu" aria-label="Main navigation">
        <a href="/contact.html">Submit Tool</a>
        <a href="/categories/index.html">Categories</a>
        <a href="/about.html">About</a>
      </nav>
    </div>
  </header>

  <main class="container">${body}</main>
  ${footer()}
</body>
</html>`;

const toolCard = (tool) => `<a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card" data-category="${escapeHtml(tool.categoryName)}">
  <img class="tool-card-logo" src="${logoUrl(tool.name)}" alt="${escapeHtml(tool.name)} logo" loading="lazy">
  <h3>${escapeHtml(tool.name)}</h3>
  <p>${escapeHtml(tool.description || 'No description available.')}</p>
  <p><small>${escapeHtml(tool.categoryName)}</small></p>
  <span class="view-link">View Tool →</span>
</a>`;

fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
fs.mkdirSync(path.join(root, 'categories'), { recursive: true });

for (const tool of toolsWithCategory) {
  const alternatives = toolsWithCategory
    .filter((candidate) => candidate.slug !== tool.slug)
    .slice(0, 6)
    .map((alt) => `<li><a href="/tools/${escapeHtml(alt.slug)}.html">${escapeHtml(alt.name)}</a></li>`)
    .join('');

  const features = (tool.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
  const useCases = [
    `Teams using ${tool.name} for faster ${tool.categoryName.toLowerCase()} workflows.`,
    'Solo creators producing content and ideas quickly.',
    'Operations teams reducing repetitive manual tasks.'
  ].map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const html = `
    <section class="hero">
      <p class="eyebrow">Tool Spotlight</p>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.fullDescription || tool.description || 'No description available.')}</p>
      <div class="hero-search">
        <a class="btn" href="${escapeHtml(tool.website || '#')}" target="_blank" rel="noopener noreferrer">Official website</a>
        <a class="btn btn-secondary" href="/categories/${escapeHtml(tool.categorySlug)}.html">Explore category</a>
      </div>
    </section>

    <section class="content-section"><div class="section-heading"><h2>Tool overview</h2></div><p><strong>Category:</strong> <span class="category-badge">${escapeHtml(tool.categoryName)}</span></p><p>${escapeHtml(tool.description || 'No description available.')}</p></section>
    <section class="content-section"><div class="section-heading"><h2>Key features</h2></div><ul>${features || '<li>Feature details not available.</li>'}</ul></section>
    <section class="content-section"><div class="section-heading"><h2>Use cases</h2></div><ul>${useCases}</ul></section>
    <section class="content-section"><div class="section-heading"><h2>Pricing</h2></div><p>${escapeHtml(tool.pricing || 'Not listed')}</p></section>
    <section class="content-section"><div class="section-heading"><h2>Screenshot</h2></div><div class="screenshot-placeholder">Product screenshot preview placeholder</div></section>
    <section class="content-section"><div class="section-heading"><h2>Related tools</h2></div><ul>${alternatives}</ul></section>
  `;

  fs.writeFileSync(path.join(root, 'tools', `${tool.slug}.html`), pageShell({
    title: `${tool.name} AI Tool - ${siteName}`,
    description: `Discover ${tool.name} features, pricing and alternatives.`,
    canonicalPath: `/tools/${tool.slug}.html`,
    body: html
  }));
}

const categoryCards = Object.entries(byCategory)
  .sort((a, b) => a[1][0].categoryName.localeCompare(b[1][0].categoryName))
  .map(([slug, catTools]) => `<a href="/categories/${escapeHtml(slug)}.html" class="tool-card"><h3>${escapeHtml(catTools[0].categoryName)}</h3><p>${catTools.length} tools available</p><span class="view-link">Explore category →</span></a>`)
  .join('');

fs.writeFileSync(path.join(root, 'categories', 'index.html'), pageShell({
  title: `All AI Categories - ${siteName}`,
  description: 'Browse all AI tool categories in AI Tool Vault.',
  canonicalPath: '/categories/index.html',
  body: `<section class="hero"><p class="eyebrow">Explore</p><h1>Browse AI Tool Categories</h1><p>Find the right tools faster with curated category pages.</p></section><section class="content-section"><div class="grid">${categoryCards}</div></section>`
}));

for (const [slug, catTools] of Object.entries(byCategory)) {
  const categoryName = catTools[0].categoryName;
  const list = catTools.map((tool) => toolCard(tool)).join('');

  fs.writeFileSync(path.join(root, 'categories', `${slug}.html`), pageShell({
    title: `Best ${categoryName} Tools (2026) | ${siteName}`,
    description: `Browse the best ${categoryName.toLowerCase()} tools in 2026 with direct links to each tool page.`,
    canonicalPath: `/categories/${slug}.html`,
    body: `<section class="hero"><p class="eyebrow">Category</p><h1>Best ${escapeHtml(categoryName)} Tools</h1><p>Compare top options, key benefits, and links to full tool profiles.</p></section><section class="content-section"><div class="grid">${list}</div></section>`
  }));
}

const categories = ['All', 'Writing', 'Image', 'Video', 'Chatbot', 'Productivity', 'Code', 'Marketing'];
const homeCards = toolsWithCategory.map((tool) => toolCard(tool)).join('');

fs.writeFileSync(path.join(root, 'index.html'), pageShell({
  title: `${siteName} | Static AI Tools Directory`,
  description: 'Discover AI tools with static, crawlable pages for tools and categories.',
  canonicalPath: '/index.html',
  body: `
    <section class="hero" style="text-align:center;">
      <p class="eyebrow">AI DIRECTORY</p>
      <h1>Discover the Best AI Tools</h1>
      <p style="margin-inline:auto;">Explore hundreds of AI tools for writing, design, coding, productivity and more.</p>
      <div class="search-wrap"><input type="text" id="searchInput" placeholder="Search AI tools..." aria-label="Search AI tools"></div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Categories</h2></div>
      <div class="category-filter" id="categoryFilter">${categories.map((category, idx) => `<button class="filter-btn${idx === 0 ? ' active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</div>
      <p id="searchStatus" class="text-gray-600 mb-4">Showing all tools</p>
      <div id="tools-grid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">${homeCards}</div>
      <p id="noResultsMessage" class="text-gray-600 mt-4" hidden>No tools found for your filters.</p>
    </section>

    <script src="/public/js/search.js" defer></script>
  `
}));

console.log(`Generated ${toolsWithCategory.length} static tool pages and ${Object.keys(byCategory).length} category pages.`);
