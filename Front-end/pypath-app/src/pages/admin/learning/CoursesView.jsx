import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import { StatusChip } from '../../../components/Chip';
import { useAdminData } from '../../../services/adminDb';
import { plural } from '../../../lib/text';
import { CourseTile, Crumbs } from './shared';
import { BASE, courseActs } from './helpers';

/* Pill tabs shared by the courses / all lessons / videos screens */
export function LmTabs({ active }) {
  return (
    <div className="pills lm-tabs" role="tablist">
      <Link className={`pill${active === 'courses' ? ' on' : ''}`} to={BASE}>Courses</Link>
      <Link className={`pill${active === 'lessons' ? ' on' : ''}`} to={`${BASE}/lessons`} data-t="lessons">All Lessons</Link>
      <Link className={`pill${active === 'videos' ? ' on' : ''}`} to={`${BASE}/videos`} data-t="videos">Videos</Link>
    </div>
  );
}

/* Manage Courses list */
export default function CoursesView({ onAdd, onEdit, onDelete }) {
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const activities = useAdminData('activities');
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const ql = q.trim().toLowerCase();
  const list = courses.filter((c) => !ql || c.title.toLowerCase().includes(ql) || c.desc.toLowerCase().includes(ql));
  const open = (c) => navigate(`${BASE}/course/${c.id}`);

  return (
    <>
      <Crumbs items={[['Manage Courses']]} />
      <section className="view" id="v-courses">
        <div className="page-head">
          <div><h1>Manage Courses</h1><p>Create courses and organise the lessons inside them.</p></div>
          <button className="btn btn-primary" id="addCourse" onClick={onAdd}><Icon name="plus" box />Add Course</button>
        </div>
        <div className="card">
          <div className="toolbar">
            <LmTabs active="courses" />
            <label className="searchbox"><Icon name="search" box /><input id="courseSearch" type="search" placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          </div>
          <div className="course-list" id="courseList">
            {list.length ? list.map((c) => (
              <article key={c.id} className="course-card" tabIndex={0} role="link" aria-label={`Open ${c.title}`}
                onClick={() => open(c)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(c); }}>
                <CourseTile c={c} />
                <div className="cc-main">
                  <h3>{c.title}</h3>
                  <p className="cc-desc">{c.desc || 'No description yet.'}</p>
                  <p>{c.level} • {plural(lessons.filter((l) => l.courseId === c.id).length, 'lesson', 'lessons')} • {plural(courseActs(activities, c.id).length, 'activity', 'activities')}</p>
                </div>
                <div className="cc-side">
                  <StatusChip status={c.status} />
                  <div className="cc-links">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(c); }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); open(c); }}>View Course</button>
                    <button className="del" onClick={(e) => { e.stopPropagation(); onDelete(c); }}>Delete</button>
                  </div>
                </div>
                <span className="cc-chev"><Icon name="right" /></span>
              </article>
            )) : <div className="empty"><Img file="mascot-sad.png" />{ql ? 'No courses match your search.' : 'No courses yet. Add your first course to get started.'}</div>}
          </div>
        </div>
      </section>
    </>
  );
}
