(async () => {
  const searchInput = document.getElementById('searchInput');
  const toolsGrid = document.getElementById('tools-grid');

  if (!searchInput || !toolsGrid) return;

  const searchStatus = document.getElementById('searchStatus');
  const noResultsMessage = document.getElementById('noResultsMessage');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  let activeCategory = 'All';

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const logoUrl = (name = '') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=e5e7eb&size=96&rounded=true`;
  const categoryMap = {
    Writing: ['ai writing'],
    Image: ['image generation'],
    Video: ['video creation'],
    Chatbot: ['ai writing', 'chatbot'],
    Productivity: ['productivity'],
    Code: ['coding'],
    Marketing: ['marketing']
  };

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

  const inActiveCategory = (tool) => {
    if (activeCategory === 'All') return true;
    const category = (tool.category || '').toLowerCase();
    return (categoryMap[activeCategory] || [activeCategory.toLowerCase()]).some((entry) => category.includes(entry));
  };

  const renderTools = (visibleTools, query = '') => {
    toolsGrid.innerHTML = visibleTools.map((tool) => createToolCard(tool)).join('');
    if (searchStatus) {
      const categoryText = activeCategory === 'All' ? '' : ` in ${activeCategory}`;
      searchStatus.textContent = query
        ? `Showing ${visibleTools.length} result${visibleTools.length === 1 ? '' : 's'} for “${query}”${categoryText}`
        : `Showing ${visibleTools.length} tool${visibleTools.length === 1 ? '' : 's'}${categoryText}`;
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

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      activeCategory = button.dataset.category || 'All';
      filterTools();
    });
  });

  renderTools(tools);
  searchInput.addEventListener('input', filterTools);
})();
