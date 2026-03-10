const fs = require('fs');
const path = require('path');

const siteUrl = 'https://aitoolvault.example.com';
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), c);
};
const render = (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? '');
const titleCaseCategory = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const logoFor = (tool) => tool.logo || '/images/logos/default-tool.webp';
const routeToFile = (route) => (route === '/' ? 'index.html' : `pages${route}/index.html`);
const normalizeRoute = (url) => {
  if (url === '/index.html') return '/';
  if (url.endsWith('.html')) return url.slice(0, -5);
  return url;
};

const cardFor = (tool, secondaryLink) => `
<article class="card" data-name="${tool.name.toLowerCase()}" data-category="${tool.category}" data-description="${tool.description.toLowerCase()}">
  <img loading="lazy" class="card-logo" src="${logoFor(tool)}" alt="${tool.name} logo" width="64" height="64">
  <span class="category-badge">${titleCaseCategory(tool.category)}</span>
  <h3><a href="/tools/${tool.slug}">${tool.name}</a></h3>
  <p>${tool.description}</p>
  <div class="card-actions">
    <a class="btn" href="${tool.official_url}" target="_blank" rel="noopener sponsored nofollow">Visit</a>
    ${secondaryLink}
  </div>
</article>`;

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : fallback;
};
const offset = Number.parseInt(getArg('offset', '0'), 10);
const limit = Number.parseInt(getArg('limit', '50'), 10);
const compareWindow = Number.parseInt(getArg('compare-window', '5'), 10);
const includeCategories = getArg('include-categories', offset === 0 ? 'true' : 'false') === 'true';
const includeBest = getArg('include-best', offset === 0 ? 'true' : 'false') === 'true';

const tools = JSON.parse(read('data/tools.json'));
const categories = JSON.parse(read('data/categories.json'));
const templates = {
  tool: read('templates/tool.html'),
  category: read('templates/category.html'),
  comparison: read('templates/comparison.html'),
  alternatives: read('templates/alternatives.html'),
  best: read('templates/best.html')
};

const header = `<header><div class="container nav"><a class="brand" href="/">AI Tool Vault</a><nav class="menu" aria-label="Main navigation"><a href="/categories/writing-ai">Categories</a><a href="/best/best-free-ai-tools">Best Of</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav></div></header>`;
const footer = `<footer><div class="container">© ${new Date().getFullYear()} AI Tool Vault</div></footer>`;

const selectedTools = tools.slice(offset, offset + limit);
const freshPageUrls = ['/', '/about', '/contact'];

for (const tool of selectedTools) {
  const related = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4);
  const alternatives = tools.filter((t) => t.category !== tool.category && t.slug !== tool.slug).slice(0, 4);
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: tool.category,
    offers: { '@type': 'Offer', price: tool.pricing },
    url: `${siteUrl}/tools/${tool.slug}`
  });

  const toolRoute = `/tools/${tool.slug}`;
  write(routeToFile(toolRoute), render(templates.tool, {
    title: `${tool.name} Review, Features & Pricing (2026) | AI Tool Vault`,
    metaDescription: `Explore ${tool.name}, pricing, key features, and alternatives for ${tool.category}.`,
    canonicalUrl: `${siteUrl}${toolRoute}`,
    schema,
    header,
    footer,
    toolName: tool.name,
    description: tool.description,
    officialUrl: tool.official_url,
    logo: logoFor(tool),
    features: tool.features.map((f) => `<li>${f}</li>`).join(''),
    pricing: tool.pricing,
    slug: tool.slug,
    category: tool.category,
    categoryLabel: titleCaseCategory(tool.category),
    relatedTools: related.map((r) => cardFor(r, `<a class="btn btn-secondary" href="/compare/${tool.slug}-vs-${r.slug}">Compare</a>`)).join(''),
    alternatives: alternatives.map((a) => cardFor(a, `<a class="btn btn-secondary" href="/alternatives/${tool.slug}">All alternatives</a>`)).join('')
  }));
  freshPageUrls.push(toolRoute);

  const alts = tools.filter((t) => t.slug !== tool.slug).slice(0, 10);
  const altRoute = `/alternatives/${tool.slug}`;
  const altSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${tool.name} alternatives`,
    itemListElement: alts.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/tools/${a.slug}` }))
  });
  write(routeToFile(altRoute), render(templates.alternatives, {
    title: `Top ${tool.name} Alternatives in 2026 | AI Tool Vault`,
    metaDescription: `Find the 10 best ${tool.name} alternatives with features and pricing summary.`,
    canonicalUrl: `${siteUrl}${altRoute}`,
    schema: altSchema,
    header,
    footer,
    heading: `Top 10 ${tool.name} Alternatives`,
    intro: `Compare leading alternatives to ${tool.name} and choose the best fit for your workflow.`,
    items: alts.map((a) => `<li><a href="/tools/${a.slug}">${a.name}</a> - <a href="/compare/${tool.slug}-vs-${a.slug}">${tool.name} vs ${a.name}</a></li>`).join('')
  }));
  freshPageUrls.push(altRoute);
}

if (includeCategories) {
  for (const cat of categories) {
    const catRoute = `/categories/${cat.slug}`;
    const categoryTools = tools.filter((t) => t.category === cat.slug);
    const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${cat.name} tools`, url: `${siteUrl}${catRoute}` });
    write(routeToFile(catRoute), render(templates.category, {
      title: `${cat.name} Tools Directory (2026) | AI Tool Vault`,
      metaDescription: `Browse the best ${cat.name.toLowerCase()} with filters, pricing, and feature highlights.`,
      canonicalUrl: `${siteUrl}${catRoute}`,
      schema,
      header,
      footer,
      heading: `${cat.name} Tools`,
      description: cat.description,
      filterOptions: categories.map((c) => `<option value="${c.slug}"${c.slug === cat.slug ? ' selected' : ''}>${c.name}</option>`).join(''),
      tools: categoryTools.map((t) => cardFor(t, `<a class="btn btn-secondary" href="/alternatives/${t.slug}">Alternatives</a>`)).join('')
    }));
    freshPageUrls.push(catRoute);
  }
}

for (let localIndex = 0; localIndex < selectedTools.length; localIndex += 1) {
  const i = offset + localIndex;
  for (let j = 1; j <= compareWindow; j += 1) {
    const a = tools[i];
    const b = tools[(i + j) % tools.length];
    const slug = `${a.slug}-vs-${b.slug}`;
    const compareRoute = `/compare/${slug}`;
    const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `${a.name} vs ${b.name}`, url: `${siteUrl}${compareRoute}` });
    write(routeToFile(compareRoute), render(templates.comparison, {
      title: `${a.name} vs ${b.name}: Features, Pricing & Verdict`,
      metaDescription: `Compare ${a.name} and ${b.name} across features, pricing, and ideal use cases.`,
      canonicalUrl: `${siteUrl}${compareRoute}`,
      schema,
      header,
      footer,
      heading: `${a.name} vs ${b.name}`,
      summary: `${a.name} and ${b.name} are popular choices for ${a.category.replace('-ai', '')} workflows.`,
      toolA: a.name,
      toolB: b.name,
      slugA: a.slug,
      slugB: b.slug,
      rows: ['Pricing', 'Primary Category', 'Feature Depth', 'Ease of Use', 'Best For'].map((r) => `<tr><td>${r}</td><td>${a.pricing}</td><td>${b.pricing}</td></tr>`).join('')
    }));
    freshPageUrls.push(compareRoute);
  }
}

if (includeBest) {
  const bestPages = [
    ['best-ai-tools-for-marketing', 'Best AI Tools for Marketing', 'marketing-ai'],
    ['best-free-ai-tools', 'Best Free AI Tools', 'writing-ai'],
    ['ai-tools-for-students', 'AI Tools for Students', 'productivity-ai'],
    ['best-ai-image-generators', 'Best AI Image Generators', 'image-ai'],
    ['best-ai-coding-tools', 'Best AI Coding Tools', 'coding-ai'],
    ['best-ai-video-tools', 'Best AI Video Tools', 'video-ai'],
    ['best-ai-audio-tools', 'Best AI Audio Tools', 'audio-ai'],
    ['best-ai-writing-tools', 'Best AI Writing Tools', 'writing-ai'],
    ['best-ai-productivity-tools', 'Best AI Productivity Tools', 'productivity-ai'],
    ['best-ai-tools-for-startups', 'Best AI Tools for Startups', 'marketing-ai']
  ];

  for (const [slug, heading, cat] of bestPages) {
    const bestRoute = `/best/${slug}`;
    const picks = tools.filter((t) => t.category === cat).slice(0, 18);
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: heading,
      itemListElement: picks.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/tools/${p.slug}` }))
    });
    write(routeToFile(bestRoute), render(templates.best, {
      title: `${heading} (2026 Guide) | AI Tool Vault`,
      metaDescription: `${heading} curated by use case, pricing, and standout features.`,
      canonicalUrl: `${siteUrl}${bestRoute}`,
      schema,
      header,
      footer,
      heading,
      intro: 'Our editors picked these tools based on performance, value, and usability.',
      cards: picks.map((p) => `<article class="card"><span class="category-badge">${titleCaseCategory(p.category)}</span><h3><a href="/tools/${p.slug}">${p.name}</a></h3><p>${p.description}</p></article>`).join('')
    }));
    freshPageUrls.push(bestRoute);
  }
}

const generatedPagesPath = path.join(root, 'data/generated-pages.json');
const existingPages = fs.existsSync(generatedPagesPath) ? JSON.parse(fs.readFileSync(generatedPagesPath, 'utf8')) : [];
const mergedPages = [...new Set([...existingPages.map(normalizeRoute), ...freshPageUrls.map(normalizeRoute)])].sort();
fs.writeFileSync(generatedPagesPath, JSON.stringify(mergedPages, null, 2));

console.log(`Generated ${freshPageUrls.length} pages in this batch.`);
console.log(`Total tracked pages: ${mergedPages.length}.`);
console.log(`Batch controls -> offset=${offset}, limit=${limit}, compare-window=${compareWindow}`);
