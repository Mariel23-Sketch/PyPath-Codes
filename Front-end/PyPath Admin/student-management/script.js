(function () {
  const $ = (id) => document.getElementById(id);
  PP.hydrate();

  /* ---------- Sample data ---------- */
  const COURSES = ['Python Basics', 'Python Data Structures', 'Object-Oriented Python', 'Python Problem Solving'];
  let users = [
    ['Jasmine Santos', 'jasmine@gmail.com', 'Student', 'Active', '2025-05-18', 1250],
    ['Marco Rivera', 'marco@sample.com', 'Student', 'Active', '2025-05-17', 420],
    ['Lian Cruz', 'lian@domain.com', 'Student', 'Active', '2025-05-16', 2480],
    ['Aira Delgado', 'aira@test.com', 'Student', 'Active', '2025-05-16', 980],
    ['Noah Reyes', 'noah@sample.com', 'Admin', 'Inactive', '2025-05-15', 0],
    ['Kayla Mendoza', 'kayla@mail.com', 'Student', 'Active', '2025-05-12', 560],
    ['Paolo Garcia', 'paolo@mail.com', 'Student', 'Active', '2025-05-10', 1900],
    ['Trisha Lim', 'trisha@mail.com', 'Student', 'Inactive', '2025-05-08', 330],
    ['Miguel Torres', 'miguel@mail.com', 'Student', 'Active', '2025-05-06', 740],
    ['Sofia Ramos', 'sofia@pypath.com', 'Admin', 'Active', '2025-05-03', 0],
    ['Gab Navarro', 'gab@mail.com', 'Student', 'Active', '2025-05-02', 1120],
    ['Bea Castillo', 'bea@mail.com', 'Student', 'Active', '2025-04-29', 610]
  ].map((u, i) => ({ id: i + 1, name: u[0], email: u[1], role: u[2], status: u[3], joined: u[4], points: u[5] }));
  let nextId = users.length + 1;

  const state = { q: '', role: '', status: '', page: 1, per: 5 };
  let editId = null;

  const code = (u) => (u.role === 'Admin' ? 'AD' : 'ST') + String(u.id).padStart(3, '0');
  const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const qs = new URLSearchParams(location.search).get('q');
  if (qs) { state.q = qs; $('search').value = qs; }

  /* ---------- List ---------- */
  function filtered() {
    const q = state.q.toLowerCase();
    return users.filter((u) =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || code(u).toLowerCase().includes(q)) &&
      (!state.role || u.role === state.role) && (!state.status || u.status === state.status));
  }

  function renderList() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / state.per));
    if (state.page > pages) state.page = pages;
    const slice = list.slice((state.page - 1) * state.per, state.page * state.per);
    $('rows').innerHTML = slice.length ? slice.map((u) =>
      '<tr><td class="hide-m mono" data-label="ID">' + code(u) + '</td>' +
      '<td class="primary" data-label="Name"><div class="cell-user">' + PP.avatar(u.name) + '<span>' + PP.esc(u.name) + '</span></div></td>' +
      '<td data-label="Email">' + PP.esc(u.email) + '</td>' +
      '<td data-label="Role">' + PP.statusChip(u.role) + '</td>' +
      '<td data-label="Status">' + PP.statusChip(u.status) + '</td>' +
      '<td class="acts-cell"><div class="acts">' +
        '<button class="act" data-a="view" data-id="' + u.id + '" title="View profile" aria-label="View profile">' + PP.i('eye') + '</button>' +
        '<button class="act edit" data-a="edit" data-id="' + u.id + '" title="Edit" aria-label="Edit">' + PP.i('edit') + '</button>' +
        '<button class="act del" data-a="del" data-id="' + u.id + '" title="Delete" aria-label="Delete">' + PP.i('trash') + '</button></div></td></tr>').join('')
      : '<tr><td colspan="6" class="empty"><img src="../assets/img/mascot-sad.png" alt="">No users match your search.</td></tr>';
    PP.pager($('pager'), { total: list.length, page: state.page, per: state.per,
      onPage: (p) => { state.page = p; renderList(); }, onPer: (n) => { state.per = n; state.page = 1; renderList(); } });
  }

  $('search').addEventListener('input', (e) => { state.q = e.target.value.trim(); state.page = 1; renderList(); });
  $('statusFilter').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; renderList(); });
  $('roleFilter').addEventListener('click', (e) => {
    const b = e.target.closest('.pill'); if (!b) return;
    state.role = b.dataset.r; state.page = 1;
    document.querySelectorAll('#roleFilter .pill').forEach((p) => p.classList.toggle('on', p === b));
    renderList();
  });

  /* ---------- Add / edit ---------- */
  function openForm(u) {
    editId = u ? u.id : null;
    $('formTitle').textContent = u ? 'Edit User' : 'Add User';
    $('fName').value = u ? u.name : ''; $('fEmail').value = u ? u.email : '';
    $('fRole').value = u ? u.role : 'Student'; $('fStatus').value = u ? u.status : 'Active';
    $('fPass').value = ''; $('pwField').hidden = !!u;
    ['eName', 'eEmail', 'ePass'].forEach((id) => ($(id).textContent = ''));
    ['fName', 'fEmail', 'fPass'].forEach((id) => $(id).classList.remove('bad'));
    PP.openModal('userModal');
  }
  $('addBtn').addEventListener('click', () => openForm(null));

  $('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('fName').value.trim(), email = $('fEmail').value.trim();
    const eName = name ? '' : 'Full name is required.';
    const dup = users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== editId);
    const eEmail = !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email address.' : dup ? 'This email is already in use.' : '';
    const ePass = !editId && $('fPass').value.length < 6 ? 'Use at least 6 characters.' : '';
    $('eName').textContent = eName; $('eEmail').textContent = eEmail; $('ePass').textContent = ePass;
    $('fName').classList.toggle('bad', !!eName); $('fEmail').classList.toggle('bad', !!eEmail); $('fPass').classList.toggle('bad', !!ePass);
    if (eName || eEmail || ePass) return;
    const data = { name, email, role: $('fRole').value, status: $('fStatus').value };
    if (editId) { Object.assign(users.find((u) => u.id === editId), data); PP.toast('User updated'); }
    else { users.unshift({ id: nextId++, joined: new Date().toISOString().slice(0, 10), points: 0, ...data }); PP.toast('User added'); }
    PP.closeModal('userModal'); state.page = 1; renderList();
  });

  $('rows').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const u = users.find((x) => x.id === +b.dataset.id);
    if (b.dataset.a === 'edit') openForm(u);
    if (b.dataset.a === 'view') location.hash = '#profile/' + u.id;
    if (b.dataset.a === 'del') {
      if (await PP.confirm({ title: 'Delete this user?', text: u.name + ' will be removed permanently.' })) {
        users = users.filter((x) => x.id !== u.id); PP.toast('User deleted'); renderList();
      }
    }
  });

  /* ---------- Profile ---------- */
  function seed(u, i) { return (u.id * 37 + i * 23) % 100; }
  function renderProfile(u) {
    const isStudent = u.role === 'Student';
    const prog = COURSES.map((c, i) => ({ name: c, pct: Math.max(8, seed(u, i)), tone: ['t-blue', 't-green', 't-orange', 't-purple'][i], ico: ['book', 'layers', 'cube', 'code'][i] }));
    const badges = [['Python Beginner', 'award', 't-green', 100], ['Data Explorer', 'cube', 't-blue', 250], ['Quiz Master', 'star', 't-purple', 500], ['Code Master', 'code', 't-yellow', 750], ['Consistency', 'clock', 't-orange', 1000], ['Top Learner', 'award', 't-pink', 1500]];
    const acts = [['Completed Module 3: Operators', '2 hours ago', 'check', 't-green'], ['Submitted Operators Quiz (8/10)', 'Yesterday', 'quiz', 't-purple'], ['Earned Python Beginner badge', '3 days ago', 'award', 't-yellow'], ['Joined PyPath', fmt(u.joined), 'user', 't-blue']];
    $('profileCard').innerHTML =
      '<div class="prof-top">' + PP.avatar(u.name, 'xl') +
      '<div><h2>' + PP.esc(u.name) + '</h2><div class="sub">' + code(u) + ' · ' + u.role + '</div><div style="margin-top:8px">' + PP.statusChip(u.status) + '</div></div>' +
      '<div class="push"><button class="btn btn-ghost" id="editFromProfile">' + PP.i('edit') + 'Edit Profile</button></div></div>' +
      '<div class="info-row"><div class="info"><small>Email</small><b>' + PP.esc(u.email) + '</b></div><div class="info"><small>Joined</small><b>' + fmt(u.joined) + '</b></div><div class="info"><small>Total Points</small><b>' + u.points.toLocaleString('en-US') + '</b></div></div>' +
      (isStudent ?
        '<div class="tabs" id="pTabs" role="tablist"><button class="tab on" data-t="courses">Enrolled Courses</button><button class="tab" data-t="badges">Badges</button><button class="tab" data-t="activity">Activity</button></div><div id="pBody"></div>'
        : '<div class="admin-note"><img src="../assets/img/mascot-wave.png" alt=""><div><b>Administrator account</b><br><span class="sub">Admins manage the platform and do not have learning progress.</span></div></div>');
    $('editFromProfile').onclick = () => openForm(u);
    if (!isStudent) return;
    const bodies = {
      courses: () => prog.map((c) => '<div class="course-row"><span class="tile ' + c.tone + '">' + PP.i(c.ico) + '</span><div><b>' + c.name + '</b><div class="bar"><i style="width:' + c.pct + '%;background:#4a90e8"></i></div></div><div style="text-align:right"><div class="pct">' + c.pct + '%</div>' + (c.pct >= 100 ? PP.chip('Done', 'green') : c.pct > 40 ? PP.chip('In Progress', 'blue') : PP.chip('Started', 'orange')) + '</div></div>').join(''),
      badges: () => '<div class="badge-grid">' + badges.map((b) => '<div class="badge-box ' + (u.points >= b[3] ? '' : 'locked') + '"><span class="tile ' + b[2] + '">' + PP.i(b[1]) + '</span><b>' + b[0] + '</b><small>' + b[3] + ' pts</small></div>').join('') + '</div>',
      activity: () => '<ul class="timeline">' + acts.map((a) => '<li><span class="tile ' + a[3] + '" style="width:38px;height:38px;border-radius:50%">' + PP.i(a[2]) + '</span><span>' + a[0] + '</span><time>' + a[1] + '</time></li>').join('') + '</ul>'
    };
    const show = (t) => { $('pBody').innerHTML = bodies[t](); document.querySelectorAll('#pTabs .tab').forEach((x) => x.classList.toggle('on', x.dataset.t === t)); };
    $('pTabs').onclick = (e) => { const b = e.target.closest('.tab'); if (b) show(b.dataset.t); };
    show('courses');
  }

  /* ---------- Routing ---------- */
  function route() {
    const m = location.hash.match(/^#profile\/(\d+)/);
    const u = m && users.find((x) => x.id === +m[1]);
    $('viewList').hidden = !!u; $('viewProfile').hidden = !u;
    if (u) { renderProfile(u); window.scrollTo(0, 0); } else renderList();
  }
  $('backBtn').addEventListener('click', (e) => { e.preventDefault(); location.hash = ''; history.replaceState(null, '', location.pathname + location.search); route(); });
  window.addEventListener('hashchange', route);

  PP.onGlobalSearch = (q) => { location.hash = ''; state.q = q; $('search').value = q; state.page = 1; route(); };
  route();
})();
