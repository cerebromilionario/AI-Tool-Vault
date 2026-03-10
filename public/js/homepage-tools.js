const categoryToSlug = (category = '') => category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toolLink = (slug) => `/pages/alternatives/${slug}/index.html`;
const categoryLink = (slug) => `/category/${slug}.html`;

let allToolsData = [];

const createToolCard = (tool) => {
  const safeName = tool.name || 'AI Tool';
  const safeDescription = tool.description || 'No description available.';
  const safeCategory = tool.category || 'Uncategorized';
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  return `
    <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md" data-name="${safeName.toLowerCase()}" data-category="${categoryToSlug(safeCategory)}" data-description="${safeDescription.toLowerCase()}">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700" aria-hidden="true">${initials}</div>
        <span class="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">${safeCategory}</span>
      </div>
      <h3 class="mb-2 text-lg font-semibold text-slate-900">${safeName}</h3>
      <p class="mb-4 text-sm leading-6 text-slate-600">${safeDescription}</p>
      <a class="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="${toolLink(tool.slug)}">View alternatives page →</a>
    </article>
  `;
};

const createCategoryCard = (category) => `
  <a class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md" href="${categoryLink(category.slug)}">
    <h3 class="mb-2 text-base font-semibold text-slate-900">${category.name}</h3>
    <p class="text-sm text-slate-600">${category.description}</p>
  </a>
`;

const renderFilteredTools = () => {
  const allTarget = document.getElementById('allTools');
  const resultCount = document.getElementById('resultCount');
  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');

  if (!allTarget || !resultCount) return;

  const query = (search?.value || '').toLowerCase().trim();
  const category = filter?.value || '';

  const filtered = allToolsData.filter((tool) => {
    const normalizedCategory = categoryToSlug(tool.category || '');
    const haystack = `${(tool.name || '').toLowerCase()} ${(tool.description || '').toLowerCase()} ${normalizedCategory}`;
    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = !category || normalizedCategory === category;
    return matchesQuery && matchesCategory;
  });

  allTarget.innerHTML = filtered.slice(0, 24).map(createToolCard).join('');
  resultCount.textContent = `Showing ${Math.min(filtered.length, 24)} of ${filtered.length} matching tools (${allToolsData.length} total).`;
};

const renderTools = async () => {
  const trendingTarget = document.getElementById('trendingTools');
  const newTarget = document.getElementById('newTools');
  const allTarget = document.getElementById('allTools');
  const categoriesTarget = document.getElementById('popularCategories');
  const resultCount = document.getElementById('resultCount');

  if (!trendingTarget || !newTarget || !allTarget || !categoriesTarget) return;

  try {
    const [toolsResponse, categoriesResponse] = await Promise.all([
      fetch('/data/tools.json'),
      fetch('/data/categories.json')
    ]);
    const tools = await toolsResponse.json();
    const categories = await categoriesResponse.json();
    allToolsData = tools;

    const trendingTools = tools.slice(0, 6);
    const newTools = [...tools].reverse().slice(0, 6);

    trendingTarget.innerHTML = trendingTools.map(createToolCard).join('');
    newTarget.innerHTML = newTools.map(createToolCard).join('');
    categoriesTarget.innerHTML = categories.map(createCategoryCard).join('');

    renderFilteredTools();

    document.getElementById('search')?.addEventListener('input', renderFilteredTools);
    document.getElementById('categoryFilter')?.addEventListener('change', renderFilteredTools);
  } catch (error) {
    resultCount.textContent = 'Unable to load tools at the moment.';
  }
};

renderTools();
