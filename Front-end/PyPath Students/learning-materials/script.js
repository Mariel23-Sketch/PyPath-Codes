/* PyPath Student – Learning Materials
   Pages inside this file (switch with the # in the address):
     #courses       all courses
     #course/1      one course (Overview / Modules / Lectures tabs)
     #module/11     one module with its lectures and practice
     #lecture/101   watch a lecture and mark it as done (+10 pts) */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, esc = PP.esc, F = PP.find;
  PP.hydrate();

  const views = ['courses', 'course', 'module', 'lecture'];
  function show(name) { views.forEach((v) => ($('v-' + v).hidden = v !== name)); window.scrollTo(0, 0); }
  const S = () => PP.store.get();
  const isDone = (lecId) => S().done.includes(lecId);
  const tileHtml = (c) => '<span class="ctile ' + c.tone + '">' + (c.icon === 'python' ? PP.img('logo-icon.png', '', 'Logo') : PP.i(c.icon)) + '</span>';
  const openModules = (cid) => D.modules.filter((m) => m.courseId === cid);
  const quizzesOf = (mid) => D.quizzes.filter((q) => q.moduleId === mid);
  const exercisesOf = (mid) => D.exercises.filter((x) => x.moduleId === mid);
  const barHtml = (p) => '<div class="bar' + (p === 100 ? ' green' : '') + '"><i style="width:' + p + '%"></i></div>';

  /* ---------- 1. Courses ---------- */
  const st = { q: '', level: '' };
  function renderCourses() {
    const nx = PP.nextLecture();
    $('resumeBtn').hidden = !nx;
    if (nx) $('resumeBtn').href = '#lecture/' + nx.id;
    const q = st.q.toLowerCase();
    const list = D.courses.filter((c) => {
      if (st.level && c.level !== st.level) return false;
      if (!q) return true;
      return (c.title + ' ' + c.desc).toLowerCase().includes(q) || PP.courseLectures(c.id).some((l) => l.title.toLowerCase().includes(q)) || openModules(c.id).some((m) => m.name.toLowerCase().includes(q));
    });
    $('courseList').innerHTML = list.length ? list.map((c) => {
      const p = PP.courseProgress(c.id), mods = openModules(c.id);
      const hits = q ? PP.courseLectures(c.id).filter((l) => l.title.toLowerCase().includes(q)).map((l) => l.title) : [];
      return '<article class="course-card" data-id="' + c.id + '" tabindex="0" role="link" aria-label="Open ' + esc(c.title) + '">' + tileHtml(c) +
        '<div class="cc-main"><h3>' + esc(c.title) + '</h3><p>' + c.level + ' • ' + mods.length + ' Modules • ' + p.total + ' Lessons</p>' +
        (hits.length ? '<p class="match">Lessons: ' + esc(hits.join(', ')) + '</p>' : '') + '</div>' +
        '<div class="cc-prog"><small><span>' + (p.pct === 100 ? 'Completed' : p.done ? 'In progress' : 'Not started') + '</span><b>' + p.pct + '%</b></small>' + barHtml(p.pct) + '</div>' +
        '<span class="cc-chev">' + PP.i('right') + '</span></article>';
    }).join('') : '<div class="card empty">' + PP.img('mascot-sad.png', '', 'Mascot') + 'No courses or lessons match your search.</div>';
  }
  $('courseSearch').addEventListener('input', (e) => { st.q = e.target.value.trim(); renderCourses(); });
  $('levelPills').addEventListener('click', (e) => {
    const b = e.target.closest('.pill'); if (!b) return;
    st.level = b.dataset.l;
    document.querySelectorAll('#levelPills .pill').forEach((p) => p.classList.toggle('on', p === b));
    renderCourses();
  });
  $('courseList').addEventListener('click', (e) => { const c = e.target.closest('.course-card'); if (c) location.hash = '#course/' + c.dataset.id; });
  $('courseList').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList.contains('course-card')) location.hash = '#course/' + e.target.dataset.id; });

  /* ---------- 2. Course details ---------- */
  let cdTab = 'overview';
  function moduleRow(m, i) {
    const status = PP.moduleStatus(m), ls = PP.lecturesOf(m.id);
    const doneN = ls.filter((l) => isDone(l.id)).length;
    const n = status === 'Completed' ? '<span class="n ok">' + PP.i('check') + '</span>' : !m.open ? '<span class="n">' + PP.i('lock') + '</span>' : '<span class="n">' + (i + 1) + '</span>';
    const inner = n + '<span class="grow"><b>' + esc(m.name) + '</b><small>' + (m.open ? doneN + ' of ' + ls.length + ' lessons done' : 'Your teacher has not published this yet') + '</small></span>' + PP.statusChip(status) + (m.open ? PP.i('right', 'chev') : '');
    return m.open ? '<a class="lr" href="#module/' + m.id + '">' + inner + '</a>' : '<div class="lr locked">' + inner + '</div>';
  }
  function renderCourseDetail(c) {
    const mods = openModules(c.id), p = PP.courseProgress(c.id);
    const nxt = PP.courseLectures(c.id).find((l) => F.module(l.moduleId).open && !isDone(l.id));
    $('courseDetail').innerHTML =
      '<div class="cd-head">' + tileHtml(c) + '<div><h2>' + esc(c.title) + '</h2><div class="sub">' + c.level + ' • ' + mods.length + ' Modules • ' + p.total + ' Lessons</div></div>' +
      '<div class="push">' + (nxt ? '<a class="btn btn-primary" href="#lecture/' + nxt.id + '">' + PP.i('play') + (p.done ? 'Continue' : 'Start course') + '</a>' : PP.statusChip('Completed')) + '</div></div>' +
      '<div class="cd-tabs" id="cdTabs">' + ['overview', 'modules', 'lectures'].map((t) => '<button data-t="' + t + '" class="' + (t === cdTab ? 'on' : '') + '">' + t[0].toUpperCase() + t.slice(1) + '</button>').join('') + '</div><div class="cd-body" id="cdBody"></div>';
    const qs = D.quizzes.filter((q) => F.module(q.moduleId).courseId === c.id), xs = D.exercises.filter((x) => F.module(x.moduleId).courseId === c.id);
    const body = {
      overview: () => '<p class="desc">' + esc(c.desc) + '</p><div class="prog-row"><span>Your progress</span><span>' + p.pct + '%</span></div>' + barHtml(p.pct) +
        '<div class="overview-grid"><div class="ov"><small>Lessons done</small><b>' + p.done + '/' + p.total + '</b></div><div class="ov"><small>Quizzes</small><b>' + qs.filter((q) => S().quiz[q.id]).length + '/' + qs.length + '</b></div><div class="ov"><small>Exercises</small><b>' + xs.filter((x) => S().ex[x.id]).length + '/' + xs.length + '</b></div></div>',
      modules: () => '<div class="list-rows">' + mods.map(moduleRow).join('') + '</div>',
      lectures: () => {
        const ls = PP.courseLectures(c.id);
        return ls.length ? '<div class="list-rows">' + ls.map((l, i) => '<a class="lr" href="#lecture/' + l.id + '"><span class="n' + (isDone(l.id) ? ' ok' : '') + '">' + (isDone(l.id) ? PP.i('check') : i + 1) + '</span><span class="grow"><b>' + esc(l.title) + '</b><small>' + esc(F.module(l.moduleId).name) + ' · ' + l.mins + ' min</small></span>' + PP.i('right', 'chev') + '</a>').join('') + '</div>' : '<div class="empty">No lectures yet.</div>';
      }
    };
    const showTab = (t) => {
      cdTab = t; $('cdBody').innerHTML = body[t]();
      document.querySelectorAll('#cdTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    };
    $('cdTabs').onclick = (e) => { const b = e.target.closest('button'); if (b) showTab(b.dataset.t); };
    showTab(cdTab);
  }

  /* ---------- 3. Module ---------- */
  function practiceHtml(mid) {
    const items = quizzesOf(mid).map((q) => '<a class="prac" href="../activities/index.html#quiz/' + q.id + '"><span class="tile t-purple">' + PP.i('quiz') + '</span><span class="grow"><b>' + esc(q.title) + '</b><small>Quiz · ' + q.qs.length + ' questions · +' + D.rules.quiz + ' pts</small></span>' + PP.statusChip(S().quiz[q.id] ? 'Completed' : q.diff) + '</a>')
      .concat(exercisesOf(mid).map((x) => '<a class="prac" href="../activities/index.html#exercise/' + x.id + '"><span class="tile t-green">' + PP.i('code') + '</span><span class="grow"><b>' + esc(x.title) + '</b><small>' + x.type + ' exercise · +' + x.pts + ' pts</small></span>' + PP.statusChip(S().ex[x.id] ? 'Completed' : x.diff) + '</a>'));
    return items.length ? '<p class="sec-h">Practice</p>' + items.join('') : '';
  }
  function renderModule(m) {
    const c = F.course(m.courseId), ls = PP.lecturesOf(m.id), status = PP.moduleStatus(m);
    $('moduleBack').href = '#course/' + c.id;
    $('moduleBack').lastChild.textContent = 'Back to ' + c.title;
    const nxt = ls.find((l) => !isDone(l.id)) || ls[0];
    $('moduleDetail').innerHTML =
      '<div class="mod-head"><span class="tile t-blue">' + PP.i('cube') + '</span><div><h2>' + esc(m.name) + '</h2><div class="sub">' + esc(c.title) + ' · ' + ls.length + ' lessons</div></div>' + PP.statusChip(status) +
      (nxt ? '<div class="push"><a class="btn btn-primary" href="#lecture/' + nxt.id + '">' + PP.i('play') + (status === 'Completed' ? 'Watch again' : 'Start lesson') + '</a></div>' : '') + '</div>' +
      '<p class="sec-h">Lectures</p><div class="list-rows">' + ls.map((l, i) => '<a class="lr" href="#lecture/' + l.id + '"><span class="n' + (isDone(l.id) ? ' ok' : '') + '">' + (isDone(l.id) ? PP.i('check') : i + 1) + '</span><span class="grow"><b>' + esc(l.title) + '</b><small>' + l.mins + ' min · ' + (l.video ? 'Video' : 'Video coming soon') + '</small></span>' + PP.i('right', 'chev') + '</a>').join('') + '</div>' +
      practiceHtml(m.id);
  }

  /* ---------- 4. Lecture ---------- */
  let curLec = null;
  function renderLecture(l) {
    curLec = l;
    const m = F.module(l.moduleId), ls = PP.lecturesOf(m.id), all = D.lectures.filter((x) => F.module(x.moduleId).open);
    const idx = all.indexOf(l);
    $('lectureBack').href = '#module/' + m.id;
    $('lectureBack').lastChild.textContent = 'Back to ' + m.name;
    $('video').innerHTML = l.video
      ? '<button class="play" type="button" id="playBtn" aria-label="Play video on YouTube">' + PP.i('play') + '</button><span class="vtitle">' + esc(l.title) + '</span><span class="vlen">' + l.mins + ':00</span>'
      : '<div class="novid">' + PP.i('video') + 'Video coming soon<br><small>Your teacher has not added a video for this lesson yet.</small></div>';
    $('lecTitle').textContent = l.title;
    $('lecSub').textContent = F.course(m.courseId).title + ' · ' + m.name + ' · ' + l.mins + ' min';
    $('lecDesc').textContent = l.desc;
    $('lecChip').innerHTML = PP.statusChip(isDone(l.id) ? 'Completed' : 'Not started');
    $('doneBtn').innerHTML = PP.i('check') + (isDone(l.id) ? 'Done' : 'Mark as done (+' + D.rules.lesson + ' pts)');
    $('doneBtn').disabled = isDone(l.id);
    $('prevLec').disabled = idx <= 0;
    $('nextLec').disabled = idx >= all.length - 1;
    $('lecList').innerHTML = '<div class="list-rows">' + ls.map((x, i) => '<a class="lr' + (x.id === l.id ? ' on' : '') + '" href="#lecture/' + x.id + '"><span class="n' + (isDone(x.id) ? ' ok' : '') + '">' + (isDone(x.id) ? PP.i('check') : i + 1) + '</span><span class="grow"><b>' + esc(x.title) + '</b><small>' + x.mins + ' min</small></span></a>').join('') + '</div>';
    $('lecPractice').innerHTML = practiceHtml(m.id);
    const pb = $('playBtn');
    if (pb) pb.onclick = () => window.open(l.video, '_blank', 'noopener');
  }
  $('doneBtn').addEventListener('click', () => {
    const l = curLec; if (!l || isDone(l.id)) return;
    S().done.push(l.id);
    PP.store.earn(D.rules.lesson, 'Finished lesson: ' + l.title);
    const m = F.module(l.moduleId);
    PP.toast(PP.moduleStatus(m) === 'Completed' ? 'Module complete! +' + D.rules.lesson + ' pts' : 'Lesson done! +' + D.rules.lesson + ' pts');
    renderLecture(l);
  });
  const step = (d) => { const all = D.lectures.filter((x) => F.module(x.moduleId).open), i = all.indexOf(curLec); if (all[i + d]) location.hash = '#lecture/' + all[i + d].id; };
  $('prevLec').addEventListener('click', () => step(-1));
  $('nextLec').addEventListener('click', () => step(1));

  /* ---------- Routing ---------- */
  function route() {
    const [name, arg] = (location.hash.replace('#', '') || 'courses').split('/');
    if (name === 'course' && F.course(arg)) { show('course'); renderCourseDetail(F.course(arg)); }
    else if (name === 'module' && F.module(arg) && F.module(arg).open) { show('module'); renderModule(F.module(arg)); }
    else if (name === 'lecture' && F.lecture(arg) && F.module(F.lecture(arg).moduleId).open) { show('lecture'); renderLecture(F.lecture(arg)); }
    else { show('courses'); renderCourses(); }
    PP.hydrate();
  }
  /* the top search box searches courses on this page */
  PP.onGlobalSearch = (q) => { st.q = q; $('courseSearch').value = q; if (location.hash && location.hash !== '#courses') location.hash = '#courses'; else route(); };
  const q0 = new URLSearchParams(location.search).get('q'); if (q0) { st.q = q0; $('courseSearch').value = q0; }
  window.addEventListener('hashchange', route);
  route();
})();
