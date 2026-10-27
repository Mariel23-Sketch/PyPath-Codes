/* PyPath Student – Activities (the old "Quizzes" page, now quizzes + exercises)
   Pages inside this file (switch with the # in the address):
     #quizzes / #exercises   list with search and filters
     #quiz/1                 take a quiz (timer, question buttons, submit)
     #result/1               your score and answers (+50 pts when you pass the first time)
     #exercise/1             code editor with Run, multiple choice, or open answer */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, F = PP.find, esc = PP.esc;
  const S = () => PP.store.get();
  const letter = (i) => String.fromCharCode(65 + i);
  const PASS = 60;
  PP.hydrate();

  const views = ['list', 'quiz', 'result', 'exercise'];
  function show(n) { views.forEach((v) => ($('v-' + v).hidden = v !== n)); window.scrollTo(0, 0); }

  /* ---------- 1. List ---------- */
  const DIFFS = { quizzes: ['Easy', 'Medium', 'Hard'], exercises: ['Beginner', 'Intermediate', 'Advanced'] };
  const st = { tab: 'quizzes', q: '', diff: '', status: '' };

  function renderStats() {
    const s = S(), qDone = D.quizzes.filter((q) => s.quiz[q.id]), passed = qDone.filter((q) => s.quiz[q.id].pct >= PASS);
    const avg = qDone.length ? Math.round(qDone.reduce((a, q) => a + s.quiz[q.id].pct, 0) / qDone.length) : 0;
    const exDone = D.exercises.filter((x) => s.ex[x.id]);
    const pts = passed.length * D.rules.quiz + exDone.reduce((a, x) => a + x.pts, 0);
    const stat = (tone, icon, label, val, sub) => '<div class="card stat"><span class="tile ' + tone + '">' + PP.i(icon) + '</span><small>' + label + '</small><b>' + val + '</b><span class="vs">' + sub + '</span></div>';
    $('actStats').innerHTML =
      stat('t-purple', 'quiz', 'Quizzes Passed', passed.length + '<span>/ ' + D.quizzes.length + '</span>', 'Pass mark: ' + PASS + '%') +
      stat('t-green', 'code', 'Exercises Solved', exDone.length + '<span>/ ' + D.exercises.length + '</span>', 'Practice makes perfect') +
      stat('t-blue', 'chart', 'Average Quiz Score', avg + '%', 'Across quizzes you took') +
      stat('t-yellow', 'star', 'Points From Activities', pts, '+' + D.rules.quiz + ' pts per passed quiz');
  }

  function renderList() {
    document.querySelectorAll('#typeTabs .pill').forEach((p) => p.classList.toggle('on', p.dataset.t === st.tab));
    $('diffFilter').innerHTML = ['All'].concat(DIFFS[st.tab]).map((d) => '<button class="pill' + ((d === 'All' ? '' : d) === st.diff ? ' on' : '') + '" data-d="' + (d === 'All' ? '' : d) + '">' + d + '</button>').join('');
    const s = S(), q = st.q.toLowerCase();
    const isQuiz = st.tab === 'quizzes';
    const items = (isQuiz ? D.quizzes : D.exercises).filter((x) => {
      const done = isQuiz ? !!s.quiz[x.id] : !!s.ex[x.id];
      return (!q || (x.title + ' ' + F.module(x.moduleId).name).toLowerCase().includes(q)) &&
        (!st.diff || x.diff === st.diff) &&
        (!st.status || (st.status === 'Completed') === done);
    });
    $('actGrid').innerHTML = items.length ? items.map((x) => {
      const m = F.module(x.moduleId);
      if (isQuiz) {
        const r = s.quiz[x.id];
        return '<article class="ac-card' + (r ? ' done' : '') + '"><div class="act-top"><span class="tile t-purple">' + PP.i('quiz') + '</span><div><b>' + esc(x.title) + '</b><small>' + esc(m.name) + '</small></div></div>' +
          '<div class="act-meta">' + PP.statusChip(x.diff) + PP.chip(x.qs.length + ' questions', 'blue') + (r ? PP.statusChip(r.pct >= PASS ? 'Passed' : 'Failed') : PP.statusChip('Not started')) + '</div>' +
          '<div class="act-foot"><small>' + (r ? 'Best score: ' + r.pct + '%' : 'Due ' + x.due + ' · +' + D.rules.quiz + ' pts') + '</small>' +
          (r ? '<span class="res-btns"><a class="btn btn-ghost btn-sm" href="#result/' + x.id + '">Review</a><a class="btn btn-soft btn-sm" href="#quiz/' + x.id + '">Retake</a></span>' : '<a class="btn btn-primary btn-sm" href="#quiz/' + x.id + '">Start quiz</a>') + '</div></article>';
      }
      const done = s.ex[x.id];
      return '<article class="ac-card' + (done ? ' done' : '') + '"><div class="act-top"><span class="tile t-green">' + PP.i(x.type === 'Coding' ? 'code' : x.type === 'Multiple choice' ? 'list' : 'edit') + '</span><div><b>' + esc(x.title) + '</b><small>' + esc(m.name) + '</small></div></div>' +
        '<div class="act-meta">' + PP.statusChip(x.diff) + PP.chip(x.type, 'purple') + PP.statusChip(done ? 'Completed' : 'Not started') + '</div>' +
        '<div class="act-foot"><small>' + (done ? 'Solved ' + done.date : 'Due ' + x.due + ' · +' + x.pts + ' pts') + '</small><a class="btn ' + (done ? 'btn-ghost' : 'btn-primary') + ' btn-sm" href="#exercise/' + x.id + '">' + (done ? 'Open' : 'Start') + '</a></div></article>';
    }).join('') : '<div class="empty" style="grid-column:1/-1">' + PP.img('mascot-sad.png', '', 'Mascot') + 'No activities match your filters.</div>';
    renderStats();
  }
  $('search').addEventListener('input', (e) => { st.q = e.target.value.trim(); renderList(); });
  $('statusFilter').addEventListener('change', (e) => { st.status = e.target.value; renderList(); });
  $('diffFilter').addEventListener('click', (e) => { const b = e.target.closest('.pill'); if (!b) return; st.diff = b.dataset.d; renderList(); });

  /* ---------- 2. Take a quiz ---------- */
  let qz = null, timerId = null;
  const fmtTime = (sec) => Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  function startQuiz(quiz) {
    qz = { quiz, picks: quiz.qs.map(() => null), cur: 0, start: Date.now() };
    $('quizTitle').textContent = quiz.title;
    $('quizSub').textContent = F.module(quiz.moduleId).name + ' · ' + quiz.qs.length + ' questions · Pass mark ' + PASS + '%';
    clearInterval(timerId);
    const tick = () => { $('timerTx').textContent = fmtTime(Math.floor((Date.now() - qz.start) / 1000)); };
    tick(); timerId = setInterval(tick, 1000);
    renderQuestion();
  }
  function renderQuestion() {
    const { quiz, picks, cur } = qz, q = quiz.qs[cur], answered = picks.filter((p) => p !== null).length;
    $('qText').textContent = 'Q' + (cur + 1) + '. ' + q.text;
    $('qOpts').innerHTML = q.opts.map((o, i) => '<button type="button" class="pv-opt' + (picks[cur] === i ? ' sel' : '') + '" data-oi="' + i + '" role="radio" aria-checked="' + (picks[cur] === i) + '"><span class="dotr"></span><span class="letter">' + letter(i) + '</span>' + esc(o) + '</button>').join('');
    $('qNav').innerHTML = quiz.qs.map((_, i) => '<button type="button" data-q="' + i + '" class="' + (i === cur ? 'on' : picks[i] !== null ? 'ans' : '') + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>').join('');
    $('qCount').textContent = answered + ' of ' + quiz.qs.length + ' answered';
    $('qBar').style.width = Math.round((answered / quiz.qs.length) * 100) + '%';
    $('qPrev').disabled = cur === 0;
    const last = cur === quiz.qs.length - 1;
    $('qNext').innerHTML = last ? PP.i('check') + 'Submit' : 'Next' + PP.i('arrowright');
  }
  $('qOpts').addEventListener('click', (e) => { const b = e.target.closest('[data-oi]'); if (!b) return; qz.picks[qz.cur] = +b.dataset.oi; renderQuestion(); });
  $('qNav').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (!b) return; qz.cur = +b.dataset.q; renderQuestion(); });
  $('qPrev').addEventListener('click', () => { if (qz.cur > 0) { qz.cur--; renderQuestion(); } });
  $('qNext').addEventListener('click', () => { if (qz.cur < qz.quiz.qs.length - 1) { qz.cur++; renderQuestion(); } else submitQuiz(); });
  $('submitQuiz').addEventListener('click', submitQuiz);
  document.addEventListener('keydown', (e) => {
    if ($('v-quiz').hidden || !qz || /input|textarea|select/i.test(e.target.tagName)) return;
    const k = e.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(k)) { qz.picks[qz.cur] = k.charCodeAt(0) - 65; renderQuestion(); }
  });

  async function submitQuiz() {
    const { quiz, picks } = qz, left = picks.filter((p) => p === null).length;
    if (left && !(await PP.confirm({ title: 'Submit with ' + left + ' unanswered?', text: 'Unanswered questions count as wrong.', confirm: 'Submit anyway', icon: 'quiz', primary: true }))) return;
    clearInterval(timerId);
    const ok = quiz.qs.filter((q, i) => picks[i] === q.correct).length, pct = Math.round((ok / quiz.qs.length) * 100);
    const s = S(), prev = s.quiz[quiz.id], earned = pct >= PASS && !(prev && prev.pct >= PASS);
    s.quiz[quiz.id] = { pct, ok, total: quiz.qs.length, time: fmtTime(Math.floor((Date.now() - qz.start) / 1000)), picks, date: PP.today(), earned };
    if (earned) PP.store.earn(D.rules.quiz, 'Completed ' + quiz.title); else PP.store.save();
    PP.toast(earned ? 'Quiz passed! +' + D.rules.quiz + ' pts' : pct >= PASS ? 'Quiz passed!' : 'Quiz submitted. Try again to pass!', pct >= PASS ? '' : 'error');
    location.hash = '#result/' + quiz.id;
  }

  /* ---------- 3. Results ---------- */
  function renderResult(quiz) {
    const r = S().quiz[quiz.id], pass = r.pct >= PASS;
    $('resHero').innerHTML = '<div class="hero-copy"><span class="tag">' + (pass ? 'Passed' : 'Keep trying') + '</span><h2>' + (pass ? (r.pct === 100 ? 'Perfect score!' : 'Great job!') : 'Almost there!') + '</h2><p>' +
      (pass ? 'You got ' + r.ok + ' of ' + r.total + ' correct' + (r.earned ? ' and earned ' + D.rules.quiz + ' points.' : '.') : 'You need ' + PASS + '% to pass. Review the lesson and try again.') + '</p></div>' +
      '<div class="hero-art" aria-hidden="true"><span class="spk s1"></span><span class="spk s2"></span><span class="wcloud"></span>' + PP.img(pass ? 'mascot-cheer.png' : 'mascot-sad.png', '', 'Mascot') + '</div>';
    $('resTitle').textContent = 'Quiz Results – ' + quiz.title;
    $('retakeBtn').href = '#quiz/' + quiz.id;
    $('resStats').innerHTML =
      '<div class="rs"><small>Score</small><b>' + r.pct + '%</b></div><div class="rs"><small>Correct</small><b>' + r.ok + '/' + r.total + '</b></div>' +
      '<div class="rs"><small>Time</small><b>' + r.time + '</b></div><div class="rs"><small>Status</small><div style="margin-top:6px">' + PP.statusChip(pass ? 'Passed' : 'Failed') + '</div></div>';
    $('resRows').innerHTML = quiz.qs.map((q, i) => {
      const p = r.picks[i], good = p === q.correct;
      return '<tr><td class="hide-m" data-label="#">' + (i + 1) + '</td><td class="primary cell-strong" data-label="Question">' + esc(q.text) + '</td><td data-label="Your Answer">' + (p === null || p === undefined ? '<span class="sub">No answer</span>' : esc(q.opts[p])) + '</td><td data-label="Correct Answer">' + esc(q.opts[q.correct]) + '</td><td data-label="Result">' + PP.statusChip(good ? 'Correct' : 'Incorrect') + '</td></tr>';
    }).join('');
  }

  /* ---------- 4. Exercise ---------- */
  /* Tiny demo runner: understands print(...), simple variables, a, b = b, a, and + - * / // % math.
     Anything else (if, for, def...) is accepted on Submit and checked by your teacher. */
  function runPython(code) {
    const vars = {}, out = [];
    const splitTop = (s) => { const parts = []; let depth = 0, quote = '', cur = '';
      for (const ch of s) {
        if (quote) { cur += ch; if (ch === quote) quote = ''; continue; }
        if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
        if (ch === '(') depth++; if (ch === ')') depth--;
        if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur.trim()) parts.push(cur); return parts.map((x) => x.trim()); };
    const val = (e) => {
      e = e.trim(); let m;
      if ((m = e.match(/^(["'])(.*)\1$/))) return m[2];
      if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
      if (e === 'True' || e === 'False') return e;
      if (/^int\(\s*input\(.*\)\s*\)$/.test(e)) return 7;
      if (Object.prototype.hasOwnProperty.call(vars, e)) return vars[e];
      if (/^[\w\s+\-*/%().]+$/.test(e)) {
        const floor = e.includes('//');
        const js = e.replace(/\/\//g, '/').replace(/[A-Za-z_]\w*/g, (n) => (Object.prototype.hasOwnProperty.call(vars, n) && typeof vars[n] === 'number' ? String(vars[n]) : 'NaN'));
        try { const r = Function('"use strict";return (' + js + ')')(); if (typeof r === 'number' && isFinite(r)) return floor ? Math.floor(r) : r; } catch (x) {}
      }
      throw new Error('The demo runner can\'t work out: ' + e);
    };
    const show = (v) => (typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(10)) : String(v));
    code.split('\n').forEach((raw, n) => {
      let line = raw.replace(/\s+$/, '');
      if (!/["']/.test(line)) line = line.replace(/#.*$/, '');
      if (!line.trim()) return;
      if (/^\s/.test(line) || /^(if|elif|else|for|while|def|class|return|import|from|try|except)\b/.test(line.trim())) throw new Error('Line ' + (n + 1) + ': the demo runner only understands print() and simple variables. Press Submit and your teacher will check it.');
      line = line.trim();
      let m;
      if ((m = line.match(/^print\((.*)\)$/))) { out.push(m[1].trim() ? splitTop(m[1]).map(val).map(show).join(' ') : ''); return; }
      if ((m = line.match(/^([A-Za-z_][\w\s,]*?)\s*=\s*([^=].*)$/))) {
        const names = m[1].split(',').map((x) => x.trim()), values = splitTop(m[2]).map(val);
        if (names.length !== values.length) throw new Error('Line ' + (n + 1) + ': ' + names.length + ' names but ' + values.length + ' values.');
        names.forEach((nm, i) => (vars[nm] = values[i]));
        return;
      }
      throw new Error('Line ' + (n + 1) + ': the demo runner does not understand "' + line + '".');
    });
    return out.join('\n');
  }

  let curEx = null;
  function renderExercise(x) {
    curEx = x;
    const done = S().ex[x.id];
    $('exTitle').textContent = x.title;
    $('exSub').textContent = F.module(x.moduleId).name + ' · ' + x.type + ' · +' + x.pts + ' pts';
    $('exChip').innerHTML = done ? PP.statusChip('Completed') : PP.statusChip(x.diff);
    $('exInstr').textContent = x.instr;
    $('exErr').textContent = '';
    $('outBox').innerHTML = '<div class="output"><small>Output</small>' + (x.type === 'Coding' ? 'Press Run to see what your code prints.' : 'Your result will appear here after you submit.') + '</div>';
    const saved = done && done.answer != null ? done.answer : null;
    if (x.type === 'Coding') {
      $('exWork').innerHTML = '<div class="editor"><div class="editor-bar"><i></i><i></i><i></i><span>main.py</span></div><textarea class="code-input" id="code" spellcheck="false" aria-label="Your code"></textarea></div>';
      $('code').value = saved != null ? saved : x.code;
      $('exBtns').innerHTML = '<button class="btn btn-ghost" id="runBtn">' + PP.i('play') + 'Run</button><button class="btn btn-ghost" id="resetBtn">' + PP.i('refresh') + 'Reset</button><button class="btn btn-primary push" id="exSubmit">' + PP.i('check') + (done ? 'Submit again' : 'Submit') + '</button>';
      $('code').addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '    ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 4; } });
      $('runBtn').onclick = () => runAndShow();
      $('resetBtn').onclick = () => { $('code').value = x.code; $('outBox').innerHTML = '<div class="output"><small>Output</small>Press Run to see what your code prints.</div>'; };
    } else if (x.type === 'Multiple choice') {
      $('exWork').innerHTML = x.opts.map((o, i) => '<button type="button" class="pv-opt' + (saved === i ? ' sel' : '') + '" data-oi="' + i + '"><span class="dotr"></span><span class="letter">' + letter(i) + '</span><span class="mono">' + esc(o) + '</span></button>').join('');
      $('exBtns').innerHTML = '<button class="btn btn-primary push" id="exSubmit">' + PP.i('check') + 'Submit answer</button>';
      $('exWork').onclick = (e) => { const b = e.target.closest('[data-oi]'); if (!b) return; $('exWork').querySelectorAll('.pv-opt').forEach((p) => p.classList.toggle('sel', p === b)); $('exErr').textContent = ''; };
    } else {
      $('exWork').innerHTML = '<textarea class="textarea answer-box" id="openAns" placeholder="Type your answer here…" aria-label="Your answer"></textarea>';
      $('openAns').value = saved || '';
      $('exBtns').innerHTML = '<button class="btn btn-primary push" id="exSubmit">' + PP.i('check') + 'Submit answer</button>';
    }
    $('exSubmit').onclick = submitExercise;
  }
  function runAndShow() {
    try {
      const out = runPython($('code').value);
      $('outBox').innerHTML = '<div class="output"><small>Output</small>' + (out ? esc(out) : '(nothing printed)') + '</div>';
      return out;
    } catch (err) {
      $('outBox').innerHTML = '<div class="output bad"><small>Output</small>' + esc(err.message) + '</div>';
      return null;
    }
  }
  function finishExercise(x, answer, msg) {
    const s = S(), first = !s.ex[x.id];
    s.ex[x.id] = { date: PP.today(), answer };
    if (first) PP.store.earn(x.pts, 'Solved exercise: ' + x.title); else PP.store.save();
    PP.toast(first ? msg + ' +' + x.pts + ' pts' : 'Answer saved');
    $('exChip').innerHTML = PP.statusChip('Completed');
  }
  function submitExercise() {
    const x = curEx; $('exErr').textContent = '';
    if (x.type === 'Coding') {
      const code = $('code').value;
      if (!code.trim() || code.trim() === (x.code || '').trim() && !x.expect) { $('exErr').textContent = 'Write your solution first.'; return; }
      if (x.expect) {
        const out = runAndShow();
        if (out === null) { $('exErr').textContent = 'Fix the error shown in Output, then submit again.'; return; }
        if (out.trim() !== x.expect) { $('outBox').firstChild.classList.add('bad'); $('exErr').textContent = 'Not quite. Expected output: ' + x.expect; return; }
        $('outBox').firstChild.classList.add('ok');
        finishExercise(x, code, 'Correct!');
      } else {
        finishExercise(x, code, 'Submitted! Your teacher will check your code.');
        $('outBox').innerHTML = '<div class="output ok"><small>Submitted</small>Your code was sent to your teacher for checking.</div>';
      }
    } else if (x.type === 'Multiple choice') {
      const sel = $('exWork').querySelector('.pv-opt.sel');
      if (!sel) { $('exErr').textContent = 'Choose an answer first.'; return; }
      const pick = +sel.dataset.oi;
      if (pick !== x.correct) { $('outBox').innerHTML = '<div class="output bad"><small>Result</small>' + esc(x.opts[pick]) + ' is not correct. Try again!</div>'; return; }
      $('outBox').innerHTML = '<div class="output ok"><small>Result</small>Correct! ' + esc(x.opts[pick]) + ' is the right answer.</div>';
      finishExercise(x, pick, 'Correct!');
    } else {
      const ans = $('openAns').value.trim();
      if (ans.length < 20) { $('exErr').textContent = 'Write at least a sentence or two (20+ characters).'; return; }
      $('outBox').innerHTML = '<div class="output ok"><small>Submitted</small>Your answer was sent to your teacher.</div>';
      finishExercise(x, ans, 'Submitted!');
    }
  }

  /* ---------- Routing ---------- */
  function route() {
    const [name, arg] = location.hash.replace('#', '').split('/');
    if (name !== 'quiz') clearInterval(timerId);
    if (name === 'quiz' && F.quiz(arg)) { show('quiz'); startQuiz(F.quiz(arg)); }
    else if (name === 'result' && F.quiz(arg)) { if (!S().quiz[arg]) { location.hash = '#quiz/' + arg; return; } show('result'); renderResult(F.quiz(arg)); }
    else if (name === 'exercise' && F.exercise(arg)) { show('exercise'); renderExercise(F.exercise(arg)); }
    else {
      const tab = name === 'exercises' ? 'exercises' : 'quizzes';
      if (tab !== st.tab) { st.tab = tab; st.diff = ''; }
      show('list'); renderList();
    }
    PP.hydrate();
  }
  PP.onGlobalSearch = (q) => { st.q = q; $('search').value = q; if (!$('v-list').hidden) renderList(); else location.hash = '#' + st.tab; };
  const q0 = new URLSearchParams(location.search).get('q'); if (q0) { st.q = q0; $('search').value = q0; }
  window.addEventListener('hashchange', route);
  route();
})();
