import { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import css from '../../styles/student/learning-materials.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { StatusChip } from '../../components/Chip';
import { usePageSearch } from '../../hooks/usePageSearch';
import { useToast } from '../../hooks/useToast';
import { studentStore, useStudent } from '../../services/studentStore';
import { D, find, lecturesOf, courseLectures, modulesOf, quizzesOf, exercisesOf, courseProgress, moduleStatus, nextLecture } from '../../services/studentCatalog';

/* Courses > course > module > lecture, now real routes instead of #hash views:
   /student/learning                  all courses
   /student/learning/course/1         one course (Overview / Modules / Lectures tabs)
   /student/learning/module/11        one module with its lectures and practice
   /student/learning/lecture/101      watch a lecture and mark it as done (+10 pts) */

const CourseTile = ({ c }) => (
  <span className={`ctile ${c.tone}`}>{c.icon === 'python' ? <Img file="logo-icon.png" label="Logo" /> : <Icon name={c.icon} />}</span>
);
const Bar = ({ p }) => <div className={`bar${p === 100 ? ' green' : ''}`}><i style={{ width: `${p}%` }} /></div>;
const Num = ({ done, i }) => <span className={`n${done ? ' ok' : ''}`}>{done ? <Icon name="check" /> : i + 1}</span>;

function Practice({ moduleId, s }) {
  const items = [
    ...quizzesOf(moduleId).map((q) => (
      <Link key={`q${q.id}`} className="prac" to={`/student/activities/quiz/${q.id}`}>
        <span className="tile t-purple"><Icon name="quiz" /></span>
        <span className="grow"><b>{q.title}</b><small>Quiz · {q.qs.length} questions · +{D.rules.quiz} pts</small></span>
        <StatusChip status={s.quiz[q.id] ? 'Completed' : q.diff} />
      </Link>
    )),
    ...exercisesOf(moduleId).map((x) => (
      <Link key={`x${x.id}`} className="prac" to={`/student/activities/exercise/${x.id}`}>
        <span className="tile t-green"><Icon name="code" /></span>
        <span className="grow"><b>{x.title}</b><small>{x.type} exercise · +{x.pts} pts</small></span>
        <StatusChip status={s.ex[x.id] ? 'Completed' : x.diff} />
      </Link>
    ))
  ];
  return items.length ? <><p className="sec-h">Practice</p>{items}</> : null;
}

/* ---------- 1. Courses ---------- */
function Courses() {
  const s = useStudent();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();
  usePageSearch(setQ);

  const nx = nextLecture(s);
  const ql = q.trim().toLowerCase();
  const list = D.courses.filter((c) => {
    if (level && c.level !== level) return false;
    if (!ql) return true;
    return `${c.title} ${c.desc}`.toLowerCase().includes(ql)
      || courseLectures(c.id).some((l) => l.title.toLowerCase().includes(ql))
      || modulesOf(c.id).some((m) => m.name.toLowerCase().includes(ql));
  });

  return (
    <section className="view" id="v-courses">
      <div className="page-head">
        <div><h1>Learning Materials</h1><p>Pick a course and continue where you left off.</p></div>
        {nx && <Link className="btn btn-primary" id="resumeBtn" to={`/student/learning/lecture/${nx.id}`}><Icon name="play" box />Resume lesson</Link>}
      </div>
      <div className="toolbar">
        <label className="searchbox"><Icon name="search" box /><input id="courseSearch" type="search" placeholder="Search courses and lessons…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div className="pills" id="levelPills">
          {[['', 'All'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate']].map(([v, l]) => (
            <button key={l} className={`pill${level === v ? ' on' : ''}`} onClick={() => setLevel(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="course-list" id="courseList">
        {list.length ? list.map((c) => {
          const p = courseProgress(c.id, s);
          const hits = ql ? courseLectures(c.id).filter((l) => l.title.toLowerCase().includes(ql)).map((l) => l.title) : [];
          const go = () => navigate(`/student/learning/course/${c.id}`);
          return (
            <article key={c.id} className="course-card" tabIndex={0} role="link" aria-label={`Open ${c.title}`} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter') go(); }}>
              <CourseTile c={c} />
              <div className="cc-main">
                <h3>{c.title}</h3>
                <p>{c.level} • {modulesOf(c.id).length} Modules • {p.total} Lessons</p>
                {hits.length > 0 && <p className="match">Lessons: {hits.join(', ')}</p>}
              </div>
              <div className="cc-prog">
                <small><span>{p.pct === 100 ? 'Completed' : p.done ? 'In progress' : 'Not started'}</span><b>{p.pct}%</b></small>
                <Bar p={p.pct} />
              </div>
              <span className="cc-chev"><Icon name="right" /></span>
            </article>
          );
        }) : <div className="card empty"><Img file="mascot-sad.png" label="Mascot" />No courses or lessons match your search.</div>}
      </div>
    </section>
  );
}

/* ---------- 2. Course details ---------- */
function ModuleRow({ m, i, s }) {
  const status = moduleStatus(m, s);
  const ls = lecturesOf(m.id);
  const doneN = ls.filter((l) => s.done.includes(l.id)).length;
  const inner = (
    <>
      {status === 'Completed' ? <span className="n ok"><Icon name="check" /></span> : !m.open ? <span className="n"><Icon name="lock" /></span> : <span className="n">{i + 1}</span>}
      <span className="grow"><b>{m.name}</b><small>{m.open ? `${doneN} of ${ls.length} lessons done` : 'Your teacher has not published this yet'}</small></span>
      <StatusChip status={status} />
      {m.open && <Icon name="right" className="chev" />}
    </>
  );
  return m.open ? <Link className="lr" to={`/student/learning/module/${m.id}`}>{inner}</Link> : <div className="lr locked">{inner}</div>;
}

function CourseDetail() {
  const { id } = useParams();
  const s = useStudent();
  const [tab, setTab] = useState('overview');
  const c = find.course(id);
  if (!c) return <Navigate to="/student/learning" replace />;

  const mods = modulesOf(c.id);
  const p = courseProgress(c.id, s);
  const lectures = courseLectures(c.id);
  const nxt = lectures.find((l) => find.module(l.moduleId).open && !s.done.includes(l.id));
  const qs = D.quizzes.filter((q) => find.module(q.moduleId).courseId === c.id);
  const xs = D.exercises.filter((x) => find.module(x.moduleId).courseId === c.id);

  return (
    <section className="view" id="v-course">
      <Link to="/student/learning" className="back"><Icon name="arrowleft" box />Back to Courses</Link>
      <div className="card" id="courseDetail">
        <div className="cd-head">
          <CourseTile c={c} />
          <div><h2>{c.title}</h2><div className="sub">{c.level} • {mods.length} Modules • {p.total} Lessons</div></div>
          <div className="push">
            {nxt
              ? <Link className="btn btn-primary" to={`/student/learning/lecture/${nxt.id}`}><Icon name="play" />{p.done ? 'Continue' : 'Start course'}</Link>
              : <StatusChip status="Completed" />}
          </div>
        </div>
        <div className="cd-tabs" id="cdTabs">
          {['overview', 'modules', 'lectures'].map((t) => (
            <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <div className="cd-body" id="cdBody">
          {tab === 'overview' && (
            <>
              <p className="desc">{c.desc}</p>
              <div className="prog-row"><span>Your progress</span><span>{p.pct}%</span></div>
              <Bar p={p.pct} />
              <div className="overview-grid">
                <div className="ov"><small>Lessons done</small><b>{p.done}/{p.total}</b></div>
                <div className="ov"><small>Quizzes</small><b>{qs.filter((q) => s.quiz[q.id]).length}/{qs.length}</b></div>
                <div className="ov"><small>Exercises</small><b>{xs.filter((x) => s.ex[x.id]).length}/{xs.length}</b></div>
              </div>
            </>
          )}
          {tab === 'modules' && <div className="list-rows">{mods.map((m, i) => <ModuleRow key={m.id} m={m} i={i} s={s} />)}</div>}
          {tab === 'lectures' && (lectures.length ? (
            <div className="list-rows">
              {lectures.map((l, i) => (
                <Link key={l.id} className="lr" to={`/student/learning/lecture/${l.id}`}>
                  <Num done={s.done.includes(l.id)} i={i} />
                  <span className="grow"><b>{l.title}</b><small>{find.module(l.moduleId).name} · {l.mins} min</small></span>
                  <Icon name="right" className="chev" />
                </Link>
              ))}
            </div>
          ) : <div className="empty">No lectures yet.</div>)}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Module ---------- */
function ModuleDetail() {
  const { id } = useParams();
  const s = useStudent();
  const m = find.module(id);
  if (!m || !m.open) return <Navigate to="/student/learning" replace />;

  const c = find.course(m.courseId);
  const ls = lecturesOf(m.id);
  const status = moduleStatus(m, s);
  const nxt = ls.find((l) => !s.done.includes(l.id)) || ls[0];

  return (
    <section className="view" id="v-module">
      <Link to={`/student/learning/course/${c.id}`} className="back"><Icon name="arrowleft" box />Back to {c.title}</Link>
      <div className="card" id="moduleDetail">
        <div className="mod-head">
          <span className="tile t-blue"><Icon name="cube" /></span>
          <div><h2>{m.name}</h2><div className="sub">{c.title} · {ls.length} lessons</div></div>
          <StatusChip status={status} />
          {nxt && <div className="push"><Link className="btn btn-primary" to={`/student/learning/lecture/${nxt.id}`}><Icon name="play" />{status === 'Completed' ? 'Watch again' : 'Start lesson'}</Link></div>}
        </div>
        <p className="sec-h">Lectures</p>
        <div className="list-rows">
          {ls.map((l, i) => (
            <Link key={l.id} className="lr" to={`/student/learning/lecture/${l.id}`}>
              <Num done={s.done.includes(l.id)} i={i} />
              <span className="grow"><b>{l.title}</b><small>{l.mins} min · {l.video ? 'Video' : 'Video coming soon'}</small></span>
              <Icon name="right" className="chev" />
            </Link>
          ))}
        </div>
        <Practice moduleId={m.id} s={s} />
      </div>
    </section>
  );
}

/* ---------- 4. Lecture ---------- */
function Lecture() {
  const { id } = useParams();
  const s = useStudent();
  const toast = useToast();
  const navigate = useNavigate();
  const l = find.lecture(id);
  const m = l && find.module(l.moduleId);
  if (!l || !m.open) return <Navigate to="/student/learning" replace />;

  const ls = lecturesOf(m.id);
  const all = D.lectures.filter((x) => find.module(x.moduleId).open);
  const idx = all.indexOf(l);
  const done = s.done.includes(l.id);

  const markDone = () => {
    if (done) return;
    studentStore.update((d) => { d.done.push(l.id); });
    studentStore.earn(D.rules.lesson, `Finished lesson: ${l.title}`);
    toast(moduleStatus(m, studentStore.get()) === 'Completed' ? `Module complete! +${D.rules.lesson} pts` : `Lesson done! +${D.rules.lesson} pts`);
  };
  const step = (d) => { if (all[idx + d]) navigate(`/student/learning/lecture/${all[idx + d].id}`); };

  return (
    <section className="view" id="v-lecture">
      <Link to={`/student/learning/module/${m.id}`} className="back"><Icon name="arrowleft" box />Back to {m.name}</Link>
      <div className="lec-grid">
        <div className="card">
          <div className="video" id="video">
            {l.video ? (
              <>
                <button className="play" type="button" aria-label="Play video on YouTube" onClick={() => window.open(l.video, '_blank', 'noopener')}><Icon name="play" /></button>
                <span className="vtitle">{l.title}</span>
                <span className="vlen">{l.mins}:00</span>
              </>
            ) : (
              <div className="novid"><Icon name="video" />Video coming soon<br /><small>Your teacher has not added a video for this lesson yet.</small></div>
            )}
          </div>
          <div className="lec-head">
            <div><h2>{l.title}</h2><p className="sub">{find.course(m.courseId).title} · {m.name} · {l.mins} min</p></div>
            <span><StatusChip status={done ? 'Completed' : 'Not started'} /></span>
          </div>
          <p className="desc">{l.desc}</p>
          <div className="lec-actions">
            <button className="btn btn-ghost" disabled={idx <= 0} onClick={() => step(-1)}><Icon name="arrowleft" box />Previous</button>
            <button className="btn btn-primary" disabled={done} onClick={markDone}><Icon name="check" />{done ? 'Done' : `Mark as done (+${D.rules.lesson} pts)`}</button>
            <button className="btn btn-ghost" disabled={idx >= all.length - 1} onClick={() => step(1)}>Next<Icon name="arrowright" box /></button>
          </div>
        </div>
        <aside className="card side-list">
          <div className="card-title"><Icon name="list" box />In this module</div>
          <div>
            <div className="list-rows">
              {ls.map((x, i) => (
                <Link key={x.id} className={`lr${x.id === l.id ? ' on' : ''}`} to={`/student/learning/lecture/${x.id}`}>
                  <Num done={s.done.includes(x.id)} i={i} />
                  <span className="grow"><b>{x.title}</b><small>{x.mins} min</small></span>
                </Link>
              ))}
            </div>
          </div>
          <div><Practice moduleId={m.id} s={s} /></div>
        </aside>
      </div>
    </section>
  );
}

export default function Learning() {
  useStyles(css);
  return (
    <Routes>
      <Route index element={<Courses />} />
      <Route path="course/:id" element={<CourseDetail />} />
      <Route path="module/:id" element={<ModuleDetail />} />
      <Route path="lecture/:id" element={<Lecture />} />
      <Route path="*" element={<Navigate to="/student/learning" replace />} />
    </Routes>
  );
}
