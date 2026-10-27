import { useState } from 'react';
import css from '../../../styles/admin/admin-extras.css?inline';
import useStyles from '../../../hooks/useStyles';
import Icon from '../../../components/Icon';
import { usePageSearch } from '../../../hooks/usePageSearch';
import { useToast } from '../../../hooks/useToast';
import { useDialogs } from '../../../hooks/useDialogs';
import { adminExtras, useExtras } from '../../../services/adminExtrasStore';
import { nextId } from '../../../lib/text';
import { Empty, Fld, HeadBtn, Pill, RecordModal, Seg, ToolbarSearch } from './parts';

/* Announcement Management */
const BLANK = { title: '', msg: '', aud: 'All students', status: 'Draft' };
const fields = (v, set) => (
  <>
    <Fld label="Title" req wide><input className="input" name="title" value={v.title} onChange={set('title')} required /></Fld>
    <Fld label="Message" req wide><textarea className="textarea" name="msg" rows="4" value={v.msg} onChange={set('msg')} required /></Fld>
    <Fld label="Audience"><select className="select" name="aud" value={v.aud} onChange={set('aud')}>{['All students', 'Beginner', 'Intermediate', 'Advanced'].map((a) => <option key={a}>{a}</option>)}</select></Fld>
    <Seg name="Status" value={v.status} options={['Draft', 'Published']} onChange={set('status')} />
  </>
);
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Announcements() {
  useStyles(css);
  const toast = useToast();
  const { confirm } = useDialogs();
  const list = useExtras('an');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [edit, setEdit] = useState(undefined);
  usePageSearch(setQ);

  const ql = q.trim().toLowerCase();
  const rows = list.filter((x) => (x.title + x.msg).toLowerCase().includes(ql) && (status === 'All' || x.status === status));

  const save = (v) => {
    if (edit.rec) adminExtras.set('an', list.map((r) => (r.id === edit.rec.id ? { ...r, ...v } : r)));
    else adminExtras.set('an', [{ id: nextId(list, 100), date: today(), ...v }, ...list]);
    toast(`Announcement${edit.rec ? ' saved' : ' added'}`);
    setEdit(undefined);
  };
  const remove = async (r) => {
    if (!(await confirm({ title: 'Delete announcement?', text: `“${r.title}” will be removed. This can’t be undone.`, confirm: 'Delete' }))) return;
    adminExtras.set('an', list.filter((x) => x.id !== r.id));
    toast('Announcement deleted');
  };

  return (
    <>
      <div className="page-head">
        <div><h1 id="tt">Announcement Management</h1><p id="ts">Post news and updates to your learners.</p></div>
        <div id="headAct"><HeadBtn label="New announcement" onClick={() => setEdit({ rec: null })} /></div>
      </div>
      <div id="pg" className="stack-v">
        <div className="card">
          <div className="toolbar">
            <ToolbarSearch value={q} onChange={setQ} ph="Search announcements" />
            <select className="select status-sel" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option><option>Published</option><option>Draft</option>
            </select>
          </div>
          <div className="table-wrap" id="list">
            {rows.length ? (
              <table className="table stack">
                <thead><tr><th>Announcement</th><th>Audience</th><th>Date</th><th>Status</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id}>
                      <td className="primary"><div className="cell-stack"><span className="cell-strong">{x.title}</span><span className="sub">{x.msg}</span></div></td>
                      <td data-label="Audience">{x.aud}</td>
                      <td data-label="Date">{x.date}</td>
                      <td data-label="Status"><Pill s={x.status} /></td>
                      <td className="acts-cell"><div className="acts">
                        <button className="act edit" aria-label="Edit" onClick={() => setEdit({ rec: x })}><Icon name="edit" /></button>
                        <button className="act del" aria-label="Delete" onClick={() => remove(x)}><Icon name="trash" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <Empty>No announcements found. Write a new one to keep learners in the loop.</Empty>}
          </div>
        </div>
      </div>
      {edit && <RecordModal key={edit.rec ? edit.rec.id : 'new'} title={`${edit.rec ? 'Edit' : 'Add'} announcement`} initial={edit.rec || BLANK} fields={fields} onSave={save} onClose={() => setEdit(undefined)} />}
    </>
  );
}
