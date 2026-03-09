(() => {
  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');
  const cards = Array.from(document.querySelectorAll('[data-name]'));

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
    const q = (search?.value || '').toLowerCase();
    const c = filter?.value || '';
    cards.forEach(card => {
      const okName = card.dataset.name.includes(q);
      const okCategory = !c || card.dataset.category === c;
      card.style.display = okName && okCategory ? '' : 'none';
    });
  };

  search?.addEventListener('input', apply);
  filter?.addEventListener('change', apply);
})();
