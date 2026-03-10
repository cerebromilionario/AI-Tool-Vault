(() => {
  if (document.getElementById('trendingTools') && document.getElementById('newTools')) return;

  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');
  const results = document.getElementById('resultCount');
  const cards = Array.from(document.querySelectorAll('[data-name]'));

  if (!cards.length || (!search && !filter)) return;

  const normalize = (value = '') => value.toLowerCase().trim();
  const params = new URLSearchParams(window.location.search);

  if (search && params.get('q')) search.value = params.get('q');
  if (filter && params.get('category')) filter.value = params.get('category');

  const apply = () => {
    const q = normalize(search?.value || '');
    const c = filter?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const searchable = `${normalize(card.dataset.name)} ${normalize(card.dataset.category)} ${normalize(card.dataset.description)} ${normalize(card.textContent)}`;
      const okQuery = !q || searchable.includes(q);
      const okCategory = !c || card.dataset.category === c;
      const show = okQuery && okCategory;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    if (results) results.textContent = `${visible} tool${visible === 1 ? '' : 's'} found`;
  };

  search?.addEventListener('input', apply);
  filter?.addEventListener('change', apply);
  apply();
})();
