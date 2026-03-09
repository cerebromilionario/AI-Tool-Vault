(() => {
  const cards = Array.from(document.querySelectorAll('[data-name]'));
  if (!cards.length) return;

  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');

  const logoFallback = (name) => {
    const initials = (name || 'AI Tool')
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' rx='12' fill='#dbeafe'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='Arial, sans-serif' fill='#1e3a8a'>${initials}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  cards.forEach((card) => {
    const name = card.dataset.name || '';
    const category = (card.dataset.category || '').replace(/-/g, ' ').trim();
    const logo = card.querySelector('img');

    if (category && !card.querySelector('.category-badge')) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = category;
      card.appendChild(badge);
    }

    if (logo) {
      const fallback = logoFallback(name);
      logo.addEventListener('error', () => {
        logo.src = fallback;
        logo.classList.add('logo-fallback');
      }, { once: true });
    }
  });

  const setFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const c = params.get('category') || '';
    if (search && q) search.value = q;
    if (filter && c) filter.value = c;
  };

  const apply = () => {
    const q = (search?.value || '').toLowerCase().trim();
    const c = filter?.value || '';

    cards.forEach((card) => {
      const haystack = `${card.dataset.name || ''} ${card.dataset.description || ''}`.toLowerCase();
      const okName = !q || haystack.includes(q);
      const okCategory = !c || card.dataset.category === c;
      card.style.display = okName && okCategory ? '' : 'none';
    });
  };

  setFromUrl();
  apply();
  search?.addEventListener('input', apply);
  filter?.addEventListener('change', apply);
})();
