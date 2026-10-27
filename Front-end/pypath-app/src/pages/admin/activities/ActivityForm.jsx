import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import CodeBlock from '../../../components/CodeBlock';
import { Chip, StatusChip } from '../../../components/Chip';
import { useToast } from '../../../hooks/useToast';
import { adminDb, useAdminData } from '../../../services/adminDb';
import { letter, nextId } from '../../../lib/text';
import { Crumbs, TypeChip } from './shared';
import { BASE } from './helpers';

const freshQ = (kind) => (kind === 'tf'
  ? { text: '', kind: 'tf', opts: ['True', 'False'], correct: 0, points: 1, feedback: '' }
  : { text: '', kind: 'mc', opts: ['', '', '', ''], correct: 0, points: 1, feedback: '' });
const totalPts = (qs) => qs.reduce((s, q) => s + (+q.points || 0), 0);

/* Add / edit an activity: /admin/activities/new?course=1&lesson=101 or /admin/activities/301/edit */
export default function ActivityForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const activities = useAdminData('activities');
  const x = id ? activities.find((z) => z.id === +id) : null;
  const noCourses = !courses.length;

  useEffect(() => { if (noCourses) toast('Add a course before adding activities.', 'error'); }, [noCourses, toast]);
  if ((id && !x) || noCourses) return <Navigate to={BASE} replace />;

  const cid = +params.get('course');
  const cc = courses.some((c) => c.id === cid) ? cid : courses[0].id;
  const ll = lessons.find((l) => l.id === +params.get('lesson'));
  const start = x ? structuredClone(x) : {
    id: null, type: 'quiz', title: '', courseId: cc, lessonId: ll && ll.courseId === cc ? ll.id : null, diff: 'Easy', status: 'Draft',
    pass: 60, qs: [], pts: 10, instr: '', code: '', validation: 'output', expected: '', feedbackOk: '', feedbackBad: ''
  };
  return <Form key={id || 'new'} start={start} x={x} courses={courses} lessons={lessons} activities={activities} />;
}

function Preview({ form, courses, lessons, selQ, onPick }) {
  const c = courses.find((z) => z.id === form.courseId);
  const l = lessons.find((z) => z.id === form.lessonId);
  const meta = (
    <div className="pv-meta"><TypeChip type={form.type} /><StatusChip status={form.diff} />{c && <Chip kind="blue">{c.title + (l ? ` › ${l.title}` : '')}</Chip>}</div>
  );
  if (form.type === 'quiz') {
    if (!form.qs.length) return <div id="prev">{meta}<div className="pv-empty"><Img file="mascot-wave.png" />Add a question to see how students will view it.</div></div>;
    const qi = Math.min(selQ, form.qs.length - 1);
    const q = form.qs[qi];
    return (
      <div id="prev">
        {meta}
        <div className="pv-nav">
          {form.qs.map((_, i) => <button key={i} type="button" className={i === qi ? 'on' : ''} aria-label={`Preview question ${i + 1}`} onClick={() => onPick(i)}>{i + 1}</button>)}
        </div>
        <p className="pv-q">Q{qi + 1}. {q.text || 'Your question will appear here'}</p>
        {q.opts.map((o, i) => <div key={i} className={`pv-opt ${i === q.correct ? 'ok' : ''}`}><span className="dotr" />{q.kind === 'tf' ? '' : `${letter(i)}) `}{o || `Option ${letter(i)}`}</div>)}
        {q.feedback && <p className="pv-expl"><b>Feedback:</b> {q.feedback}</p>}
      </div>
    );
  }
  return (
    <div id="prev">
      {meta}
      <p className="pv-q">{form.title.trim() || 'Exercise title'}</p>
      <p className="sub" style={{ marginBottom: 12, fontSize: 13.5 }}>{form.instr || 'Instructions will appear here.'}</p>
      <CodeBlock code={form.code || '# your code here'} />
      {form.validation === 'output'
        ? <div className="output"><small>Expected output</small>{form.expected || '—'}</div>
        : <p className="pv-expl">This answer is reviewed by a teacher.</p>}
      <p className="pv-expl">Worth <b>{form.pts || 0}</b> points.</p>
    </div>
  );
}

function Form({ start, x, courses, lessons, activities }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(start);
  const [selQ, setSelQ] = useState(0);
  const [errs, setErrs] = useState({});
  const focusNew = useRef(false);
  const patch = (p) => setForm((f) => ({ ...f, ...p }));
  const setQ = (qi, p) => setForm((f) => ({ ...f, qs: f.qs.map((q, i) => (i === qi ? { ...q, ...p } : q)) }));

  const courseLessons = lessons.filter((l) => l.courseId === form.courseId).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!focusNew.current) return;
    focusNew.current = false;
    const el = document.querySelector(`.q-card[data-qi="${selQ}"] .q-text`);
    if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }, [form.qs.length, selQ]);

  const addQuestion = () => {
    focusNew.current = true;
    setForm((f) => ({ ...f, qs: [...f.qs, freshQ('mc')] }));
    setSelQ(form.qs.length);
    setErrs((e) => ({ ...e, qs: '' }));
  };
  const removeQ = (qi) => {
    setForm((f) => ({ ...f, qs: f.qs.filter((_, i) => i !== qi) }));
    setSelQ(Math.max(0, selQ - (selQ >= qi ? 1 : 0)));
  };
  const changeKind = (qi, kind) => {
    const old = form.qs[qi];
    setQ(qi, { ...freshQ(kind), text: old.text, points: old.points, feedback: old.feedback });
    setSelQ(qi);
  };
  const setType = (t) => patch({ type: t, ...(t === 'exercise' && !form.pts ? { pts: 10 } : {}) });

  const submit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const quiz = form.type === 'quiz';
    const err = {};
    if (!title) err.title = 'Activity title is required.';
    else if (activities.some((a) => a.id !== form.id && a.courseId === form.courseId && a.title.toLowerCase() === title.toLowerCase())) err.title = 'This course already has an activity with this title.';
    if (!form.courseId || !courses.some((c) => c.id === form.courseId)) err.course = 'Choose a course.';
    if (quiz) {
      const pass = +form.pass;
      if (!(pass >= 1 && pass <= 100)) err.pass = 'Enter a passing score from 1 to 100.';
      if (!form.qs.length) err.qs = 'Add at least one question.';
      else {
        const bad = form.qs.findIndex((q) => !q.text.trim() || q.opts.some((o) => !o.trim()) || !(q.points >= 1));
        if (bad > -1) { err.qs = `Question ${bad + 1} needs a question, every answer choice and at least 1 point.`; setSelQ(bad); }
      }
    } else {
      if (!form.instr.trim()) err.instr = 'Add the problem description and instructions.';
      if (!(form.pts >= 1)) err.pts = 'Enter points of 1 or more.';
      if (form.validation === 'output' && !form.expected.trim()) err.expected = 'Add the expected output, or switch to manual review.';
    }
    setErrs(err);
    if (Object.keys(err).length) return;

    const rec = { type: form.type, title, courseId: form.courseId, lessonId: form.lessonId, diff: form.diff, status: form.status };
    if (quiz) {
      Object.assign(rec, {
        pass: +form.pass, qs: form.qs.map((q) => ({ text: q.text.trim(), kind: q.kind, opts: q.opts.map((o) => o.trim()), correct: q.correct, points: +q.points, feedback: q.feedback.trim() })),
        pts: 0, instr: '', code: '', expected: '', validation: 'output', feedbackOk: '', feedbackBad: ''
      });
    } else {
      Object.assign(rec, {
        qs: [], pass: 60, pts: Math.round(form.pts), instr: form.instr.trim(), code: form.code.replace(/\s+$/, ''), validation: form.validation,
        expected: form.validation === 'output' ? form.expected.replace(/\s+$/, '') : '', feedbackOk: form.feedbackOk.trim(), feedbackBad: form.feedbackBad.trim()
      });
    }
    adminDb.set('activities', form.id ? activities.map((a) => (a.id === form.id ? { ...a, ...rec } : a)) : [...activities, { id: nextId(activities, 300), ...rec }]);
    toast(form.id ? 'Activity updated' : 'Activity saved');
    navigate(BASE);
  };

  const quiz = form.type === 'quiz';
  return (
    <>
      <Crumbs items={[[x ? x.title : 'New activity']]} />
      <section className="view" id="v-form">
        <div className="page-head"><div><h1 id="formTitle">{x ? 'Edit Activity' : 'Add Activity'}</h1><p>Choose a quiz or a practical exercise, then link it to a course and lesson.</p></div></div>
        <div className="form-grid">
          <form className="card" id="actForm" noValidate onSubmit={submit}>
            <div className="field"><label htmlFor="aTitle">Activity title <span className="req">*</span></label><input className={`input${errs.title ? ' bad' : ''}`} id="aTitle" placeholder="e.g. Variables Quiz" autoComplete="off" value={form.title} onChange={(e) => patch({ title: e.target.value })} /><div className="err">{errs.title}</div></div>
            <div className="field"><span className="label">Activity type <span className="req">*</span></span>
              <div className="radios" id="typeRadios">
                <label className="radio"><input type="radio" name="atype" value="quiz" checked={quiz} onChange={() => setType('quiz')} /> Quiz</label>
                <label className="radio"><input type="radio" name="atype" value="exercise" checked={!quiz} onChange={() => setType('exercise')} /> Programming exercise</label>
              </div>
            </div>
            <div className="row2">
              <div className="field"><label htmlFor="aCourse">Course <span className="req">*</span></label>
                <select className={`select${errs.course ? ' bad' : ''}`} id="aCourse" value={form.courseId} onChange={(e) => {
                  const cid = +e.target.value;
                  const l = lessons.find((z) => z.id === form.lessonId);
                  patch({ courseId: cid, ...(!l || l.courseId !== cid ? { lessonId: null } : {}) });
                }}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select><div className="err">{errs.course}</div></div>
              <div className="field"><label htmlFor="aLesson">Lesson</label>
                <select className="select" id="aLesson" value={form.lessonId || ''} onChange={(e) => patch({ lessonId: e.target.value ? +e.target.value : null })}>
                  <option value="">Whole course (no specific lesson)</option>
                  {courseLessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select></div>
            </div>
            <div className="row2">
              <div className="field"><span className="label">Difficulty <span className="req">*</span></span>
                <div className="radios">
                  {['Easy', 'Medium', 'Hard'].map((d) => <label key={d} className="radio"><input type="radio" name="diff" value={d} checked={form.diff === d} onChange={() => patch({ diff: d })} /> {d}</label>)}
                </div>
              </div>
              <div className="field"><label htmlFor="aStatus">Status</label><select className="select" id="aStatus" value={form.status} onChange={(e) => patch({ status: e.target.value })}><option>Draft</option><option>Published</option></select></div>
            </div>

            {quiz && (
              <div id="quizBox">
                <div className="row2">
                  <div className="field"><label htmlFor="aPass">Passing score (%)</label><input className={`input${errs.pass ? ' bad' : ''}`} id="aPass" type="number" min="1" max="100" value={form.pass} onChange={(e) => patch({ pass: e.target.value })} /><div className="err">{errs.pass}</div></div>
                  <div className="field"><span className="label">Total points</span><div className="total-pts" id="totalPts">{totalPts(form.qs)}</div></div>
                </div>
                <div className="field">
                  <span className="label">Questions <span className="req">*</span></span>
                  <div><button type="button" className="btn btn-soft btn-sm" id="addQ" onClick={addQuestion}><Icon name="plus" box />Add Question</button></div>
                  <div className="err">{errs.qs}</div>
                </div>
                <div id="qList">
                  {form.qs.map((q, qi) => (
                    <div key={qi} className={`q-card ${qi === selQ ? 'sel' : ''}`} data-qi={qi} onFocus={() => setSelQ(qi)}>
                      <div className="q-top"><b>Question {qi + 1}</b>
                        <div className="q-ctl">
                          <select className="select q-kind" aria-label="Question type" value={q.kind} onChange={(e) => changeKind(qi, e.target.value)}><option value="mc">Multiple choice</option><option value="tf">True or False</option></select>
                          <input className="input pts q-pts" type="number" min="1" aria-label={`Points for question ${qi + 1}`} value={q.points} onChange={(e) => { setQ(qi, { points: +e.target.value || 0 }); setSelQ(qi); }} /><span className="sub">pts</span>
                          <button type="button" onClick={() => removeQ(qi)}><Icon name="trash" />Remove</button>
                        </div>
                      </div>
                      <input className="input q-text" placeholder="Type the question…" aria-label={`Question ${qi + 1} text`} value={q.text} onChange={(e) => setQ(qi, { text: e.target.value })} />
                      {q.opts.map((o, oi) => (
                        <div className="opt-row" key={oi}>
                          <span className="letter">{letter(oi)}</span>
                          {q.kind === 'tf'
                            ? <span className="tf-label">{o}</span>
                            : <input className="input q-opt" placeholder={`Option ${letter(oi)}`} aria-label={`Option ${letter(oi)}`} value={o} onChange={(e) => setQ(qi, { opts: q.opts.map((v, k) => (k === oi ? e.target.value : v)) })} />}
                          <label className="radio" title="Mark as correct answer"><input type="radio" name={`c${qi}`} checked={q.correct === oi} aria-label={`Correct answer ${letter(oi)}`} onChange={() => { setQ(qi, { correct: oi }); setSelQ(qi); }} /></label>
                        </div>
                      ))}
                      <div className="hint">Select the radio button next to the correct answer.</div>
                      <textarea className="textarea q-fb" placeholder="Feedback shown after submission (optional)" aria-label={`Feedback for question ${qi + 1}`} value={q.feedback} onChange={(e) => setQ(qi, { feedback: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!quiz && (
              <div id="exBox">
                <div className="field"><label htmlFor="xInstr">Problem description and instructions <span className="req">*</span></label><textarea className={`textarea${errs.instr ? ' bad' : ''}`} id="xInstr" placeholder="Describe the problem and what the student must do." value={form.instr} onChange={(e) => patch({ instr: e.target.value })} /><div className="err">{errs.instr}</div></div>
                <div className="field"><label htmlFor="xCode">Starter code</label><textarea className="textarea mono" id="xCode" spellCheck="false" placeholder="# students start here" value={form.code} onChange={(e) => patch({ code: e.target.value })} /></div>
                <div className="row2">
                  <div className="field"><label htmlFor="xVal">How is the answer checked?</label><select className="select" id="xVal" value={form.validation} onChange={(e) => patch({ validation: e.target.value })}><option value="output">Program output must match</option><option value="manual">Manual review by the teacher</option></select></div>
                  <div className="field"><label htmlFor="xPts">Points <span className="req">*</span></label><input className={`input${errs.pts ? ' bad' : ''}`} id="xPts" type="number" min="1" value={form.pts} onChange={(e) => patch({ pts: +e.target.value || 0 })} /><div className="err">{errs.pts}</div></div>
                </div>
                {form.validation === 'output' && (
                  <div className="field" id="expField"><label htmlFor="xExp">Expected output <span className="req">*</span></label><textarea className={`textarea mono${errs.expected ? ' bad' : ''}`} id="xExp" spellCheck="false" placeholder="Hello, Python!" value={form.expected} onChange={(e) => patch({ expected: e.target.value })} /><div className="hint">The student&#39;s output is compared line by line. Extra spaces at the ends are ignored.</div><div className="err">{errs.expected}</div></div>
                )}
                <div className="row2">
                  <div className="field"><label htmlFor="xOk">Feedback when correct</label><textarea className="textarea" id="xOk" placeholder="Great job! Your program works." value={form.feedbackOk} onChange={(e) => patch({ feedbackOk: e.target.value })} /></div>
                  <div className="field"><label htmlFor="xBad">Hint when incorrect</label><textarea className="textarea" id="xBad" placeholder="Check your output and try again." value={form.feedbackBad} onChange={(e) => patch({ feedbackBad: e.target.value })} /></div>
                </div>
              </div>
            )}

            <div className="form-actions"><button type="button" className="btn btn-ghost" id="cancelForm" onClick={() => navigate(BASE)}>Cancel</button><button className="btn btn-primary" type="submit">Save Activity</button></div>
          </form>

          <aside className="card preview-card">
            <div className="card-title">Student preview</div>
            <Preview form={form} courses={courses} lessons={lessons} selQ={selQ} onPick={setSelQ} />
          </aside>
        </div>
      </section>
    </>
  );
}
