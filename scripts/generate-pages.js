const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://aitoolvault.netlify.app';

const BEST_KEYWORDS = [
  'best-ai-tools-for-marketing',
  'best-ai-tools-for-students',
  'best-ai-tools-for-productivity',
  'best-ai-tools-for-startups',
  'best-ai-tools-for-seo',
  'best-ai-tools-for-programming',
  'best-ai-tools-for-video-editing',
  'best-ai-tools-for-design'
];

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const ensureDir = (relativeDir) => fs.mkdirSync(path.join(root, relativeDir), { recursive: true });
const writeFile = (relativePath, content) => {
  const absolute = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const titleCase = (value = '') =>
  String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const htmlDoc = ({ title, description, canonicalPath, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${siteUrl}${canonicalPath}" />
</head>
<body>
  <header>
    <p><a href="/">AI Tool Vault</a> | <a href="/categories/index.html">Categories</a> | <a href="/best/best-ai-tools-for-marketing.html">Best AI Tools</a></p>
  </header>
  <main>
${body}
  </main>
</body>
</html>
`;

const tools = readJson('data/tools.json');

const normalizedTools = tools.map((tool) => ({
  ...tool,
  slug: tool.slug || slugify(tool.name),
  category: tool.category || 'AI Tools',
  url: tool.url || tool.website || '#',
  description: tool.description || `${tool.name} is an AI tool for modern teams.`
}));

const categoryMap = new Map();
for (const tool of normalizedTools) {
  const categorySlug = slugify(tool.category);
  if (!categoryMap.has(categorySlug)) categoryMap.set(categorySlug, []);
  categoryMap.get(categorySlug).push(tool);
}

const categorySlugs = Array.from(categoryMap.keys()).sort();

const pageUrls = ['/'];

// /tools/[tool-name].html
ensureDir('tools');
for (const tool of normalizedTools) {
  const categorySlug = slugify(tool.category);
  const relatedTools = (categoryMap.get(categorySlug) || []).filter((item) => item.slug !== tool.slug).slice(0, 10);
  const alternativeTools = normalizedTools.filter((item) => item.slug !== tool.slug).slice(0, 10);
  const body = `    <article>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.description)}</p>
      <p><strong>Category:</strong> <a href="/categories/${categorySlug}.html">${escapeHtml(tool.category)}</a></p>
      <p><a href="${escapeHtml(tool.url)}" target="_blank" rel="nofollow noopener sponsored">Visit ${escapeHtml(tool.name)}</a></p>

      <section>
        <h2>Related tools</h2>
        <ul>
          ${relatedTools.map((item) => `<li><a href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></li>`).join('')}
        </ul>
      </section>

      <section>
        <h2>Top alternatives</h2>
        <ul>
          ${alternativeTools.slice(0, 5).map((item) => `<li><a href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></li>`).join('')}
        </ul>
        <p><a href="/alternatives/${tool.slug}-alternatives.html">View all ${escapeHtml(tool.name)} alternatives</a></p>
      </section>

      <section>
        <h2>Explore more</h2>
        <ul>
          <li><a href="/categories/index.html">All categories</a></li>
          <li><a href="/best/best-ai-tools-for-productivity.html">Best AI tools for productivity</a></li>
        </ul>
      </section>
    </article>`;

  const filePath = `tools/${tool.slug}.html`;
  writeFile(
    filePath,
    htmlDoc({
      title: `${tool.name} – ${tool.category} Tool`,
      description: tool.description,
      canonicalPath: `/${filePath}`,
      body
    })
  );
  pageUrls.push(`/${filePath}`);
}

// /categories/[category].html
ensureDir('categories');
for (const [categorySlug, categoryTools] of categoryMap) {
  const topTools = (categoryTools.length >= 20
    ? categoryTools
    : categoryTools.concat(normalizedTools.filter((tool) => slugify(tool.category) !== categorySlug))
  ).slice(0, 25);
  const body = `    <article>
      <h1>${escapeHtml(titleCase(categorySlug))} AI Tools</h1>
      <p>Browse top ${escapeHtml(titleCase(categorySlug))} tools and compare their strengths.</p>

      <section>
        <h2>Tools in this category</h2>
        <ul>
          ${topTools
            .map(
              (tool) =>
                `<li><a href="/tools/${tool.slug}.html">${escapeHtml(tool.name)}</a> – ${escapeHtml(tool.description)}</li>`
            )
            .join('')}
        </ul>
      </section>

      <section>
        <h2>Internal links</h2>
        <ul>
          <li><a href="/best/best-ai-tools-for-marketing.html">Best AI tools for marketing</a></li>
          <li><a href="/best/best-ai-tools-for-programming.html">Best AI tools for programming</a></li>
          ${topTools
            .slice(0, 5)
            .map((tool) => `<li><a href="/alternatives/${tool.slug}-alternatives.html">${escapeHtml(tool.name)} alternatives</a></li>`)
            .join('')}
        </ul>
      </section>
    </article>`;

  const filePath = `categories/${categorySlug}.html`;
  writeFile(
    filePath,
    htmlDoc({
      title: `${titleCase(categorySlug)} AI Tools (2026)`,
      description: `Discover the best ${titleCase(categorySlug)} AI tools with quick comparisons and internal links.`,
      canonicalPath: `/${filePath}`,
      body
    })
  );
  pageUrls.push(`/${filePath}`);
}

const categoriesIndexBody = `    <article>
      <h1>AI Tool Categories</h1>
      <p>Explore category hubs for focused AI tool discovery.</p>
      <ul>
        ${categorySlugs.map((slug) => `<li><a href="/categories/${slug}.html">${escapeHtml(titleCase(slug))}</a></li>`).join('')}
      </ul>
    </article>`;
writeFile(
  'categories/index.html',
  htmlDoc({
    title: 'AI Tool Categories Directory',
    description: 'Browse all AI tool categories with curated internal links.',
    canonicalPath: '/categories/index.html',
    body: categoriesIndexBody
  })
);
pageUrls.push('/categories/index.html');

// /alternatives/[tool]-alternatives.html
ensureDir('alternatives');
for (const tool of normalizedTools) {
  const alternatives = normalizedTools.filter((item) => item.slug !== tool.slug).slice(0, 10);
  const rows = alternatives
    .map(
      (item, index) => `<tr>
        <td>${index + 1}</td>
        <td><a href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.description)}</td>
      </tr>`
    )
    .join('');

  const body = `    <article>
      <h1>Top 10 ${escapeHtml(tool.name)} Alternatives</h1>
      <p>Compare leading alternatives to ${escapeHtml(tool.name)} for similar use cases.</p>

      <section>
        <h2>Alternative tools list</h2>
        <ol>
          ${alternatives.map((item) => `<li><a href="/tools/${item.slug}.html">${escapeHtml(item.name)}</a></li>`).join('')}
        </ol>
      </section>

      <section>
        <h2>Comparison table</h2>
        <table border="1" cellpadding="8" cellspacing="0">
          <thead><tr><th>#</th><th>Tool</th><th>Category</th><th>Description</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>

      <section>
        <h2>Internal links</h2>
        <ul>
          <li><a href="/categories/${slugify(tool.category)}.html">${escapeHtml(tool.category)} category</a></li>
          <li><a href="/best/best-ai-tools-for-seo.html">Best AI tools for SEO</a></li>
          <li><a href="/best/best-ai-tools-for-students.html">Best AI tools for students</a></li>
        </ul>
      </section>
    </article>`;

  const filePath = `alternatives/${tool.slug}-alternatives.html`;
  writeFile(
    filePath,
    htmlDoc({
      title: `${tool.name} Alternatives: Top 10 Picks`,
      description: `Find the best ${tool.name} alternatives and compare features quickly.`,
      canonicalPath: `/${filePath}`,
      body
    })
  );
  pageUrls.push(`/${filePath}`);
}

// /best/[keyword].html
ensureDir('best');
for (const bestSlug of BEST_KEYWORDS) {
  const keyword = bestSlug.replace(/^best-ai-tools-for-/, '').replace(/-/g, ' ');
  const relevant = normalizedTools.filter((tool) => {
    const haystack = `${tool.category} ${tool.description}`.toLowerCase();
    return haystack.includes(keyword.split(' ')[0]);
  });
  const picks = (relevant.length ? relevant : normalizedTools).slice(0, 20);

  const body = `    <article>
      <h1>${escapeHtml(titleCase(bestSlug))}</h1>
      <p>Looking for the best AI tools for ${escapeHtml(keyword)}? This curated list highlights practical options for different budgets and workflows.</p>

      <section>
        <h2>Recommended tools</h2>
        <ul>
          ${picks.map((tool) => `<li><a href="/tools/${tool.slug}.html">${escapeHtml(tool.name)}</a> – ${escapeHtml(tool.description)}</li>`).join('')}
        </ul>
      </section>

      <section>
        <h2>Explore related pages</h2>
        <ul>
          ${picks.slice(0, 5).map((tool) => `<li><a href="/alternatives/${tool.slug}-alternatives.html">${escapeHtml(tool.name)} alternatives</a></li>`).join('')}
          <li><a href="/categories/index.html">All categories</a></li>
        </ul>
      </section>
    </article>`;

  const filePath = `best/${bestSlug}.html`;
  writeFile(
    filePath,
    htmlDoc({
      title: `${titleCase(bestSlug)} (2026 Guide)`,
      description: `Discover ${titleCase(bestSlug)} with curated picks and internal links.`,
      canonicalPath: `/${filePath}`,
      body
    })
  );
  pageUrls.push(`/${filePath}`);
}

// sitemap.xml update
const uniqueUrls = Array.from(new Set(pageUrls)).sort();
const sitemapEntries = uniqueUrls
  .map(
    (url) => `  <url>\n    <loc>${siteUrl}${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${url === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
  )
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
writeFile('sitemap.xml', sitemap);

writeFile('data/generated-pages.json', JSON.stringify(uniqueUrls, null, 2));

console.log(`Generated ${uniqueUrls.length} SEO pages and updated sitemap.xml.`);
