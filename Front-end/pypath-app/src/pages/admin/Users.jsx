import { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import css from '../../styles/admin/student-management.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import Avatar from '../../components/Avatar';
import { Chip, StatusChip } from '../../components/Chip';
import Pager from '../../components/Pager';
import Modal from '../../components/Modal';
import { EMAIL_RE } from '../../components/Auth';
import { usePageSearch } from '../../hooks/usePageSearch';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { INITIAL_USERS, USER_COURSES } from '../../data/adminUsers';
import { nextId } from '../../lib/text';

/* Manage Users: /admin/users (list, add, edit, delete) and /admin/users/:id (profile).
   Users live in this component's state (sample data, resets on reload – same as the old page). */
const code = (u) => (u.role === 'Admin' ? 'AD' : 'ST') + String(u.id).padStart(3, '0');
const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function UserForm({ user, users, onSave, onClose }) {
  const [f, setF] = useState({ name: user ? user.name : '', email: user ? user.email : '', role: user ? user.role : 'Student', status: user ? user.status : 'Active', pass: '' });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim();
    const email = f.email.trim();
    const dup = users.some((u) => u.email.toLowerCase() === email.toLowerCase() && (!user || u.id !== user.id));
    const next = {
      name: name ? '' : 'Full name is required.',
      email: !EMAIL_RE.test(email) ? 'Enter a valid email address.' : dup ? 'This email is already in use.' : '',
      pass: !user && f.pass.length < 6 ? 'Use at least 6 characters.' : ''
    };
    setErrs(next);
    if (Object.values(next).some(Boolean)) return;
    onSave({ name, email, role: f.role, status: f.status });
  };

  return (
    <Modal
      title={user ? 'Edit User' : 'Add User'}
      onClose={onClose}
      onSubmit={submit}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">Save User</button></>}
    >
      <div className="field"><label htmlFor="fName">Full name <span className="req">*</span></label><input className={`input${errs.name ? ' bad' : ''}`} id="fName" placeholder="e.g. Jasmine Santos" autoComplete="off" value={f.name} onChange={set('name')} /><div className="err">{errs.name}</div></div>
      <div className="field"><label htmlFor="fEmail">Email <span className="req">*</span></label><input className={`input${errs.email ? ' bad' : ''}`} id="fEmail" type="email" placeholder="name@email.com" autoComplete="off" value={f.email} onChange={set('email')} /><div className="err">{errs.email}</div></div>
      <div className="row2">
        <div className="field"><label htmlFor="fRole">Role</label><select className="select" id="fRole" value={f.role} onChange={set('role')}><option>Student</option><option>Admin</option></select></div>
        <div className="field"><label htmlFor="fStatus">Status</label><select className="select" id="fStatus" value={f.status} onChange={set('status')}><option>Active</option><option>Inactive</option></select></div>
      </div>
      {!user && (
        <div className="field"><label htmlFor="fPass">Temporary password <span className="req">*</span></label><input className={`input${errs.pass ? ' bad' : ''}`} id="fPass" type="text" placeholder="At least 6 characters" autoComplete="off" value={f.pass} onChange={set('pass')} /><div className="err">{errs.pass}</div></div>
      )}
    </Modal>
  );
}

function Profile({ users, onEdit }) {
  const { id } = useParams();
  const u = users.find((x) => x.id === +id);
  const [tab, setTab] = useState('courses');
  if (!u) return <Navigate to="/admin/users" replace />;

  const isStudent = u.role === 'Student';
  const seed = (i) => (u.id * 37 + i * 23) % 100;
  const prog = USER_COURSES.map((c, i) => ({ name: c, pct: Math.max(8, seed(i)), tone: ['t-blue', 't-green', 't-orange', 't-purple'][i], ico: ['book', 'layers', 'cube', 'code'][i] }));
  const badges = [['Python Beginner', 'award', 't-green', 100], ['Data Explorer', 'cube', 't-blue', 250], ['Quiz Master', 'star', 't-purple', 500], ['Code Master', 'code', 't-yellow', 750], ['Consistency', 'clock', 't-orange', 1000], ['Top Learner', 'award', 't-pink', 1500]];
  const acts = [['Completed Module 3: Operators', '2 hours ago', 'check', 't-green'], ['Submitted Operators Quiz (8/10)', 'Yesterday', 'quiz', 't-purple'], ['Earned Python Beginner badge', '3 days ago', 'award', 't-yellow'], ['Joined PyPath', fmt(u.joined), 'user', 't-blue']];

  return (
    <section id="viewProfile" className="stack-v">
      <Link to="/admin/users" className="back" id="backBtn"><Icon name="arrowleft" box />Back to Manage Users</Link>
      <div className="card prof-card" id="profileCard">
        <div className="prof-top">
          <Avatar name={u.name} className="xl" />
          <div><h2>{u.name}</h2><div className="sub">{code(u)} · {u.role}</div><div style={{ marginTop: 8 }}><StatusChip status={u.status} /></div></div>
          <div className="push"><button className="btn btn-ghost" id="editFromProfile" onClick={() => onEdit(u)}><Icon name="edit" />Edit Profile</button></div>
        </div>
        <div className="info-row">
          <div className="info"><small>Email</small><b>{u.email}</b></div>
          <div className="info"><small>Joined</small><b>{fmt(u.joined)}</b></div>
          <div className="info"><small>Total Points</small><b>{u.points.toLocaleString('en-US')}</b></div>
        </div>
        {isStudent ? (
          <>
            <div className="tabs" id="pTabs" role="tablist">
              {[['courses', 'Enrolled Courses'], ['badges', 'Badges'], ['activity', 'Activity']].map(([k, l]) => (
                <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
            <div id="pBody">
              {tab === 'courses' && prog.map((c) => (
                <div className="course-row" key={c.name}>
                  <span className={`tile ${c.tone}`}><Icon name={c.ico} /></span>
                  <div><b>{c.name}</b><div className="bar"><i style={{ width: `${c.pct}%`, background: '#4a90e8' }} /></div></div>
                  <div style={{ textAlign: 'right' }}><div className="pct">{c.pct}%</div>{c.pct >= 100 ? <Chip kind="green">Done</Chip> : c.pct > 40 ? <Chip kind="blue">In Progress</Chip> : <Chip kind="orange">Started</Chip>}</div>
                </div>
              ))}
              {tab === 'badges' && (
                <div className="badge-grid">
                  {badges.map((b) => (
                    <div key={b[0]} className={`badge-box ${u.points >= b[3] ? '' : 'locked'}`}><span className={`tile ${b[2]}`}><Icon name={b[1]} /></span><b>{b[0]}</b><small>{b[3]} pts</small></div>
                  ))}
                </div>
              )}
              {tab === 'activity' && (
                <ul className="timeline">
                  {acts.map((a) => (
                    <li key={a[0]}><span className={`tile ${a[3]}`} style={{ width: 38, height: 38, borderRadius: '50%' }}><Icon name={a[2]} /></span><span>{a[0]}</span><time>{a[1]}</time></li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="admin-note"><Img file="mascot-wave.png" /><div><b>Administrator account</b><br /><span className="sub">Admins manage the platform and do not have learning progress.</span></div></div>
        )}
      </div>
    </section>
  );
}

export default function Users() {
  useStyles(css);
  const toast = useToast();
  const { confirm } = useDialogs();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [q, setQ] = useState(params.get('q') || '');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(5);
  const [form, setForm] = useState(undefined); // undefined = closed, null = new user, user = edit

  usePageSearch((v) => { setQ(v); setPage(1); navigate('/admin/users'); });

  const ql = q.trim().toLowerCase();
  const list = users.filter((u) => (!ql || u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql) || code(u).toLowerCase().includes(ql))
    && (!role || u.role === role) && (!status || u.status === status));
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(page, pages);
  const slice = list.slice((cur - 1) * per, cur * per);

  const save = (data) => {
    if (form) {
      setUsers((l) => l.map((u) => (u.id === form.id ? { ...u, ...data } : u)));
      toast('User updated');
    } else {
      setUsers((l) => [{ id: nextId(l), joined: new Date().toISOString().slice(0, 10), points: 0, ...data }, ...l]);
      setPage(1);
      toast('User added');
    }
    setForm(undefined);
  };

  const remove = async (u) => {
    if (await confirm({ title: 'Delete this user?', text: `${u.name} will be removed permanently.` })) {
      setUsers((l) => l.filter((x) => x.id !== u.id));
      toast('User deleted');
    }
  };

  const listView = (
    <section id="viewList" className="stack-v">
      <div className="page-head">
        <div><h1>Manage Users</h1><p>View, add, edit and remove student and admin accounts.</p></div>
        <button className="btn btn-primary" id="addBtn" onClick={() => setForm(null)}><Icon name="plus" box />Add User</button>
      </div>

      <div className="card">
        <div className="toolbar">
          <label className="searchbox"><Icon name="search" box /><input id="search" type="search" placeholder="Search users…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <div className="pills" id="roleFilter" role="group" aria-label="Filter by role">
            <button className={`pill${role === '' ? ' on' : ''}`} onClick={() => { setRole(''); setPage(1); }}><Icon name="users" box />All</button>
            <button className={`pill${role === 'Student' ? ' on' : ''}`} onClick={() => { setRole('Student'); setPage(1); }}>Student</button>
            <button className={`pill${role === 'Admin' ? ' on' : ''}`} onClick={() => { setRole('Admin'); setPage(1); }}>Admin</button>
          </div>
          <select className="select status-sel" id="statusFilter" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table stack">
            <thead><tr><th style={{ width: 84 }}>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style={{ width: 140 }}>Actions</th></tr></thead>
            <tbody id="rows">
              {slice.length ? slice.map((u) => (
                <tr key={u.id}>
                  <td className="hide-m mono" data-label="ID">{code(u)}</td>
                  <td className="primary" data-label="Name"><div className="cell-user"><Avatar name={u.name} /><span>{u.name}</span></div></td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role"><StatusChip status={u.role} /></td>
                  <td data-label="Status"><StatusChip status={u.status} /></td>
                  <td className="acts-cell">
                    <div className="acts">
                      <button className="act" title="View profile" aria-label="View profile" onClick={() => navigate(`/admin/users/${u.id}`)}><Icon name="eye" /></button>
                      <button className="act edit" title="Edit" aria-label="Edit" onClick={() => setForm(u)}><Icon name="edit" /></button>
                      <button className="act del" title="Delete" aria-label="Delete" onClick={() => remove(u)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="empty"><Img file="mascot-sad.png" />No users match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager total={list.length} page={cur} per={per} onPage={setPage} onPer={(n) => { setPer(n); setPage(1); }} />
      </div>
    </section>
  );

  return (
    <>
      <Routes>
        <Route index element={listView} />
        <Route path=":id" element={<Profile users={users} onEdit={setForm} />} />
      </Routes>
      {form !== undefined && <UserForm key={form ? form.id : 'new'} user={form} users={users} onSave={save} onClose={() => setForm(undefined)} />}
    </>
  );
}
