export {};
for (const root of document.querySelectorAll<HTMLElement>('[data-post-list]')) {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]')!;
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const cards = root.querySelectorAll<HTMLElement>('[data-post-card]');
  const empty = root.querySelector<HTMLElement>('[data-no-results]')!;
  const status = root.querySelector<HTMLElement>('[data-search-status]')!;
  let tag = '';
  function refresh() {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const tags: string[] = JSON.parse(card.dataset.tags || '[]');
      const matches =
        (!tag || tags.includes(tag)) &&
        (card.dataset.search || '').includes(query);
      card.hidden = !matches;
      if (matches) count++;
    });
    empty.hidden = count > 0;
    status.textContent = `${count} ${count === 1 ? 'post' : 'posts'} found`;
    buttons.forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.filter === tag),
      ),
    );
  }
  input.addEventListener('input', refresh);
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      tag = button.dataset.filter || '';
      refresh();
    }),
  );
  root.querySelector<HTMLElement>('[data-filter-controls]')!.hidden = false;
}
