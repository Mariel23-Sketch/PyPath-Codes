/* PyPath Admin – shared shell (sidebar, top bar, mobile nav, drawer) and small UI helpers */
(function (PP) {
  const STUDENT = document.body.dataset.portal === 'student';
  const ROOT = document.body.dataset.root || '../';   /* path back to the project root */
  const IMG = ROOT + 'assets/img/';
  const ADMIN_NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', href: '../admin-dashboard/index.html' },
    { key: 'users', label: 'Manage Users', icon: 'users', href: '../student-management/index.html' },
    { key: 'learning', label: 'Learning Materials', icon: 'book', href: '../learning-materials/index.html#courses' },
    { key: 'activities', label: 'Activities', icon: 'quiz', href: '../activities/index.html' },
    { key: 'progress', label: 'Progress', icon: 'chart', href: '../admin-extras/index.html#progress' },
    { key: 'rewards', label: 'Points and Reward', icon: 'gift', href: '../admin-extras/index.html#points-reward' },
    { key: 'announcements', label: 'Announcements', icon: 'megaphone', href: '../admin-extras/index.html#announcements' }
    /* Settings is intentionally not in the sidebar; it stays reachable from the profile menu (top right). */
  ];
  const STUDENT_NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', soon: true },
    { key: 'learning', label: 'Learning Materials', icon: 'book', soon: true },
    { key: 'activities', label: 'Activities', icon: 'quiz', soon: true },
    { key: 'points', label: 'Points and Reward', icon: 'gift', href: ROOT + 'student/points-reward/index.html' },
    { key: 'profile', label: 'Profile', icon: 'user', soon: true },
    { key: 'logout', label: 'Logout', icon: 'logout', href: ROOT + 'index.html', logout: true }
  ];
  const STUDENT_BOTTOM = [
    { key: 'dashboard', label: 'Home', icon: 'home', soon: true },
    { key: 'learning', label: 'Learning', icon: 'book', soon: true },
    { key: 'activities', label: 'Activities', icon: 'quiz', soon: true },
    { key: 'points', label: 'Points', icon: 'gift', href: ROOT + 'student/points-reward/index.html' },
    { key: 'more', label: 'More', icon: 'menu', more: true }
  ];
  const NAV = STUDENT ? STUDENT_NAV : ADMIN_NAV;
  const ADMIN_BOTTOM = [
    { key: 'dashboard', label: 'Home', icon: 'home', href: '../admin-dashboard/index.html' },
    { key: 'learning', label: 'Learning', icon: 'book', href: '../learning-materials/index.html#courses' },
    { key: 'activities', label: 'Activities', icon: 'quiz', href: '../activities/index.html' },
    { key: 'announcements', label: 'Announcements', icon: 'megaphone', href: '../admin-extras/index.html#announcements' },
    { key: 'more', label: 'More', icon: 'menu', more: true }
  ];
  const BOTTOM = STUDENT ? STUDENT_BOTTOM : ADMIN_BOTTOM;
  const WHO = STUDENT ? { name: 'ranz', role: 'Student', sub: 'Student', portal: 'Student Portal', panel: 'Learning Portal', ph: 'Search lessons and activities...' }
                       : { name: 'Admin', role: 'Administrator', sub: 'ADM001 · Administrator', portal: 'Admin Portal', panel: 'Admin Panel', ph: 'Search anything...' };
  const NOTES_ADMIN = [
    { t: 'New user registered', s: 'jasmine123 joined PyPath', ago: '2 mins ago', unread: true },
    { t: 'New activity submitted', s: 'Operators Quiz', ago: '25 mins ago', unread: true },
    { t: 'Backup completed', s: 'All data saved safely', ago: '1 hour ago', unread: false }
  ];
  const NOTES_STUDENT = [
    { t: 'New badge unlocked', s: 'You earned the Quiz Master badge', ago: '1 day ago', unread: true },
    { t: 'Streak going strong', s: 'You are on a 7 day learning streak', ago: 'Today', unread: false }
  ];
  const NOTES = STUDENT ? NOTES_STUDENT : NOTES_ADMIN;

  let active = document.body.dataset.active || '';
  const $ = (s, r) => (r || document).querySelector(s);

  /* ---------- helpers ---------- */
  PP.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  PP.toast = function (msg, kind) {
    let host = $('#toasts');
    if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast-' + kind : '');
    t.innerHTML = PP.i(kind === 'error' ? 'x' : 'check') + '<span>' + PP.esc(msg) + '</span>';
    host.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 2600);
  };

  const PAL = [['#8ec5ff', '#5b9cf2'], ['#ffc9a8', '#f59a6b'], ['#c8b6ff', '#9a7cf0'], ['#9be3c6', '#4fbf97'], ['#ffc2dc', '#ef8ab5'], ['#ffe08a', '#f2b632']];
  PP.avatar = function (name, cls) {
    const ini = String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 997;
    const p = PAL[h % PAL.length];
    return '<span class="avatar ' + (cls || '') + '" style="background:linear-gradient(135deg,' + p[0] + ',' + p[1] + ')">' + PP.esc(ini) + '</span>';
  };
  PP.chip = (text, kind) => '<span class="chip chip-' + kind + '">' + PP.esc(text) + '</span>';
  PP.statusChip = (s) => PP.chip(s, { Published: 'green', Draft: 'orange', Active: 'green', Inactive: 'red', Easy: 'green', Medium: 'orange', Hard: 'red', Student: 'blue', Admin: 'purple', Correct: 'green', Incorrect: 'red', Passed: 'green', Failed: 'red' }[s] || 'blue');

  /* Confirm dialog -> Promise<boolean> */
  PP.confirm = function (o) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-backdrop open';
      wrap.dataset.dynamic = '1';
      wrap.innerHTML = '<div class="modal modal-sm" role="dialog" aria-modal="true"><div class="confirm-ico">' + PP.i('trash') + '</div><h3>' + PP.esc(o.title || 'Are you sure?') + '</h3><p>' + PP.esc(o.text || '') + '</p><div class="modal-foot center"><button class="btn btn-ghost" data-v="0">Cancel</button><button class="btn btn-danger-solid" data-v="1">' + PP.esc(o.confirm || 'Delete') + '</button></div></div>';
      document.body.appendChild(wrap);
      const done = (v) => { wrap.remove(); resolve(v); };
      wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) done(b.dataset.v === '1'); else if (e.target === wrap) done(false); });
    });
  };

  /* Modal open/close for static .modal-backdrop elements */
  PP.openModal = (id) => { const m = document.getElementById(id); if (m) { m.classList.add('open'); const f = m.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus(), 30); } };
  PP.closeModal = (id) => { const m = document.getElementById(id); if (m) m.classList.remove('open'); };
  document.addEventListener('click', (e) => {
    const bd = e.target.closest('.modal-backdrop');
    if (!bd || bd.dataset.dynamic) return;
    if (e.target === bd || e.target.closest('[data-close]')) bd.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-backdrop.open').forEach((m) => { if (m.dataset.dynamic) m.click(); else m.classList.remove('open'); });
    closeDrawer(); closeMenus();
  });

  /* Pagination widget */
  PP.pager = function (el, o) {
    const pages = Math.max(1, Math.ceil(o.total / o.per));
    if (o.page > pages) o.page = pages;
    let b = '<button class="pg" data-p="' + (o.page - 1) + '" ' + (o.page === 1 ? 'disabled' : '') + ' aria-label="Previous">' + PP.i('left') + '</button>';
    for (let i = 1; i <= pages; i++) b += '<button class="pg ' + (i === o.page ? 'on' : '') + '" data-p="' + i + '">' + i + '</button>';
    b += '<button class="pg" data-p="' + (o.page + 1) + '" ' + (o.page === pages ? 'disabled' : '') + ' aria-label="Next">' + PP.i('right') + '</button>';
    b += '<span class="per-wrap"><select class="per" aria-label="Rows per page">' + [5, 10, 20].map((n) => '<option value="' + n + '" ' + (n === o.per ? 'selected' : '') + '>' + n + ' per page</option>').join('') + '</select></span>';
    el.innerHTML = '<span class="pager-info">' + (o.total ? ((o.page - 1) * o.per + 1) + '–' + Math.min(o.page * o.per, o.total) + ' of ' + o.total : '0 results') + '</span><div class="pager-btns">' + b + '</div>';
    el.onclick = (e) => { const x = e.target.closest('.pg'); if (x && !x.disabled) o.onPage(+x.dataset.p); };
    el.onchange = (e) => { if (e.target.classList.contains('per')) o.onPer(+e.target.value); };
  };

  /* ---------- shell ---------- */
  function navHtml(list, cls) {
    return list.map((n) => '<a class="' + cls + (n.key === active ? ' active' : '') + '" data-key="' + n.key + '" ' + (n.soon ? 'href="#" data-soon="' + n.label + '"' : n.more ? 'href="#" data-more="1"' : 'href="' + n.href + '"' + (n.logout ? ' data-logout' : '')) + '>' + PP.i(n.icon) + '<span>' + n.label + '</span></a>').join('');
  }
  const sparkle = '<svg class="sp" viewBox="0 0 24 24"><path d="M12 1.500 14 9.500 22.500 12 14 14.500 12 22.500 10 14.500 1.500 12 10 9.500z" fill="currentColor"/></svg>';

  function build() {
    const sb = $('#sidebar');
    if (sb) sb.innerHTML =
      '<div class="brand"><img src="' + IMG + 'logo-icon.png" alt=""><div><b>PyPath</b><small>' + WHO.panel + '</small></div></div>' +
      '<nav class="nav" aria-label="Main">' + navHtml(NAV, 'nav-link') + '</nav>' +
      '<div class="side-foot"><div class="cloud"></div><img class="side-mascot" src="' + IMG + 'mascot-hands.png" alt="PyPath mascot"><p>Better Learning<br>for a Brighter Future</p><span class="star-y">' + sparkle + '</span></div>';

    const tb = $('#topbar');
    if (tb) tb.innerHTML =
      '<button class="icon-btn tb-mobile" id="menuBtn" aria-label="Open menu">' + PP.i('menu') + '</button>' +
      '<div class="tb-brand tb-mobile"><img src="' + IMG + 'logo-icon.png" alt=""><div><b>PyPath</b><small>' + WHO.portal + '</small></div></div>' +
      '<label class="searchbox tb-desktop">' + PP.i('search') + '<input id="globalSearch" type="search" placeholder="' + WHO.ph + '" autocomplete="off"></label>' +
      '<div class="tb-right">' +
        (STUDENT ? '<a class="pts-pill" id="ptsPill" href="' + ROOT + 'student/points-reward/index.html" aria-label="Your points balance"><span data-icon="star"></span><b id="ptsVal"></b></a>' : '') +
        '<button class="icon-btn" id="themeBtn" aria-label="Switch light or dark mode"></button>' +
        '<div class="menu-host"><button class="icon-btn bell" id="bellBtn" aria-label="Notifications">' + PP.i('bell') + '<i class="dot" id="bellDot"></i></button><div class="dropdown notif" id="notifMenu"></div></div>' +
        '<span class="tb-sep tb-desktop"></span>' +
        '<div class="menu-host"><button class="profile" id="profileBtn" aria-haspopup="true"><img class="avatar-img" src="' + IMG + (STUDENT ? 'logo-icon.png' : 'mascot-hands.png') + '" alt=""><span class="who tb-desktop"><b>' + WHO.name + '</b><small>' + WHO.role + '</small></span><span class="tb-desktop">' + PP.i('down') + '</span></button>' +
        '<div class="dropdown prof" id="profMenu">' + (STUDENT
          ? '<a href="#" data-soon="Profile">' + PP.i('user') + 'My Profile</a><a href="' + ROOT + 'index.html" data-logout>' + PP.i('logout') + 'Logout</a>'
          : '<a href="../admin-extras/index.html#profile">' + PP.i('user') + 'My Profile</a><a href="../admin-extras/index.html#profile">' + PP.i('gear') + 'Settings</a><a href="../admin-login/index.html" data-logout>' + PP.i('logout') + 'Logout</a>') + '</div></div>' +
      '</div>';

    const bn = $('#bottomnav');
    if (bn) bn.innerHTML = navHtml(BOTTOM, 'bn-link');

    const dr = $('#drawer');
    if (dr) dr.innerHTML =
      '<div class="drawer-scrim" data-dclose></div><aside class="drawer-panel" role="dialog" aria-label="Menu">' +
      '<div class="drawer-head"><div class="tb-brand"><img src="' + IMG + 'logo-icon.png" alt=""><div><b>PyPath</b><small>' + WHO.portal + '</small></div></div><button class="icon-btn" data-dclose aria-label="Close menu">' + PP.i('x') + '</button></div>' +
      '<div class="drawer-user"><img class="avatar-img lg" src="' + IMG + (STUDENT ? 'logo-icon.png' : 'mascot-hands.png') + '" alt=""><div><b>' + WHO.name + '</b><small>' + WHO.sub + '</small>' + (STUDENT ? '' : '<a class="mini-btn" href="../admin-extras/index.html#profile">' + PP.i('edit') + 'Edit Profile</a>') + '</div></div>' +
      '<nav class="drawer-nav">' + navHtml(STUDENT ? NAV.filter((n) => !n.logout) : NAV, 'dn-link') + '<hr><a class="dn-link" href="#" data-soon="Help & Support">' + PP.i('help') + '<span>Help &amp; Support</span></a><a class="dn-link logout" href="' + (STUDENT ? ROOT + 'index.html' : '../admin-login/index.html') + '" data-logout>' + PP.i('logout') + '<span>Logout</span></a></nav></aside>';

    renderNotes();
    themeIcon();
    PP.hydrate();
    pointsPill();
  }

  /* student top bar: live points balance */
  function pointsPill() {
    const v = $('#ptsVal'); if (!v || !PP.store) return;
    v.textContent = PP.store.balance().toLocaleString() + ' pts';
  }
  document.addEventListener('pp-points', pointsPill);

  function themeIcon() {
    const b = $('#themeBtn'); if (!b || !PP.theme) return;
    const dark = PP.theme.current() === 'dark';
    b.innerHTML = PP.i(dark ? 'sun' : 'moon');
    b.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  document.addEventListener('pp-theme', themeIcon);

  function renderNotes() {
    const un = NOTES.filter((n) => n.unread).length;
    const dot = $('#bellDot'); if (dot) dot.style.display = un ? 'block' : 'none';
    const m = $('#notifMenu');
    if (m) m.innerHTML = '<div class="dd-head"><b>Notifications</b><button class="link-btn" id="markRead">Mark all read</button></div>' +
      NOTES.map((n) => '<div class="note ' + (n.unread ? 'unread' : '') + '"><b>' + PP.esc(n.t) + '</b><small>' + PP.esc(n.s) + '</small><em>' + n.ago + '</em></div>').join('');
  }

  function closeMenus() { document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open')); }
  function openDrawer() { const d = $('#drawer'); if (d) { d.classList.add('open'); document.body.classList.add('no-scroll'); } }
  function closeDrawer() { const d = $('#drawer'); if (d) { d.classList.remove('open'); document.body.classList.remove('no-scroll'); } }

  PP.setActive = function (key) {
    active = key;
    document.querySelectorAll('[data-key]').forEach((a) => a.classList.toggle('active', a.dataset.key === key));
  };

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('#menuBtn')) { openDrawer(); return; }
    if (t.closest('#themeBtn')) { if (PP.theme) PP.theme.toggle(); return; }
    if (t.closest('[data-dclose]')) { closeDrawer(); return; }
    const more = t.closest('[data-more]'); if (more) { e.preventDefault(); openDrawer(); return; }
    const soon = t.closest('[data-soon]'); if (soon) { e.preventDefault(); closeDrawer(); closeMenus(); PP.toast(soon.dataset.soon + ' is not part of this build yet.'); return; }
    const lo = t.closest('[data-logout]'); if (lo) { try { sessionStorage.removeItem('pypath_admin'); } catch (x) {} return; }
    if (t.closest('#bellBtn')) { const m = $('#notifMenu'); const was = m.classList.contains('open'); closeMenus(); m.classList.toggle('open', !was); return; }
    if (t.closest('#profileBtn')) { const m = $('#profMenu'); const was = m.classList.contains('open'); closeMenus(); m.classList.toggle('open', !was); return; }
    if (t.closest('#markRead')) { NOTES.forEach((n) => (n.unread = false)); renderNotes(); PP.toast('All notifications marked as read'); return; }
    if (!t.closest('.dropdown')) closeMenus();
    const dn = t.closest('.dn-link[href], .nav-link[href], .bn-link[href]');
    if (dn && dn.getAttribute('href').indexOf('#') > 0) {
      /* same page hash navigation (learning materials) – let hashchange handle it, close drawer */
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'globalSearch' && e.target.value.trim()) {
      const q = e.target.value.trim();
      if (typeof PP.onGlobalSearch === 'function') PP.onGlobalSearch(q);
      else location.href = '../student-management/index.html?q=' + encodeURIComponent(q);
    }
  });

  build();
})(window.PP);
