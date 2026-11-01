export {};
type ThemePreference = 'light' | 'dark' | 'system';
const control = document.querySelector<HTMLSelectElement>('#theme-select');
const system = window.matchMedia('(prefers-color-scheme: dark)');
function preference(value: string | null | undefined): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
let selected = preference(document.documentElement.dataset.themePreference);
function applyTheme() {
  document.documentElement.dataset.themePreference = selected;
  document.documentElement.dataset.theme =
    selected === 'system' ? (system.matches ? 'dark' : 'light') : selected;
  if (control) control.value = selected;
}
control?.addEventListener('change', () => {
  selected = preference(control.value);
  applyTheme();
  try {
    localStorage.setItem('np-theme', selected);
  } catch {
    /* Theme still works without storage. */
  }
});
system.addEventListener('change', () => {
  if (selected === 'system') applyTheme();
});
window.addEventListener('storage', (event) => {
  if (event.key === 'np-theme' || event.key === null) {
    selected = preference(event.newValue);
    applyTheme();
  }
});
applyTheme();
document
  .querySelector<HTMLElement>('[data-theme-control]')
  ?.removeAttribute('hidden');
