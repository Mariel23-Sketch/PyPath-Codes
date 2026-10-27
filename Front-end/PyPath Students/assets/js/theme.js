/* PyPath Admin – light / dark theme (loaded in <head> so the page never flashes the wrong theme)
   Saved choice: localStorage 'pp-theme' = 'Light' | 'Dark' | 'System' (default System) */
window.PP = window.PP || {};
(function (PP) {
  const KEY = 'pp-theme';
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function saved() { try { return localStorage.getItem(KEY) || 'System'; } catch (e) { return 'System'; } }
  function resolve(mode) { return mode === 'Dark' || (mode === 'System' && mq && mq.matches) ? 'dark' : 'light'; }
  function apply(mode) {
    const t = resolve(mode);
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
    document.dispatchEvent(new CustomEvent('pp-theme', { detail: { mode: mode, theme: t } }));
  }
  PP.theme = {
    get: saved,
    current: () => resolve(saved()),
    set: function (mode) { try { localStorage.setItem(KEY, mode); } catch (e) {} apply(mode); },
    toggle: function () { this.set(this.current() === 'dark' ? 'Light' : 'Dark'); }
  };
  apply(saved());
  if (mq) {
    const onSys = () => { if (saved() === 'System') apply('System'); };
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  /* keep other open tabs in sync */
  window.addEventListener('storage', (e) => { if (e.key === KEY) apply(saved()); });
})(window.PP);
