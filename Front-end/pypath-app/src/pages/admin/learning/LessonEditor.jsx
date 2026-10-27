import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/Icon';
import CodeBlock from '../../../components/CodeBlock';
import { useToast } from '../../../hooks/useToast';
import { adminDb, useAdminData } from '../../../services/adminDb';
import { lines, nextId } from '../../../lib/text';
import { Crumbs } from './shared';
import { BASE, courseLessons, lessonActs, renumber, uniqueTitle } from './helpers';

/* Live "student preview" next to the lesson form */
function LessonPreview({ f, courses }) {
  const obj = lines(f.objectives);
  const content = f.content.trim();
  const c = courses.find((x) => x.id === +f.courseId);
  return (
    <div id="lessonPrev" className="lesson-prev">
      <div className="lp-eyebrow">{c ? c.title : 'Course'}</div>
      <h3 className="lp-title">{f.title.trim() || 'Lesson title'}</h3>
      {obj.length > 0 && <div className="lp-sec"><b>Objectives</b><ul>{obj.map((o, i) => <li key={i}>{o}</li>)}</ul></div>}
      {content
        ? <div className="lp-sec">{content.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim().split('\n').flatMap((ln, k) => (k ? [<br key={`b${k}`} />, ln] : [ln]))}</p>)}</div>
        : <p className="sub">Lesson content will appear here.</p>}
      {f.code.trim() && <div className="lp-sec"><b>Code example</b><CodeBlock code={f.code} /></div>}
      {f.output.trim() && <div className="lp-sec"><div className="output"><small>Expected output</small>{f.output.trim()}</div></div>}
      {f.practice.trim() && <div className="lp-sec lp-practice"><b>Try it yourself</b><p>{f.practice.trim()}</p></div>}
    </div>
  );
}

/* Add / edit a lesson: /admin/learning/lesson/new?course=1  or  /admin/learning/lesson/101 */
export default function LessonEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const activities = useAdminData('activities');
  const l = id === 'new' ? null : lessons.find((x) => x.id === +id);
  const noCourses = !courses.length;

  useEffect(() => { if (noCourses) toast('Add a course before adding lessons.', 'error'); }, [noCourses, toast]);
  if ((id !== 'new' && !l) || noCourses) return <Navigate to={BASE} replace />;

  const cidParam = +params.get('course');
  const startCourse = l ? l.courseId : (courses.some((c) => c.id === cidParam) ? cidParam : courses[0].id);
  return <Form key={id} l={l} startCourse={startCourse} courses={courses} lessons={lessons} activities={activities} navigate={navigate} toast={toast} />;
}

function Form({ l, startCourse, courses, lessons, activities, navigate, toast }) {
  const [f, setF] = useState({
    title: l ? l.title : '', courseId: startCourse, status: l ? l.status : 'Draft', objectives: l ? l.objectives : '', content: l ? l.content : '',
    code: l ? l.code : '', output: l ? l.output : '', practice: l ? l.practice : ''
  });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const course = courses.find((c) => c.id === startCourse);
  const la = l ? lessonActs(activities, l.id) : [];
  const back = () => navigate(`${BASE}/course/${l ? l.courseId : startCourse}`);

  const submit = (e) => {
    e.preventDefault();
    const title = f.title.trim();
    const cid = +f.courseId;
    const content = f.content.trim();
    const next = {
      title: !title ? 'Lesson title is required.' : cid && !uniqueTitle(lessons, title, l && l.id, (x) => x.courseId === cid) ? 'This course already has a lesson with this title.' : '',
      course: cid ? '' : 'Choose a course.',
      content: f.status === 'Published' && !content ? 'Add lesson content before publishing.' : ''
    };
    setErrs(next);
    if (Object.values(next).some(Boolean)) return;

    const data = { title, courseId: cid, status: f.status, objectives: lines(f.objectives).join('\n'), content, code: f.code.replace(/\s+$/, ''), output: f.output.replace(/\s+$/, ''), practice: f.practice.trim() };
    if (l) {
      const moved = l.courseId !== cid;
      let next2 = lessons.map((x) => (x.id === l.id ? { ...x, ...data, ...(moved ? { order: courseLessons(lessons, cid).length + 1 } : {}) } : x));
      if (moved) {
        next2 = renumber(renumber(next2, l.courseId), cid);
        adminDb.set('activities', activities.map((a) => (a.lessonId === l.id ? { ...a, lessonId: null } : a)));
      }
      adminDb.set('lessons', next2);
    } else {
      adminDb.set('lessons', [...lessons, { id: nextId(lessons, 100), order: courseLessons(lessons, cid).length + 1, ...data }]);
    }
    toast(l ? 'Lesson updated' : 'Lesson added');
    navigate(`${BASE}/course/${cid}`);
  };

  return (
    <>
      <Crumbs items={[[course.title, `${BASE}/course/${course.id}`], [l ? l.title : 'New lesson']]} />
      <section className="view" id="v-lesson">
        <div className="page-head"><div><h1 id="lsTitleH">{l ? 'Edit Lesson' : 'Add Lesson'}</h1><p>This is what students read, so write it for beginners.</p></div></div>
        <div className="form-grid">
          <form className="card" id="lessonForm" noValidate onSubmit={submit}>
            <div className="field"><label htmlFor="sTitle">Lesson title <span className="req">*</span></label><input className={`input${errs.title ? ' bad' : ''}`} id="sTitle" placeholder="e.g. Variables and Data Types" autoComplete="off" value={f.title} onChange={set('title')} /><div className="err">{errs.title}</div></div>
            <div className="row2">
              <div className="field"><label htmlFor="sCourse">Course <span className="req">*</span></label>
                <select className={`select${errs.course ? ' bad' : ''}`} id="sCourse" value={f.courseId} onChange={set('courseId')}>
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select><div className="err">{errs.course}</div></div>
              <div className="field"><label htmlFor="sStatus">Status</label><select className="select" id="sStatus" value={f.status} onChange={set('status')}><option>Draft</option><option>Published</option></select></div>
            </div>
            <div className="field"><label htmlFor="sObj">Learning objectives <span className="sub">(one per line)</span></label><textarea className="textarea" id="sObj" placeholder={'Create variables\nRecognize basic data types'} value={f.objectives} onChange={set('objectives')} /></div>
            <div className="field"><label htmlFor="sContent">Lesson content <span className="req">*</span> <span className="sub">(leave a blank line between paragraphs)</span></label><textarea className={`textarea tall${errs.content ? ' bad' : ''}`} id="sContent" placeholder="Explain the topic in simple words…" value={f.content} onChange={set('content')} /><div className="err">{errs.content}</div></div>
            <div className="field"><label htmlFor="sCode">Code example</label><textarea className="textarea mono" id="sCode" spellCheck="false" placeholder={'name = "Ana"\nprint(name)'} value={f.code} onChange={set('code')} /></div>
            <div className="field"><label htmlFor="sOut">Expected output</label><textarea className="textarea mono" id="sOut" spellCheck="false" placeholder="Ana" value={f.output} onChange={set('output')} /></div>
            <div className="field"><label htmlFor="sPractice">Short practice exercise</label><textarea className="textarea" id="sPractice" placeholder="Ask the student to try something small." value={f.practice} onChange={set('practice')} /></div>
            {l && (
              <div className="field" id="linkedField">
                <span className="label">Linked activities</span>
                <div id="linkedList">
                  {la.length ? (
                    <div className="linked">
                      {la.map((a) => <Link key={a.id} className={`chip chip-${a.type === 'quiz' ? 'purple' : 'blue'}`} to={`/admin/activities/${a.id}/edit`}>{a.type === 'quiz' ? 'Quiz' : 'Exercise'}: {a.title} · {a.diff}</Link>)}
                    </div>
                  ) : <p className="sub">No activities are linked to this lesson yet.</p>}
                  <Link className="add-link" to={`/admin/activities/new?course=${l.courseId}&lesson=${l.id}`}><Icon name="plus" />Add an activity for this lesson</Link>
                </div>
              </div>
            )}
            <div className="form-actions"><button type="button" className="btn btn-ghost" id="cancelLesson" onClick={back}>Cancel</button><button className="btn btn-primary" type="submit">Save Lesson</button></div>
          </form>
          <aside className="card preview-card"><div className="card-title">Student preview</div><LessonPreview f={f} courses={courses} /></aside>
        </div>
      </section>
    </>
  );
}
