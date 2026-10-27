(function () {
  const $ = (id) => document.getElementById(id);
  const esc = PP.esc;
  PP.hydrate();

  /* ---------- Data (shared with Learning Materials) ---------- */
  const courses = PP.db.courses.load();
  const lessons = PP.db.lessons.load();
  let activities = PP.db.activities.load();
  const save = () => PP.db.activities.save(activities);
  const courseOf = (id) => courses.find((c) => c.id === id);
  const lessonOf = (id) => lessons.find((l) => l.id === id);
  const courseLessons = (cid) => lessons.filter((l) => l.courseId === cid).sort((a, b) => a.order - b.order);
  const letter = (i) => String.fromCharCode(65 + i);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const DIFF = {
    Easy: { icon: 'star', text: 'Basic questions and beginner-friendly Python exercises.' },
    Medium: { icon: 'chart', text: 'Intermediate questions that require applying programming concepts.' },
    Hard: { icon: 'award', text: 'Advanced programming challenges and problem-solving exercises.' }
  };
  const st = { q: '', diff: '', course: '', type: '', status: '', page: 1, per: 5 };
  const views = ['list', 'form', 'results'];
  const show = (n) => { views.forEach((v) => ($('v-' + v).hidden = v !== n)); window.scrollTo(0, 0); };
  function crumbs(list) {
    const all = [['Activities', '#list']].concat(list);
    $('crumbs').innerHTML = all.map((c, i) => (i === all.length - 1 || !c[1] ? '<span class="cur" aria-current="page">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>')).join('<span class="sep">›</span>');
  }
  const typeChip = (t) => PP.chip(t === 'quiz' ? 'Quiz' : 'Exercise', t === 'quiz' ? 'purple' : 'blue');
  const where = (a) => { const c = courseOf(a.courseId), l = lessonOf(a.lessonId); return { course: c ? c.title : '—', lesson: l ? l.title : 'Whole course' }; };

  /* ---------- Difficulty cards ---------- */
  function renderCards() {
    $('diffCards').innerHTML = Object.keys(DIFF).map((d) => {
      const all = activities.filter((a) => a.diff === d), pub = all.filter((a) => a.status === 'Published').length, dr = all.length - pub;
      return '<button type="button" class="diff-card d-' + d.toLowerCase() + (st.diff === d ? ' on' : '') + '" data-d="' + d + '" aria-pressed="' + (st.diff === d) + '">' +
        '<span class="tile">' + PP.i(DIFF[d].icon) + '</span><h3>' + d + '</h3><p>' + DIFF[d].text + '</p>' +
        '<div class="count">' + pub + ' available <small>' + (dr ? '· ' + dr + (dr === 1 ? ' draft' : ' drafts') : '') + '</small></div>' +
        '<span class="btn btn-soft btn-sm go">' + (st.diff === d ? 'Showing ' + d : 'View ' + d + ' activities') + '</span></button>';
    }).join('');
  }
  function setDiff(d) {
    st.diff = d; st.page = 1;
    document.querySelectorAll('#diffFilter .pill').forEach((p) => p.classList.toggle('on', p.dataset.d === d));
    renderCards(); renderList();
  }
  $('diffCards').addEventListener('click', (e) => {
    const b = e.target.closest('.diff-card'); if (!b) return;
    setDiff(st.diff === b.dataset.d ? '' : b.dataset.d);
    if (st.diff) $('rows').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- List ---------- */
  function renderList() {
    const q = st.q.toLowerCase();
    $('courseFilter').innerHTML = '<option value="">All courses</option>' + courses.map((c) => '<option value="' + c.id + '"' + (String(c.id) === st.course ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('');
    const list = activities.filter((a) => (!q || a.title.toLowerCase().includes(q) || where(a).lesson.toLowerCase().includes(q)) && (!st.diff || a.diff === st.diff) && (!st.course || a.courseId === +st.course) && (!st.type || a.type === st.type) && (!st.status || a.status === st.status));
    const pages = Math.max(1, Math.ceil(list.length / st.per));
    if (st.page > pages) st.page = pages;
    const start = (st.page - 1) * st.per;
    $('rows').innerHTML = list.length ? list.slice(start, start + st.per).map((x, i) => {
      const w = where(x);
      return '<tr><td class="hide-m" data-label="#">' + (start + i + 1) + '</td>' +
        '<td class="primary cell-strong" data-label="Activity">' + esc(x.title) + '<span class="cell-sub">' + (x.type === 'quiz' ? x.qs.length + (x.qs.length === 1 ? ' question' : ' questions') : (x.validation === 'manual' ? 'Manual review' : 'Auto-checked')) + '</span></td>' +
        '<td data-label="Course · Lesson">' + esc(w.course) + '<span class="cell-sub">' + esc(w.lesson) + '</span></td>' +
        '<td data-label="Type">' + typeChip(x.type) + '</td>' +
        '<td data-label="Level">' + PP.statusChip(x.diff) + '</td>' +
        '<td data-label="Points">' + PP.actPoints(x) + '</td>' +
        '<td data-label="Status">' + PP.statusChip(x.status) + '</td>' +
        '<td class="acts-cell"><div class="acts">' +
          '<button class="act" data-a="results" data-id="' + x.id + '" title="View results" aria-label="View results">' + PP.i('chart') + '</button>' +
          '<button class="act" data-a="pub" data-id="' + x.id + '" title="' + (x.status === 'Published' ? 'Unpublish' : 'Publish') + '" aria-label="Toggle publish">' + PP.i(x.status === 'Published' ? 'eyeoff' : 'eye') + '</button>' +
          '<button class="act edit" data-a="edit" data-id="' + x.id + '" title="Edit" aria-label="Edit">' + PP.i('edit') + '</button>' +
          '<button class="act del" data-a="del" data-id="' + x.id + '" title="Delete" aria-label="Delete">' + PP.i('trash') + '</button></div></td></tr>';
    }).join('')
      : '<tr><td colspan="8" class="empty"><img src="../assets/img/mascot-sad.png" alt="">' + (activities.length ? 'No activities match your filters.' : 'No activities yet. Add your first quiz or exercise.') + '</td></tr>';
    PP.pager($('pager'), { total: list.length, page: st.page, per: st.per, onPage: (p) => { st.page = p; renderList(); }, onPer: (n) => { st.per = n; st.page = 1; renderList(); } });
  }
  $('search').addEventListener('input', (e) => { st.q = e.target.value.trim(); st.page = 1; renderList(); });
  $('courseFilter').addEventListener('change', (e) => { st.course = e.target.value; st.page = 1; renderList(); });
  $('typeFilter').addEventListener('change', (e) => { st.type = e.target.value; st.page = 1; renderList(); });
  $('statusFilter').addEventListener('change', (e) => { st.status = e.target.value; st.page = 1; renderList(); });
  $('diffFilter').addEventListener('click', (e) => { const b = e.target.closest('.pill'); if (b) setDiff(b.dataset.d); });
  $('rows').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const x = activities.find((z) => z.id === +b.dataset.id);
    if (b.dataset.a === 'edit') location.hash = '#edit/' + x.id;
    if (b.dataset.a === 'results') location.hash = '#results/' + x.id;
    if (b.dataset.a === 'pub') {
      if (x.status === 'Draft' && x.type === 'quiz' && !x.qs.length) { PP.toast('Add questions before publishing.', 'error'); return; }
      if (x.status === 'Draft' && x.type === 'exercise' && !x.instr.trim()) { PP.toast('Add instructions before publishing.', 'error'); return; }
      x.status = x.status === 'Published' ? 'Draft' : 'Published'; save(); PP.toast('“' + x.title + '” is now ' + x.status.toLowerCase()); renderCards(); renderList();
    }
    if (b.dataset.a === 'del' && await PP.confirm({ title: 'Delete this activity?', text: '“' + x.title + '”' + (x.type === 'quiz' ? ' and its ' + x.qs.length + ' question(s)' : '') + ' will be removed. Student attempts for it will no longer be shown.' })) {
      activities = activities.filter((z) => z.id !== x.id); save(); PP.toast('Activity deleted'); renderCards(); renderList();
    }
  });
  $('addAct').addEventListener('click', () => { location.hash = '#new'; });

  /* ---------- Form ---------- */
  let form = null, selQ = 0;
  const freshQ = (kind) => kind === 'tf' ? { text: '', kind: 'tf', opts: ['True', 'False'], correct: 0, points: 1, feedback: '' } : { text: '', kind: 'mc', opts: ['', '', '', ''], correct: 0, points: 1, feedback: '' };
  const totalPts = () => form.qs.reduce((s, q) => s + (+q.points || 0), 0);

  function lessonSelect() {
    $('aLesson').innerHTML = '<option value="">Whole course (no specific lesson)</option>' + courseLessons(form.courseId).map((l) => '<option value="' + l.id + '"' + (l.id === form.lessonId ? ' selected' : '') + '>' + esc(l.title) + '</option>').join('');
  }
  function setType(t) { form.type = t; $('quizBox').hidden = t !== 'quiz'; $('exBox').hidden = t !== 'exercise'; document.querySelector('input[name=atype][value="' + t + '"]').checked = true; renderPreview(); }
  function syncEx() {
    form.instr = $('xInstr').value; form.code = $('xCode').value; form.validation = $('xVal').value; form.expected = $('xExp').value;
    form.pts = +$('xPts').value || 0; form.feedbackOk = $('xOk').value; form.feedbackBad = $('xBad').value;
    $('expField').hidden = form.validation !== 'output';
  }

  function renderQs() {
    $('qList').innerHTML = form.qs.map((q, qi) =>
      '<div class="q-card ' + (qi === selQ ? 'sel' : '') + '" data-qi="' + qi + '">' +
      '<div class="q-top"><b>Question ' + (qi + 1) + '</b><div class="q-ctl">' +
        '<select class="select q-kind" data-qi="' + qi + '" aria-label="Question type"><option value="mc"' + (q.kind === 'mc' ? ' selected' : '') + '>Multiple choice</option><option value="tf"' + (q.kind === 'tf' ? ' selected' : '') + '>True or False</option></select>' +
        '<input class="input pts q-pts" type="number" min="1" data-qi="' + qi + '" value="' + q.points + '" aria-label="Points for question ' + (qi + 1) + '"><span class="sub">pts</span>' +
        '<button type="button" data-rm="' + qi + '">' + PP.i('trash') + 'Remove</button></div></div>' +
      '<input class="input q-text" data-qi="' + qi + '" placeholder="Type the question…" value="' + esc(q.text) + '" aria-label="Question ' + (qi + 1) + ' text">' +
      q.opts.map((o, oi) => '<div class="opt-row"><span class="letter">' + letter(oi) + '</span>' +
        (q.kind === 'tf' ? '<span class="tf-label">' + esc(o) + '</span>' : '<input class="input q-opt" data-qi="' + qi + '" data-oi="' + oi + '" placeholder="Option ' + letter(oi) + '" value="' + esc(o) + '" aria-label="Option ' + letter(oi) + '">') +
        '<label class="radio" title="Mark as correct answer"><input type="radio" name="c' + qi + '" data-qi="' + qi + '" data-oi="' + oi + '" ' + (q.correct === oi ? 'checked' : '') + ' aria-label="Correct answer ' + letter(oi) + '"></label></div>').join('') +
      '<div class="hint">Select the radio button next to the correct answer.</div>' +
      '<textarea class="textarea q-fb" data-qi="' + qi + '" placeholder="Feedback shown after submission (optional)" aria-label="Feedback for question ' + (qi + 1) + '">' + esc(q.feedback) + '</textarea></div>').join('');
    $('totalPts').textContent = totalPts();
    renderPreview();
  }

  function renderPreview() {
    const c = courseOf(form.courseId), l = lessonOf(form.lessonId);
    const meta = '<div class="pv-meta">' + typeChip(form.type) + PP.statusChip(form.diff) + (c ? PP.chip(c.title + (l ? ' › ' + l.title : ''), 'blue') : '') + '</div>';
    if (form.type === 'quiz') {
      if (!form.qs.length) { $('prev').innerHTML = meta + '<div class="pv-empty"><img src="../assets/img/mascot-wave.png" alt="">Add a question to see how students will view it.</div>'; return; }
      if (selQ >= form.qs.length) selQ = form.qs.length - 1;
      const q = form.qs[selQ];
      $('prev').innerHTML = meta +
        '<div class="pv-nav">' + form.qs.map((_, i) => '<button type="button" data-pv="' + i + '" class="' + (i === selQ ? 'on' : '') + '" aria-label="Preview question ' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</div>' +
        '<p class="pv-q">Q' + (selQ + 1) + '. ' + esc(q.text || 'Your question will appear here') + '</p>' +
        q.opts.map((o, i) => '<div class="pv-opt ' + (i === q.correct ? 'ok' : '') + '"><span class="dotr"></span>' + (q.kind === 'tf' ? '' : letter(i) + ') ') + esc(o || 'Option ' + letter(i)) + '</div>').join('') +
        (q.feedback ? '<p class="pv-expl"><b>Feedback:</b> ' + esc(q.feedback) + '</p>' : '');
    } else {
      $('prev').innerHTML = meta + '<p class="pv-q">' + esc($('aTitle').value.trim() || 'Exercise title') + '</p>' +
        '<p class="sub" style="margin-bottom:12px;font-size:13.5px">' + esc(form.instr || 'Instructions will appear here.') + '</p>' +
        PP.codeBlock(form.code || '# your code here') +
        (form.validation === 'output' ? '<div class="output"><small>Expected output</small>' + esc(form.expected || '—') + '</div>' : '<p class="pv-expl">This answer is reviewed by a teacher.</p>') +
        '<p class="pv-expl">Worth <b>' + (form.pts || 0) + '</b> points.</p>';
    }
  }

  function addQuestion(kind) {
    form.qs.push(freshQ(kind)); selQ = form.qs.length - 1; renderQs(); $('eQs').textContent = '';
    const el = document.querySelector('.q-card[data-qi="' + selQ + '"] .q-text'); if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  $('addQ').addEventListener('click', () => addQuestion('mc'));
  $('qList').addEventListener('input', (e) => {
    const t = e.target, qi = +t.dataset.qi; if (isNaN(qi) || t.type === 'radio') return;
    if (t.classList.contains('q-text')) form.qs[qi].text = t.value;
    if (t.classList.contains('q-opt')) form.qs[qi].opts[+t.dataset.oi] = t.value;
    if (t.classList.contains('q-fb')) form.qs[qi].feedback = t.value;
    if (t.classList.contains('q-pts')) { form.qs[qi].points = +t.value || 0; $('totalPts').textContent = totalPts(); }
    selQ = qi; renderPreview();
    document.querySelectorAll('.q-card').forEach((c, i) => c.classList.toggle('sel', i === qi));
  });
  $('qList').addEventListener('change', (e) => {
    const t = e.target, qi = +t.dataset.qi; if (isNaN(qi)) return;
    if (t.type === 'radio') { form.qs[qi].correct = +t.dataset.oi; selQ = qi; renderPreview(); }
    if (t.classList.contains('q-kind')) { const old = form.qs[qi], n = freshQ(t.value); n.text = old.text; n.points = old.points; n.feedback = old.feedback; form.qs[qi] = n; selQ = qi; renderQs(); }
  });
  $('qList').addEventListener('focusin', (e) => {
    const c = e.target.closest('.q-card'); if (!c || +c.dataset.qi === selQ) return;
    selQ = +c.dataset.qi; renderPreview(); document.querySelectorAll('.q-card').forEach((x, i) => x.classList.toggle('sel', i === selQ));
  });
  $('qList').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { form.qs.splice(+b.dataset.rm, 1); selQ = Math.max(0, selQ - (selQ >= +b.dataset.rm ? 1 : 0)); renderQs(); } });
  $('prev').addEventListener('click', (e) => { const b = e.target.closest('[data-pv]'); if (b) { selQ = +b.dataset.pv; renderQs(); } });

  $('typeRadios').addEventListener('change', (e) => { setType(e.target.value); if (form.type === 'exercise' && !form.pts) { form.pts = 10; $('xPts').value = 10; } });
  document.querySelector('#v-form .radios input[name=diff]').closest('.radios').addEventListener('change', (e) => { form.diff = e.target.value; renderPreview(); });
  $('aCourse').addEventListener('change', (e) => {
    form.courseId = +e.target.value;
    const l = lessonOf(form.lessonId); if (!l || l.courseId !== form.courseId) form.lessonId = null;
    lessonSelect(); renderPreview();
  });
  $('aLesson').addEventListener('change', (e) => { form.lessonId = e.target.value ? +e.target.value : null; renderPreview(); });
  ['xInstr', 'xCode', 'xVal', 'xExp', 'xPts', 'xOk', 'xBad'].forEach((k) => { $(k).addEventListener('input', () => { syncEx(); renderPreview(); }); $(k).addEventListener('change', () => { syncEx(); renderPreview(); }); });
  $('aTitle').addEventListener('input', renderPreview);

  function openForm(id, cid, lid) {
    const x = id === 'new' ? null : activities.find((z) => z.id === +id);
    if (id !== 'new' && !x) { location.hash = '#list'; return; }
    if (!courses.length) { PP.toast('Add a course before adding activities.', 'error'); location.hash = '#list'; return; }
    const cc = courseOf(+cid) ? +cid : courses[0].id, ll = lessonOf(+lid);
    form = x ? clone(x) : { id: null, type: 'quiz', title: '', courseId: cc, lessonId: ll && ll.courseId === cc ? ll.id : null, diff: 'Easy', status: 'Draft', pass: 60, qs: [], pts: 10, instr: '', code: '', validation: 'output', expected: '', feedbackOk: '', feedbackBad: '' };
    selQ = 0;
    crumbs([[x ? x.title : 'New activity']]);
    $('formTitle').textContent = x ? 'Edit Activity' : 'Add Activity';
    $('aTitle').value = form.title; $('aStatus').value = form.status; $('aPass').value = form.pass || 60;
    $('aCourse').innerHTML = courses.map((c) => '<option value="' + c.id + '"' + (c.id === form.courseId ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('');
    lessonSelect();
    document.querySelector('input[name=diff][value="' + form.diff + '"]').checked = true;
    $('xInstr').value = form.instr; $('xCode').value = form.code; $('xVal').value = form.validation; $('xExp').value = form.expected; $('xPts').value = form.pts || 10; $('xOk').value = form.feedbackOk; $('xBad').value = form.feedbackBad;
    $('expField').hidden = form.validation !== 'output';
    ['eTitle', 'eCourse', 'eQs', 'ePass', 'eInstr', 'ePts', 'eExp'].forEach((k) => ($(k).textContent = '')); ['aTitle', 'aCourse', 'aPass', 'xInstr', 'xPts', 'xExp'].forEach((k) => $(k).classList.remove('bad'));
    renderQs(); setType(form.type); show('form');
  }
  $('cancelForm').addEventListener('click', () => { location.hash = '#list'; });
  $('aStatus').addEventListener('change', () => {});
  $('actForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('aTitle').value.trim(), cid = form.courseId, quiz = form.type === 'quiz';
    syncEx();
    const err = { eTitle: '', eCourse: '', eQs: '', ePass: '', eInstr: '', ePts: '', eExp: '' };
    if (!title) err.eTitle = 'Activity title is required.';
    else if (activities.some((a) => a.id !== form.id && a.courseId === cid && a.title.toLowerCase() === title.toLowerCase())) err.eTitle = 'This course already has an activity with this title.';
    if (!cid || !courseOf(cid)) err.eCourse = 'Choose a course.';
    if (quiz) {
      const pass = +$('aPass').value;
      if (!(pass >= 1 && pass <= 100)) err.ePass = 'Enter a passing score from 1 to 100.';
      if (!form.qs.length) err.eQs = 'Add at least one question.';
      else {
        const bad = form.qs.findIndex((q) => !q.text.trim() || q.opts.some((o) => !o.trim()) || !(q.points >= 1));
        if (bad > -1) { err.eQs = 'Question ' + (bad + 1) + ' needs a question, every answer choice and at least 1 point.'; selQ = bad; renderQs(); }
      }
    } else {
      if (!form.instr.trim()) err.eInstr = 'Add the problem description and instructions.';
      if (!(form.pts >= 1)) err.ePts = 'Enter points of 1 or more.';
      if (form.validation === 'output' && !form.expected.trim()) err.eExp = 'Add the expected output, or switch to manual review.';
    }
    Object.keys(err).forEach((k) => ($(k).textContent = err[k]));
    $('aTitle').classList.toggle('bad', !!err.eTitle); $('aCourse').classList.toggle('bad', !!err.eCourse); $('aPass').classList.toggle('bad', !!err.ePass);
    $('xInstr').classList.toggle('bad', !!err.eInstr); $('xPts').classList.toggle('bad', !!err.ePts); $('xExp').classList.toggle('bad', !!err.eExp);
    if (Object.values(err).some(Boolean)) return;
    const rec = { type: form.type, title, courseId: cid, lessonId: form.lessonId, diff: form.diff, status: $('aStatus').value };
    if (quiz) Object.assign(rec, { pass: +$('aPass').value, qs: form.qs.map((q) => ({ text: q.text.trim(), kind: q.kind, opts: q.opts.map((o) => o.trim()), correct: q.correct, points: +q.points, feedback: q.feedback.trim() })), pts: 0, instr: '', code: '', expected: '', validation: 'output', feedbackOk: '', feedbackBad: '' });
    else Object.assign(rec, { qs: [], pass: 60, pts: Math.round(form.pts), instr: form.instr.trim(), code: form.code.replace(/\s+$/, ''), validation: form.validation, expected: form.validation === 'output' ? form.expected.replace(/\s+$/, '') : '', feedbackOk: form.feedbackOk.trim(), feedbackBad: form.feedbackBad.trim() });
    if (form.id) Object.assign(activities.find((z) => z.id === form.id), rec); else activities.push({ id: PP.store.nextId(activities, 300), ...rec });
    save(); PP.toast(form.id ? 'Activity updated' : 'Activity saved'); location.hash = '#list';
  });

  /* ---------- Results (sample attempts) ---------- */
  const STUDENTS = ['Jasmine Santos', 'Marco Rivera', 'Lian Cruz', 'Aira Delgado'];
  function attemptQuiz(quiz, si) {
    const answers = quiz.qs.map((q, qi) => {
      const wrong = (si * 7 + qi * 3 + quiz.id) % 5 === 0 && !(si === 0 && qi === 0);
      const n = q.opts.length, pick = wrong ? (q.correct + 1 + ((qi + si) % (n - 1))) % n : q.correct;
      return { q, pick, ok: pick === q.correct };
    });
    const earned = answers.reduce((s, a) => s + (a.ok ? +a.q.points || 0 : 0), 0), total = PP.quizPoints(quiz) || 1, pct = Math.round((earned / total) * 100);
    const secs = 150 + (si * 53 + quiz.id * 41) % 260;
    return { answers, earned, total, pct, ok: answers.filter((a) => a.ok).length, time: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') };
  }
  function renderResults(a) {
    const w = where(a);
    crumbs([[a.title, '#edit/' + a.id], ['Results']]);
    $('resTitle').textContent = (a.type === 'quiz' ? 'Quiz' : 'Exercise') + ' Results – ' + a.title;
    $('studentSel').hidden = a.type !== 'quiz';
    if (a.type === 'quiz') {
      if (!$('studentSel').options.length) $('studentSel').innerHTML = STUDENTS.map((s, i) => '<option value="' + i + '">' + s + '</option>').join('');
      const draw = () => {
        if (!a.qs.length) { $('resStats').innerHTML = ''; $('resTable').innerHTML = '<tbody><tr><td class="empty"><img src="../assets/img/mascot-sad.png" alt="">This quiz has no questions yet, so there are no results.</td></tr></tbody>'; return; }
        const r = attemptQuiz(a, +$('studentSel').value), pass = r.pct >= (a.pass || 60);
        $('resStats').innerHTML = '<div class="rs"><small>Score</small><b>' + r.pct + '%</b></div><div class="rs"><small>Points</small><b>' + r.earned + '/' + r.total + '</b></div><div class="rs"><small>Time</small><b>' + r.time + '</b></div><div class="rs"><small>Status (pass ' + (a.pass || 60) + '%)</small><div style="margin-top:6px">' + PP.statusChip(pass ? 'Passed' : 'Failed') + '</div></div>';
        $('resTable').innerHTML = '<thead><tr><th style="width:56px">#</th><th>Question</th><th>Student’s Answer</th><th>Correct Answer</th><th>Result</th></tr></thead><tbody>' + r.answers.map((x, i) =>
          '<tr><td class="hide-m" data-label="#">' + (i + 1) + '</td><td class="primary cell-strong" data-label="Question">' + esc(x.q.text) + '</td><td data-label="Student’s Answer">' + esc(x.q.opts[x.pick]) + '</td><td data-label="Correct Answer">' + esc(x.q.opts[x.q.correct]) + '</td><td data-label="Result">' + PP.statusChip(x.ok ? 'Correct' : 'Incorrect') + '</td></tr>').join('') + '</tbody>';
      };
      $('studentSel').onchange = draw; draw();
    } else {
      const rows = STUDENTS.map((s, si) => { const pct = [100, 80, 60, 40][(si + a.id) % 4]; return { s, pct, pts: Math.round((a.pts * pct) / 100), tries: 1 + ((si + a.id) % 3) }; });
      const avg = Math.round(rows.reduce((t, r) => t + r.pct, 0) / rows.length), passed = rows.filter((r) => r.pct >= 60).length;
      $('resStats').innerHTML = '<div class="rs"><small>Average score</small><b>' + avg + '%</b></div><div class="rs"><small>Passed</small><b>' + passed + '/' + rows.length + '</b></div><div class="rs"><small>Points possible</small><b>' + a.pts + '</b></div><div class="rs"><small>Checking</small><div style="margin-top:6px">' + PP.chip(a.validation === 'manual' ? 'Manual review' : 'Auto-checked', 'blue') + '</div></div>';
      $('resTable').innerHTML = '<thead><tr><th>Student</th><th>Attempts</th><th>Points</th><th>Result</th></tr></thead><tbody>' + rows.map((r) =>
        '<tr><td class="primary" data-label="Student"><div class="cell-user">' + PP.avatar(r.s) + esc(r.s) + '</div></td><td data-label="Attempts">' + r.tries + '</td><td data-label="Points">' + r.pts + '/' + a.pts + '</td><td data-label="Result">' + PP.statusChip(r.pct >= 60 ? 'Passed' : 'Failed') + '</td></tr>').join('') + '</tbody>';
    }
  }

  /* ---------- Routing ---------- */
  function route() {
    const [name, arg, arg2] = location.hash.replace('#', '').split('/');
    PP.setActive('activities');
    if (name === 'new') openForm('new', arg, arg2);
    else if (name === 'edit') openForm(arg);
    else if (name === 'results') { const x = activities.find((z) => z.id === +arg); if (!x) { location.hash = '#list'; return; } show('results'); renderResults(x); }
    else { crumbs([]); show('list'); renderCards(); renderList(); }
  }
  window.addEventListener('hashchange', route);
  const qs0 = new URLSearchParams(location.search).get('q'); if (qs0) { st.q = qs0; $('search').value = qs0; }
  PP.onGlobalSearch = (q) => { st.q = q; $('search').value = q; st.page = 1; if (location.hash && location.hash !== '#list') location.hash = '#list'; else route(); };
  route();
})();
