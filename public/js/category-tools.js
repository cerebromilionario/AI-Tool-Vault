(() => {
  const slug = document.body.dataset.categorySlug;
  const name = document.body.dataset.categoryName || slug;
  const description = document.body.dataset.categoryDescription || '';
  const title = document.getElementById('categoryTitle');
  const descriptionEl = document.getElementById('categoryDescription');
  const grid = document.getElementById('categoryTools');
  const count = document.getElementById('toolCount');

  if (!slug || !grid) return;

  const toSlug = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (title) title.textContent = name;
  if (descriptionEl) descriptionEl.textContent = description;

  fetch('/data/tools.json')
    .then((response) => response.json())
    .then((tools) => {
      const matchingTools = tools.filter((tool) => toSlug(tool.category || '') === slug);
      if (count) count.textContent = `${matchingTools.length} tools in this category`;

      grid.innerHTML = matchingTools.map((tool) => `
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">${tool.category}</p>
          <h2 class="mb-2 text-lg font-semibold text-slate-900">${tool.name}</h2>
          <p class="mb-4 text-sm text-slate-600">${tool.description || 'No description available.'}</p>
          <a class="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="/pages/alternatives/${tool.slug}/index.html">View alternatives page →</a>
        </article>
      `).join('');
    })
    .catch(() => {
      if (count) count.textContent = 'Unable to load category tools right now.';
    });
})();
