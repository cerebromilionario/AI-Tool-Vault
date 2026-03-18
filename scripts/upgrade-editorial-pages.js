const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_ROOT = path.join(ROOT, 'pages');
const SITE_URL = 'https://aitoolvault.netlify.app';
const EDITORIAL_UPDATED = 'March 18, 2026';
const EDITORIAL_TEAM = 'AI Tool Vault Editorial Team';

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tools.json'), 'utf8')).map((tool) => ({
  ...tool,
  name: tool.name || 'Untitled Tool',
  slug: tool.slug || slugify(tool.name || ''),
  category: tool.category || 'AI Tools',
  description: tool.description || `${tool.name || 'This tool'} helps teams work faster with AI.`,
  pricing: tool.pricing || 'Check vendor website',
  features: Array.isArray(tool.features) && tool.features.length ? tool.features : ['automation', 'workflow support', 'team productivity'],
  website: tool.website || tool.url || '#'
}));

const toolMap = new Map(tools.map((tool) => [tool.slug, tool]));
const toolsByCategory = new Map();
for (const tool of tools) {
  const key = slugify(tool.category);
  if (!toolsByCategory.has(key)) toolsByCategory.set(key, []);
  toolsByCategory.get(key).push(tool);
}

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function titleCase(value = '') {
  return String(value)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function prettyNameFromSlug(slug = '') {
  return titleCase(String(slug).replace(/\bAi\b/g, 'AI'));
}

function canonicalFromRelative(relativePath) {
  const normal = relativePath.replace(/\\/g, '/').replace(/^pages\//, '');
  if (normal.endsWith('/index.html')) return `/${normal.replace(/\/index\.html$/, '')}`;
  return `/${normal.replace(/\.html$/, '')}`;
}

function logoLetter(name = '') {
  return String(name).trim().charAt(0).toUpperCase() || 'A';
}

function categoryLabel(category = '') {
  return String(category).replace(/\bai\b/gi, 'AI');
}

function featureSummary(tool) {
  return tool.features.slice(0, 3).map((feature) => titleCase(feature)).join(', ');
}

function primaryAudience(tool) {
  const category = tool.category.toLowerCase();
  if (category.includes('writing')) return ['content teams publishing weekly', 'freelancers drafting faster', 'marketing teams scaling campaign copy'];
  if (category.includes('image')) return ['designers iterating on concepts', 'creative teams producing visual assets', 'marketers testing campaign creatives'];
  if (category.includes('video')) return ['video teams repurposing footage', 'creators making short-form content', 'marketing teams turning scripts into visuals'];
  if (category.includes('coding')) return ['developers reducing repetitive coding tasks', 'engineering teams reviewing code faster', 'technical founders shipping prototypes'];
  if (category.includes('productivity')) return ['operators documenting repeatable workflows', 'team leads managing tasks and notes', 'small teams reducing admin work'];
  if (category.includes('marketing')) return ['growth teams launching campaigns faster', 'agencies juggling multiple client briefs', 'founders validating messaging quickly'];
  if (category.includes('audio') || category.includes('voice')) return ['podcasters creating audio assets', 'customer teams producing voice content', 'media teams editing narration faster'];
  if (category.includes('research')) return ['researchers summarizing sources', 'students organizing evidence', 'analysts scanning long documents'];
  return ['teams automating repetitive work', 'operators evaluating AI tooling', 'small businesses scaling output with lean resources'];
}

function useCaseSentence(tool) {
  const audience = primaryAudience(tool);
  return `${tool.name} is usually a fit for ${audience[0]}, ${audience[1]}, and ${audience[2]}.`;
}

function pricingSignal(tool) {
  const pricing = String(tool.pricing).toLowerCase();
  if (pricing.includes('free')) return 'There is some form of low-friction entry point, which lowers risk for solo users and first evaluations.';
  if (pricing.includes('enterprise')) return 'The pricing signal suggests a heavier sales-led motion, so this is more relevant for larger teams than casual buyers.';
  if (pricing.includes('paid')) return 'This looks better suited to teams that already know the workflow they want to standardize and can justify a dedicated budget.';
  return 'Pricing details are limited, so buyers should verify plan limits, seats, and credit rules directly on the vendor site.';
}

function editorialMethodHtml() {
  return `<aside class="editorial-note"><p class="editorial-kicker">Editorial note</p><p><strong>Reviewed by ${esc(EDITORIAL_TEAM)}</strong> · Updated ${esc(EDITORIAL_UPDATED)}</p><p>These pages are produced from our structured tool dataset and human-edited rules. We compare positioning, feature themes, pricing signals, internal alternatives, and category fit. We avoid claiming hands-on testing when we have not independently verified it.</p><p><a href="/editorial-policy.html">Read our editorial policy</a></p></aside>`;
}

function prosForTool(tool) {
  const pros = [
    `${tool.name} covers ${tool.features[0]} and related ${tool.category.toLowerCase()} workflows.`,
    `${pricingSignal(tool).replace(/\.$/, '')} can be a positive depending on your buying stage.`,
    `${tool.features.length > 1 ? `The feature mix (${featureSummary(tool).toLowerCase()}) gives buyers more than a single narrow use case.` : 'The positioning is easy to understand for a first-pass evaluation.'}`
  ];
  return pros.slice(0, 3);
}

function consForTool(tool) {
  return [
    `The page data does not prove output quality, so teams should validate ${tool.name} with their own prompts, files, or workflows.`,
    `${tool.pricing === 'Enterprise' ? 'Enterprise-style packaging can slow down self-serve testing and make budgeting less transparent.' : 'Plan limits, seats, or credit usage may still change the real cost after initial adoption.'}`,
    `${tool.features.length < 4 ? 'Feature coverage looks focused, which can be good for simplicity but limiting for broader rollouts.' : 'A broader feature set can also mean more setup and governance work before rollout.'}`
  ];
}

function alternativesForTool(tool) {
  const sameCategory = (toolsByCategory.get(slugify(tool.category)) || []).filter((item) => item.slug !== tool.slug);
  const crossCategory = tools.filter((item) => item.slug !== tool.slug && item.category !== tool.category);
  return [...sameCategory.slice(0, 2), ...crossCategory.slice(0, 2)].slice(0, 4);
}

function verdictForTool(tool) {
  const audience = primaryAudience(tool);
  const pricing = String(tool.pricing).toLowerCase();
  if (pricing.includes('free')) {
    return `${tool.name} makes the most sense for buyers who want a lower-friction starting point in ${tool.category.toLowerCase()} before committing to a heavier stack.`;
  }
  if (pricing.includes('enterprise')) {
    return `${tool.name} looks better aligned with established teams that can handle procurement, rollout, and governance around ${tool.category.toLowerCase()} workflows.`;
  }
  return `${tool.name} is a sensible shortlist candidate for ${audience[0]} that want a dedicated workflow tool rather than a generic AI app.`;
}

function relatedTools(tool, count = 4) {
  const sameCategory = (toolsByCategory.get(slugify(tool.category)) || []).filter((item) => item.slug !== tool.slug);
  const fallback = tools.filter((item) => item.slug !== tool.slug && item.category !== tool.category);
  return [...sameCategory, ...fallback].slice(0, count);
}

function list(items) {
  return items.map((item) => `<li>${esc(item)}</li>`).join('');
}

function linkList(items, builder) {
  return items.map(builder).join('');
}

function existingCompareUrl(aSlug, bSlug) {
  const direct = `${aSlug}-vs-${bSlug}`;
  const inverse = `${bSlug}-vs-${aSlug}`;
  if (compareSlugSet.has(direct)) return `/compare/${direct}`;
  if (compareSlugSet.has(inverse)) return `/compare/${inverse}`;
  return '';
}

function pageDocument({ title, description, canonicalPath, schema, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}${canonicalPath}">
  <link rel="canonical" href="${SITE_URL}${canonicalPath}">
  <meta name="google-adsense-account" content="ca-pub-4613426749830025">
  <link rel="stylesheet" href="/public/css/styles.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
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
  <main class="container page-stack">
${body}
  </main>
  <footer>
    <div class="container footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/index.html"><span class="brand-icon">&#9889;</span> AI Tool Vault</a>
          <p>Your editorial directory for discovering AI tools with clearer methodology, transparent disclosures and practical research paths.</p>
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
          <h3 class="footer-title">Editorial</h3>
          <div class="footer-links">
            <a href="/best/best-ai-writing-tools.html">Best Of Guides</a>
            <a href="/editorial-policy.html">Editorial Policy</a>
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
          </div>
        </div>
        <div>
          <h3 class="footer-title">Legal</h3>
          <div class="footer-links">
            <a href="/privacy-policy.html">Privacy Policy</a>
            <a href="/terms-of-use.html">Terms of Use</a>
            <a href="/contact.html">Corrections</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">&copy; 2026 AI Tool Vault. All rights reserved.</span>
        <div class="footer-legal">
          <a href="/privacy-policy.html">Privacy Policy</a>
          <a href="/terms-of-use.html">Terms of Use</a>
          <a href="/editorial-policy.html">Editorial Policy</a>
        </div>
      </div>
    </div>
  </footer>
  <div id="cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>We use cookies and similar technologies to improve your experience, analyze traffic, and serve personalized ads. By clicking &quot;Accept&quot;, you consent to our use of cookies as described in our <a href="/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-actions">
      <button id="cookie-decline" class="btn btn-secondary btn-sm">Decline</button>
      <button id="cookie-accept" class="btn btn-sm">Accept All</button>
    </div>
  </div>
  <script src="/public/js/main.js" defer></script>
</body>
</html>`;
}

function renderToolPage(tool, relativePath) {
  const canonicalPath = canonicalFromRelative(relativePath);
  const alternatives = alternativesForTool(tool);
  const related = relatedTools(tool, 4);
  const audience = primaryAudience(tool);
  const pros = prosForTool(tool);
  const cons = consForTool(tool);

  const body = `
    <section class="hero hero-left">
      <div class="tool-hero-header">
        <div class="tool-logo-placeholder" aria-label="${esc(tool.name)} logo placeholder">${esc(logoLetter(tool.name))}</div>
        <div>
          <p class="eyebrow">Editorial tool review</p>
          <h1>${esc(tool.name)}</h1>
          <p>${esc(tool.description)}</p>
          <div class="meta-pills">
            <span class="meta-pill">Category: ${esc(categoryLabel(tool.category))}</span>
            <span class="meta-pill">Pricing: ${esc(tool.pricing)}</span>
            <span class="meta-pill">Updated: ${esc(EDITORIAL_UPDATED)}</span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <a class="btn" href="${esc(tool.website)}" target="_blank" rel="noopener sponsored nofollow">Visit official website</a>
        <a class="btn btn-secondary" href="/alternatives/${esc(tool.slug)}">See alternatives</a>
      </div>
    </section>

    ${editorialMethodHtml()}

    <section class="content-section">
      <div class="section-heading"><h2>Who is ${esc(tool.name)} for?</h2></div>
      <p>${esc(useCaseSentence(tool))}</p>
      <ul class="editorial-list">${list(audience.map((item) => `${titleCase(item)}.`))}</ul>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>What stands out</h2></div>
      <p>${esc(`${tool.name} is positioned around ${featureSummary(tool).toLowerCase()}. ${pricingSignal(tool)}`)}</p>
      <div class="editorial-grid editorial-grid-2">
        <article class="editorial-card">
          <h3>Feature themes</h3>
          <ul class="editorial-list">${list(tool.features.map((feature) => `${titleCase(feature)}.`))}</ul>
        </article>
        <article class="editorial-card">
          <h3>Editorial take</h3>
          <p>${esc(`${tool.name} looks strongest when you already know the workflow you want to improve, rather than when you are searching for a do-everything AI platform.`)}</p>
        </article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Pros and cons</h2></div>
      <div class="editorial-grid editorial-grid-2">
        <article class="editorial-card pros-card"><h3>Pros</h3><ul class="editorial-list">${list(pros)}</ul></article>
        <article class="editorial-card cons-card"><h3>Cons</h3><ul class="editorial-list">${list(cons)}</ul></article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Alternatives to consider</h2></div>
      <p>${esc(`If ${tool.name} feels too narrow, too broad, or not aligned with your pricing expectations, compare it with adjacent tools before deciding.`)}</p>
      <div class="editorial-grid editorial-grid-2">
        ${linkList(alternatives, (item) => `<a class="tool-card" href="/tools/${esc(item.slug)}"><small>${esc(categoryLabel(item.category))}</small><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><span class="view-link">Open profile →</span></a>`)}
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Verdict</h2></div>
      <p>${esc(verdictForTool(tool))}</p>
      <p class="muted-note">Best next step: compare pricing, test one core workflow, and review at least two alternatives in the same category before rollout.</p>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Keep researching</h2></div>
      <div class="editorial-grid editorial-grid-2">
        ${linkList(related, (item) => { const compareUrl = existingCompareUrl(tool.slug, item.slug); return compareUrl ? `<a class=\"tool-card\" href=\"${compareUrl}\"><small>Compare</small><h3>${esc(tool.name)} vs ${esc(item.name)}</h3><p>${esc(`See how these tools differ across category fit, pricing signal, and typical use case.`)}</p><span class=\"view-link\">Read comparison →</span></a>` : `<a class=\"tool-card\" href=\"/tools/${esc(item.slug)}\"><small>Alternative</small><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><span class=\"view-link\">Open profile →</span></a>`; })}
      </div>
    </section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      applicationCategory: tool.category,
      offers: {
        '@type': 'Offer',
        price: tool.pricing
      },
      url: `${SITE_URL}/tools/${tool.slug}`
    },
    author: {
      '@type': 'Organization',
      name: EDITORIAL_TEAM
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Tool Vault'
    },
    dateModified: '2026-03-18',
    reviewBody: verdictForTool(tool)
  };

  return pageDocument({
    title: `${tool.name} review: who it is for, pros, cons and alternatives`,
    description: `${tool.name} review with who it is for, pros, cons, alternatives and an editorial verdict.`,
    canonicalPath,
    schema,
    body
  });
}

function comparisonVerdict(a, b) {
  if (a.category === b.category) {
    if (String(a.pricing).toLowerCase().includes('free') && !String(b.pricing).toLowerCase().includes('free')) {
      return `${a.name} is the easier first tool to trial, while ${b.name} may still be worth paying for if its workflow fit is more specific to your team.`;
    }
    if (String(b.pricing).toLowerCase().includes('free') && !String(a.pricing).toLowerCase().includes('free')) {
      return `${b.name} is the easier first tool to trial, while ${a.name} may still be worth paying for if its workflow fit is more specific to your team.`;
    }
    return `Because both tools sit in ${a.category.toLowerCase()}, the better choice usually comes down to which product maps more closely to your main workflow and approval process.`;
  }
  return `${a.name} is the more natural fit if your priority is ${a.category.toLowerCase()}, while ${b.name} makes more sense if your team is primarily buying for ${b.category.toLowerCase()}.`;
}

function renderComparePage(a, b, relativePath) {
  const canonicalPath = canonicalFromRelative(relativePath);
  const aPros = prosForTool(a).slice(0, 2);
  const bPros = prosForTool(b).slice(0, 2);
  const aCons = consForTool(a).slice(0, 2);
  const bCons = consForTool(b).slice(0, 2);
  const alternatives = [...alternativesForTool(a).slice(0, 2), ...alternativesForTool(b).slice(0, 2)]
    .filter((item, index, list) => list.findIndex((candidate) => candidate.slug === item.slug) === index)
    .slice(0, 4);

  const body = `
    <section class="hero hero-left">
      <p class="eyebrow">Editorial comparison</p>
      <h1>${esc(a.name)} vs ${esc(b.name)}</h1>
      <p>${esc(`${a.name} and ${b.name} solve related but not always identical problems. This page focuses on category fit, pricing signal, feature themes, and the type of buyer each tool seems best suited for.`)}</p>
      <div class="meta-pills">
        <span class="meta-pill">${esc(categoryLabel(a.category))}</span>
        <span class="meta-pill">${esc(categoryLabel(b.category))}</span>
        <span class="meta-pill">Updated: ${esc(EDITORIAL_UPDATED)}</span>
      </div>
    </section>

    ${editorialMethodHtml()}

    <section class="content-section">
      <div class="section-heading"><h2>Quick comparison</h2></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Criteria</th><th>${esc(a.name)}</th><th>${esc(b.name)}</th></tr>
          </thead>
          <tbody>
            <tr><td>Primary category</td><td>${esc(categoryLabel(a.category))}</td><td>${esc(categoryLabel(b.category))}</td></tr>
            <tr><td>Pricing signal</td><td>${esc(a.pricing)}</td><td>${esc(b.pricing)}</td></tr>
            <tr><td>Feature themes</td><td>${esc(featureSummary(a))}</td><td>${esc(featureSummary(b))}</td></tr>
            <tr><td>Better fit for</td><td>${esc(primaryAudience(a)[0])}</td><td>${esc(primaryAudience(b)[0])}</td></tr>
            <tr><td>Editorial caution</td><td>${esc(aCons[0])}</td><td>${esc(bCons[0])}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Who should choose each tool?</h2></div>
      <div class="editorial-grid editorial-grid-2">
        <article class="editorial-card"><h3>Choose ${esc(a.name)} if…</h3><ul class="editorial-list">${list(primaryAudience(a).map((item) => `You are ${item}.`))}</ul></article>
        <article class="editorial-card"><h3>Choose ${esc(b.name)} if…</h3><ul class="editorial-list">${list(primaryAudience(b).map((item) => `You are ${item}.`))}</ul></article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Pros and cons at a glance</h2></div>
      <div class="editorial-grid editorial-grid-2">
        <article class="editorial-card pros-card"><h3>${esc(a.name)} pros</h3><ul class="editorial-list">${list(aPros)}</ul><h3>${esc(a.name)} cons</h3><ul class="editorial-list">${list(aCons)}</ul></article>
        <article class="editorial-card pros-card"><h3>${esc(b.name)} pros</h3><ul class="editorial-list">${list(bPros)}</ul><h3>${esc(b.name)} cons</h3><ul class="editorial-list">${list(bCons)}</ul></article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Alternatives worth checking</h2></div>
      <p>${esc('If neither option is a clean fit, expanding the shortlist often reveals better alignment on workflow depth, budget, or team size.')}</p>
      <div class="editorial-grid editorial-grid-2">
        ${linkList(alternatives, (item) => `<a class="tool-card" href="/tools/${esc(item.slug)}"><small>${esc(categoryLabel(item.category))}</small><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><span class="view-link">Review tool →</span></a>`)}
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Verdict</h2></div>
      <p>${esc(comparisonVerdict(a, b))}</p>
      <p class="muted-note">Editorial recommendation: run a real workflow test before purchase, especially if output quality and approvals matter more than raw feature count.</p>
    </section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${a.name} vs ${b.name}`,
    author: {
      '@type': 'Organization',
      name: EDITORIAL_TEAM
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Tool Vault'
    },
    dateModified: '2026-03-18',
    url: `${SITE_URL}${canonicalPath}`
  };

  return pageDocument({
    title: `${a.name} vs ${b.name}: who each tool is for, pros, cons and verdict`,
    description: `Compare ${a.name} vs ${b.name} with audience fit, pros, cons, alternatives and an editorial verdict.`,
    canonicalPath,
    schema,
    body
  });
}

function topicConfigFromSlug(slug) {
  const clean = slug.replace(/^best-/, '').replace(/^ai-/, '');
  const name = titleCase(slug.replace(/^best-/, '').replace(/-/g, ' '));
  const mappings = [
    { test: /writing/, keywords: ['writing', 'copy', 'content', 'grammar'], label: 'AI writing', categories: ['ai writing', 'content marketing'] },
    { test: /image|design/, keywords: ['image', 'design', 'visual'], label: 'image generation', categories: ['image generation'] },
    { test: /video/, keywords: ['video', 'avatar', 'clip'], label: 'video creation', categories: ['video creation'] },
    { test: /coding|programming|developer/, keywords: ['coding', 'programming', 'developer', 'code'], label: 'coding', categories: ['coding'] },
    { test: /productivity|student|startup/, keywords: ['productivity', 'task', 'note', 'automation'], label: 'productivity', categories: ['productivity', 'automation'] },
    { test: /marketing|seo/, keywords: ['marketing', 'seo', 'campaign'], label: 'marketing', categories: ['marketing', 'content marketing', 'seo optimization', 'social media marketing', 'email marketing'] }
  ];
  const match = mappings.find((item) => item.test.test(slug));
  return {
    title: titleCase(clean.replace(/\bai\b/g, 'AI')),
    label: match ? match.label : clean,
    keywords: match ? match.keywords : clean.split('-'),
    categories: match ? match.categories : []
  };
}

function pickBestTools(bestSlug) {
  const config = topicConfigFromSlug(bestSlug);
  const scored = tools
    .map((tool) => {
      const haystack = `${tool.name} ${tool.category} ${tool.description} ${tool.features.join(' ')}`.toLowerCase();
      const normalizedCategory = tool.category.toLowerCase();
      const categoryMatch = config.categories.some((category) => normalizedCategory.includes(category)) ? 8 : 0;
      const keywordScore = config.keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 2 : 0), 0);
      const score = categoryMatch + keywordScore + (haystack.includes(config.label) ? 1 : 0);
      return { tool, score, categoryMatch };
    })
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  const exactCategoryPicks = scored.filter((item) => item.categoryMatch > 0).map((item) => item.tool);
  const picks = scored.filter((item) => item.score > 0).map((item) => item.tool);
  const ordered = exactCategoryPicks.length >= 8 ? exactCategoryPicks : picks;
  return (ordered.length ? ordered : tools).slice(0, 12);
}

function bestIntro(bestSlug) {
  const config = topicConfigFromSlug(bestSlug);
  return `This guide is for readers comparing ${config.label} tools with a focus on originality, practical fit, and buying context. Instead of repeating vendor claims, we group each pick by likely audience, pricing signal, and the workflow it appears built to improve.`;
}

function renderBestPage(bestSlug, relativePath) {
  const canonicalPath = canonicalFromRelative(relativePath);
  const picks = pickBestTools(bestSlug);
  const intro = bestIntro(bestSlug);
  const body = `
    <section class="hero hero-left">
      <p class="eyebrow">Editorial best-of guide</p>
      <h1>${esc(titleCase(bestSlug.replace(/-/g, ' ')))}</h1>
      <p>${esc(intro)}</p>
      <div class="meta-pills">
        <span class="meta-pill">12 editorial picks</span>
        <span class="meta-pill">Updated: ${esc(EDITORIAL_UPDATED)}</span>
        <span class="meta-pill">Methodology-led roundup</span>
      </div>
    </section>

    ${editorialMethodHtml()}

    <section class="content-section">
      <div class="section-heading"><h2>Who this shortlist is for</h2></div>
      <div class="editorial-grid editorial-grid-3">
        <article class="editorial-card"><h3>Solo buyers</h3><p>People who need a practical first shortlist without reading dozens of near-duplicate landing pages.</p></article>
        <article class="editorial-card"><h3>Teams</h3><p>Operators comparing pricing signals, rollout complexity, and category depth before a group purchase.</p></article>
        <article class="editorial-card"><h3>Researchers</h3><p>Readers who want internal links into profiles, alternatives, and comparison pages before making a decision.</p></article>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Our picks</h2></div>
      <div class="editorial-grid editorial-grid-2">
        ${linkList(picks, (tool, index) => { const comparisonTarget = alternativesForTool(tool)[0] || picks[0]; const compareUrl = comparisonTarget ? existingCompareUrl(tool.slug, comparisonTarget.slug) : ''; const secondaryAction = compareUrl ? `<a class="btn btn-secondary btn-sm" href="${compareUrl}">Compare</a>` : `<a class="btn btn-secondary btn-sm" href="/tools/${esc(tool.slug)}">Review</a>`; return `<article class="tool-card ranking-card"><small>#${index + 1} · ${esc(categoryLabel(tool.category))}</small><h3><a href="/tools/${esc(tool.slug)}">${esc(tool.name)}</a></h3><p>${esc(tool.description)}</p><div class="bullet-inline"><span>${esc(primaryAudience(tool)[0])}</span><span>${esc(tool.pricing)}</span></div><p class="muted-note"><strong>Editorial verdict:</strong> ${esc(verdictForTool(tool))}</p><div class="card-actions">${secondaryAction}<a class="btn btn-sm" href="/alternatives/${esc(tool.slug)}">Alternatives</a></div></article>`; })}
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>How to choose between them</h2></div>
      <ul class="editorial-list">
        <li>Start with the workflow you want to improve, not the biggest brand name.</li>
        <li>Check whether pricing looks friendly to trialing or points to a heavier procurement process.</li>
        <li>Review at least one comparison page and one alternatives page before narrowing the shortlist.</li>
        <li>Favor tools whose feature themes clearly match the job-to-be-done your team repeats most.</li>
      </ul>
    </section>

    <section class="content-section">
      <div class="section-heading"><h2>Useful next clicks</h2></div>
      <div class="tool-grid">
        ${picks.slice(0, 6).map((tool) => `<a href="/tools/${esc(tool.slug)}">${esc(tool.name)} review</a>`).join('')}
      </div>
    </section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titleCase(bestSlug.replace(/-/g, ' ')),
    itemListElement: picks.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/tools/${tool.slug}`
    }))
  };

  return pageDocument({
    title: `${titleCase(bestSlug.replace(/-/g, ' '))}: editorial picks, use cases and verdicts`,
    description: `${titleCase(bestSlug.replace(/-/g, ' '))} with original editorial picks, who each option is for, and practical shortlist guidance.`,
    canonicalPath,
    schema,
    body
  });
}

function walkHtmlFiles(startDir) {
  if (!fs.existsSync(startDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(startDir, { withFileTypes: true })) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const compareSlugSet = new Set(walkHtmlFiles(path.join(PAGES_ROOT, 'compare')).map((filePath) => slugFromContentPath(filePath, path.join(PAGES_ROOT, 'compare'))));

function relativePathFromAbsolute(absolutePath) {
  return path.relative(ROOT, absolutePath).replace(/\\/g, '/');
}

function slugFromContentPath(absolutePath, contentRoot) {
  const relative = path.relative(contentRoot, absolutePath).replace(/\\/g, '/');
  return relative.endsWith('/index.html') ? relative.replace(/\/index\.html$/, '') : relative.replace(/\.html$/, '');
}

function upgradeTools() {
  let count = 0;
  for (const filePath of walkHtmlFiles(path.join(PAGES_ROOT, 'tools'))) {
    const slug = slugFromContentPath(filePath, path.join(PAGES_ROOT, 'tools'));
    const tool = toolMap.get(slug);
    if (!tool) continue;
    const relativePath = relativePathFromAbsolute(filePath);
    fs.writeFileSync(filePath, renderToolPage(tool, relativePath));
    count += 1;
  }
  return count;
}

function upgradeBest() {
  let count = 0;
  for (const filePath of walkHtmlFiles(path.join(PAGES_ROOT, 'best'))) {
    const bestSlug = slugFromContentPath(filePath, path.join(PAGES_ROOT, 'best'));
    const relativePath = relativePathFromAbsolute(filePath);
    fs.writeFileSync(filePath, renderBestPage(bestSlug, relativePath));
    count += 1;
  }
  return count;
}

function upgradeCompare() {
  let count = 0;
  for (const filePath of walkHtmlFiles(path.join(PAGES_ROOT, 'compare'))) {
    const compareSlug = slugFromContentPath(filePath, path.join(PAGES_ROOT, 'compare'));
    const [aSlug, bSlug] = compareSlug.split('-vs-');
    const a = toolMap.get(aSlug);
    const b = toolMap.get(bSlug);
    if (!a || !b) continue;
    const relativePath = relativePathFromAbsolute(filePath);
    fs.writeFileSync(filePath, renderComparePage(a, b, relativePath));
    count += 1;
  }
  return count;
}

const summary = {
  tools: upgradeTools(),
  best: upgradeBest(),
  compare: upgradeCompare()
};

console.log(`Upgraded editorial pages -> tools: ${summary.tools}, best: ${summary.best}, compare: ${summary.compare}`);
