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
    staticSlug: slugify(tool.category || 'uncategorized'),
    description: ''
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
        <a href="/index.html">Home</a>
        <a href="/categories/index.html">Categories</a>
      </nav>
    </div>
  </header>

  <main class="container">
    ${body}
  </main>

  <footer><div class="container">© ${new Date().getFullYear()} ${siteName} · Discover, compare, and choose AI tools confidently.</div></footer>
</body>
</html>`;

const toolCard = (tool) => `<a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
  <h3 class="text-xl font-semibold">${escapeHtml(tool.name)}</h3>
  <p class="text-gray-600">${escapeHtml(tool.description || 'No description available.')}</p>
  <p><small>${escapeHtml(tool.categoryName)}</small></p>
  <span class="text-blue-600 font-semibold">View tool</span>
</a>`;

const buildCategoryIntro = (categoryName, toolsInCategory) => {
  const featured = toolsInCategory.slice(0, 4).map((tool) => tool.name).join(', ');
  return `${categoryName} tools help teams move faster with better output and less manual work. Compare top options like ${featured}, then visit each profile page to evaluate pricing, key features, and best-fit use cases.`;
};

fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
fs.mkdirSync(path.join(root, 'categories'), { recursive: true });

for (const tool of toolsWithCategory) {
  const alternatives = toolsWithCategory
    .filter((candidate) => candidate.slug !== tool.slug)
    .slice(0, 8)
    .map((alt) => `<li><a href="/tools/${escapeHtml(alt.slug)}.html">${escapeHtml(alt.name)}</a></li>`)
    .join('');

  const features = (tool.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');

  const html = `
    <section class="hero">
      <p class="eyebrow">Tool Profile</p>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.fullDescription || tool.description || 'No description available.')}</p>
      <div class="hero-search">
        <a class="btn" href="${escapeHtml(tool.website || '#')}" target="_blank" rel="noopener noreferrer">Visit Official Website</a>
        <a class="btn btn-secondary" href="/categories/${escapeHtml(tool.categorySlug)}.html">More ${escapeHtml(tool.categoryName)} tools</a>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Overview</h2></div>
      <p><strong>Category:</strong> <span class="category-badge">${escapeHtml(tool.categoryName)}</span></p>
      <p><strong>Pricing:</strong> ${escapeHtml(tool.pricing || 'Not listed')}</p>
    </section>

    <section class="content-section">
      <h2>Features</h2>
      <ul>${features || '<li>Feature details not available.</li>'}</ul>
    </section>

    <section class="content-section">
      <h2>Alternatives</h2>
      <ul>${alternatives}</ul>
    </section>
  `;

  const finalHtml = pageShell({
    title: `${tool.name} AI Tool - ${siteName}`,
    description: `Discover ${tool.name} features, pricing and alternatives.`,
    canonicalPath: `/tools/${tool.slug}.html`,
    body: html
  });

  fs.writeFileSync(path.join(root, 'tools', `${tool.slug}.html`), finalHtml);
}

const categoryCards = Object.entries(byCategory)
  .sort((a, b) => a[1][0].categoryName.localeCompare(b[1][0].categoryName))
  .map(([slug, catTools]) => `<a href="/categories/${escapeHtml(slug)}.html" class="tool-card"><h3>${escapeHtml(catTools[0].categoryName)}</h3><p>${catTools.length} tools available</p><span class="text-blue-600 font-semibold">Explore category</span></a>`)
  .join('');

const categoriesIndexHtml = pageShell({
  title: `All AI Categories - ${siteName}`,
  description: 'Browse all AI tool categories in AI Tool Vault.',
  canonicalPath: '/categories/index.html',
  body: `
    <section class="hero">
      <p class="eyebrow">Discover by Workflow</p>
      <h1>Browse AI Tool Categories</h1>
      <p>Find the right tools faster with curated category pages for writing, coding, productivity, automation, and more.</p>
    </section>
    <section class="content-section">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${categoryCards}</div>
    </section>
  `
});
fs.writeFileSync(path.join(root, 'categories', 'index.html'), categoriesIndexHtml);

for (const [slug, catTools] of Object.entries(byCategory)) {
  const categoryName = catTools[0].categoryName;
  const intro = buildCategoryIntro(categoryName, catTools);
  const list = catTools.map((tool) => toolCard(tool)).join('');

  const html = pageShell({
    title: `Best ${categoryName} Tools (2026) | ${siteName}`,
    description: `Browse the best ${categoryName.toLowerCase()} tools in 2026 with direct links to each tool page.`,
    canonicalPath: `/categories/${slug}.html`,
    body: `
      <section class="hero">
        <p class="eyebrow">Category Spotlight</p>
        <h1>Best ${escapeHtml(categoryName)} Tools</h1>
        <p>${escapeHtml(intro)}</p>
      </section>
      <section class="content-section">
        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">${list}</div>
      </section>
    `
  });

  fs.writeFileSync(path.join(root, 'categories', `${slug}.html`), html);
}

const homeCards = toolsWithCategory.map((tool) => toolCard(tool)).join('');

const homeHtml = pageShell({
  title: `${siteName} | Static AI Tools Directory`,
  description: 'Discover AI tools with static, crawlable pages for tools and categories.',
  canonicalPath: '/index.html',
  body: `
    <section class="hero">
      <p class="eyebrow">AI DIRECTORY</p>
      <h1>Find the Best AI Tools for Every Workflow</h1>
      <p>Explore a modern AI tools directory with curated categories, rich tool cards, and SEO-friendly static pages.</p>
      <div class="hero-search">
        <input type="text" id="searchInput" placeholder="Search AI tools..." aria-label="Search AI tools">
        <a class="btn" href="/categories/index.html">Browse categories</a>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Browse by Category</h2></div>
      <div class="tool-grid">
        ${Object.entries(byCategory)
          .sort((a, b) => a[1][0].categoryName.localeCompare(b[1][0].categoryName))
          .map(([slug, catTools]) => `<a href="/categories/${escapeHtml(slug)}.html"><span>${escapeHtml(catTools[0].categoryName)}</span></a>`)
          .join('')}
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>All Tools</h2></div>
      <p id="searchStatus" class="text-gray-600 mb-4">Showing all tools</p>
      <div id="tools-grid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${homeCards}
      </div>
      <p id="noResultsMessage" class="text-gray-600 mt-4" hidden>No tools found for your search.</p>
    </section>

    <script src="/public/js/search.js" defer></script>
  `
});

fs.writeFileSync(path.join(root, 'index.html'), homeHtml);
console.log(`Generated ${toolsWithCategory.length} static tool pages and ${Object.keys(byCategory).length} category pages.`);
