import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import { StatusChip } from '../../../components/Chip';
import Pager from '../../../components/Pager';
import { useToast } from '../../../hooks/useToast';
import { useDialogs } from '../../../hooks/useDialogs';
import { adminDb, useAdminData } from '../../../services/adminDb';
import { Crumbs } from './shared';
import { BASE, lessonActs } from './helpers';
import { LmTabs } from './CoursesView';

const META = {
  lessons: { h: 'All Lessons', sub: 'Every lesson across your courses. Open a course to reorder its lessons.', ph: 'Search lessons…' },
  videos: { h: 'Videos', sub: 'Video lessons attached to lessons.', ph: 'Search videos…' }
};

const Acts = ({ onEdit, onPub, pub, onDel }) => (
  <div className="acts">
    <button className="act edit" title="Edit" aria-label="Edit" onClick={onEdit}><Icon name="edit" /></button>
    <button className="act" title={pub ? 'Unpublish' : 'Publish'} aria-label="Toggle publish" onClick={onPub}><Icon name={pub ? 'eyeoff' : 'eye'} /></button>
    <button className="act del" title="Delete" aria-label="Delete" onClick={onDel}><Icon name="trash" /></button>
  </div>
);

/* All lessons / Videos tables with search, course filter and paging */
export default function MaterialsTable({ tab, course, onCourse, onDeleteLesson }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useDialogs();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const videos = useAdminData('videos');
  const activities = useAdminData('activities');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(5);

  const m = META[tab];
  const ql = q.trim().toLowerCase();
  const cf = course ? +course : 0;
  const courseOf = (id) => courses.find((c) => c.id === id);
  const lessonOf = (id) => lessons.find((l) => l.id === id);

  const list = tab === 'lessons'
    ? lessons.filter((x) => (!cf || x.courseId === cf) && (!ql || x.title.toLowerCase().includes(ql))).sort((a, b) => (a.courseId - b.courseId) || (a.order - b.order))
    : videos.filter((x) => { const l = lessonOf(x.lessonId); return (!cf || (l && l.courseId === cf)) && (!ql || x.title.toLowerCase().includes(ql) || (l && l.title.toLowerCase().includes(ql))); });
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * per;

  const togglePub = (item) => {
    const status = item.status === 'Published' ? 'Draft' : 'Published';
    const key = tab === 'lessons' ? 'lessons' : 'videos';
    adminDb.set(key, adminDb.get(key).map((x) => (x.id === item.id ? { ...x, status } : x)));
    toast(`Now ${status.toLowerCase()}`);
  };
  const removeVideo = async (item) => {
    if (!(await confirm({ title: `Delete “${item.title}”?`, text: 'This cannot be undone.' }))) return;
    adminDb.set('videos', videos.filter((x) => x.id !== item.id));
    toast('Deleted');
  };

  return (
    <>
      <Crumbs items={[[tab === 'lessons' ? 'All Lessons' : 'Videos']]} />
      <section className="view" id="v-materials">
        <div className="page-head">
          <div><h1 id="matTitle">{m.h}</h1><p id="matSub">{m.sub}</p></div>
          <div className="head-btns">
            {tab === 'lessons' && <button className="btn btn-primary" id="addLesson" onClick={() => navigate(`${BASE}/lesson/new${course ? `?course=${course}` : ''}`)}><Icon name="plus" box />Add Lesson</button>}
            {tab === 'videos' && <button className="btn btn-primary" id="addVideo" onClick={() => navigate(`${BASE}/video/new`)}><Icon name="video" box />Add Video</button>}
          </div>
        </div>
        <div className="card">
          <div className="toolbar">
            <LmTabs active={tab} />
            <label className="searchbox"><Icon name="search" box /><input id="matSearch" type="search" placeholder={m.ph} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
            <select className="select status-sel" id="matCourse" aria-label="Filter by course" value={course} onChange={(e) => { onCourse(e.target.value); setPage(1); }}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="table-wrap">
            <table className="table stack" id="matTable">
              <thead>
                {tab === 'lessons'
                  ? <tr><th style={{ width: 56 }}>#</th><th>Lesson</th><th>Course</th><th>Activities</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr>
                  : <tr><th style={{ width: 56 }}>#</th><th>Video</th><th>Lesson</th><th>Link</th><th>Status</th><th style={{ width: 130 }}>Actions</th></tr>}
              </thead>
              <tbody>
                {list.length ? list.slice(start, start + per).map((x, i) => (tab === 'lessons' ? (
                  <tr key={x.id}>
                    <td className="hide-m" data-label="#">{x.order}</td>
                    <td className="primary cell-strong" data-label="Lesson">{x.title}</td>
                    <td data-label="Course">{(courseOf(x.courseId) || {}).title}</td>
                    <td data-label="Activities">{lessonActs(activities, x.id).length}</td>
                    <td data-label="Status"><StatusChip status={x.status} /></td>
                    <td className="acts-cell"><Acts pub={x.status === 'Published'} onEdit={() => navigate(`${BASE}/lesson/${x.id}`)} onPub={() => togglePub(x)} onDel={() => onDeleteLesson(x)} /></td>
                  </tr>
                ) : (
                  <tr key={x.id}>
                    <td className="hide-m" data-label="#">{start + i + 1}</td>
                    <td className="primary cell-strong" data-label="Video">{x.title}</td>
                    <td data-label="Lesson">{(lessonOf(x.lessonId) || {}).title || '—'}</td>
                    <td data-label="Link"><span className="chip chip-blue">▶ Linked</span></td>
                    <td data-label="Status"><StatusChip status={x.status} /></td>
                    <td className="acts-cell"><Acts pub={x.status === 'Published'} onEdit={() => navigate(`${BASE}/video/${x.id}`)} onPub={() => togglePub(x)} onDel={() => removeVideo(x)} /></td>
                  </tr>
                ))) : <tr><td colSpan="6" className="empty"><Img file="mascot-sad.png" />Nothing found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pager total={list.length} page={cur} per={per} onPage={setPage} onPer={(n) => { setPer(n); setPage(1); }} />
        </div>
      </section>
    </>
  );
}
