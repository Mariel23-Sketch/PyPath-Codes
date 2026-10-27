import { useState } from 'react';
import Modal from '../../../components/Modal';
import { TONE_FOR, uniqueTitle } from './helpers';

/* Add / edit course dialog. `course` is null for a new one. */
export default function CourseForm({ course, courses, onSave, onClose }) {
  const [f, setF] = useState({
    title: course ? course.title : '', level: course ? course.level : 'Beginner', status: course ? course.status : 'Draft',
    icon: course ? course.icon : 'python', desc: course ? course.desc : ''
  });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const title = f.title.trim();
    const msg = !title ? 'Course title is required.' : !uniqueTitle(courses, title, course && course.id, () => true) ? 'A course with this title already exists.' : '';
    setErr(msg);
    if (msg) return;
    onSave({ title, level: f.level, status: f.status, icon: f.icon, desc: f.desc.trim(), tone: TONE_FOR[f.icon] });
  };

  return (
    <Modal
      title={course ? 'Edit Course' : 'Add Course'}
      onClose={onClose}
      onSubmit={submit}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">Save Course</button></>}
    >
      <div className="field"><label htmlFor="cName">Course title <span className="req">*</span></label><input className={`input${err ? ' bad' : ''}`} id="cName" placeholder="e.g. Python Basics" autoComplete="off" value={f.title} onChange={set('title')} /><div className="err">{err}</div></div>
      <div className="row2">
        <div className="field"><label htmlFor="cLevel">Level</label><select className="select" id="cLevel" value={f.level} onChange={set('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        <div className="field"><label htmlFor="cStatus">Status</label><select className="select" id="cStatus" value={f.status} onChange={set('status')}><option>Draft</option><option>Published</option></select></div>
      </div>
      <div className="field"><label htmlFor="cIcon">Icon</label><select className="select" id="cIcon" value={f.icon} onChange={set('icon')}><option value="python">Python</option><option value="layers">Layers</option><option value="cube">Cube</option><option value="code">Code</option></select></div>
      <div className="field"><label htmlFor="cDesc">Description</label><textarea className="textarea" id="cDesc" placeholder="What will students learn?" value={f.desc} onChange={set('desc')} /></div>
    </Modal>
  );
}
