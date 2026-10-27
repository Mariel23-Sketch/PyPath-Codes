import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import css from '../../styles/student/activities.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip, StatusChip } from '../../components/Chip';
import { usePageSearch } from '../../hooks/usePageSearch';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { studentStore, today, useStudent } from '../../services/studentStore';
import { D, find } from '../../services/studentCatalog';
import runPython from '../../services/pythonDemoRunner';

/* Quizzes + practice exercises:
   /student/activities?tab=quizzes|exercises   list with search and filters
   /student/activities/quiz/1                  take a quiz (timer, question buttons, submit)
   /student/activities/result/1                your score and answers (+50 pts when you pass the first time)
   /student/activities/exercise/1              code editor with Run, multiple choice, or open answer */

const PASS = 60;
const letter = (i) => String.fromCharCode(65 + i);
const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const DIFFS = { quizzes: ['Easy', 'Medium', 'Hard'], exercises: ['Beginner', 'Intermediate', 'Advanced'] };

/* ---------- 1. List ---------- */
function Stat({ tone, icon, label, val, unit, sub }) {
  return (
    <div className="card stat">
      <span className={`tile ${tone}`}><Icon name={icon} /></span>
      <small>{label}</small>
      <b>{val}{unit && <span>{unit}</span>}</b>
      <span className="vs">{sub}</span>
    </div>
  );
}

function List() {
  const s = useStudent();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'exercises' ? 'exercises' : 'quizzes';
  const [q, setQ] = useState(params.get('q') || '');
  const [diff, setDiff] = useState('');
  const [status, setStatus] = useState('');
  usePageSearch((v) => { setQ(v); if (params.get('tab')) setParams({}, { replace: true }); });

  const isQuiz = tab === 'quizzes';
  const ql = q.trim().toLowerCase();
  const items = (isQuiz ? D.quizzes : D.exercises).filter((x) => {
    const done = isQuiz ? !!s.quiz[x.id] : !!s.ex[x.id];
    return (!ql || `${x.title} ${find.module(x.moduleId).name}`.toLowerCase().includes(ql))
      && (!diff || x.diff === diff)
      && (!status || (status === 'Completed') === done);
  });

  const qDone = D.quizzes.filter((x) => s.quiz[x.id]);
  const passed = qDone.filter((x) => s.quiz[x.id].pct >= PASS);
  const avg = qDone.length ? Math.round(qDone.reduce((a, x) => a + s.quiz[x.id].pct, 0) / qDone.length) : 0;
  const exDone = D.exercises.filter((x) => s.ex[x.id]);
  const pts = passed.length * D.rules.quiz + exDone.reduce((a, x) => a + x.pts, 0);

  const switchTab = (t) => { setDiff(''); setParams(t === 'quizzes' ? {} : { tab: t }); };

  return (
    <section className="view" id="v-list">
      <div className="page-head">
        <div><h1>Activities</h1><p>Quizzes and practice exercises from your lessons. Finish them to earn points.</p></div>
      </div>
      <div className="stats" id="actStats">
        <Stat tone="t-purple" icon="quiz" label="Quizzes Passed" val={passed.length} unit={`/ ${D.quizzes.length}`} sub={`Pass mark: ${PASS}%`} />
        <Stat tone="t-green" icon="code" label="Exercises Solved" val={exDone.length} unit={`/ ${D.exercises.length}`} sub="Practice makes perfect" />
        <Stat tone="t-blue" icon="chart" label="Average Quiz Score" val={`${avg}%`} sub="Across quizzes you took" />
        <Stat tone="t-yellow" icon="star" label="Points From Activities" val={pts} sub={`+${D.rules.quiz} pts per passed quiz`} />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="pills" id="typeTabs" role="tablist">
            <a className={`pill${isQuiz ? ' on' : ''}`} href="#" onClick={(e) => { e.preventDefault(); switchTab('quizzes'); }}>Quizzes</a>
            <a className={`pill${!isQuiz ? ' on' : ''}`} href="#" onClick={(e) => { e.preventDefault(); switchTab('exercises'); }}>Exercises</a>
          </div>
          <label className="searchbox"><Icon name="search" box /><input id="search" type="search" placeholder="Search activities…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <div className="pills" id="diffFilter" role="group" aria-label="Filter by difficulty">
            {['All', ...DIFFS[tab]].map((d) => {
              const v = d === 'All' ? '' : d;
              return <button key={d} className={`pill${v === diff ? ' on' : ''}`} onClick={() => setDiff(v)}>{d}</button>;
            })}
          </div>
          <select className="select status-sel" id="statusFilter" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option><option>Not started</option><option>Completed</option>
          </select>
        </div>
        <div className="act-grid" id="actGrid">
          {items.length ? items.map((x) => {
            const m = find.module(x.moduleId);
            if (isQuiz) {
              const r = s.quiz[x.id];
              return (
                <article key={x.id} className={`ac-card${r ? ' done' : ''}`}>
                  <div className="act-top"><span className="tile t-purple"><Icon name="quiz" /></span><div><b>{x.title}</b><small>{m.name}</small></div></div>
                  <div className="act-meta"><StatusChip status={x.diff} /><Chip kind="blue">{x.qs.length} questions</Chip>{r ? <StatusChip status={r.pct >= PASS ? 'Passed' : 'Failed'} /> : <StatusChip status="Not started" />}</div>
                  <div className="act-foot">
                    <small>{r ? `Best score: ${r.pct}%` : `Due ${x.due} · +${D.rules.quiz} pts`}</small>
                    {r
                      ? <span className="res-btns"><Link className="btn btn-ghost btn-sm" to={`/student/activities/result/${x.id}`}>Review</Link><Link className="btn btn-soft btn-sm" to={`/student/activities/quiz/${x.id}`}>Retake</Link></span>
                      : <Link className="btn btn-primary btn-sm" to={`/student/activities/quiz/${x.id}`}>Start quiz</Link>}
                  </div>
                </article>
              );
            }
            const done = s.ex[x.id];
            return (
              <article key={x.id} className={`ac-card${done ? ' done' : ''}`}>
                <div className="act-top"><span className="tile t-green"><Icon name={x.type === 'Coding' ? 'code' : x.type === 'Multiple choice' ? 'list' : 'edit'} /></span><div><b>{x.title}</b><small>{m.name}</small></div></div>
                <div className="act-meta"><StatusChip status={x.diff} /><Chip kind="purple">{x.type}</Chip><StatusChip status={done ? 'Completed' : 'Not started'} /></div>
                <div className="act-foot">
                  <small>{done ? `Solved ${done.date}` : `Due ${x.due} · +${x.pts} pts`}</small>
                  <Link className={`btn ${done ? 'btn-ghost' : 'btn-primary'} btn-sm`} to={`/student/activities/exercise/${x.id}`}>{done ? 'Open' : 'Start'}</Link>
                </div>
              </article>
            );
          }) : <div className="empty" style={{ gridColumn: '1/-1' }}><Img file="mascot-sad.png" label="Mascot" />No activities match your filters.</div>}
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Take a quiz ---------- */
function TakeQuiz() {
  const { id } = useParams();
  const quiz = find.quiz(id);
  if (!quiz) return <Navigate to="/student/activities" replace />;
  return <QuizRunner key={quiz.id} quiz={quiz} />;
}

function QuizRunner({ quiz }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useDialogs();
  const [picks, setPicks] = useState(() => quiz.qs.map(() => null));
  const [cur, setCur] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer.current);
  }, [startedAt]);

  const pick = (i) => setPicks((p) => p.map((v, k) => (k === cur ? i : v)));

  /* A-D keys choose an answer (not while typing in a field) */
  useEffect(() => {
    const onKey = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      const k = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(k)) pick(k.charCodeAt(0) - 65);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const submit = async () => {
    const left = picks.filter((p) => p === null).length;
    if (left && !(await confirm({ title: `Submit with ${left} unanswered?`, text: 'Unanswered questions count as wrong.', confirm: 'Submit anyway', icon: 'quiz', primary: true }))) return;
    clearInterval(timer.current);
    const ok = quiz.qs.filter((q, i) => picks[i] === q.correct).length;
    const pct = Math.round((ok / quiz.qs.length) * 100);
    const prev = studentStore.get().quiz[quiz.id];
    const earned = pct >= PASS && !(prev && prev.pct >= PASS);
    studentStore.update((s) => {
      s.quiz[quiz.id] = { pct, ok, total: quiz.qs.length, time: fmtTime(Math.floor((Date.now() - startedAt) / 1000)), picks, date: today(), earned };
    });
    if (earned) studentStore.earn(D.rules.quiz, `Completed ${quiz.title}`);
    toast(earned ? `Quiz passed! +${D.rules.quiz} pts` : pct >= PASS ? 'Quiz passed!' : 'Quiz submitted. Try again to pass!', pct >= PASS ? '' : 'error');
    navigate(`/student/activities/result/${quiz.id}`);
  };

  const q = quiz.qs[cur];
  const answered = picks.filter((p) => p !== null).length;
  const last = cur === quiz.qs.length - 1;

  return (
    <section className="view" id="v-quiz">
      <Link to="/student/activities" className="back"><Icon name="arrowleft" box />Back to Activities</Link>
      <div className="quiz-grid">
        <div className="card">
          <div className="q-head">
            <div><h2>{quiz.title}</h2><p className="sub">{find.module(quiz.moduleId).name} · {quiz.qs.length} questions · Pass mark {PASS}%</p></div>
            <span className="timer" id="timer"><Icon name="clock" box /><b>{fmtTime(elapsed)}</b></span>
          </div>
          <div className="q-progress"><div className="bar"><i style={{ width: `${Math.round((answered / quiz.qs.length) * 100)}%` }} /></div><small>{answered} of {quiz.qs.length} answered</small></div>
          <p className="pv-q">Q{cur + 1}. {q.text}</p>
          <div role="radiogroup">
            {q.opts.map((o, i) => (
              <button key={i} type="button" className={`pv-opt${picks[cur] === i ? ' sel' : ''}`} role="radio" aria-checked={picks[cur] === i} onClick={() => pick(i)}>
                <span className="dotr" /><span className="letter">{letter(i)}</span>{o}
              </button>
            ))}
          </div>
          <div className="q-actions">
            <button className="btn btn-ghost" disabled={cur === 0} onClick={() => setCur(cur - 1)}><Icon name="arrowleft" box />Previous</button>
            <button className="btn btn-primary" onClick={() => (last ? submit() : setCur(cur + 1))}>
              {last ? <><Icon name="check" />Submit</> : <>Next<Icon name="arrowright" /></>}
            </button>
          </div>
        </div>
        <aside className="card side-card">
          <div className="card-title"><Icon name="list" box />Questions</div>
          <div className="pv-nav">
            {quiz.qs.map((_, i) => (
              <button key={i} type="button" className={i === cur ? 'on' : picks[i] !== null ? 'ans' : ''} aria-label={`Question ${i + 1}`} onClick={() => setCur(i)}>{i + 1}</button>
            ))}
          </div>
          <p className="hint">Answered questions turn blue. You can jump to any question.</p>
          <button className="btn btn-primary btn-block" onClick={submit}><Icon name="check" box />Submit Quiz</button>
        </aside>
      </div>
    </section>
  );
}

/* ---------- 3. Results ---------- */
function Result() {
  const { id } = useParams();
  const s = useStudent();
  const quiz = find.quiz(id);
  if (!quiz) return <Navigate to="/student/activities" replace />;
  const r = s.quiz[quiz.id];
  if (!r) return <Navigate to={`/student/activities/quiz/${quiz.id}`} replace />;
  const pass = r.pct >= PASS;

  return (
    <section className="view" id="v-result">
      <Link to="/student/activities" className="back"><Icon name="arrowleft" box />Back to Activities</Link>
      <div className="card hero res-hero">
        <div className="hero-copy">
          <span className="tag">{pass ? 'Passed' : 'Keep trying'}</span>
          <h2>{pass ? (r.pct === 100 ? 'Perfect score!' : 'Great job!') : 'Almost there!'}</h2>
          <p>{pass ? `You got ${r.ok} of ${r.total} correct${r.earned ? ` and earned ${D.rules.quiz} points.` : '.'}` : `You need ${PASS}% to pass. Review the lesson and try again.`}</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="spk s1" /><span className="spk s2" /><span className="wcloud" />
          <Img file={pass ? 'mascot-cheer.png' : 'mascot-sad.png'} label="Mascot" />
        </div>
      </div>
      <div className="card">
        <div className="res-head">
          <h2>Quiz Results – {quiz.title}</h2>
          <div className="res-btns">
            <Link className="btn btn-ghost" to={`/student/activities/quiz/${quiz.id}`}><Icon name="refresh" box />Retake</Link>
            <Link className="btn btn-primary" to="/student/activities">More activities</Link>
          </div>
        </div>
        <div className="res-stats">
          <div className="rs"><small>Score</small><b>{r.pct}%</b></div>
          <div className="rs"><small>Correct</small><b>{r.ok}/{r.total}</b></div>
          <div className="rs"><small>Time</small><b>{r.time}</b></div>
          <div className="rs"><small>Status</small><div style={{ marginTop: 6 }}><StatusChip status={pass ? 'Passed' : 'Failed'} /></div></div>
        </div>
        <div className="table-wrap">
          <table className="table stack">
            <thead><tr><th style={{ width: 56 }}>#</th><th>Question</th><th>Your Answer</th><th>Correct Answer</th><th>Result</th></tr></thead>
            <tbody>
              {quiz.qs.map((q, i) => {
                const p = r.picks[i];
                return (
                  <tr key={i}>
                    <td className="hide-m" data-label="#">{i + 1}</td>
                    <td className="primary cell-strong" data-label="Question">{q.text}</td>
                    <td data-label="Your Answer">{p === null || p === undefined ? <span className="sub">No answer</span> : q.opts[p]}</td>
                    <td data-label="Correct Answer">{q.opts[q.correct]}</td>
                    <td data-label="Result"><StatusChip status={p === q.correct ? 'Correct' : 'Incorrect'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Exercise ---------- */
const OUT_IDLE = (x) => ({ cls: '', label: 'Output', text: x.type === 'Coding' ? 'Press Run to see what your code prints.' : 'Your result will appear here after you submit.' });

function ExerciseRoute() {
  const { id } = useParams();
  const x = find.exercise(id);
  if (!x) return <Navigate to="/student/activities?tab=exercises" replace />;
  return <Exercise key={x.id} x={x} />;
}

function Exercise({ x }) {
  const s = useStudent();
  const toast = useToast();
  const done = s.ex[x.id];
  const saved = done && done.answer != null ? done.answer : null;
  const [code, setCode] = useState(saved != null ? saved : x.code || '');
  const [pick, setPick] = useState(typeof saved === 'number' ? saved : null);
  const [open, setOpen] = useState(typeof saved === 'string' && x.type === 'Open answer' ? saved : '');
  const [err, setErr] = useState('');
  const [out, setOut] = useState(OUT_IDLE(x));

  const run = () => {
    try {
      const text = runPython(code);
      setOut({ cls: '', label: 'Output', text: text || '(nothing printed)' });
      return text;
    } catch (e) {
      setOut({ cls: 'bad', label: 'Output', text: e.message });
      return null;
    }
  };

  const finish = (answer, msg) => {
    const first = !studentStore.get().ex[x.id];
    studentStore.update((d) => { d.ex[x.id] = { date: today(), answer }; });
    if (first) studentStore.earn(x.pts, `Solved exercise: ${x.title}`);
    toast(first ? `${msg} +${x.pts} pts` : 'Answer saved');
  };

  const submit = () => {
    setErr('');
    if (x.type === 'Coding') {
      if (!code.trim() || (code.trim() === (x.code || '').trim() && !x.expect)) { setErr('Write your solution first.'); return; }
      if (x.expect) {
        const text = run();
        if (text === null) { setErr('Fix the error shown in Output, then submit again.'); return; }
        if (text.trim() !== x.expect) { setOut((o) => ({ ...o, cls: 'bad' })); setErr(`Not quite. Expected output: ${x.expect}`); return; }
        setOut((o) => ({ ...o, cls: 'ok' }));
        finish(code, 'Correct!');
      } else {
        finish(code, 'Submitted! Your teacher will check your code.');
        setOut({ cls: 'ok', label: 'Submitted', text: 'Your code was sent to your teacher for checking.' });
      }
    } else if (x.type === 'Multiple choice') {
      if (pick === null) { setErr('Choose an answer first.'); return; }
      if (pick !== x.correct) { setOut({ cls: 'bad', label: 'Result', text: `${x.opts[pick]} is not correct. Try again!` }); return; }
      setOut({ cls: 'ok', label: 'Result', text: `Correct! ${x.opts[pick]} is the right answer.` });
      finish(pick, 'Correct!');
    } else {
      const ans = open.trim();
      if (ans.length < 20) { setErr('Write at least a sentence or two (20+ characters).'); return; }
      setOut({ cls: 'ok', label: 'Submitted', text: 'Your answer was sent to your teacher.' });
      finish(ans, 'Submitted!');
    }
  };

  const onTab = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const t = e.target;
    const pos = t.selectionStart;
    const next = `${code.slice(0, pos)}    ${code.slice(t.selectionEnd)}`;
    setCode(next);
    requestAnimationFrame(() => { t.selectionStart = pos + 4; t.selectionEnd = pos + 4; });
  };

  return (
    <section className="view" id="v-exercise">
      <Link to="/student/activities?tab=exercises" className="back"><Icon name="arrowleft" box />Back to Activities</Link>
      <div className="form-grid">
        <div className="card">
          <div className="q-head">
            <div><h2>{x.title}</h2><p className="sub">{find.module(x.moduleId).name} · {x.type} · +{x.pts} pts</p></div>
            <span><StatusChip status={done ? 'Completed' : x.diff} /></span>
          </div>
          <p className="prev-q">{x.instr}</p>
          <div id="exWork">
            {x.type === 'Coding' && (
              <div className="editor">
                <div className="editor-bar"><i /><i /><i /><span>main.py</span></div>
                <textarea className="code-input" id="code" spellCheck="false" aria-label="Your code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={onTab} />
              </div>
            )}
            {x.type === 'Multiple choice' && x.opts.map((o, i) => (
              <button key={i} type="button" className={`pv-opt${pick === i ? ' sel' : ''}`} onClick={() => { setPick(i); setErr(''); }}>
                <span className="dotr" /><span className="letter">{letter(i)}</span><span className="mono">{o}</span>
              </button>
            ))}
            {x.type === 'Open answer' && (
              <textarea className="textarea answer-box" id="openAns" placeholder="Type your answer here…" aria-label="Your answer" value={open} onChange={(e) => setOpen(e.target.value)} />
            )}
          </div>
          <div className="err" id="exErr">{err}</div>
          <div className="run-row" id="exBtns">
            {x.type === 'Coding' && (
              <>
                <button className="btn btn-ghost" onClick={run}><Icon name="play" />Run</button>
                <button className="btn btn-ghost" onClick={() => { setCode(x.code); setOut(OUT_IDLE(x)); }}><Icon name="refresh" />Reset</button>
              </>
            )}
            <button className="btn btn-primary push" id="exSubmit" onClick={submit}>
              <Icon name="check" />{x.type === 'Coding' ? (done ? 'Submit again' : 'Submit') : 'Submit answer'}
            </button>
          </div>
        </div>
        <aside className="card preview-card">
          <div className="card-title"><Icon name="code" box />Output</div>
          <div id="outBox"><div className={`output${out.cls ? ` ${out.cls}` : ''}`}><small>{out.label}</small>{out.text}</div></div>
          <p className="hint">Demo runner: it shows what your <code>print()</code> lines would display.</p>
        </aside>
      </div>
    </section>
  );
}

export default function Activities() {
  useStyles(css);
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path="quiz/:id" element={<TakeQuiz />} />
      <Route path="result/:id" element={<Result />} />
      <Route path="exercise/:id" element={<ExerciseRoute />} />
      <Route path="*" element={<Navigate to="/student/activities" replace />} />
    </Routes>
  );
}
