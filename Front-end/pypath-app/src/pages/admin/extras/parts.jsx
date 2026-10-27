import { useState } from 'react';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import Modal from '../../../components/Modal';
import { Chip } from '../../../components/Chip';

/* Small building blocks shared by the Progress, Rewards, Announcements and Profile screens */

const CHIP_OF = { Published: 'green', Active: 'green', Completed: 'green', Correct: 'green', Draft: 'orange', Hidden: 'orange', 'In progress': 'blue', 'Not started': 'purple', Inactive: 'red', Incorrect: 'red' };
export const Pill = ({ s }) => <Chip kind={CHIP_OF[s] || 'blue'}>{s}</Chip>;

export const Empty = ({ children }) => <div className="empty"><Img file="mascot-sad.png" />{children}</div>;

export const Stat = ({ tile, icon, label, val }) => (
  <div className="card stat"><span className={`tile ${tile}`}><Icon name={icon} /></span><small>{label}</small><b>{val}</b></div>
);

export const HeadBtn = ({ label, onClick }) => <button className="btn btn-primary" onClick={onClick}><Icon name="plus" />{label}</button>;

export const Tabs = ({ list, cur, onPick }) => (
  <div className="pills" role="tablist">
    {list.map((n) => <button key={n} className={`pill${cur === n ? ' on' : ''}`} role="tab" aria-selected={cur === n} onClick={() => onPick(n)}>{n}</button>)}
  </div>
);

export const Bar = ({ p }) => (
  <div className="pc">
    <div className="bar"><i style={{ width: `${p}%`, background: p >= 80 ? 'linear-gradient(90deg,#2fa57a,#4fc79b)' : p >= 50 ? 'linear-gradient(90deg,#3d8bf5,#74b6ff)' : 'linear-gradient(90deg,#f0a50c,#f4c04f)' }} /></div>
    <b>{p}%</b>
  </div>
);

/* label + control, in the two-column form grid (wide = spans both columns) */
export function Fld({ label, req, wide, children }) {
  return (
    <label className={`field${wide ? ' w' : ''}`}>
      <span className="label">{label}{req && <> <span className="req">*</span></>}</span>
      {children}
    </label>
  );
}

export function Seg({ name, value, options, onChange, wide }) {
  return (
    <div className={`field${wide ? ' w' : ''}`}>
      <span className="label">{name}</span>
      <div className="radios">
        {options.map((x) => <label key={x} className="radio"><input type="radio" name={name} value={x} checked={value === x} onChange={() => onChange(x)} />{x}</label>)}
      </div>
    </div>
  );
}

/* Add / edit dialog for a record. fields(values, set) returns the inputs. */
export function RecordModal({ title, initial, fields, onSave, onClose }) {
  const [v, setV] = useState(initial);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e && e.target ? e.target.value : e }));
  return (
    <Modal
      title={title}
      onClose={onClose}
      onSubmit={(e) => { e.preventDefault(); onSave(v); }}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save changes</button></>}
    >
      <div className="mb"><div className="fg">{fields(v, set)}</div></div>
    </Modal>
  );
}

export const ToolbarSearch = ({ value, onChange, ph }) => (
  <label className="searchbox"><Icon name="search" box /><input type="search" placeholder={ph} aria-label={ph} value={value} onChange={(e) => onChange(e.target.value)} /></label>
);
