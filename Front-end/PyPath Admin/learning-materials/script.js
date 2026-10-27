(function () {
  const $ = (id) => document.getElementById(id);
  const esc = PP.esc;
  PP.hydrate();

  /* ---------- Data (shared with the Activities page) ---------- */
  let courses = PP.db.courses.load();
  let lessons = PP.db.lessons.load();
  let videos = PP.db.videos.load();
  let activities = PP.db.activities.load();
  const saveCourses = () => PP.db.courses.save(courses);
  const saveLessons = () => PP.db.lessons.save(lessons);
  const saveVideos = () => PP.db.videos.save(videos);
  const saveActs = () => PP.db.activities.save(activities);

  const courseOf = (id) => courses.find((c) => c.id === id);
  const lessonOf = (id) => lessons.find((l) => l.id === id);
  const courseLessons = (cid) => lessons.filter((l) => l.courseId === cid).sort((a, b) => a.order - b.order);
  const courseActs = (cid) => activities.filter((a) => a.courseId === cid);
  const lessonActs = (lid) => activities.filter((a) => a.lessonId === lid);
  const renumber = (cid) => courseLessons(cid).forEach((l, i) => (l.order = i + 1));
  const lessonOptions = (sel) => courses.map((c) => '<optgroup label="' + esc(c.title) + '">' + courseLessons(c.id).map((l) => '<option value="' + l.id + '"' + (l.id === sel ? ' selected' : '') + '>' + esc(l.title) + '</option>').join('') + '</optgroup>').join('');
  const courseOptions = (sel) => courses.map((c) => '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('');
  const tileHtml = (c, small) => '<span class="ctile ' + c.tone + (small ? ' sm' : '') + '">' + (c.icon === 'python' ? '<img src="../assets/img/logo-icon.png" alt="">' : PP.i(c.icon)) + '</span>';
  const toneFor = { python: 'c-blue', layers: 'c-green', cube: 'c-orange', code: 'c-purple' };
  const nLessons = (n) => n + (n === 1 ? ' lesson' : ' lessons');
  const nActs = (n) => n + (n === 1 ? ' activity' : ' activities');
  const nVideos = (n) => n + (n === 1 ? ' video' : ' videos');

  const views = ['courses', 'course', 'materials', 'lesson', 'video'];
  function show(name) { views.forEach((v) => ($('v-' + v).hidden = v !== name)); window.scrollTo(0, 0); }
  function crumbs(list) {
    const all = [['Learning Materials', '#courses']].concat(list);
    $('crumbs').innerHTML = all.map((c, i) => (i === all.length - 1 || !c[1] ? '<span class="cur" aria-current="page">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>')).join('<span class="sep">›</span>');
  }
  const uniqueTitle = (list, title, selfId, pred) => !list.some((x) => x.id !== selfId && pred(x) && x.title.trim().toLowerCase() === title.toLowerCase());

  /* ---------- Manage Courses ---------- */
  let courseQ = '';
  function renderCourses() {
    const list = courses.filter((c) => !courseQ || c.title.toLowerCase().includes(courseQ) || c.desc.toLowerCase().includes(courseQ));
    $('courseList').innerHTML = list.length ? list.map((c) =>
      '<article class="course-card" data-id="' + c.id + '" tabindex="0" role="link" aria-label="Open ' + esc(c.title) + '">' + tileHtml(c) +
      '<div class="cc-main"><h3>' + esc(c.title) + '</h3><p class="cc-desc">' + esc(c.desc || 'No description yet.') + '</p><p>' + c.level + ' • ' + nLessons(lessons.filter((l) => l.courseId === c.id).length) + ' • ' + nActs(courseActs(c.id).length) + '</p></div>' +
      '<div class="cc-side">' + PP.statusChip(c.status) + '<div class="cc-links"><button data-a="edit">Edit</button><button data-a="view">View Course</button><button class="del" data-a="del">Delete</button></div></div>' +
      '<span class="cc-chev">' + PP.i('right') + '</span></article>').join('')
      : '<div class="empty"><img src="../assets/img/mascot-sad.png" alt="">' + (courseQ ? 'No courses match your search.' : 'No courses yet. Add your first course to get started.') + '</div>';
  }
  $('courseSearch').addEventListener('input', (e) => { courseQ = e.target.value.trim().toLowerCase(); renderCourses(); });
  $('courseList').addEventListener('click', async (e) => {
    const card = e.target.closest('.course-card'); if (!card) return;
    const c = courseOf(+card.dataset.id), a = e.target.closest('[data-a]');
    if (!a || a.dataset.a === 'view') { cdTab = 'lessons'; location.hash = '#course/' + c.id; return; }
    if (a.dataset.a === 'edit') openCourseForm(c);
    if (a.dataset.a === 'del') await deleteCourse(c);
  });
  $('courseList').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList.contains('course-card')) { cdTab = 'lessons'; location.hash = '#course/' + e.target.dataset.id; } });

  let editCourse = null;
  function openCourseForm(c) {
    editCourse = c ? c.id : null;
    $('cTitleH').textContent = c ? 'Edit Course' : 'Add Course';
    $('cName').value = c ? c.title : ''; $('cLevel').value = c ? c.level : 'Beginner'; $('cStatus').value = c ? c.status : 'Draft';
    $('cIcon').value = c ? c.icon : 'python'; $('cDesc').value = c ? c.desc : '';
    $('ecName').textContent = ''; $('cName').classList.remove('bad');
    PP.openModal('courseModal');
  }
  $('addCourse').addEventListener('click', () => openCourseForm(null));
  $('courseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('cName').value.trim();
    const err = !title ? 'Course title is required.' : !uniqueTitle(courses, title, editCourse, () => true) ? 'A course with this title already exists.' : '';
    $('ecName').textContent = err; $('cName').classList.toggle('bad', !!err);
    if (err) return;
    const data = { title, level: $('cLevel').value, status: $('cStatus').value, icon: $('cIcon').value, desc: $('cDesc').value.trim() };
    data.tone = toneFor[data.icon];
    if (editCourse) Object.assign(courseOf(editCourse), data);
    else courses.unshift({ id: PP.store.nextId(courses), students: 0, avg: 0, ...data });
    saveCourses();
    PP.closeModal('courseModal'); PP.toast(editCourse ? 'Course updated' : 'Course added');
    route();
  });
  async function deleteCourse(c) {
    const nl = lessons.filter((l) => l.courseId === c.id).length, na = courseActs(c.id).length;
    if (!(await PP.confirm({ title: 'Delete this course?', text: '“' + c.title + '” will be removed together with its ' + nLessons(nl) + ' and ' + nActs(na) + '. This cannot be undone.' }))) return;
    const ids = lessons.filter((l) => l.courseId === c.id).map((l) => l.id);
    lessons = lessons.filter((l) => l.courseId !== c.id); videos = videos.filter((v) => !ids.includes(v.lessonId));
    activities = activities.filter((a) => a.courseId !== c.id); courses = courses.filter((x) => x.id !== c.id);
    saveLessons(); saveVideos(); saveActs(); saveCourses();
    PP.toast('Course deleted');
    if (location.hash === '#courses') renderCourses(); else location.hash = '#courses';
  }

  /* ---------- Course details (lessons live here) ---------- */
  let cdTab = 'lessons';
  function renderCourseDetail(c) {
    const ls = courseLessons(c.id), acts = courseActs(c.id), pub = ls.filter((l) => l.status === 'Published').length;
    $('courseDetail').innerHTML =
      '<div class="cd-head">' + tileHtml(c) + '<div><h2>' + esc(c.title) + '</h2><div class="sub">' + c.level + ' • ' + nLessons(ls.length) + ' • ' + nActs(acts.length) + '</div></div>' + PP.statusChip(c.status) +
      '<div class="push"><button class="btn btn-primary" id="cdEdit">' + PP.i('edit') + 'Edit Course</button></div></div>' +
      '<div class="cd-tabs" id="cdTabs">' + ['lessons', 'overview', 'students', 'settings'].map((t) => '<button data-t="' + t + '" class="' + (t === cdTab ? 'on' : '') + '">' + t[0].toUpperCase() + t.slice(1) + '</button>').join('') + '</div><div class="cd-body" id="cdBody"></div>';
    const body = {
      overview: () => '<p class="desc">' + esc(c.desc || 'No description yet.') + '</p><div class="mini-stats"><div class="rs"><small>Lessons published</small><b>' + pub + '/' + ls.length + '</b></div><div class="rs"><small>Activities</small><b>' + acts.length + '</b></div><div class="rs"><small>Students</small><b>' + c.students + '</b></div></div><div class="prog-row"><span>Average student progress</span><span>' + c.avg + '%</span></div><div class="bar"><i style="width:' + c.avg + '%"></i></div>',
      lessons: () => '<div class="lessons-bar"><p class="sub">Lessons appear to students in this order. Use the arrows to rearrange them.</p><button class="btn btn-primary btn-sm" id="cdAddLesson">' + PP.i('plus') + 'Add Lesson</button></div>' +
        (ls.length ? '<div class="list-rows lesson-rows">' + ls.map((l, i) => {
          const na = lessonActs(l.id).length;
          return '<div class="lr" data-id="' + l.id + '"><span class="n">' + (i + 1) + '</span><div class="grow"><button class="lesson-link" data-a="edit">' + esc(l.title) + '</button><small class="sub">' + (l.content ? 'Has content' : 'No content yet') + ' • ' + nActs(na) + ' linked</small></div>' + PP.statusChip(l.status) +
            '<div class="acts"><button class="act" data-a="up" title="Move up" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + PP.i('arrowup') + '</button><button class="act" data-a="down" title="Move down" aria-label="Move down"' + (i === ls.length - 1 ? ' disabled' : '') + '><span class="flip">' + PP.i('arrowup') + '</span></button>' +
            '<button class="act" data-a="pub" title="' + (l.status === 'Published' ? 'Unpublish' : 'Publish') + '" aria-label="Toggle publish">' + PP.i(l.status === 'Published' ? 'eyeoff' : 'eye') + '</button><button class="act edit" data-a="edit" title="Edit" aria-label="Edit">' + PP.i('edit') + '</button><button class="act del" data-a="del" title="Delete" aria-label="Delete">' + PP.i('trash') + '</button></div></div>';
        }).join('') + '</div>' : '<div class="empty"><img src="../assets/img/mascot-sad.png" alt="">No lessons in this course yet. Add the first lesson.</div>'),
      students: () => c.students ? '<p class="desc"><b>' + c.students + '</b> students are enrolled in this course.</p><div style="display:flex">' + ['Jasmine Santos', 'Marco Rivera', 'Lian Cruz', 'Aira Delgado', 'Noah Reyes'].map((n) => '<span style="margin-right:-8px">' + PP.avatar(n) + '</span>').join('') + '</div>' : '<div class="empty">No students enrolled yet.</div>',
      settings: () => '<div class="set-row"><div><b>Published</b><small>Students can see and join this course.</small></div><label class="switch"><input type="checkbox" id="cdPub" ' + (c.status === 'Published' ? 'checked' : '') + '><i></i></label></div><div class="set-row"><div><b>Delete course</b><small>This also removes its lessons and activities.</small></div><button class="btn btn-ghost btn-sm" id="cdDel" style="color:var(--red)">' + PP.i('trash') + 'Delete</button></div>'
    };
    const showTab = (t) => {
      cdTab = t; $('cdBody').innerHTML = body[t]();
      document.querySelectorAll('#cdTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
      if ($('cdPub')) $('cdPub').onchange = (e) => { c.status = e.target.checked ? 'Published' : 'Draft'; saveCourses(); PP.toast('Course ' + c.status.toLowerCase()); renderCourseDetail(c); };
      if ($('cdDel')) $('cdDel').onclick = () => deleteCourse(c);
      if ($('cdAddLesson')) $('cdAddLesson').onclick = () => { location.hash = '#lesson/new/' + c.id; };
      $('cdBody').onclick = t !== 'lessons' ? null : async (e) => {
        const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
        const row = b.closest('.lr'); const l = lessonOf(+row.dataset.id), a = b.dataset.a;
        if (a === 'edit') location.hash = '#lesson/' + l.id;
        if (a === 'pub') { l.status = l.status === 'Published' ? 'Draft' : 'Published'; saveLessons(); PP.toast('“' + l.title + '” is now ' + l.status.toLowerCase()); renderCourseDetail(c); }
        if (a === 'up' || a === 'down') {
          const order = courseLessons(c.id), i = order.findIndex((x) => x.id === l.id), j = a === 'up' ? i - 1 : i + 1;
          if (j < 0 || j >= order.length) return;
          [order[i], order[j]] = [order[j], order[i]]; order.forEach((x, k) => (x.order = k + 1)); saveLessons(); renderCourseDetail(c);
        }
        if (a === 'del') await deleteLesson(l, () => renderCourseDetail(c));
      };
    };
    $('cdTabs').onclick = (e) => { const b = e.target.closest('button'); if (b) showTab(b.dataset.t); };
    $('cdEdit').onclick = () => openCourseForm(c);
    showTab(cdTab);
  }

  async function deleteLesson(l, after) {
    const na = lessonActs(l.id).length, nv = videos.filter((v) => v.lessonId === l.id).length;
    const extra = (na ? ' Its ' + nActs(na) + ' will stay in the course but become unlinked.' : '') + (nv ? ' Its ' + nVideos(nv) + ' will be removed.' : '');
    if (!(await PP.confirm({ title: 'Delete “' + l.title + '”?', text: 'This lesson will be removed from the course.' + extra }))) return;
    activities.forEach((a) => { if (a.lessonId === l.id) a.lessonId = null; });
    videos = videos.filter((v) => v.lessonId !== l.id); lessons = lessons.filter((x) => x.id !== l.id); renumber(l.courseId);
    saveActs(); saveVideos(); saveLessons(); PP.toast('Lesson deleted'); after();
  }

  /* ---------- All lessons / videos tables ---------- */
  const st = { tab: 'lessons', q: '', course: '', page: 1, per: 5 };
  const META = {
    lessons: { h: 'All Lessons', sub: 'Every lesson across your courses. Open a course to reorder its lessons.', ph: 'Search lessons…' },
    videos: { h: 'Videos', sub: 'Video lessons attached to lessons.', ph: 'Search videos…' }
  };
  const actsHtml = (id, extra) => '<div class="acts"><button class="act edit" data-a="edit" data-id="' + id + '" title="Edit" aria-label="Edit">' + PP.i('edit') + '</button>' + (extra || '') + '<button class="act del" data-a="del" data-id="' + id + '" title="Delete" aria-label="Delete">' + PP.i('trash') + '</button></div>';
  const pubBtn = (id, pub) => '<button class="act" data-a="pub" data-id="' + id + '" title="' + (pub ? 'Unpublish' : 'Publish') + '" aria-label="Toggle publish">' + PP.i(pub ? 'eyeoff' : 'eye') + '</button>';

  function renderMaterials(tab) {
    if (st.tab !== tab) { st.tab = tab; st.q = ''; st.page = 1; $('matSearch').value = ''; }
    const m = META[tab];
    $('matTitle').textContent = m.h; $('matSub').textContent = m.sub; $('matSearch').placeholder = m.ph;
    $('addLesson').hidden = tab !== 'lessons'; $('addVideo').hidden = tab !== 'videos';
    document.querySelectorAll('#v-materials .lm-tabs .pill').forEach((p) => p.classList.toggle('on', p.dataset.t === tab));
    $('matCourse').innerHTML = '<option value="">All courses</option>' + courses.map((c) => '<option value="' + c.id + '"' + (String(c.id) === st.course ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('');
    const q = st.q.toLowerCase(), cf = st.course ? +st.course : 0;
    let head, rows, list;
    if (tab === 'lessons') {
      list = lessons.filter((x) => (!cf || x.courseId === cf) && (!q || x.title.toLowerCase().includes(q))).sort((a, b) => (a.courseId - b.courseId) || (a.order - b.order));
      head = '<tr><th style="width:56px">#</th><th>Lesson</th><th>Course</th><th>Activities</th><th>Status</th><th style="width:130px">Actions</th></tr>';
      rows = (x) => '<tr><td class="hide-m" data-label="#">' + x.order + '</td><td class="primary cell-strong" data-label="Lesson">' + esc(x.title) + '</td><td data-label="Course">' + esc((courseOf(x.courseId) || {}).title) + '</td><td data-label="Activities">' + lessonActs(x.id).length + '</td><td data-label="Status">' + PP.statusChip(x.status) + '</td><td class="acts-cell">' + actsHtml(x.id, pubBtn(x.id, x.status === 'Published')) + '</td></tr>';
    } else {
      list = videos.filter((x) => { const l = lessonOf(x.lessonId); return (!cf || (l && l.courseId === cf)) && (!q || x.title.toLowerCase().includes(q) || (l && l.title.toLowerCase().includes(q))); });
      head = '<tr><th style="width:56px">#</th><th>Video</th><th>Lesson</th><th>Link</th><th>Status</th><th style="width:130px">Actions</th></tr>';
      rows = (x, i) => '<tr><td class="hide-m" data-label="#">' + i + '</td><td class="primary cell-strong" data-label="Video">' + esc(x.title) + '</td><td data-label="Lesson">' + esc((lessonOf(x.lessonId) || {}).title || '—') + '</td><td data-label="Link"><span class="chip chip-blue">▶ Linked</span></td><td data-label="Status">' + PP.statusChip(x.status) + '</td><td class="acts-cell">' + actsHtml(x.id, pubBtn(x.id, x.status === 'Published')) + '</td></tr>';
    }
    const pages = Math.max(1, Math.ceil(list.length / st.per));
    if (st.page > pages) st.page = pages;
    const start = (st.page - 1) * st.per;
    $('matTable').innerHTML = '<thead>' + head + '</thead><tbody>' + (list.length ? list.slice(start, start + st.per).map((x, i) => rows(x, start + i + 1)).join('') : '<tr><td colspan="6" class="empty"><img src="../assets/img/mascot-sad.png" alt="">Nothing found.</td></tr>') + '</tbody>';
    PP.pager($('pager'), { total: list.length, page: st.page, per: st.per, onPage: (p) => { st.page = p; renderMaterials(tab); }, onPer: (n) => { st.per = n; st.page = 1; renderMaterials(tab); } });
  }
  $('matSearch').addEventListener('input', (e) => { st.q = e.target.value.trim(); st.page = 1; renderMaterials(st.tab); });
  $('matCourse').addEventListener('change', (e) => { st.course = e.target.value; st.page = 1; renderMaterials(st.tab); });
  $('addLesson').addEventListener('click', () => { location.hash = '#lesson/new' + (st.course ? '/' + st.course : ''); });
  $('addVideo').addEventListener('click', () => { location.hash = '#video/new'; });

  $('matTable').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const id = +b.dataset.id, tab = st.tab;
    const item = (tab === 'lessons' ? lessons : videos).find((x) => x.id === id);
    if (b.dataset.a === 'edit') location.hash = '#' + (tab === 'lessons' ? 'lesson' : 'video') + '/' + id;
    if (b.dataset.a === 'pub') { item.status = item.status === 'Published' ? 'Draft' : 'Published'; (tab === 'lessons' ? saveLessons : saveVideos)(); PP.toast('Now ' + item.status.toLowerCase()); renderMaterials(tab); }
    if (b.dataset.a === 'del') {
      if (tab === 'lessons') { await deleteLesson(item, () => renderMaterials(tab)); return; }
      if (!(await PP.confirm({ title: 'Delete “' + item.title + '”?', text: 'This cannot be undone.' }))) return;
      videos = videos.filter((x) => x.id !== id); saveVideos(); PP.toast('Deleted'); renderMaterials(tab);
    }
  });

  /* ---------- Lesson editor ---------- */
  let editLesson = null, lessonCourse = null;
  const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  function lessonPreview() {
    const title = $('sTitle').value.trim(), obj = lines($('sObj').value), content = $('sContent').value.trim(), code = $('sCode').value, out = $('sOut').value.trim(), prac = $('sPractice').value.trim();
    const c = courseOf(+$('sCourse').value);
    let h = '<div class="lp-eyebrow">' + esc(c ? c.title : 'Course') + '</div><h3 class="lp-title">' + esc(title || 'Lesson title') + '</h3>';
    if (obj.length) h += '<div class="lp-sec"><b>Objectives</b><ul>' + obj.map((o) => '<li>' + esc(o) + '</li>').join('') + '</ul></div>';
    h += content ? '<div class="lp-sec">' + content.split(/\n\s*\n/).map((p) => '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>').join('') + '</div>' : '<p class="sub">Lesson content will appear here.</p>';
    if (code.trim()) h += '<div class="lp-sec"><b>Code example</b>' + PP.codeBlock(code) + '</div>';
    if (out) h += '<div class="lp-sec"><div class="output"><small>Expected output</small>' + esc(out) + '</div></div>';
    if (prac) h += '<div class="lp-sec lp-practice"><b>Try it yourself</b><p>' + esc(prac) + '</p></div>';
    $('lessonPrev').innerHTML = h;
  }
  function renderLesson(id, cid) {
    const l = id === 'new' ? null : lessonOf(+id);
    if (id !== 'new' && !l) { location.hash = '#courses'; return; }
    if (!courses.length) { PP.toast('Add a course before adding lessons.', 'error'); location.hash = '#courses'; return; }
    editLesson = l ? l.id : null;
    lessonCourse = l ? l.courseId : (courseOf(+cid) ? +cid : courses[0].id);
    const c = courseOf(lessonCourse);
    crumbs([[c.title, '#course/' + c.id], [l ? l.title : 'New lesson']]);
    $('lsTitleH').textContent = l ? 'Edit Lesson' : 'Add Lesson';
    $('sCourse').innerHTML = '<option value="">Select course</option>' + courseOptions(lessonCourse);
    $('sTitle').value = l ? l.title : ''; $('sStatus').value = l ? l.status : 'Draft'; $('sObj').value = l ? l.objectives : ''; $('sContent').value = l ? l.content : '';
    $('sCode').value = l ? l.code : ''; $('sOut').value = l ? l.output : ''; $('sPractice').value = l ? l.practice : '';
    ['esTitle', 'esCourse', 'esContent'].forEach((k) => ($(k).textContent = '')); ['sTitle', 'sCourse', 'sContent'].forEach((k) => $(k).classList.remove('bad'));
    const la = l ? lessonActs(l.id) : [];
    $('linkedField').hidden = !l;
    if (l) $('linkedList').innerHTML = (la.length ? '<div class="linked">' + la.map((a) => '<a class="chip chip-' + (a.type === 'quiz' ? 'purple' : 'blue') + '" href="../activities/index.html#edit/' + a.id + '">' + (a.type === 'quiz' ? 'Quiz' : 'Exercise') + ': ' + esc(a.title) + ' · ' + a.diff + '</a>').join('') + '</div>' : '<p class="sub">No activities are linked to this lesson yet.</p>') +
      '<a class="add-link" href="../activities/index.html#new/' + l.courseId + '/' + l.id + '">' + PP.i('plus') + 'Add an activity for this lesson</a>';
    lessonPreview();
  }
  ['sTitle', 'sObj', 'sContent', 'sCode', 'sOut', 'sPractice', 'sCourse'].forEach((k) => $(k).addEventListener('input', lessonPreview));
  $('cancelLesson').addEventListener('click', () => { cdTab = 'lessons'; location.hash = '#course/' + (editLesson ? lessonOf(editLesson).courseId : lessonCourse); });
  $('lessonForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('sTitle').value.trim(), cid = +$('sCourse').value, content = $('sContent').value.trim(), status = $('sStatus').value;
    const errs = {
      esTitle: !title ? 'Lesson title is required.' : cid && !uniqueTitle(lessons, title, editLesson, (x) => x.courseId === cid) ? 'This course already has a lesson with this title.' : '',
      esCourse: cid ? '' : 'Choose a course.',
      esContent: status === 'Published' && !content ? 'Add lesson content before publishing.' : ''
    };
    Object.keys(errs).forEach((k) => ($(k).textContent = errs[k]));
    $('sTitle').classList.toggle('bad', !!errs.esTitle); $('sCourse').classList.toggle('bad', !!errs.esCourse); $('sContent').classList.toggle('bad', !!errs.esContent);
    if (Object.values(errs).some(Boolean)) return;
    const data = { title, courseId: cid, status, objectives: lines($('sObj').value).join('\n'), content, code: $('sCode').value.replace(/\s+$/, ''), output: $('sOut').value.replace(/\s+$/, ''), practice: $('sPractice').value.trim() };
    if (editLesson) {
      const l = lessonOf(editLesson), moved = l.courseId !== cid, old = l.courseId;
      Object.assign(l, data);
      if (moved) { l.order = courseLessons(cid).length + 1; renumber(old); renumber(cid); activities.forEach((a) => { if (a.lessonId === l.id) a.lessonId = null; }); saveActs(); }
    } else { data.id = PP.store.nextId(lessons, 100); data.order = courseLessons(cid).length + 1; lessons.push(data); }
    saveLessons(); PP.toast(editLesson ? 'Lesson updated' : 'Lesson added'); cdTab = 'lessons'; location.hash = '#course/' + cid;
  });

  /* ---------- Video form ---------- */
  let editVid = null;
  const ytId = (u) => { const m = String(u).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/); return m ? m[1] : ''; };
  function videoPreview() {
    const t = $('lTitle').value.trim(), v = $('lVideo').value.trim();
    $('videoPrev').querySelector('.vtitle') && $('videoPrev').querySelector('.vtitle').remove();
    if (t) $('videoPrev').insertAdjacentHTML('beforeend', '<span class="vtitle">' + esc(t) + '</span>');
    $('videoCap').textContent = v ? (ytId(v) ? 'YouTube video · ' + ytId(v) : 'Video linked') : 'Video Preview';
  }
  function renderVideo(id) {
    const l = id === 'new' ? null : videos.find((x) => x.id === +id);
    if (id !== 'new' && !l) { location.hash = '#videos'; return; }
    editVid = l ? l.id : null;
    $('vidTitle').textContent = l ? 'Edit Video' : 'Add Video';
    $('lLesson').innerHTML = '<option value="">Select lesson</option>' + lessonOptions(l && l.lessonId);
    $('lTitle').value = l ? l.title : ''; $('lStatus').value = l ? l.status : 'Draft'; $('lVideo').value = l ? l.video : ''; $('lDesc').value = l ? l.desc : '';
    ['elTitle', 'elLesson', 'elVideo'].forEach((x) => ($(x).textContent = ''));
    ['lTitle', 'lLesson', 'lVideo'].forEach((x) => $(x).classList.remove('bad'));
    videoPreview();
  }
  ['lTitle', 'lVideo'].forEach((x) => $(x).addEventListener('input', videoPreview));
  $('videoPrev').querySelector('.play').addEventListener('click', () => PP.toast('Preview only. The video plays for students.'));
  $('videoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('lTitle').value.trim(), les = $('lLesson').value, video = $('lVideo').value.trim();
    const errs = { elTitle: title ? '' : 'Video title is required.', elLesson: les ? '' : 'Choose a lesson.', elVideo: !video ? 'Video link is required.' : /^https?:\/\/\S+$/i.test(video) ? '' : 'Enter a valid link starting with http:// or https://' };
    Object.keys(errs).forEach((k) => ($(k).textContent = errs[k]));
    $('lTitle').classList.toggle('bad', !!errs.elTitle); $('lLesson').classList.toggle('bad', !!errs.elLesson); $('lVideo').classList.toggle('bad', !!errs.elVideo);
    if (Object.values(errs).some(Boolean)) return;
    const data = { title, lessonId: +les, video, desc: $('lDesc').value.trim(), status: $('lStatus').value };
    if (editVid) Object.assign(videos.find((x) => x.id === editVid), data); else videos.push({ id: PP.store.nextId(videos, 200), ...data });
    saveVideos(); PP.toast(editVid ? 'Video updated' : 'Video saved'); location.hash = '#videos';
  });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-back]'); if (b) location.hash = '#' + b.dataset.back; });

  /* ---------- Routing ---------- */
  function route() {
    let [name, arg, arg2] = (location.hash.replace('#', '') || 'courses').split('/');
    const alias = { modules: 'lessons', lectures: 'videos', lecture: 'video', module: 'lesson' };
    if (alias[name]) name = alias[name];
    if (name === 'exercises' || name === 'exercise') { location.replace('../activities/index.html'); return; }
    PP.setActive('learning');
    if (name === 'course') {
      const c = courseOf(+arg); if (!c) { location.hash = '#courses'; return; }
      if (['overview', 'students', 'settings', 'lessons'].includes(arg2)) cdTab = arg2;
      crumbs([[c.title]]); show('course'); renderCourseDetail(c);
    } else if (name === 'lessons' || name === 'videos') {
      crumbs([[name === 'lessons' ? 'All Lessons' : 'Videos']]); show('materials'); renderMaterials(name);
    } else if (name === 'lesson') { show('lesson'); renderLesson(arg || 'new', arg2); }
    else if (name === 'video') { crumbs([['Videos', '#videos'], [arg && arg !== 'new' ? 'Edit video' : 'New video']]); show('video'); renderVideo(arg || 'new'); }
    else { crumbs([['Manage Courses']]); show('courses'); renderCourses(); }
  }
  window.addEventListener('hashchange', route);
  route();
})();
