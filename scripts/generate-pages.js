const fs = require('fs');
const path = require('path');

const siteUrl = 'https://aitoolvault.example.com';
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, c) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), c); };
const render = (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? '');

const tools = JSON.parse(read('data/tools.json'));
const categories = JSON.parse(read('data/categories.json'));
const templates = {
  tool: read('templates/tool.html'),
  category: read('templates/category.html'),
  comparison: read('templates/comparison.html'),
  alternatives: read('templates/alternatives.html'),
  best: read('templates/best.html')
};

const header = `<header><div class="container nav"><a class="brand" href="/index.html">AI Tool Vault</a><nav class="menu" aria-label="Main navigation"><a href="/categories/writing-ai.html">Categories</a><a href="/best/best-free-ai-tools.html">Best Of</a><a href="/contact.html">Contact</a></nav></div></header>`;
const footer = `<footer><div class="container">© ${new Date().getFullYear()} AI Tool Vault</div></footer>`;

const pageUrls = ['/index.html','/about.html','/contact.html'];

for (const tool of tools) {
  const related = tools.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 6);
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: tool.name, applicationCategory: tool.category, offers: { '@type': 'Offer', price: tool.pricing }, url: `${siteUrl}/tools/${tool.slug}.html` });
  const html = render(templates.tool, {
    title: `${tool.name} Review, Features & Pricing (2026) | AI Tool Vault`,
    metaDescription: `Explore ${tool.name}, pricing, key features, and alternatives for ${tool.category}.`,
    canonicalUrl: `${siteUrl}/tools/${tool.slug}.html`,
    schema,
    header,
    footer,
    toolName: tool.name,
    description: tool.description,
    officialUrl: tool.official_url,
    features: tool.features.map(f => `<li>${f}</li>`).join(''),
    pricing: tool.pricing,
    slug: tool.slug,
    category: tool.category,
    categoryLabel: tool.category.replace('-', ' '),
    compareSlug: `${tool.slug}-vs-${related[0]?.slug || tool.slug}` ,
    compareName: related[0]?.name || 'another tool',
    relatedTools: related.map(r => `<article class="card" data-name="${r.name.toLowerCase()}" data-description="${r.description.toLowerCase()}" data-category="${r.category}"><img loading="lazy" src="${r.logo}" alt="${r.name} logo" width="64" height="64"><h3><a href="/tools/${r.slug}.html">${r.name}</a></h3><p>${r.pricing}</p><p><a href="${r.official_url}" target="_blank" rel="noopener sponsored nofollow">Visit Tool</a></p></article>`).join('')
  });
  write(`pages/tools/${tool.slug}.html`, html);
  pageUrls.push(`/tools/${tool.slug}.html`);

  const alts = tools.filter(t => t.slug !== tool.slug).slice(0, 10);
  const altSchema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: `${tool.name} alternatives`, itemListElement: alts.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/tools/${a.slug}.html` })) });
  write(`pages/alternatives/${tool.slug}.html`, render(templates.alternatives, {
    title: `Top ${tool.name} Alternatives in 2026 | AI Tool Vault`,
    metaDescription: `Find the 10 best ${tool.name} alternatives with features and pricing summary.`,
    canonicalUrl: `${siteUrl}/alternatives/${tool.slug}.html`,
    schema: altSchema,
    header,
    footer,
    heading: `Top 10 ${tool.name} Alternatives`,
    intro: `Compare leading alternatives to ${tool.name} and choose the best fit for your workflow.`,
    items: alts.map(a => `<li><a href="/tools/${a.slug}.html">${a.name}</a> - <a href="/compare/${tool.slug}-vs-${a.slug}.html">${tool.name} vs ${a.name}</a></li>`).join('')
  }));
  pageUrls.push(`/alternatives/${tool.slug}.html`);
}

for (const cat of categories) {
  const catTools = tools.filter(t => t.category === cat.slug);
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${cat.name} tools`, url: `${siteUrl}/categories/${cat.slug}.html` });
  write(`pages/categories/${cat.slug}.html`, render(templates.category, {
    title: `${cat.name} Tools Directory (2026) | AI Tool Vault`,
    metaDescription: `Browse the best ${cat.name.toLowerCase()} with filters, pricing, and feature highlights.`,
    canonicalUrl: `${siteUrl}/categories/${cat.slug}.html`,
    schema,
    header,
    footer,
    heading: `${cat.name} Tools`,
    description: cat.description,
    filterOptions: categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join(''),
    tools: catTools.map(t => `<article class="card" data-name="${t.name.toLowerCase()}" data-description="${t.description.toLowerCase()}" data-category="${t.category}"><img loading="lazy" src="${t.logo}" alt="${t.name} logo" width="64" height="64"><h3><a href="/tools/${t.slug}.html">${t.name}</a></h3><p>${t.description}</p><p><a href="/alternatives/${t.slug}.html">Alternatives</a></p></article>`).join('')
  }));
  pageUrls.push(`/categories/${cat.slug}.html`);
}

// comparisons: each tool vs next 5 tools => 1000 pages for 200 tools
for (let i = 0; i < tools.length; i++) {
  for (let j = 1; j <= 5; j++) {
    const a = tools[i];
    const b = tools[(i + j) % tools.length];
    const slug = `${a.slug}-vs-${b.slug}`;
    const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `${a.name} vs ${b.name}`, url: `${siteUrl}/compare/${slug}.html` });
    write(`pages/compare/${slug}.html`, render(templates.comparison, {
      title: `${a.name} vs ${b.name}: Features, Pricing & Verdict`,
      metaDescription: `Compare ${a.name} and ${b.name} across features, pricing, and ideal use cases.`,
      canonicalUrl: `${siteUrl}/compare/${slug}.html`,
      schema,
      header,
      footer,
      heading: `${a.name} vs ${b.name}`,
      summary: `${a.name} and ${b.name} are popular choices for ${a.category.replace('-ai','')} workflows.`,
      toolA: a.name,
      toolB: b.name,
      slugA: a.slug,
      slugB: b.slug,
      rows: ['Pricing','Primary Category','Feature Depth','Ease of Use','Best For'].map(r=>`<tr><td>${r}</td><td>${a.pricing}</td><td>${b.pricing}</td></tr>`).join('')
    }));
    pageUrls.push(`/compare/${slug}.html`);
  }
}

const bestPages = [
  ['best-ai-tools-for-marketing','Best AI Tools for Marketing','marketing-ai'],
  ['best-free-ai-tools','Best Free AI Tools','writing-ai'],
  ['ai-tools-for-students','AI Tools for Students','productivity-ai'],
  ['best-ai-image-generators','Best AI Image Generators','image-ai'],
  ['best-ai-coding-tools','Best AI Coding Tools','coding-ai'],
  ['best-ai-video-tools','Best AI Video Tools','video-ai'],
  ['best-ai-audio-tools','Best AI Audio Tools','audio-ai'],
  ['best-ai-writing-tools','Best AI Writing Tools','writing-ai'],
  ['best-ai-productivity-tools','Best AI Productivity Tools','productivity-ai'],
  ['best-ai-tools-for-startups','Best AI Tools for Startups','marketing-ai']
];

for (const [slug, heading, cat] of bestPages) {
  const picks = tools.filter(t=>t.category===cat).slice(0, 18);
  const schema = JSON.stringify({ '@context':'https://schema.org','@type':'ItemList',name:heading,itemListElement:picks.map((p,i)=>({'@type':'ListItem',position:i+1,url:`${siteUrl}/tools/${p.slug}.html`}))});
  write(`pages/best/${slug}.html`, render(templates.best, {
    title: `${heading} (2026 Guide) | AI Tool Vault`,
    metaDescription: `${heading} curated by use case, pricing, and standout features.`,
    canonicalUrl: `${siteUrl}/best/${slug}.html`,
    schema,
    header,
    footer,
    heading,
    intro: `Our editors picked these tools based on performance, value, and usability.`,
    cards: picks.map(p=>`<article class="card"><h3><a href="/tools/${p.slug}.html">${p.name}</a></h3><p>${p.description}</p></article>`).join('')
  }));
  pageUrls.push(`/best/${slug}.html`);
}

fs.writeFileSync(path.join(root, 'data/generated-pages.json'), JSON.stringify(pageUrls, null, 2));
console.log(`Generated ${pageUrls.length} pages.`);
