import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import { StatusChip } from '../../../components/Chip';
import Pager from '../../../components/Pager';
import { usePageSearch } from '../../../hooks/usePageSearch';
import { useToast } from '../../../hooks/useToast';
import { useDialogs } from '../../../hooks/useDialogs';
import { actPoints, adminDb, useAdminData } from '../../../services/adminDb';
import { Crumbs, TypeChip } from './shared';
import { BASE, whereIs } from './helpers';

const DIFF = {
  Easy: { icon: 'star', text: 'Basic questions and beginner-friendly Python exercises.' },
  Medium: { icon: 'chart', text: 'Intermediate questions that require applying programming concepts.' },
  Hard: { icon: 'award', text: 'Advanced programming challenges and problem-solving exercises.' }
};

/* Activities home: difficulty cards, filters and the table of quizzes / exercises */
export default function ActivityList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useDialogs();
  const [params, setParams] = useSearchParams();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const activities = useAdminData('activities');
  const tableRef = useRef(null);

  const [q, setQ] = useState(params.get('q') || '');
  const [diff, setDiff] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(5);
  const type = params.get('type') || ''; // the sidebar "Quizzes" / "Exercises" links set this
  usePageSearch((v) => { setQ(v); setPage(1); });

  const setType = (t) => { setParams(t ? { type: t } : {}); setPage(1); };
  const pickDiff = (d) => { setDiff(d); setPage(1); };

  const ql = q.trim().toLowerCase();
  const list = activities.filter((a) => (!ql || a.title.toLowerCase().includes(ql) || whereIs(a, courses, lessons).lesson.toLowerCase().includes(ql))
    && (!diff || a.diff === diff) && (!course || a.courseId === +course) && (!type || a.type === type) && (!status || a.status === status));
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * per;

  const togglePub = (x) => {
    if (x.status === 'Draft' && x.type === 'quiz' && !x.qs.length) { toast('Add questions before publishing.', 'error'); return; }
    if (x.status === 'Draft' && x.type === 'exercise' && !x.instr.trim()) { toast('Add instructions before publishing.', 'error'); return; }
    const next = x.status === 'Published' ? 'Draft' : 'Published';
    adminDb.set('activities', activities.map((a) => (a.id === x.id ? { ...a, status: next } : a)));
    toast(`“${x.title}” is now ${next.toLowerCase()}`);
  };
  const remove = async (x) => {
    if (await confirm({ title: 'Delete this activity?', text: `“${x.title}”${x.type === 'quiz' ? ` and its ${x.qs.length} question(s)` : ''} will be removed. Student attempts for it will no longer be shown.` })) {
      adminDb.set('activities', activities.filter((a) => a.id !== x.id));
      toast('Activity deleted');
    }
  };

  return (
    <>
      <Crumbs items={[]} />
      <section className="view" id="v-list">
        <div className="page-head">
          <div><h1>Activities</h1><p>Quizzes and practice exercises, organised by difficulty, course and lesson.</p></div>
          <button className="btn btn-primary" id="addAct" onClick={() => navigate(`${BASE}/new`)}><Icon name="plus" box />Add Activity</button>
        </div>

        <div className="diff-grid" id="diffCards">
          {Object.keys(DIFF).map((d) => {
            const all = activities.filter((a) => a.diff === d);
            const pub = all.filter((a) => a.status === 'Published').length;
            const dr = all.length - pub;
            return (
              <button key={d} type="button" className={`diff-card d-${d.toLowerCase()}${diff === d ? ' on' : ''}`} aria-pressed={diff === d}
                onClick={() => { pickDiff(diff === d ? '' : d); if (diff !== d && tableRef.current) tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="tile"><Icon name={DIFF[d].icon} /></span>
                <h3>{d}</h3>
                <p>{DIFF[d].text}</p>
                <div className="count">{pub} available <small>{dr ? `· ${dr}${dr === 1 ? ' draft' : ' drafts'}` : ''}</small></div>
                <span className="btn btn-soft btn-sm go">{diff === d ? `Showing ${d}` : `View ${d} activities`}</span>
              </button>
            );
          })}
        </div>

        <div className="card" ref={tableRef}>
          <div className="toolbar">
            <label className="searchbox"><Icon name="search" box /><input id="search" type="search" placeholder="Search activities…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
            <select className="select status-sel" id="courseFilter" aria-label="Filter by course" value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select className="select status-sel" id="typeFilter" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option><option value="quiz">Quizzes</option><option value="exercise">Exercises</option>
            </select>
            <select className="select status-sel" id="statusFilter" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All status</option><option>Published</option><option>Draft</option>
            </select>
          </div>
          <div className="pills" id="diffFilter" role="group" aria-label="Filter by difficulty" style={{ marginBottom: 16 }}>
            {[['', 'All levels'], ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']].map(([v, l]) => (
              <button key={l} className={`pill${diff === v ? ' on' : ''}`} onClick={() => pickDiff(v)}>{l}</button>
            ))}
          </div>
          <div className="table-wrap">
            <table className="table stack">
              <thead><tr><th style={{ width: 48 }}>#</th><th>Activity</th><th>Course · Lesson</th><th>Type</th><th>Level</th><th>Points</th><th>Status</th><th style={{ width: 150 }}>Actions</th></tr></thead>
              <tbody id="rows">
                {list.length ? list.slice(start, start + per).map((x, i) => {
                  const w = whereIs(x, courses, lessons);
                  return (
                    <tr key={x.id}>
                      <td className="hide-m" data-label="#">{start + i + 1}</td>
                      <td className="primary cell-strong" data-label="Activity">{x.title}<span className="cell-sub">{x.type === 'quiz' ? `${x.qs.length} ${x.qs.length === 1 ? 'question' : 'questions'}` : (x.validation === 'manual' ? 'Manual review' : 'Auto-checked')}</span></td>
                      <td data-label="Course · Lesson">{w.course}<span className="cell-sub">{w.lesson}</span></td>
                      <td data-label="Type"><TypeChip type={x.type} /></td>
                      <td data-label="Level"><StatusChip status={x.diff} /></td>
                      <td data-label="Points">{actPoints(x)}</td>
                      <td data-label="Status"><StatusChip status={x.status} /></td>
                      <td className="acts-cell">
                        <div className="acts">
                          <button className="act" title="View results" aria-label="View results" onClick={() => navigate(`${BASE}/${x.id}/results`)}><Icon name="chart" /></button>
                          <button className="act" title={x.status === 'Published' ? 'Unpublish' : 'Publish'} aria-label="Toggle publish" onClick={() => togglePub(x)}><Icon name={x.status === 'Published' ? 'eyeoff' : 'eye'} /></button>
                          <button className="act edit" title="Edit" aria-label="Edit" onClick={() => navigate(`${BASE}/${x.id}/edit`)}><Icon name="edit" /></button>
                          <button className="act del" title="Delete" aria-label="Delete" onClick={() => remove(x)}><Icon name="trash" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan="8" className="empty"><Img file="mascot-sad.png" />{activities.length ? 'No activities match your filters.' : 'No activities yet. Add your first quiz or exercise.'}</td></tr>}
              </tbody>
            </table>
          </div>
          <Pager total={list.length} page={cur} per={per} onPage={setPage} onPer={(n) => { setPer(n); setPage(1); }} />
        </div>
      </section>
    </>
  );
}
