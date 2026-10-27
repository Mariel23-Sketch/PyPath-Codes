/* PyPath Admin – Results & Progress, Rewards, Announcements, Profile & Settings
   (from pogi.html, restyled to the shared PyPath Admin shell) */
(function (PP) {
const $ = (s) => document.querySelector(s);
const IMG = '../assets/img/';
const ICO = { mega: 'megaphone' };
const ic = (n) => PP.i(ICO[n] || n);
const esc = PP.esc;
const MODS = ['Introduction to Python', 'Variables and Data Types', 'Operators', 'Conditional Statements', 'Loops', 'Functions'];
let uid = 100;
const CM = { Blue: 't-blue', Green: 't-green', Purple: 't-purple', Yellow: 't-yellow', Red: 't-red' };
const D = {
st: [
{id:1,name:'Jasmine Santos',pct:80,status:'In progress',last:'May 18, 2026',score:80,correct:8,time:'6:32'},
{id:2,name:'Marco Rivera',pct:60,status:'In progress',last:'May 17, 2026',score:70,correct:7,time:'8:10'},
{id:3,name:'Lian Cruz',pct:40,status:'In progress',last:'May 16, 2026',score:60,correct:6,time:'9:45'},
{id:4,name:'Aira Delgado',pct:20,status:'Inactive',last:'Apr 28, 2026',score:40,correct:4,time:'11:02'},
{id:5,name:'Noah Reyes',pct:100,status:'Completed',last:'May 15, 2026',score:95,correct:9,time:'5:20'},
{id:6,name:'Mika Tan',pct:100,status:'Completed',last:'May 14, 2026',score:90,correct:9,time:'6:01'},
{id:7,name:'Eli Cruz',pct:0,status:'Not started',last:'—',score:0,correct:0,time:'—'}],
bd: [
{id:1,name:'Python Beginner',pts:500,color:'Blue',desc:'Finish your first module.'},
{id:2,name:'Loop Master',pts:850,color:'Green',desc:'Finish the Loops module.'},
{id:3,name:'Quiz Master',pts:900,color:'Purple',desc:'Score 90% or higher on five quizzes.'},
{id:4,name:'Code Warrior',pts:750,color:'Yellow',desc:'Solve 25 practice exercises.'},
{id:5,name:'Consistency',pts:1000,color:'Red',desc:'Learn for seven days in a row.'}],
rw: [
{id:1,name:'Python Beginner Badge',cost:500,stock:999,status:'Active'},
{id:2,name:'Python Master Badge',cost:1000,stock:999,status:'Active'},
{id:3,name:'Python Hoodie',cost:2000,stock:24,status:'Active'},
{id:4,name:'Mascot Sticker Pack',cost:300,stock:40,status:'Active'},
{id:5,name:'Gold Profile Frame',cost:200,stock:999,status:'Active'}],
rules: {lesson:10,quiz:50,practice:10,course:100,streak:5},
an: [
{id:1,title:'System maintenance on May 20',msg:'PyPath will be offline from 1:00 to 2:00 AM for upgrades.',aud:'All students',date:'May 14, 2026',status:'Published'},
{id:2,title:'New Python module available',msg:'Module 3: Operators is now open. Keep going!',aud:'All students',date:'May 10, 2026',status:'Published'},
{id:3,title:'Quiz schedule update',msg:'Python Quiz 1 is now open for Beginner learners.',aud:'Beginner',date:'May 8, 2026',status:'Published'},
{id:4,title:'Welcome to PyPath!',msg:'Start with Introduction to Python and earn your first badge.',aud:'All students',date:'May 1, 2026',status:'Published'},
{id:5,title:'Hoodie rewards arrive in June',msg:'Redeem 2,000 points for the Python Hoodie.',aud:'All students',date:'—',status:'Draft'}],
me: {name:'Admin User',user:'admin',email:'admin@pypath.ph',phone:'',site:'PyPath - Learn Python',desc:'Learn Python, Build Your Future.',lang:'English',tz:'Asia/Manila',tfa:false,notify:true}};
const S = {st:{q:'',a:'All',b:'All'},an:{q:'',a:'All'},rw:{tab:'Badges'},pf:{tab:'Profile'}};

/* ---- UI helpers (PyPath Admin components) ---- */
const chipOf = {Published:'green',Active:'green',Completed:'green',Correct:'green',Draft:'orange',Hidden:'orange','In progress':'blue','Not started':'purple',Inactive:'red',Incorrect:'red'};
const pill = (s) => PP.chip(s, chipOf[s] || 'blue');
const bar = (p) => `<div class="pc"><div class="bar"><i style="width:${p}%;background:${p>=80?'linear-gradient(90deg,#2fa57a,#4fc79b)':p>=50?'linear-gradient(90deg,#3d8bf5,#74b6ff)':'linear-gradient(90deg,#f0a50c,#f4c04f)'}"></i></div><b>${p}%</b></div>`;
const empty = (m) => `<div class="empty"><img src="${IMG}mascot-sad.png" alt="">${m}</div>`;
const opts = (l, v) => l.map((x) => `<option${x == v ? ' selected' : ''}>${esc(x)}</option>`).join('');
const sel = (k, l, key, all) => `<select class="select status-sel" aria-label="${l}" data-s="${k}.${key}">${opts([all, ...(S[k]._o[key])], S[k][key])}</select>`;
const fld = (k, l, v = '', o = {}) => {
  const t = o.t || 'text', w = o.w ? ' w' : '';
  if (t === 'seg') return `<div class="field${w}"><span class="label">${l}</span><div class="radios">${o.o.map((x) => `<label class="radio"><input type="radio" name="${k}" value="${x}"${x == v ? ' checked' : ''}>${x}</label>`).join('')}</div></div>`;
  const c = t === 'select' ? `<select class="select" name="${k}">${opts(o.o, v)}</select>`
    : t === 'textarea' ? `<textarea class="textarea${o.pv ? ' mono' : ''}" name="${k}" rows="${o.r || 3}"${o.pv ? ` data-pv="${o.pv}"` : ''}${o.req ? ' required' : ''}>${esc(v)}</textarea>`
    : `<input class="input" name="${k}" type="${t}" value="${esc(v)}"${o.req ? ' required' : ''}${o.min != null ? ` min="${o.min}"` : ''}>`;
  return `<label class="field${w}"><span class="label">${l}${o.req ? ' <span class="req">*</span>' : ''}</span>${c}</label>`;
};
function modal(t, body, ok, btn = 'Save changes', danger) {
  const d = document.createElement('div');
  d.className = 'modal-backdrop open';
  d.dataset.dynamic = '1';
  d.innerHTML = `<form class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${t}</h2><button type="button" class="icon-btn" data-x aria-label="Close">${ic('x')}</button></div><div class="mb">${body}</div><div class="modal-foot"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}">${btn}</button></div></form>`;
  const close = () => d.remove();
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-x]')) close(); });
  d.addEventListener('input', (e) => { const p = e.target.dataset.pv; if (p) d.querySelector(p).textContent = e.target.value; });
  d.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); for (const k in fd) if (/^(pts|cost|stock)$/.test(k)) fd[k] = +fd[k]; ok(fd); close(); });
  document.body.append(d);
  const f = d.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus(), 30);
}
const toast = (m) => PP.toast(m);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function crud(key, label, form, blank, name) {
  const save = (rec) => modal((rec ? 'Edit ' : 'Add ') + label, form(rec || blank()), (fd) => { if (rec) Object.assign(rec, fd); else D[key].unshift({ id: ++uid, ...fd }); toast(cap(label) + (rec ? ' saved' : ' added')); draw(); });
  return {
    add: () => save(),
    edit: (id) => save(D[key].find((x) => x.id == id)),
    del: (id) => { const r = D[key].find((x) => x.id == id); PP.confirm({ title: 'Delete ' + label + '?', text: '“' + r[name] + '” will be removed. This can’t be undone.', confirm: 'Delete' }).then((yes) => { if (!yes) return; D[key] = D[key].filter((x) => x.id != id); toast(cap(label) + ' deleted'); draw(); }); }
  };
}
const acts = (id, extra = '') => `<td class="acts-cell"><div class="acts">${extra}<button class="act edit" data-a="edit" data-id="${id}" aria-label="Edit">${ic('edit')}</button><button class="act del" data-a="del" data-id="${id}" aria-label="Delete">${ic('trash')}</button></div></td>`;
const tbar = (ph, filters) => `<div class="toolbar"><label class="searchbox">${ic('search')}<input type="search" placeholder="${ph}" aria-label="${ph}" data-s="q" value="${esc(S[R.k].q || '')}"></label>${filters}</div>`;
const headBtn = (label) => `<button class="btn btn-primary" data-a="add">${ic('plus')}${label}</button>`;
const stat = (tile, icon, label, val) => `<div class="card stat"><span class="tile ${tile}">${ic(icon)}</span><small>${label}</small><b>${val}</b></div>`;
const tabs = (list, cur) => `<div class="pills" role="tablist">${list.map((n) => `<button class="pill${cur == n ? ' on' : ''}" role="tab" aria-selected="${cur == n}" data-a="tab" data-id="${n}">${n}</button>`).join('')}</div>`;
const tableCard = '<div class="card"><TOOLBAR><div class="table-wrap" id="list"></div></div>';
const cellMain = (t, s) => `<td class="primary"><div class="cell-stack"><span class="cell-strong">${t}</span>${s ? `<span class="sub">${s}</span>` : ''}</div></td>`;

/* ---- Results & Progress ---- */
const doneN = (x) => Math.floor(x.pct / 100 * 6), cur = (x) => x.pct >= 100 ? 'All lessons done' : MODS[doneN(x)];
const ST = { k: 'st', t: 'Results and Progress', s: 'See how learners are doing across the Python lessons.', i: 'chart',
  draw() {
    S.st._o = { a: MODS, b: ['Completed', 'In progress', 'Not started', 'Inactive'] };
    const d = D.st, avg = Math.round(d.reduce((a, x) => a + x.score, 0) / d.length), done = Math.round(d.reduce((a, x) => a + x.pct, 0) / d.length);
    return `<div class="card hero"><div class="hero-copy"><span class="admin-tag">Progress</span><h2>Learners are on a roll</h2><p>${d.filter((x) => x.status == 'Completed').length} of ${d.length} students finished all six Python lessons. ${d.filter((x) => x.status == 'Inactive').length} haven’t opened PyPath in over two weeks.</p></div><div class="hero-art" aria-hidden="true"><span class="spk s1"></span><span class="spk s2"></span><span class="wcloud"></span><img src="${IMG}mascot-cheer.png" alt=""></div></div>
<div class="stats">${stat('t-blue', 'chart', 'Average quiz score', avg + '%')}${stat('t-green', 'check', 'Average progress', done + '%')}${stat('t-purple', 'users', 'Students tracked', d.length)}${stat('t-red', 'alert', 'Need a nudge', d.filter((x) => x.status == 'Inactive' || x.status == 'Not started').length)}</div>`
      + tableCard.replace('<TOOLBAR>', tbar('Search students', sel('st', 'Module', 'a', 'All lessons') + sel('st', 'Status', 'b', 'All statuses')));
  },
  list() {
    const s = S.st, q = s.q.toLowerCase(), r = D.st.filter((x) => x.name.toLowerCase().includes(q) && (s.a == 'All' || cur(x) == s.a) && (s.b == 'All' || x.status == s.b));
    $('#list').innerHTML = r.length ? `<table class="table stack"><thead><tr><th>Student</th><th>Current module</th><th>Progress</th><th>Quiz score</th><th>Status</th><th>Last activity</th><th>Actions</th></tr></thead><tbody>${r.map((x) => `<tr><td class="primary"><div class="cell-user">${PP.avatar(x.name)}${esc(x.name)}</div></td><td data-label="Current module">${cur(x)}</td><td data-label="Progress">${bar(x.pct)}</td><td data-label="Quiz score">${x.score}%</td><td data-label="Status">${pill(x.status)}</td><td data-label="Last activity">${x.last}</td><td class="acts-cell"><button class="btn btn-ghost btn-sm" data-a="view" data-id="${x.id}">${ic('eye')}View results</button></td></tr>`).join('')}</tbody></table>` : empty('No students match these filters.');
  },
  view(id) {
    const x = D.st.find((r) => r.id == id); if (!x.correct && !x.score) return toast(x.name + ' hasn’t taken a quiz yet');
    const qs = ['What is Python?', 'Which keyword creates a function?', 'What does print(5 + 3) show?', 'Which data type is mutable?'], ans = [['A programming language', 'def', '8', 'list'], ['A snake', 'def', '53', 'list'], ['A programming language', 'def', '8', 'tuple'], ['A snake', 'func', '53', 'tuple']];
    const ok = (i) => x.score / 100 * 4 > i;
    modal('Quiz results · ' + esc(x.name), `<div class="res-stats"><div><small>Score</small><b>${x.score}%</b></div><div><small>Correct</small><b>${x.correct}/10</b></div><div><small>Time</small><b>${x.time}</b></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Question</th><th>Answer</th><th>Result</th></tr></thead><tbody>${qs.map((q, i) => `<tr><td>${q}</td><td>${ans[ok(i) ? 0 : Math.min(i, 3)][i]}</td><td>${pill(ok(i) ? 'Correct' : 'Incorrect')}</td></tr>`).join('')}</tbody></table></div>`, () => {}, 'Done');
  } };

/* ---- Rewards ---- */
const bdC = crud('bd', 'badge', (r) => `<div class="fg">${fld('name', 'Badge name', r.name, { w: 1, req: 1 })}${fld('pts', 'Points required', r.pts, { t: 'number', min: 0, req: 1 })}${fld('color', 'Color', r.color, { t: 'select', o: Object.keys(CM) })}${fld('desc', 'How it’s earned', r.desc, { t: 'textarea', w: 1 })}</div>`, () => ({ name: '', pts: 500, color: 'Blue', desc: '' }), 'name');
const rwC = crud('rw', 'reward', (r) => `<div class="fg">${fld('name', 'Reward name', r.name, { w: 1, req: 1 })}${fld('cost', 'Cost in points', r.cost, { t: 'number', min: 0, req: 1 })}${fld('stock', 'Stock', r.stock, { t: 'number', min: 0, req: 1 })}${fld('status', 'Visibility', r.status, { t: 'seg', o: ['Active', 'Hidden'], w: 1 })}</div>`, () => ({ name: '', cost: 500, stock: 10, status: 'Active' }), 'name');
const RW = { k: 'rw', t: 'Points and Reward Management', s: 'Decide what learners earn and what they can redeem.', i: 'gift',
  head: () => S.rw.tab == 'Points rules' ? '' : headBtn(S.rw.tab == 'Badges' ? 'Add badge' : 'Add reward'),
  draw() {
    const t = S.rw.tab;
    return `<div class="stats">${stat('t-yellow', 'star', 'Points awarded', '48,920')}${stat('t-purple', 'award', 'Badges earned', '3,214')}${stat('t-green', 'gift', 'Redemptions', '186')}</div>
${tabs(['Badges', 'Redeemable rewards', 'Points rules'], t)}
${t == 'Points rules' ? `<div class="card form"><div class="card-title">${ic('star')}Points rules</div><div class="fg">${fld('lesson', 'Completing a lesson', D.rules.lesson, { t: 'number', min: 0 })}${fld('quiz', 'Passing a quiz', D.rules.quiz, { t: 'number', min: 0 })}${fld('practice', 'Solving an exercise', D.rules.practice, { t: 'number', min: 0 })}${fld('course', 'Completing a course', D.rules.course, { t: 'number', min: 0 })}${fld('streak', 'Each day of a learning streak', D.rules.streak, { t: 'number', min: 0 })}</div><div class="form-actions"><button class="btn btn-primary" data-a="rules">Save rules</button></div></div>` : `<div id="list"></div>`}`;
  },
  list() {
    const el = $('#list'); if (!el) return;
    if (S.rw.tab == 'Badges') el.innerHTML = D.bd.length ? `<div class="badge-grid">${D.bd.map((b) => `<div class="card bdg"><span class="tile ${CM[b.color]}">${ic('award')}</span><h3>${esc(b.name)}</h3>${PP.chip(b.pts + ' pts', 'blue')}<p>${esc(b.desc)}</p><div class="acts"><button class="act edit" data-a="edit" data-id="${b.id}" aria-label="Edit ${esc(b.name)}">${ic('edit')}</button><button class="act del" data-a="del" data-id="${b.id}" aria-label="Delete ${esc(b.name)}">${ic('trash')}</button></div></div>`).join('')}</div>` : `<div class="card">${empty('No badges yet. Add one to reward milestones.')}</div>`;
    else el.innerHTML = `<div class="card"><div class="table-wrap">${D.rw.length ? `<table class="table stack"><thead><tr><th>Reward</th><th>Cost</th><th>In stock</th><th>Visibility</th><th style="width:100px">Actions</th></tr></thead><tbody>${D.rw.map((r) => `<tr>${cellMain(esc(r.name))}<td data-label="Cost">${r.cost.toLocaleString()} pts</td><td data-label="In stock">${r.stock ? r.stock : PP.chip('Sold out', 'red')}</td><td data-label="Visibility">${pill(r.status)}</td>${acts(r.id)}</tr>`).join('')}</tbody></table>` : empty('No rewards yet.')}</div></div>`;
  },
  add() { (S.rw.tab == 'Badges' ? bdC : rwC).add(); }, edit(id) { (S.rw.tab == 'Badges' ? bdC : rwC).edit(id); }, del(id) { (S.rw.tab == 'Badges' ? bdC : rwC).del(id); },
  tab(n) { S.rw.tab = n; draw(); }, rules() { document.querySelectorAll('.form input').forEach((i) => (D.rules[i.name] = Math.max(0, Math.floor(+i.value) || 0))); try { localStorage.setItem('pypath_points_rules', JSON.stringify(D.rules)); } catch (e) {} toast('Points rules saved'); } };

/* ---- Announcements ---- */
const anC = crud('an', 'announcement', (r) => `<div class="fg">${fld('title', 'Title', r.title, { w: 1, req: 1 })}${fld('msg', 'Message', r.msg, { t: 'textarea', r: 4, w: 1, req: 1 })}${fld('aud', 'Audience', r.aud, { t: 'select', o: ['All students', 'Beginner', 'Intermediate', 'Advanced'] })}${fld('status', 'Status', r.status, { t: 'seg', o: ['Draft', 'Published'] })}</div>`, () => ({ title: '', msg: '', aud: 'All students', status: 'Draft' }), 'title');
const AN = { k: 'an', t: 'Announcement Management', s: 'Post news and updates to your learners.', i: 'mega',
  head: () => headBtn('New announcement'),
  draw() { S.an._o = { a: ['Published', 'Draft'] }; return tableCard.replace('<TOOLBAR>', tbar('Search announcements', sel('an', 'Status', 'a', 'All statuses'))); },
  list() {
    const s = S.an, q = s.q.toLowerCase(), r = D.an.filter((x) => (x.title + x.msg).toLowerCase().includes(q) && (s.a == 'All' || x.status == s.a));
    $('#list').innerHTML = r.length ? `<table class="table stack"><thead><tr><th>Announcement</th><th>Audience</th><th>Date</th><th>Status</th><th style="width:100px">Actions</th></tr></thead><tbody>${r.map((x) => `<tr>${cellMain(esc(x.title), esc(x.msg))}<td data-label="Audience">${x.aud}</td><td data-label="Date">${x.date}</td><td data-label="Status">${pill(x.status)}</td>${acts(x.id)}</tr>`).join('')}</tbody></table>` : empty('No announcements found. Write a new one to keep learners in the loop.');
  }, add: anC.add, edit: anC.edit, del: anC.del };

/* ---- Profile & Settings ---- */
const PF = { k: 'pf', t: 'Admin Profile and Settings', s: 'Manage your account and how PyPath behaves.', i: 'user',
  draw() {
    const m = D.me, t = S.pf.tab; let b = '';
    if (t == 'Profile') b = `${fld('name', 'Full name', m.name, { req: 1 })}${fld('user', 'Username', m.user, { req: 1 })}${fld('email', 'Email', m.email, { t: 'email', req: 1 })}${fld('phone', 'Phone', m.phone, { t: 'tel' })}`;
    if (t == 'General') b = `${fld('site', 'Site name', m.site, { w: 1 })}${fld('desc', 'Site description', m.desc, { t: 'textarea', w: 1 })}${fld('lang', 'Language', m.lang, { t: 'select', o: ['English', 'Filipino'] })}${fld('tz', 'Time zone', m.tz, { t: 'select', o: ['Asia/Manila', 'UTC', 'America/New_York'] })}${fld('notify', 'Email me about new sign-ups', m.notify ? 'On' : 'Off', { t: 'seg', o: ['On', 'Off'], w: 1 })}`;
    if (t == 'Security') b = `${fld('cur', 'Current password', '', { t: 'password', w: 1 })}${fld('nw', 'New password', '', { t: 'password' })}${fld('cf', 'Confirm new password', '', { t: 'password' })}<div class="err w" id="err" style="grid-column:1/-1;margin:-6px 0 12px"></div>${fld('tfa', 'Two-step sign-in', m.tfa ? 'On' : 'Off', { t: 'seg', o: ['On', 'Off'], w: 1 })}`;
    return `<div class="card"><div class="prof-top"><img class="avatar-img xl" src="${IMG}mascot-hands.png" alt=""><div><h2>${esc(m.name)}</h2><p class="sub">${esc(m.email)}</p>${PP.chip('Administrator', 'purple')}</div></div></div>
${tabs(['Profile', 'General', 'Security'], t)}
<form class="card form" id="pf" novalidate><div class="fg">${b}</div><div class="form-actions"><button class="btn btn-primary">Save changes</button></div></form>`;
  },
  tab(n) { S.pf.tab = n; draw(); }, list() {} };
document.addEventListener('submit', (e) => {
  if (e.target.id != 'pf') return; e.preventDefault();
  const f = e.target; if (!f.reportValidity()) return;
  const fd = Object.fromEntries(new FormData(f)), t = S.pf.tab;
  if (t == 'Security') { const err = $('#err'); if (fd.nw || fd.cf || fd.cur) { if (!fd.cur) return err.textContent = 'Enter your current password.'; if (fd.nw.length < 8) return err.textContent = 'New password needs at least 8 characters.'; if (fd.nw !== fd.cf) return err.textContent = 'New passwords don’t match.'; } D.me.tfa = fd.tfa == 'On'; f.querySelectorAll('input[type=password]').forEach((i) => (i.value = '')); err.textContent = ''; }
  else { if ('notify' in fd) D.me.notify = fd.notify == 'On'; Object.assign(D.me, { ...fd, notify: D.me.notify }); }
  toast('Settings saved'); if (t == 'Profile') draw();
});

/* ---- Router ---- */
const ROUTES = { progress: ST, 'points-reward': RW, rewards: RW, announcements: AN, profile: PF };
const NAVKEY = { progress: 'progress', 'points-reward': 'rewards', rewards: 'rewards', announcements: 'announcements', profile: '' }; /* profile/settings has no sidebar entry */
let R = ST;
function draw() { $('#headAct').innerHTML = R.head ? R.head() : ''; $('#pg').innerHTML = R.draw(); R.list(); }
function route() {
  if (/^#exercises?$/.test(location.hash)) { location.replace('../activities/index.html'); return; }
  const k = ROUTES[location.hash.slice(1)] ? location.hash.slice(1) : 'progress'; R = ROUTES[k];
  PP.setActive(NAVKEY[k]);
  document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open'));
  const dr = $('#drawer'); if (dr) dr.classList.remove('open'); document.body.classList.remove('no-scroll');
  $('#tt').textContent = R.t; $('#ts').textContent = R.s; document.title = 'PyPath Admin – ' + R.t; draw(); scrollTo(0, 0);
}
addEventListener('hashchange', route);
document.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b && R[b.dataset.a]) R[b.dataset.a](b.dataset.id); });
document.addEventListener('input', (e) => { const s = e.target.dataset.s; if (!s || e.target.type != 'search') return; S[R.k].q = e.target.value; R.list(); });
document.addEventListener('change', (e) => { const s = e.target.dataset.s; if (!s || e.target.type == 'search') return; const [k, f] = s.split('.'); S[k][f] = e.target.value == 'All' || e.target.selectedIndex == 0 ? 'All' : e.target.value; R.list(); });
route();
})(window.PP);
