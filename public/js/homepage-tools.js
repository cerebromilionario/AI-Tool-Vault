const categoryToSlug = (category = '') => category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let categorySlugMap = {};

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
      <a class="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="/tools/${tool.slug}">View tool page →</a>
    </article>
  `;
};

const createCategoryCard = ([category, count]) => `
  <a class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md" href="/category/${categorySlugMap[category] || categoryToSlug(category)}">
    <h3 class="mb-2 text-base font-semibold text-slate-900">${category}</h3>
    <p class="text-sm text-slate-600">${count} tools</p>
  </a>
`;

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

    categorySlugMap = categories.reduce((acc, category) => {
      acc[category.name] = category.slug;
      return acc;
    }, {});

    const trendingTools = tools.slice(0, 6);
    const newTools = [...tools].reverse().slice(0, 6);
    const allTools = tools.slice(0, 12);

    const popularCategories = Object.entries(
      tools.reduce((acc, tool) => {
        acc[tool.category] = (acc[tool.category] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    trendingTarget.innerHTML = trendingTools.map(createToolCard).join('');
    newTarget.innerHTML = newTools.map(createToolCard).join('');
    allTarget.innerHTML = allTools.map(createToolCard).join('');
    categoriesTarget.innerHTML = popularCategories.map(createCategoryCard).join('');
    resultCount.textContent = `Showing ${allTools.length} of ${tools.length} tools from tools.json.`;
  } catch (error) {
    resultCount.textContent = 'Unable to load tools at the moment.';
  }
};

renderTools();
