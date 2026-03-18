(async () => {
  const searchInput = document.getElementById('searchInput');
  const toolsGrid = document.getElementById('tools-grid');
  const categoryFilter = document.getElementById('categoryFilter');

  if (!searchInput || !toolsGrid) return;

  const searchStatus = document.getElementById('searchStatus');
  const noResultsMessage = document.getElementById('noResultsMessage');
  const highIntentLinks = document.getElementById('highIntentLinks');
  let filterButtons = [];
  let activeCategory = 'All';

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const slugify = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const logoUrl = (name = '') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=e5e7eb&size=96&rounded=true`;
  const formatNumber = (value = 0) => new Intl.NumberFormat('en-US').format(value);

  const createToolCard = (tool) => `
    <a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card" data-category="${escapeHtml(tool.category || '')}">
      <img class="tool-card-logo" src="${logoUrl(tool.name)}" alt="${escapeHtml(tool.name)} logo" loading="lazy">
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.description || 'No description available.')}</p>
      <p><small>${escapeHtml(tool.category || 'Uncategorized')}</small></p>
      <span class="view-link">View Tool →</span>
    </a>
  `;

  let tools = [];
  try {
    const response = await fetch('/data/tools.json');
    if (!response.ok) throw new Error(`Failed to load tools.json (${response.status})`);
    tools = await response.json();
  } catch (error) {
    console.error('Search initialization failed:', error);
    if (searchStatus) searchStatus.textContent = 'Search is temporarily unavailable.';
    return;
  }

  const categoryCounts = tools.reduce((counts, tool) => {
    const category = (tool.category || 'Uncategorized').trim();
    counts.set(category, (counts.get(category) || 0) + 1);
    return counts;
  }, new Map());

  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  document.querySelectorAll('[data-tool-count]').forEach((element) => {
    element.textContent = formatNumber(tools.length);
  });

  document.querySelectorAll('[data-category-count]').forEach((element) => {
    element.textContent = formatNumber(sortedCategories.length);
  });

  const renderFilterButtons = () => {
    if (!categoryFilter) return;

    const topCategories = sortedCategories.slice(0, 10);
    categoryFilter.innerHTML = [
      '<button class="filter-btn active" data-category="All">All</button>',
      ...topCategories.map(([category, count]) => (
        `<button class="filter-btn" data-category="${escapeHtml(category)}">${escapeHtml(category)} (${count})</button>`
      ))
    ].join('');

    filterButtons = Array.from(categoryFilter.querySelectorAll('.filter-btn'));
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        activeCategory = button.dataset.category || 'All';
        filterTools();
      });
    });
  };

  const renderHighIntentLinks = () => {
    if (!highIntentLinks) return;

    highIntentLinks.innerHTML = sortedCategories.slice(0, 6).map(([category, count]) => `
      <a href="/categories/${slugify(category)}.html">
        <strong>${escapeHtml(category)}</strong>
        <span>${formatNumber(count)} tools</span>
      </a>
    `).join('');
  };

  const inActiveCategory = (tool) => {
    if (activeCategory === 'All') return true;
    return (tool.category || '').trim().toLowerCase() === activeCategory.toLowerCase();
  };

  const renderTools = (visibleTools, query = '') => {
    toolsGrid.innerHTML = visibleTools.map((tool) => createToolCard(tool)).join('');
    if (searchStatus) {
      if (query) {
        const categoryText = activeCategory === 'All' ? '' : ` in ${activeCategory}`;
        searchStatus.textContent = `Showing ${visibleTools.length} result${visibleTools.length === 1 ? '' : 's'} for “${query}”${categoryText}`;
      } else if (activeCategory === 'All') {
        searchStatus.textContent = `Showing ${visibleTools.length} tools across ${sortedCategories.length} categories.`;
      } else {
        searchStatus.textContent = `Showing ${visibleTools.length} tool${visibleTools.length === 1 ? '' : 's'} in ${activeCategory}.`;
      }
    }
    if (noResultsMessage) noResultsMessage.hidden = visibleTools.length > 0;
  };

  const filterTools = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = tools.filter((tool) => {
      if (!inActiveCategory(tool)) return false;
      if (!query) return true;
      const name = (tool.name || '').toLowerCase();
      const description = (tool.description || '').toLowerCase();
      const category = (tool.category || '').toLowerCase();
      return name.includes(query) || description.includes(query) || category.includes(query);
    });

    renderTools(filtered, searchInput.value.trim());
  };

  renderFilterButtons();
  renderHighIntentLinks();
  renderTools(tools);
  searchInput.addEventListener('input', filterTools);
})();
