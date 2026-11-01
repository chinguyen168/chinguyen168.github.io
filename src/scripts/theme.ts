export {};
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme]');
function syncTheme() {
  const theme =
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  buttons.forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.theme === theme)),
  );
}
buttons.forEach((button) =>
  button.addEventListener('click', () => {
    const theme = button.dataset.theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('np-theme', theme);
    } catch {
      /* Theme still works without storage. */
    }
    syncTheme();
  }),
);
syncTheme();
