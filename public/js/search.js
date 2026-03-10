(async () => {
  const searchInput = document.getElementById('searchInput');
  const toolsGrid = document.getElementById('tools-grid');

  if (!searchInput || !toolsGrid) {
    return;
  }

  const searchStatus = document.getElementById('searchStatus');
  const noResultsMessage = document.getElementById('noResultsMessage');

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const createToolCard = (tool) => `
    <a href="/tools/${escapeHtml(tool.slug)}.html" class="tool-card bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h3 class="text-xl font-semibold">${escapeHtml(tool.name)}</h3>
      <p class="text-gray-600">${escapeHtml(tool.description || 'No description available.')}</p>
      <p><small>${escapeHtml(tool.category || 'Uncategorized')}</small></p>
      <span class="text-blue-600 font-semibold">View tool</span>
    </a>
  `;

  let tools = [];

  try {
    const response = await fetch('/data/tools.json');
    if (!response.ok) {
      throw new Error(`Failed to load tools.json (${response.status})`);
    }
    tools = await response.json();
  } catch (error) {
    console.error('Search initialization failed:', error);
    if (searchStatus) {
      searchStatus.textContent = 'Search is temporarily unavailable.';
    }
    return;
  }

  const renderTools = (visibleTools, query = '') => {
    toolsGrid.innerHTML = visibleTools.map((tool) => createToolCard(tool)).join('');

    if (searchStatus) {
      searchStatus.textContent = query
        ? `Showing ${visibleTools.length} result${visibleTools.length === 1 ? '' : 's'} for “${query}”`
        : `Showing all ${tools.length} tools`;
    }

    if (noResultsMessage) {
      noResultsMessage.hidden = visibleTools.length > 0;
    }
  };

  const filterTools = () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      renderTools(tools);
      return;
    }

    const filtered = tools.filter((tool) => {
      const name = (tool.name || '').toLowerCase();
      const description = (tool.description || '').toLowerCase();
      const category = (tool.category || '').toLowerCase();
      return name.includes(query) || description.includes(query) || category.includes(query);
    });

    renderTools(filtered, searchInput.value.trim());
  };

  renderTools(tools);
  searchInput.addEventListener('input', filterTools);
})();
