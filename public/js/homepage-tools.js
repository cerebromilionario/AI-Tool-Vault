const categoryToSlug = (category = '') => category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toolLink = (slug = '') => `/pages/alternatives/${slug}.html`;
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
    <a class="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400" href="${toolLink(tool.slug)}" aria-label="View alternatives for ${safeName}" data-name="${safeName.toLowerCase()}" data-category="${categoryToSlug(safeCategory)}" data-description="${safeDescription.toLowerCase()}">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700" aria-hidden="true">${initials}</div>
        <span class="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">${safeCategory}</span>
      </div>
      <h3 class="mb-2 text-lg font-semibold text-slate-900">${safeName}</h3>
      <p class="mb-4 text-sm leading-6 text-slate-600">${safeDescription}</p>
      <span class="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">View alternatives page →</span>
    </a>
  `;
};

const createCategoryCard = (category) => `
  <a class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md" href="${categoryLink(category.slug)}">
    <h3 class="mb-2 text-base font-semibold text-slate-900">${category.name}</h3>
    <p class="text-sm text-slate-600">${category.description}</p>
  </a>
`;

const renderFilteredTools = () => {
  const allTarget = document.getElementById('tools-grid');
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

const setFallbackMessage = (message) => {
  const targets = ['trending-tools', 'new-tools', 'tools-grid', 'categories'];
  targets.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.innerHTML = `<p class="text-sm text-slate-500">${message}</p>`;
  });

  const resultCount = document.getElementById('resultCount');
  if (resultCount) resultCount.textContent = message;
};

const renderTools = async () => {
  const trendingTarget = document.getElementById('trending-tools');
  const newTarget = document.getElementById('new-tools');
  const allTarget = document.getElementById('tools-grid');
  const categoriesTarget = document.getElementById('categories');

  if (!trendingTarget || !newTarget || !allTarget || !categoriesTarget) return;

  try {
    const [toolsResponse, categoriesResponse] = await Promise.all([
      fetch('./data/tools.json'),
      fetch('./data/categories.json')
    ]);
    if (!toolsResponse.ok || !categoriesResponse.ok) {
      throw new Error('Failed to fetch homepage data.');
    }

    const tools = await toolsResponse.json();
    const categories = await categoriesResponse.json();

    if (!Array.isArray(tools) || !Array.isArray(categories)) {
      throw new Error('Invalid homepage data format.');
    }
    allToolsData = tools;

    const trendingTools = tools.slice(0, 6);
    const newTools = tools.slice(6, 12);

    trendingTarget.innerHTML = trendingTools.map(createToolCard).join('');
    newTarget.innerHTML = newTools.map(createToolCard).join('');
    categoriesTarget.innerHTML = categories.map(createCategoryCard).join('');

    renderFilteredTools();

    document.getElementById('search')?.addEventListener('input', renderFilteredTools);
    document.getElementById('categoryFilter')?.addEventListener('change', renderFilteredTools);
    document.getElementById('toolSearchForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      renderFilteredTools();
    });
  } catch (error) {
    console.error(error);
    setFallbackMessage('Unable to load homepage data right now. Please try again soon.');
  }
};

document.addEventListener("DOMContentLoaded", function() {
  renderTools();
});
