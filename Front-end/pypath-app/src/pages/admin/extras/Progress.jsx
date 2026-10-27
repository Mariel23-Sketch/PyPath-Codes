import { useState } from 'react';
import css from '../../../styles/admin/admin-extras.css?inline';
import useStyles from '../../../hooks/useStyles';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import Avatar from '../../../components/Avatar';
import Modal from '../../../components/Modal';
import { usePageSearch } from '../../../hooks/usePageSearch';
import { useToast } from '../../../hooks/useToast';
import { useExtras } from '../../../services/adminExtrasStore';
import { MODS } from '../../../data/adminExtras';
import { Bar, Empty, Pill, Stat, ToolbarSearch } from './parts';

/* Results and Progress – sample learners and quiz results */
const current = (x) => (x.pct >= 100 ? 'All lessons done' : MODS[Math.floor((x.pct / 100) * 6)]);

function ResultsModal({ x, onClose }) {
  const qs = ['What is Python?', 'Which keyword creates a function?', 'What does print(5 + 3) show?', 'Which data type is mutable?'];
  const ans = [['A programming language', 'def', '8', 'list'], ['A snake', 'def', '53', 'list'], ['A programming language', 'def', '8', 'tuple'], ['A snake', 'func', '53', 'tuple']];
  const ok = (i) => (x.score / 100) * 4 > i;
  return (
    <Modal title={`Quiz results · ${x.name}`} onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <div className="mb">
        <div className="res-stats"><div><small>Score</small><b>{x.score}%</b></div><div><small>Correct</small><b>{x.correct}/10</b></div><div><small>Time</small><b>{x.time}</b></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Question</th><th>Answer</th><th>Result</th></tr></thead>
            <tbody>{qs.map((q, i) => <tr key={q}><td>{q}</td><td>{ans[ok(i) ? 0 : Math.min(i, 3)][i]}</td><td><Pill s={ok(i) ? 'Correct' : 'Incorrect'} /></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default function Progress() {
  useStyles(css);
  const toast = useToast();
  const students = useExtras('st');
  const [q, setQ] = useState('');
  const [mod, setMod] = useState('All');
  const [status, setStatus] = useState('All');
  const [view, setView] = useState(null);
  usePageSearch(setQ);

  const avg = Math.round(students.reduce((a, x) => a + x.score, 0) / students.length);
  const done = Math.round(students.reduce((a, x) => a + x.pct, 0) / students.length);
  const ql = q.trim().toLowerCase();
  const rows = students.filter((x) => x.name.toLowerCase().includes(ql) && (mod === 'All' || current(x) === mod) && (status === 'All' || x.status === status));

  const open = (x) => {
    if (!x.correct && !x.score) { toast(`${x.name} hasn’t taken a quiz yet`); return; }
    setView(x);
  };

  return (
    <>
      <div className="page-head"><div><h1 id="tt">Results and Progress</h1><p id="ts">See how learners are doing across the Python lessons.</p></div><div id="headAct" /></div>
      <div id="pg" className="stack-v">
        <div className="card hero">
          <div className="hero-copy">
            <span className="admin-tag">Progress</span>
            <h2>Learners are on a roll</h2>
            <p>{students.filter((x) => x.status === 'Completed').length} of {students.length} students finished all six Python lessons. {students.filter((x) => x.status === 'Inactive').length} haven’t opened PyPath in over two weeks.</p>
          </div>
          <div className="hero-art" aria-hidden="true"><span className="spk s1" /><span className="spk s2" /><span className="wcloud" /><Img file="mascot-cheer.png" /></div>
        </div>
        <div className="stats">
          <Stat tile="t-blue" icon="chart" label="Average quiz score" val={`${avg}%`} />
          <Stat tile="t-green" icon="check" label="Average progress" val={`${done}%`} />
          <Stat tile="t-purple" icon="users" label="Students tracked" val={students.length} />
          <Stat tile="t-red" icon="alert" label="Need a nudge" val={students.filter((x) => x.status === 'Inactive' || x.status === 'Not started').length} />
        </div>
        <div className="card">
          <div className="toolbar">
            <ToolbarSearch value={q} onChange={setQ} ph="Search students" />
            <select className="select status-sel" aria-label="Module" value={mod} onChange={(e) => setMod(e.target.value)}>
              <option value="All">All lessons</option>{MODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="select status-sel" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option>{['Completed', 'In progress', 'Not started', 'Inactive'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-wrap" id="list">
            {rows.length ? (
              <table className="table stack">
                <thead><tr><th>Student</th><th>Current module</th><th>Progress</th><th>Quiz score</th><th>Status</th><th>Last activity</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id}>
                      <td className="primary"><div className="cell-user"><Avatar name={x.name} />{x.name}</div></td>
                      <td data-label="Current module">{current(x)}</td>
                      <td data-label="Progress"><Bar p={x.pct} /></td>
                      <td data-label="Quiz score">{x.score}%</td>
                      <td data-label="Status"><Pill s={x.status} /></td>
                      <td data-label="Last activity">{x.last}</td>
                      <td className="acts-cell"><button className="btn btn-ghost btn-sm" onClick={() => open(x)}><Icon name="eye" />View results</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <Empty>No students match these filters.</Empty>}
          </div>
        </div>
      </div>
      {view && <ResultsModal x={view} onClose={() => setView(null)} />}
    </>
  );
}
