(() => {
  const search = document.getElementById('search');
  const filter = document.getElementById('categoryFilter');
  const cards = Array.from(document.querySelectorAll('[data-name]'));
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
