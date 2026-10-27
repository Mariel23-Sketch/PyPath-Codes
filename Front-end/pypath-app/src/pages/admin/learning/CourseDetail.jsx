import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import Avatar from '../../../components/Avatar';
import { StatusChip } from '../../../components/Chip';
import { useToast } from '../../../hooks/useToast';
import { adminDb, useAdminData } from '../../../services/adminDb';
import { plural } from '../../../lib/text';
import { CourseTile, Crumbs } from './shared';
import { BASE, courseActs, courseLessons, lessonActs } from './helpers';

const TABS = ['lessons', 'overview', 'students', 'settings'];

/* One course: Lessons (reorder, publish, edit, delete) / Overview / Students / Settings */
export default function CourseDetail({ onEdit, onDeleteCourse, onDeleteLesson }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const activities = useAdminData('activities');
  const c = courses.find((x) => x.id === +id);
  const [tab, setTab] = useState(TABS.includes(params.get('tab')) ? params.get('tab') : 'lessons');
  if (!c) return <Navigate to={BASE} replace />;

  const ls = courseLessons(lessons, c.id);
  const acts = courseActs(activities, c.id);
  const pub = ls.filter((l) => l.status === 'Published').length;

  const setCourse = (patch) => adminDb.set('courses', courses.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
  const togglePub = (l) => {
    const status = l.status === 'Published' ? 'Draft' : 'Published';
    adminDb.set('lessons', lessons.map((x) => (x.id === l.id ? { ...x, status } : x)));
    toast(`“${l.title}” is now ${status.toLowerCase()}`);
  };
  const move = (l, dir) => {
    const i = ls.findIndex((x) => x.id === l.id);
    const j = i + dir;
    if (j < 0 || j >= ls.length) return;
    const order = ls.map((x) => x.id);
    [order[i], order[j]] = [order[j], order[i]];
    adminDb.set('lessons', lessons.map((x) => (order.includes(x.id) ? { ...x, order: order.indexOf(x.id) + 1 } : x)));
  };

  return (
    <>
      <Crumbs items={[[c.title]]} />
      <section className="view" id="v-course">
        <div className="card" id="courseDetail">
          <div className="cd-head">
            <CourseTile c={c} />
            <div><h2>{c.title}</h2><div className="sub">{c.level} • {plural(ls.length, 'lesson', 'lessons')} • {plural(acts.length, 'activity', 'activities')}</div></div>
            <StatusChip status={c.status} />
            <div className="push"><button className="btn btn-primary" id="cdEdit" onClick={() => onEdit(c)}><Icon name="edit" />Edit Course</button></div>
          </div>
          <div className="cd-tabs" id="cdTabs">
            {TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          </div>
          <div className="cd-body" id="cdBody">
            {tab === 'overview' && (
              <>
                <p className="desc">{c.desc || 'No description yet.'}</p>
                <div className="mini-stats">
                  <div className="rs"><small>Lessons published</small><b>{pub}/{ls.length}</b></div>
                  <div className="rs"><small>Activities</small><b>{acts.length}</b></div>
                  <div className="rs"><small>Students</small><b>{c.students}</b></div>
                </div>
                <div className="prog-row"><span>Average student progress</span><span>{c.avg}%</span></div>
                <div className="bar"><i style={{ width: `${c.avg}%` }} /></div>
              </>
            )}

            {tab === 'lessons' && (
              <>
                <div className="lessons-bar">
                  <p className="sub">Lessons appear to students in this order. Use the arrows to rearrange them.</p>
                  <button className="btn btn-primary btn-sm" id="cdAddLesson" onClick={() => navigate(`${BASE}/lesson/new?course=${c.id}`)}><Icon name="plus" />Add Lesson</button>
                </div>
                {ls.length ? (
                  <div className="list-rows lesson-rows">
                    {ls.map((l, i) => (
                      <div className="lr" key={l.id}>
                        <span className="n">{i + 1}</span>
                        <div className="grow">
                          <button className="lesson-link" onClick={() => navigate(`${BASE}/lesson/${l.id}`)}>{l.title}</button>
                          <small className="sub">{l.content ? 'Has content' : 'No content yet'} • {plural(lessonActs(activities, l.id).length, 'activity', 'activities')} linked</small>
                        </div>
                        <StatusChip status={l.status} />
                        <div className="acts">
                          <button className="act" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => move(l, -1)}><Icon name="arrowup" /></button>
                          <button className="act" title="Move down" aria-label="Move down" disabled={i === ls.length - 1} onClick={() => move(l, 1)}><span className="flip"><Icon name="arrowup" /></span></button>
                          <button className="act" title={l.status === 'Published' ? 'Unpublish' : 'Publish'} aria-label="Toggle publish" onClick={() => togglePub(l)}><Icon name={l.status === 'Published' ? 'eyeoff' : 'eye'} /></button>
                          <button className="act edit" title="Edit" aria-label="Edit" onClick={() => navigate(`${BASE}/lesson/${l.id}`)}><Icon name="edit" /></button>
                          <button className="act del" title="Delete" aria-label="Delete" onClick={() => onDeleteLesson(l)}><Icon name="trash" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty"><Img file="mascot-sad.png" />No lessons in this course yet. Add the first lesson.</div>}
              </>
            )}

            {tab === 'students' && (c.students ? (
              <>
                <p className="desc"><b>{c.students}</b> students are enrolled in this course.</p>
                <div style={{ display: 'flex' }}>
                  {['Jasmine Santos', 'Marco Rivera', 'Lian Cruz', 'Aira Delgado', 'Noah Reyes'].map((n) => <span key={n} style={{ marginRight: -8 }}><Avatar name={n} /></span>)}
                </div>
              </>
            ) : <div className="empty">No students enrolled yet.</div>)}

            {tab === 'settings' && (
              <>
                <div className="set-row">
                  <div><b>Published</b><small>Students can see and join this course.</small></div>
                  <label className="switch">
                    <input type="checkbox" id="cdPub" checked={c.status === 'Published'} onChange={(e) => { const status = e.target.checked ? 'Published' : 'Draft'; setCourse({ status }); toast(`Course ${status.toLowerCase()}`); }} /><i />
                  </label>
                </div>
                <div className="set-row">
                  <div><b>Delete course</b><small>This also removes its lessons and activities.</small></div>
                  <button className="btn btn-ghost btn-sm" id="cdDel" style={{ color: 'var(--red)' }} onClick={() => onDeleteCourse(c)}><Icon name="trash" />Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
