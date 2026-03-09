(() => {
  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');
  const results = document.getElementById('resultCount');
  const cards = Array.from(document.querySelectorAll('[data-name]'));

  const normalize = (value = '') => value.toLowerCase().trim();
  const params = new URLSearchParams(window.location.search);

  if (search && params.get('q')) {
    search.value = params.get('q');
  }

  if (filter && params.get('category')) {
    filter.value = params.get('category');
  }

  cards.forEach(card => {
    const category = (card.dataset.category || '').replace(/-/g, ' ').trim();
    if (category && !card.querySelector('.category-badge')) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = category;
      card.appendChild(badge);
    }

    const toolLink = card.querySelector('h3 a');
    const altLink = card.querySelector('p:last-child a');
    if (toolLink && altLink && !card.querySelector('.card-actions')) {
      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const visit = document.createElement('a');
      visit.href = toolLink.href;
      visit.textContent = 'Visit Tool';

      actions.appendChild(visit);
      actions.appendChild(altLink.cloneNode(true));
      card.appendChild(actions);
      altLink.parentElement?.remove();
    }
  });

  const apply = () => {
    const q = normalize(search?.value || '');
    const c = filter?.value || '';
    let visible = 0;

    cards.forEach(card => {
      const searchable = [
        normalize(card.dataset.name),
        normalize(card.dataset.category),
        normalize(card.dataset.description),
        normalize(card.querySelector('h3')?.textContent || ''),
        normalize(card.textContent || '')
      ].join(' ');

      const okName = !q || searchable.includes(q);
      const okCategory = !c || card.dataset.category === c;
      const shouldShow = okName && okCategory;
      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        visible += 1;
      }
    });

    if (results) {
      results.textContent = `${visible} tool${visible === 1 ? '' : 's'} found`;
    }
  };

  search?.addEventListener('input', apply);
  filter?.addEventListener('change', apply);
  apply();
})();
