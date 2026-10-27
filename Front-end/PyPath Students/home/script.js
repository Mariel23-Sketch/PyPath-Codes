/* PyPath Student – Home page
   Everything here is filled from PP.DATA and PP.store (main-ui/script.js),
   so finishing a lesson or a quiz on another page updates these numbers. */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, esc = PP.esc;
  PP.hydrate();

  function render() {
    const S = PP.store.get();

    /* ---------- Welcome ---------- */
    $('hello').textContent = S.name.split(' ')[0];
    const nx = PP.nextLecture();
    $('continueBtn').href = nx ? '../learning-materials/index.html#lecture/' + nx.id : '../learning-materials/index.html';
    $('continueSub').textContent = nx ? 'Keep going! Next up: ' + nx.title + '.' : 'Amazing! You finished every open lesson.';

    /* ---------- Stats ---------- */
    const openL = D.lectures.filter((l) => PP.find.module(l.moduleId).open);
    const doneL = openL.filter((l) => S.done.includes(l.id)).length;
    const actsTotal = D.quizzes.length + D.exercises.length;
    const actsDone = Object.keys(S.quiz).length + Object.keys(S.ex).length;
    const stats = [
      { label: 'Total Points', val: S.points, unit: 'pts', icon: 'star', tone: 't-yellow', href: '../rewards/index.html', sub: 'Redeem rewards' },
      { label: 'Lessons Done', val: doneL, unit: '/ ' + openL.length, icon: 'book', tone: 't-blue', href: '../learning-materials/index.html', sub: 'Learning Materials' },
      { label: 'Activities Done', val: actsDone, unit: '/ ' + actsTotal, icon: 'quiz', tone: 't-purple', href: '../activities/index.html', sub: 'Quizzes & exercises' },
      { label: 'Day Streak', val: S.streak, unit: 'days', icon: 'flame', tone: 't-orange', href: '../rewards/index.html#earn', sub: '+' + D.rules.streak + ' pts each day' }
    ];
    $('stats').innerHTML = stats.map((s, i) =>
      '<a class="card stat" href="' + s.href + '"><span class="tile ' + s.tone + '">' + PP.i(s.icon) + '</span>' +
      '<small>' + s.label + '</small><b><em id="stat' + i + '" style="font-style:normal">0</em><span>' + s.unit + '</span></b><span class="vs">' + s.sub + '</span></a>').join('');
    stats.forEach((s, i) => {
      const el = $('stat' + i); let n = 0; const step = Math.max(1, Math.ceil(s.val / 30));
      const iv = setInterval(() => { n = Math.min(s.val, n + step); el.textContent = n.toLocaleString('en-US'); if (n >= s.val) clearInterval(iv); }, 24);
    });

    /* ---------- Progress donut ---------- */
    const inProg = openL.filter((l) => !S.done.includes(l.id) && PP.moduleStatus(PP.find.module(l.moduleId)) === 'In progress').length;
    const total = openL.length || 1;
    const pDone = Math.round((doneL / total) * 100), pProg = Math.round((inProg / total) * 100), pNot = Math.max(0, 100 - pDone - pProg);
    $('donutPct').textContent = pDone + '%';
    $('legend').innerHTML =
      '<li><i style="background:#2f9e86"></i>Completed<b>' + pDone + '%</b></li>' +
      '<li><i style="background:#4a90e8"></i>In Progress<b>' + pProg + '%</b></li>' +
      '<li><i style="background:#cfe2fb"></i>Not Started<b>' + pNot + '%</b></li>';
    const C = 2 * Math.PI * 72;
    setTimeout(() => {
      $('ring').setAttribute('stroke-dasharray', (C * pDone / 100).toFixed(1) + ' ' + C.toFixed(1));
      $('ring2').setAttribute('stroke-dasharray', (C * (pDone + pProg) / 100).toFixed(1) + ' ' + C.toFixed(1));
    }, 150);

    /* ---------- Recent activity (points history) ---------- */
    $('activity').innerHTML = S.history.slice(0, 4).map((h) => {
      const plus = h.pts >= 0;
      const icon = /quiz/i.test(h.what) ? ['quiz', 't-purple'] : /lesson/i.test(h.what) ? ['book', 't-blue'] : /exercise/i.test(h.what) ? ['code', 't-green'] : !plus ? ['gift', 't-orange'] : ['flame', 't-yellow'];
      return '<li><span class="ai ' + icon[1] + '">' + PP.i(icon[0]) + '</span><div><b>' + esc(h.what) + '</b><small class="' + (plus ? 'plus' : 'minus') + '">' + (plus ? '+ ' : '− ') + Math.abs(h.pts) + ' pts</small></div><time>' + esc(h.date) + '</time></li>';
    }).join('') || '<li class="empty">No activity yet.</li>';

    /* ---------- My courses ---------- */
    const colors = { 'c-blue': 't-blue', 'c-green': 't-green', 'c-orange': 't-orange' };
    $('myCourses').innerHTML = D.courses.map((c) => {
      const p = PP.courseProgress(c.id);
      return '<li><a href="../learning-materials/index.html#course/' + c.id + '"><span class="tile ' + colors[c.tone] + '">' + (c.icon === 'python' ? PP.img('logo-icon.png', '', 'Logo') : PP.i(c.icon)) + '</span>' +
        '<div><div class="tc-top"><b>' + esc(c.title) + '</b><span>' + p.pct + '%</span></div><small>' + p.done + ' of ' + p.total + ' lessons · ' + c.level + '</small>' +
        '<div class="bar' + (p.pct === 100 ? ' green' : '') + '"><i data-w="' + p.pct + '"></i></div></div></a></li>';
    }).join('');
    setTimeout(() => document.querySelectorAll('#myCourses .bar i').forEach((b) => (b.style.width = b.dataset.w + '%')), 150);

    /* ---------- Upcoming activities (not done yet) ---------- */
    const up = D.quizzes.filter((q) => !S.quiz[q.id]).map((q) => ({ t: q.title, href: '../activities/index.html#quiz/' + q.id, due: q.due, icon: 'quiz', tone: 't-purple', chip: q.diff }))
      .concat(D.exercises.filter((x) => !S.ex[x.id]).map((x) => ({ t: x.title, href: '../activities/index.html#exercise/' + x.id, due: x.due, icon: 'code', tone: 't-green', chip: x.diff })))
      .sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 4);
    $('upcoming').innerHTML = up.length ? up.map((u) =>
      '<li><a href="' + u.href + '"><span class="tile ' + u.tone + '">' + PP.i(u.icon) + '</span><div class="up-main"><b>' + esc(u.t) + '</b><small>Due: ' + u.due + '</small></div>' + PP.statusChip(u.chip) + '</a></li>').join('')
      : '<li class="empty">You are all caught up!</li>';

    /* ---------- Announcements ---------- */
    $('latestNews').innerHTML = D.announcements.slice(0, 2).map((a) =>
      '<a class="news" href="../announcements/index.html#' + a.id + '"><b><span>' + esc(a.title) + '</span>' + (S.read.includes(a.id) ? '' : PP.chip('New', 'blue')) + '</b><small>' + a.date + '</small></a>').join('');

    PP.hydrate();
  }

  /* ---------- Points chart (same drawing code as the admin "User Growth" chart) ---------- */
  const sets = {
    '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [15, 40, 20, 65, 35, 80, 55] },
    '30D': { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'], data: [60, 110, 95, 150, 185] }
  };
  let range = '7D', pts = [], hover = null;
  const cv = $('pointsChart'), ctx = cv.getContext('2d');

  function draw() {
    const box = cv.parentElement, dpr = window.devicePixelRatio || 1;
    const w = box.clientWidth, h = box.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const { labels, data } = sets[range];
    const pad = { l: 40, r: 16, t: 14, b: 30 };
    const max = Math.ceil((Math.max.apply(null, data) * 1.2) / 20) * 20;
    const X = (i) => pad.l + 12 + (i * (w - pad.l - pad.r - 24)) / (data.length - 1);
    const Y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    ctx.font = '11.5px "Plus Jakarta Sans", sans-serif';
    const dark = document.documentElement.dataset.theme === 'dark';
    const C = dark ? { grid: '#24395f', grid2: '#1c2f52', txt: '#8ea3c6', dotRing: '#13223f', tipBg: '#e6eefc', tipTx: '#0b1630' } : { grid: '#e4edf9', grid2: '#eef3fb', txt: '#7589a9', dotRing: '#fff', tipBg: '#16294f', tipTx: '#fff' };
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.txt;
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
      const v = Math.round(max * f), y = Math.round(Y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(v, pad.l - 8, y + 4);
    });
    pts = data.map((v, i) => ({ x: X(i), y: Y(v), v, l: labels[i] }));
    pts.forEach((p) => { ctx.strokeStyle = C.grid2; ctx.beginPath(); ctx.moveTo(Math.round(p.x) + 0.5, pad.t); ctx.lineTo(Math.round(p.x) + 0.5, h - pad.b); ctx.stroke(); });
    ctx.fillStyle = C.txt; ctx.textAlign = 'center';
    pts.forEach((p) => ctx.fillText(p.l, p.x, h - 8));
    const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    g.addColorStop(0, 'rgba(74,144,232,.32)'); g.addColorStop(1, 'rgba(74,144,232,.03)');
    ctx.beginPath(); ctx.moveTo(pts[0].x, h - pad.b); pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - pad.b); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2; ctx.bezierCurveTo(cx, a.y, cx, b.y, b.x, b.y); }
    ctx.strokeStyle = '#4a90e8'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
    pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(p.x, p.y, i === hover ? 6.5 : 4.5, 0, Math.PI * 2); ctx.fillStyle = '#4a90e8'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.dotRing; ctx.stroke(); });
    if (hover != null) {
      const p = pts[hover], t = p.l + ' · ' + p.v + ' pts';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(t).width + 18, tx = Math.min(Math.max(p.x - tw / 2, 2), w - tw - 2), ty = Math.max(p.y - 40, 2);
      ctx.fillStyle = C.tipBg; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tx, ty, tw, 26, 9); else ctx.rect(tx, ty, tw, 26);
      ctx.fill();
      ctx.fillStyle = C.tipTx; ctx.textAlign = 'left'; ctx.fillText(t, tx + 9, ty + 17);
    }
  }
  function nearest(clientX) {
    const r = cv.getBoundingClientRect(), mx = clientX - r.left; let b = 0;
    pts.forEach((p, i) => { if (Math.abs(p.x - mx) < Math.abs(pts[b].x - mx)) b = i; });
    return b;
  }
  cv.addEventListener('mousemove', (e) => { hover = nearest(e.clientX); draw(); });
  cv.addEventListener('touchstart', (e) => { hover = nearest(e.touches[0].clientX); draw(); }, { passive: true });
  cv.addEventListener('mouseleave', () => { hover = null; draw(); });
  $('rangeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    range = b.dataset.r; hover = null;
    document.querySelectorAll('#rangeSeg button').forEach((x) => x.classList.toggle('on', x === b));
    draw();
  });
  window.addEventListener('resize', draw);
  document.addEventListener('pp-theme', draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

  render();
  draw();
})();
