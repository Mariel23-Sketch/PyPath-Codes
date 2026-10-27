import { useState } from 'react';
import css from '../../../styles/admin/admin-extras.css?inline';
import useStyles from '../../../hooks/useStyles';
import Icon from '../../../components/Icon';
import { Chip } from '../../../components/Chip';
import { useToast } from '../../../hooks/useToast';
import { useDialogs } from '../../../hooks/useDialogs';
import { adminExtras, useExtras } from '../../../services/adminExtrasStore';
import { COLOR_TILE } from '../../../data/adminExtras';
import { nextId } from '../../../lib/text';
import { Empty, Fld, HeadBtn, Pill, RecordModal, Seg, Stat, Tabs } from './parts';

/* Points and Reward Management: Badges / Redeemable rewards / Points rules */
const TABS = ['Badges', 'Redeemable rewards', 'Points rules'];

const BADGE = {
  label: 'badge', key: 'bd', blank: { name: '', pts: 500, color: 'Blue', desc: '' },
  fields: (v, set) => (
    <>
      <Fld label="Badge name" req wide><input className="input" name="name" value={v.name} onChange={set('name')} required /></Fld>
      <Fld label="Points required" req><input className="input" name="pts" type="number" min="0" value={v.pts} onChange={set('pts')} required /></Fld>
      <Fld label="Color"><select className="select" name="color" value={v.color} onChange={set('color')}>{Object.keys(COLOR_TILE).map((c) => <option key={c}>{c}</option>)}</select></Fld>
      <Fld label="How it’s earned" wide><textarea className="textarea" name="desc" rows="3" value={v.desc} onChange={set('desc')} /></Fld>
    </>
  )
};
const REWARD = {
  label: 'reward', key: 'rw', blank: { name: '', cost: 500, stock: 10, status: 'Active' },
  fields: (v, set) => (
    <>
      <Fld label="Reward name" req wide><input className="input" name="name" value={v.name} onChange={set('name')} required /></Fld>
      <Fld label="Cost in points" req><input className="input" name="cost" type="number" min="0" value={v.cost} onChange={set('cost')} required /></Fld>
      <Fld label="Stock" req><input className="input" name="stock" type="number" min="0" value={v.stock} onChange={set('stock')} required /></Fld>
      <Seg name="Visibility" value={v.status} options={['Active', 'Hidden']} onChange={set('status')} wide />
    </>
  )
};
const NUMBERS = /^(pts|cost|stock)$/;

function RulesForm() {
  const toast = useToast();
  const rules = useExtras('rules');
  const [v, setV] = useState(rules);
  const FIELDS = [['lesson', 'Completing a lesson'], ['quiz', 'Passing a quiz'], ['practice', 'Solving an exercise'], ['course', 'Completing a course'], ['streak', 'Each day of a learning streak']];
  return (
    <div className="card form">
      <div className="card-title"><Icon name="star" />Points rules</div>
      <div className="fg">
        {FIELDS.map(([k, l]) => <Fld key={k} label={l}><input className="input" name={k} type="number" min="0" value={v[k]} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))} /></Fld>)}
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={() => {
          adminExtras.saveRules(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Math.max(0, Math.floor(+x) || 0)])));
          toast('Points rules saved');
        }}>Save rules</button>
      </div>
    </div>
  );
}

export default function Rewards() {
  useStyles(css);
  const toast = useToast();
  const { confirm } = useDialogs();
  const badges = useExtras('bd');
  const rewards = useExtras('rw');
  const [tab, setTab] = useState('Badges');
  const [edit, setEdit] = useState(undefined); // undefined = closed, {rec|null} = open

  const kind = tab === 'Badges' ? BADGE : REWARD;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  const save = (v) => {
    const fd = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NUMBERS.test(k) ? +x : x]));
    const cur = adminExtras.get(kind.key);
    if (edit.rec) adminExtras.set(kind.key, cur.map((r) => (r.id === edit.rec.id ? { ...r, ...fd } : r)));
    else adminExtras.set(kind.key, [{ id: nextId(cur, 100), ...fd }, ...cur]);
    toast(`${cap(kind.label)}${edit.rec ? ' saved' : ' added'}`);
    setEdit(undefined);
  };
  const remove = async (r) => {
    if (!(await confirm({ title: `Delete ${kind.label}?`, text: `“${r.name}” will be removed. This can’t be undone.`, confirm: 'Delete' }))) return;
    adminExtras.set(kind.key, adminExtras.get(kind.key).filter((x) => x.id !== r.id));
    toast(`${cap(kind.label)} deleted`);
  };

  return (
    <>
      <div className="page-head">
        <div><h1 id="tt">Points and Reward Management</h1><p id="ts">Decide what learners earn and what they can redeem.</p></div>
        <div id="headAct">{tab !== 'Points rules' && <HeadBtn label={tab === 'Badges' ? 'Add badge' : 'Add reward'} onClick={() => setEdit({ rec: null })} />}</div>
      </div>
      <div id="pg" className="stack-v">
        <div className="stats">
          <Stat tile="t-yellow" icon="star" label="Points awarded" val="48,920" />
          <Stat tile="t-purple" icon="award" label="Badges earned" val="3,214" />
          <Stat tile="t-green" icon="gift" label="Redemptions" val="186" />
        </div>
        <Tabs list={TABS} cur={tab} onPick={setTab} />

        {tab === 'Points rules' && <RulesForm />}

        {tab === 'Badges' && (badges.length ? (
          <div className="badge-grid">
            {badges.map((b) => (
              <div className="card bdg" key={b.id}>
                <span className={`tile ${COLOR_TILE[b.color]}`}><Icon name="award" /></span>
                <h3>{b.name}</h3>
                <Chip kind="blue">{b.pts} pts</Chip>
                <p>{b.desc}</p>
                <div className="acts">
                  <button className="act edit" aria-label={`Edit ${b.name}`} onClick={() => setEdit({ rec: b })}><Icon name="edit" /></button>
                  <button className="act del" aria-label={`Delete ${b.name}`} onClick={() => remove(b)}><Icon name="trash" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="card"><Empty>No badges yet. Add one to reward milestones.</Empty></div>)}

        {tab === 'Redeemable rewards' && (
          <div className="card">
            <div className="table-wrap">
              {rewards.length ? (
                <table className="table stack">
                  <thead><tr><th>Reward</th><th>Cost</th><th>In stock</th><th>Visibility</th><th style={{ width: 100 }}>Actions</th></tr></thead>
                  <tbody>
                    {rewards.map((r) => (
                      <tr key={r.id}>
                        <td className="primary"><div className="cell-stack"><span className="cell-strong">{r.name}</span></div></td>
                        <td data-label="Cost">{r.cost.toLocaleString()} pts</td>
                        <td data-label="In stock">{r.stock ? r.stock : <Chip kind="red">Sold out</Chip>}</td>
                        <td data-label="Visibility"><Pill s={r.status} /></td>
                        <td className="acts-cell"><div className="acts">
                          <button className="act edit" aria-label="Edit" onClick={() => setEdit({ rec: r })}><Icon name="edit" /></button>
                          <button className="act del" aria-label="Delete" onClick={() => remove(r)}><Icon name="trash" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Empty>No rewards yet.</Empty>}
            </div>
          </div>
        )}
      </div>
      {edit && (
        <RecordModal key={edit.rec ? edit.rec.id : 'new'} title={`${edit.rec ? 'Edit ' : 'Add '}${kind.label}`} initial={edit.rec || kind.blank} fields={kind.fields} onSave={save} onClose={() => setEdit(undefined)} />
      )}
    </>
  );
}
