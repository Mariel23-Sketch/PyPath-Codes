/* PyPath Student – Announcements
   Cards come from PP.DATA.announcements (main-ui/script.js).
   "Read more" opens the full message and marks it as read.
   Opening announcements/index.html#3 opens announcement 3 right away. */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, esc = PP.esc;
  const S = () => PP.store.get();
  const st = { q: '', f: '', page: 1, per: 4 };
  PP.hydrate();

  function render() {
    const s = S(), q = st.q.toLowerCase();
    const list = D.announcements.filter((a) => (!q || (a.title + ' ' + a.msg).toLowerCase().includes(q)) &&
      (!st.f || (st.f === 'read') === s.read.includes(a.id)));
    const pages = Math.max(1, Math.ceil(list.length / st.per));
    if (st.page > pages) st.page = pages;
    const start = (st.page - 1) * st.per;
    $('list').innerHTML = list.length ? list.slice(start, start + st.per).map((a) => {
      const unread = !s.read.includes(a.id);
      return '<article class="a-card' + (unread ? ' unread' : '') + '">' + (unread ? '<span class="a-new">' + PP.chip('New', 'blue') + '</span>' : '') +
        '<div class="a-ico a-' + a.tone + '">' + PP.i(a.icon) + '</div>' +
        '<div class="a-body"><h3>' + esc(a.title) + '</h3><p>' + esc(a.msg) + '</p>' +
        '<div class="a-foot"><span>' + PP.i('calendar') + esc(a.date) + '</span><button class="a-more" data-id="' + a.id + '">Read more ' + PP.i('arrowright') + '</button></div></div></article>';
    }).join('') : '<div class="empty">' + PP.img('mascot-sad.png', '', 'Mascot') + 'No announcements found.</div>';
    PP.pager($('pager'), { total: list.length, page: st.page, per: st.per, onPage: (p) => { st.page = p; render(); } });
    $('markAll').disabled = D.announcements.every((a) => s.read.includes(a.id));
  }

  function openAnn(id) {
    const a = D.announcements.find((x) => x.id === +id); if (!a) return;
    const s = S();
    if (!s.read.includes(a.id)) { s.read.push(a.id); PP.store.save(); render(); }
    PP.modal(a.title, '<div class="modal-date">' + PP.i('calendar') + esc(a.date) + '</div><p>' + esc(a.msg) + '</p>', 'Got it');
  }

  $('list').addEventListener('click', (e) => { const b = e.target.closest('.a-more'); if (b) openAnn(b.dataset.id); });
  $('search').addEventListener('input', (e) => { st.q = e.target.value.trim(); st.page = 1; render(); });
  $('readFilter').addEventListener('click', (e) => {
    const b = e.target.closest('.pill'); if (!b) return;
    st.f = b.dataset.f; st.page = 1;
    document.querySelectorAll('#readFilter .pill').forEach((p) => p.classList.toggle('on', p === b));
    render();
  });
  $('markAll').addEventListener('click', () => {
    const s = S(); s.read = D.announcements.map((a) => a.id); PP.store.save();
    PP.toast('All announcements marked as read'); render();
  });
  PP.onGlobalSearch = (q) => { st.q = q; $('search').value = q; st.page = 1; render(); };

  render();
  if (/^#\d+$/.test(location.hash)) openAnn(location.hash.slice(1));
})();
