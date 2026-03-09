(function () {
  const tools = window.AI_TOOLS || [];
  const categories = window.AI_CATEGORIES || [];

  const byId = (id) => document.getElementById(id);

  function setYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function setupDarkMode() {
    const root = document.documentElement;
    const key = 'ai-tools-hub-theme';
    const saved = localStorage.getItem(key);
    if (saved === 'dark') root.classList.add('dark');

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.classList.toggle('dark');
        localStorage.setItem(key, root.classList.contains('dark') ? 'dark' : 'light');
      });
    });
  }

  function toolCard(tool) {
    return `
      <article class="card fade-in-up rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 hover:-translate-y-1 hover:shadow-xl transition" data-category="${tool.category}" data-name="${tool.name.toLowerCase()}">
        <div class="flex items-center gap-3 mb-4">
          <img src="${tool.logo}" alt="${tool.name} logo" class="w-12 h-12 rounded-lg object-contain bg-neutral-50" loading="lazy" referrerpolicy="no-referrer" />
          <div>
            <h3 class="text-lg font-semibold">${tool.name}</h3>
            <p class="text-sm text-neutral-500">${tool.category}</p>
          </div>
        </div>
        <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-4">${tool.description}</p>
        <a href="/tools/${tool.slug}" class="inline-flex items-center text-sm font-medium text-amber-500 hover:text-amber-600">View details →</a>
      </article>
    `;
  }

  function renderTools(containerId, list) {
    const el = byId(containerId);
    if (!el) return;
    el.innerHTML = list.map(toolCard).join('');
  }

  function renderCategories(containerId) {
    const el = byId(containerId);
    if (!el) return;
    el.innerHTML = categories
      .map((category) => `<a href="/tools.html?category=${encodeURIComponent(category)}" class="chip">${category}</a>`)
      .join('');
  }

  function setupToolFilters() {
    const searchInput = byId('toolSearch');
    const categorySelect = byId('categoryFilter');
    const grid = byId('toolsGrid');
    if (!searchInput || !categorySelect || !grid) return;

    const params = new URLSearchParams(window.location.search);
    const currentCategory = params.get('category');
    if (currentCategory) categorySelect.value = currentCategory;

    function applyFilters() {
      const query = searchInput.value.toLowerCase().trim();
      const selectedCategory = categorySelect.value;

      Array.from(grid.children).forEach((card) => {
        const name = card.getAttribute('data-name') || '';
        const category = card.getAttribute('data-category') || '';

        const matchSearch = !query || name.includes(query);
        const matchCategory = !selectedCategory || category === selectedCategory;

        card.style.display = matchSearch && matchCategory ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    applyFilters();
  }

  function renderToolDetail() {
    const detailWrap = byId('toolDetail');
    if (!detailWrap) return;
    const querySlug = new URLSearchParams(window.location.search).get('tool') || '';
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const pathSlug = pathParts[0] === 'tools' ? (pathParts[1] || '').replace('.html', '') : '';
    const slug = querySlug || pathSlug;
    const tool = tools.find((item) => item.slug === slug) || tools[0];
    if (!tool) return;

    document.title = `${tool.name} Review, Features & Pricing | AI Tools Hub`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${tool.name} overview, features, pricing, and alternatives. Discover if this ${tool.category} platform is right for your workflow.`);
    }

    detailWrap.innerHTML = `
      <section class="rounded-3xl bg-white dark:bg-neutral-900 p-6 md:p-10 border border-neutral-200 dark:border-neutral-700 mb-10">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <img src="${tool.logo}" alt="${tool.name} logo" class="w-20 h-20 rounded-2xl object-contain bg-neutral-50" />
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-1">${tool.name}</h1>
            <p class="text-neutral-600 dark:text-neutral-300">${tool.description}</p>
            <span class="inline-block mt-3 chip">${tool.category}</span>
          </div>
        </div>
      </section>

      <section class="grid md:grid-cols-3 gap-8">
        <article class="md:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 bg-white dark:bg-neutral-900">
          <h2 class="text-xl font-semibold mb-4">Top Features</h2>
          <ul class="space-y-2 text-neutral-700 dark:text-neutral-300 list-disc pl-5">
            ${tool.features.map((feature) => `<li>${feature}</li>`).join('')}
          </ul>
        </article>
        <aside class="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 bg-white dark:bg-neutral-900">
          <h2 class="text-lg font-semibold mb-3">Pricing</h2>
          <p class="mb-6 text-neutral-700 dark:text-neutral-300">${tool.pricing}</p>
          <a href="${tool.website}" target="_blank" rel="noopener noreferrer" class="inline-flex w-full justify-center bg-amber-400 text-neutral-900 font-semibold px-4 py-3 rounded-xl hover:bg-amber-300 transition">Visit Official Website</a>
        </aside>
      </section>

      <section class="ad-slot mt-10">AdSense Slot (In-Content)</section>
    `;

    const related = tools.filter((item) => item.slug !== tool.slug).slice(0, 3);
    renderTools('relatedTools', related);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      applicationCategory: tool.category,
      operatingSystem: 'Web',
      description: tool.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      url: `https://aitoolshub.example/tools/${tool.slug}`
    };

    const schemaScript = byId('toolSchema');
    if (schemaScript) schemaScript.textContent = JSON.stringify(schema);
  }

  function setupNewsletter() {
    const form = byId('newsletterForm');
    const notice = byId('newsletterNotice');
    if (!form || !notice) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      notice.textContent = 'Thanks! You are subscribed to AI Tools Hub updates.';
      form.reset();
    });
  }

  function init() {
    setYear();
    setupDarkMode();
    renderCategories('categoryList');
    renderCategories('allCategories');
    renderTools('featuredTools', tools.slice(0, 6));
    renderTools('latestTools', [...tools].reverse().slice(0, 6));
    renderTools('toolsGrid', tools);

    const categoryFilter = byId('categoryFilter');
    if (categoryFilter) {
      categoryFilter.innerHTML = `<option value="">All categories</option>${categories
        .map((category) => `<option value="${category}">${category}</option>`)
        .join('')}`;
    }

    setupToolFilters();
    setupNewsletter();
    renderToolDetail();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
