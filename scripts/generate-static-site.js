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
  const resolvedCategory = categoryMap.get(tool.category) || categoryMap.get(slugify(tool.category)) || { name: tool.category || 'Uncategorized', slug: slugify(tool.category || 'uncategorized'), staticSlug: slugify(tool.category || 'uncategorized'), description: '' };
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

const baseStyles = '<link rel="stylesheet" href="/public/css/styles.css">';

const pageShell = ({ title, description, body }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="https://aitoolvault.example.com${escapeHtml(body.canonicalPath)}">
  ${baseStyles}
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
    ${body.html}
  </main>

  <footer><div class="container">© ${new Date().getFullYear()} ${siteName}</div></footer>
</body>
</html>`;

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
    <article class="content-section">
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.fullDescription || tool.description || 'No description available.')}</p>
      <p><strong>Category:</strong> <a href="/categories/${escapeHtml(tool.categorySlug)}.html">${escapeHtml(tool.categoryName)}</a></p>
      <p><strong>Pricing:</strong> ${escapeHtml(tool.pricing || 'Not listed')}</p>
      <p><a class="btn" href="${escapeHtml(tool.website || '#')}" target="_blank" rel="noopener noreferrer">Official Website</a></p>
    </article>

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
    body: { canonicalPath: `/tools/${tool.slug}.html`, html }
  });

  fs.writeFileSync(path.join(root, 'tools', `${tool.slug}.html`), finalHtml);
}

const categoryCards = Object.entries(byCategory)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([slug, catTools]) => {
    const categoryName = catTools[0].categoryName;
    return `<a href="/categories/${escapeHtml(slug)}.html" class="tool-card"><h3>${escapeHtml(categoryName)}</h3><p>${catTools.length} tools</p></a>`;
  })
  .join('');

const categoriesIndexHtml = pageShell({
  title: `All AI Categories - ${siteName}`,
  description: 'Browse all AI tool categories in AI Tool Vault.',
  body: {
    canonicalPath: '/categories/index.html',
    html: `
      <section class="content-section">
        <h1>AI Tool Categories</h1>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${categoryCards}</div>
      </section>
    `
  }
});
fs.writeFileSync(path.join(root, 'categories', 'index.html'), categoriesIndexHtml);

for (const [slug, catTools] of Object.entries(byCategory)) {
  const categoryName = catTools[0].categoryName;
  const list = catTools
    .map((tool) => `<a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description || '')}</p></a>`)
    .join('');

  const html = pageShell({
    title: `${categoryName} AI Tools - ${siteName}`,
    description: `Explore ${categoryName} tools, features and pricing.`,
    body: {
      canonicalPath: `/categories/${slug}.html`,
      html: `
        <section class="content-section">
          <h1>${escapeHtml(categoryName)}</h1>
          <p>Browse all ${escapeHtml(categoryName)} tools.</p>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${list}</div>
        </section>
      `
    }
  });

  fs.writeFileSync(path.join(root, 'categories', `${slug}.html`), html);
}

const homeCards = toolsWithCategory
  .map((tool) => `<a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card"><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description || 'No description available.')}</p><p><small>${escapeHtml(tool.categoryName)}</small></p></a>`)
  .join('');

const homeHtml = pageShell({
  title: `${siteName} | Static AI Tools Directory`,
  description: 'Discover AI tools with static, crawlable pages for tools and categories.',
  body: {
    canonicalPath: '/index.html',
    html: `
      <section class="hero">
        <h1>AI Tool Vault</h1>
        <p>Explore AI tools with fully static pages optimized for SEO.</p>
        <p><a href="/categories/index.html">Browse categories</a></p>
      </section>

      <section class="content-section">
        <h2>All Tools</h2>
        <div id="tools-grid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${homeCards}
        </div>
      </section>
    `
  }
});

fs.writeFileSync(path.join(root, 'index.html'), homeHtml);
console.log(`Generated ${toolsWithCategory.length} static tool pages and ${Object.keys(byCategory).length} category pages.`);
