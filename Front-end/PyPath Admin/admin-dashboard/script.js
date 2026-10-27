(function () {
  const $ = (id) => document.getElementById(id);
  PP.hydrate();

  /* ---------- Stat cards ---------- */
  const stats = [
    { label: 'Total Users', val: 1250, delta: '12%', icon: 'users', tone: 't-blue', href: '../student-management/index.html' },
    { label: 'Total Courses', val: 12, delta: '8%', icon: 'book', tone: 't-green', href: '../learning-materials/index.html#courses' },
    { label: 'Total Activities', val: 48, delta: '15%', icon: 'quiz', tone: 't-purple', href: '../activities/index.html' },
    { label: 'Course Completions', val: 892, delta: '20%', icon: 'star', tone: 't-yellow', href: '../student-management/index.html' }
  ];
  $('stats').innerHTML = stats.map((s, i) =>
    '<a class="card stat" href="' + s.href + '"><span class="tile ' + s.tone + '">' + PP.i(s.icon) + '</span>' +
    '<small>' + s.label + '</small><b id="stat' + i + '">0</b>' +
    '<span class="delta">' + PP.i('arrowup') + s.delta + '</span><span class="vs">vs. last month</span></a>').join('');
  stats.forEach((s, i) => {
    const el = $('stat' + i); let n = 0; const step = Math.max(1, Math.ceil(s.val / 36));
    const iv = setInterval(() => { n = Math.min(s.val, n + step); el.textContent = n.toLocaleString('en-US'); if (n >= s.val) clearInterval(iv); }, 24);
  });

  /* ---------- User growth chart ---------- */
  const sets = {
    '7D': { labels: ['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'], data: [220, 370, 400, 520, 700, 800, 1050] },
    '30D': { labels: ['Apr 20', 'Apr 27', 'May 4', 'May 11', 'May 18'], data: [300, 480, 640, 820, 1050] },
    '3M': { labels: ['Mar', 'Apr', 'May'], data: [420, 760, 1050] },
    '1Y': { labels: ['Jun', 'Aug', 'Oct', 'Dec', 'Feb', 'Apr', 'May'], data: [90, 210, 380, 560, 720, 910, 1050] }
  };
  let range = '7D', pts = [], hover = null;
  const cv = $('growthChart'), ctx = cv.getContext('2d');

  function draw() {
    const box = cv.parentElement, dpr = window.devicePixelRatio || 1;
    const w = box.clientWidth, h = box.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const { labels, data } = sets[range];
    const pad = { l: 40, r: 16, t: 14, b: 30 };
    const max = 1200;
    const X = (i) => pad.l + 12 + (i * (w - pad.l - pad.r - 24)) / (data.length - 1);
    const Y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    ctx.font = '11.5px "Plus Jakarta Sans", sans-serif';
    const dark = document.documentElement.dataset.theme === 'dark';
    const C = dark ? { grid: '#24395f', grid2: '#1c2f52', txt: '#8ea3c6', dotRing: '#13223f', tipBg: '#e6eefc', tipTx: '#0b1630' } : { grid: '#e4edf9', grid2: '#eef3fb', txt: '#7589a9', dotRing: '#fff', tipBg: '#16294f', tipTx: '#fff' };
    // grid
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.txt;
    [0, 300, 600, 900, 1200].forEach((v) => {
      const y = Math.round(Y(v)) + .5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(v === 1200 ? '1.2k' : v, pad.l - 8, y + 4);
    });
    pts = data.map((v, i) => ({ x: X(i), y: Y(v), v, l: labels[i] }));
    pts.forEach((p) => {
      ctx.strokeStyle = C.grid2; ctx.beginPath(); ctx.moveTo(Math.round(p.x) + .5, pad.t); ctx.lineTo(Math.round(p.x) + .5, h - pad.b); ctx.stroke();
    });
    ctx.fillStyle = C.txt; ctx.textAlign = 'center';
    pts.forEach((p) => ctx.fillText(p.l, p.x, h - 8));
    // area
    const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    g.addColorStop(0, 'rgba(74,144,232,.32)'); g.addColorStop(1, 'rgba(74,144,232,.03)');
    ctx.beginPath(); ctx.moveTo(pts[0].x, h - pad.b); pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - pad.b); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    // line (smooth)
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2;
      ctx.bezierCurveTo(cx, a.y, cx, b.y, b.x, b.y);
    }
    ctx.strokeStyle = '#4a90e8'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
    pts.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, i === hover ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4a90e8'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.dotRing; ctx.stroke();
    });
    if (hover != null) {
      const p = pts[hover], t = p.l + ' · ' + p.v.toLocaleString('en-US') + ' users';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(t).width + 18, tx = Math.min(Math.max(p.x - tw / 2, 2), w - tw - 2), ty = Math.max(p.y - 40, 2);
      ctx.fillStyle = C.tipBg; ctx.beginPath(); ctx.roundRect(tx, ty, tw, 26, 9); ctx.fill();
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
  draw();

  /* ---------- Donut ---------- */
  const C = 2 * Math.PI * 72;
  setTimeout(() => $('ring').setAttribute('stroke-dasharray', (C * 0.68).toFixed(1) + ' ' + C.toFixed(1)), 150);

  /* ---------- Recent activities ---------- */
  const acts = [
    ['user', 'New user registered', 'jasmine123', '2 mins ago', 't-blue'],
    ['star', 'Course completed', 'Python Basics', '12 mins ago', 't-yellow'],
    ['quiz', 'New quiz submitted', 'Module 2 Quiz', '25 mins ago', 't-purple'],
    ['megaphone', 'New announcement', 'System Maintenance', '1 hour ago', 't-purple']
  ];
  $('activity').innerHTML = acts.map((a) => '<li><span class="ai ' + a[4] + '">' + PP.i(a[0]) + '</span><div><b>' + a[1] + '</b><small>' + a[2] + '</small></div><time>' + a[3] + '</time></li>').join('');

  /* ---------- Top courses ---------- */
  const courses = [
    ['Python Basics', 520, 92, '#2f9e86', 'book', 't-green'],
    ['Data Types', 420, 78, '#4a90e8', 'cube', 't-blue'],
    ['Control Flow', 380, 65, '#9b5de5', 'layers', 't-purple'],
    ['Functions', 310, 58, '#f5b942', 'code', 't-orange'],
    ['Loops', 290, 52, '#ff6fa5', 'clock', 't-pink']
  ];
  $('topCourses').innerHTML = courses.map((c, i) =>
    '<li><span class="rank">' + (i + 1) + '</span><span class="tile ' + c[5] + '">' + PP.i(c[4]) + '</span>' +
    '<div class="tc-body"><div class="tc-top"><b>' + c[0] + '</b><span>' + c[2] + '%</span></div><small>' + c[1] + ' students</small>' +
    '<div class="bar"><i data-w="' + c[2] + '" style="background:' + c[3] + '"></i></div></div></li>').join('');
  setTimeout(() => document.querySelectorAll('#topCourses .bar i').forEach((b) => (b.style.width = b.dataset.w + '%')), 150);

  /* ---------- Recent users ---------- */
  const users = [
    ['Jasmine Santos', 'jasmine@gmail.com', 'May 18, 2025', 'Active'],
    ['Marco Rivera', 'marco@sample.com', 'May 17, 2025', 'Active'],
    ['Lian Cruz', 'lian@domain.com', 'May 16, 2025', 'Active'],
    ['Aira Delgado', 'aira@test.com', 'May 16, 2025', 'Active'],
    ['Noah Reyes', 'noah@sample.com', 'May 15, 2025', 'Inactive']
  ];
  $('recentUsers').innerHTML = users.map((u) =>
    '<tr><td class="primary" data-label="Name"><div class="cell-user">' + PP.avatar(u[0]) + PP.esc(u[0]) + '</div></td>' +
    '<td data-label="Email" class="sm">' + u[1] + '</td><td data-label="Joined" class="sm">' + u[2] + '</td><td data-label="Status">' + PP.statusChip(u[3]) + '</td></tr>').join('');

  /* ---------- System ---------- */
  $('refreshBtn').addEventListener('click', () => {
    $('lastBackup').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    PP.toast('System status refreshed');
  });
})();
