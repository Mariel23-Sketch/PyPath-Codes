/* Light / dark theme. Saved choice: localStorage 'pp-theme' = 'Light' | 'Dark' | 'System' (default System).
   Shared by the student and admin portals, same as the old theme.js. Applied once at import
   time (main.jsx imports this first) so the page never flashes the wrong theme. */
const KEY = 'pp-theme';
const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const listeners = new Set();

function saved() {
  try { return localStorage.getItem(KEY) || 'System'; } catch { return 'System'; }
}
function resolve(mode) {
  return mode === 'Dark' || (mode === 'System' && mq && mq.matches) ? 'dark' : 'light';
}
function apply(mode) {
  const t = resolve(mode);
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
  listeners.forEach((fn) => fn());
}

export const theme = {
  get: saved,
  current: () => resolve(saved()),
  set(mode) {
    try { localStorage.setItem(KEY, mode); } catch { /* storage blocked */ }
    apply(mode);
  },
  toggle() { this.set(this.current() === 'dark' ? 'Light' : 'Dark'); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

apply(saved());
if (mq) {
  const onSys = () => { if (saved() === 'System') apply('System'); };
  if (mq.addEventListener) mq.addEventListener('change', onSys);
}
/* keep other open tabs in sync */
window.addEventListener('storage', (e) => { if (e.key === KEY) apply(saved()); });
