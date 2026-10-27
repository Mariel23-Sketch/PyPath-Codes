import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/Icon';
import { useToast } from '../../../hooks/useToast';
import { adminDb, useAdminData } from '../../../services/adminDb';
import { nextId } from '../../../lib/text';
import { Crumbs } from './shared';
import { BASE, courseLessons } from './helpers';

const ytId = (u) => { const m = String(u).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/); return m ? m[1] : ''; };

/* Add / edit a video: /admin/learning/video/new  or  /admin/learning/video/201 */
export default function VideoEditor() {
  const { id } = useParams();
  const videos = useAdminData('videos');
  const v = id === 'new' ? null : videos.find((x) => x.id === +id);
  if (id !== 'new' && !v) return <Navigate to={`${BASE}/videos`} replace />;
  return <Form key={id} v={v} videos={videos} />;
}

function Form({ v, videos }) {
  const navigate = useNavigate();
  const toast = useToast();
  const courses = useAdminData('courses');
  const lessons = useAdminData('lessons');
  const [f, setF] = useState({ title: v ? v.title : '', lessonId: v && v.lessonId ? String(v.lessonId) : '', status: v ? v.status : 'Draft', video: v ? v.video : '', desc: v ? v.desc : '' });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const title = f.title.trim();
    const video = f.video.trim();
    const next = {
      title: title ? '' : 'Video title is required.',
      lesson: f.lessonId ? '' : 'Choose a lesson.',
      video: !video ? 'Video link is required.' : /^https?:\/\/\S+$/i.test(video) ? '' : 'Enter a valid link starting with http:// or https://'
    };
    setErrs(next);
    if (Object.values(next).some(Boolean)) return;
    const data = { title, lessonId: +f.lessonId, video, desc: f.desc.trim(), status: f.status };
    adminDb.set('videos', v ? videos.map((x) => (x.id === v.id ? { ...x, ...data } : x)) : [...videos, { id: nextId(videos, 200), ...data }]);
    toast(v ? 'Video updated' : 'Video saved');
    navigate(`${BASE}/videos`);
  };

  const yt = ytId(f.video.trim());
  return (
    <>
      <Crumbs items={[['Videos', `${BASE}/videos`], [v ? 'Edit video' : 'New video']]} />
      <section className="view" id="v-video">
        <div className="page-head"><div><h1 id="vidTitle">{v ? 'Edit Video' : 'Add Video'}</h1></div></div>
        <div className="form-grid">
          <form className="card" id="videoForm" noValidate onSubmit={submit}>
            <div className="field"><label htmlFor="lTitle">Video title <span className="req">*</span></label><input className={`input${errs.title ? ' bad' : ''}`} id="lTitle" placeholder="Enter video title" autoComplete="off" value={f.title} onChange={set('title')} /><div className="err">{errs.title}</div></div>
            <div className="row2">
              <div className="field"><label htmlFor="lLesson">Lesson <span className="req">*</span></label>
                <select className={`select${errs.lesson ? ' bad' : ''}`} id="lLesson" value={f.lessonId} onChange={set('lessonId')}>
                  <option value="">Select lesson</option>
                  {courses.map((c) => (
                    <optgroup key={c.id} label={c.title}>
                      {courseLessons(lessons, c.id).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </optgroup>
                  ))}
                </select><div className="err">{errs.lesson}</div></div>
              <div className="field"><label htmlFor="lStatus">Status</label><select className="select" id="lStatus" value={f.status} onChange={set('status')}><option>Draft</option><option>Published</option></select></div>
            </div>
            <div className="field"><label htmlFor="lVideo">Video link (YouTube) <span className="req">*</span></label><input className={`input${errs.video ? ' bad' : ''}`} id="lVideo" placeholder="https://www.youtube.com/watch?v=..." autoComplete="off" value={f.video} onChange={set('video')} /><div className="err">{errs.video}</div></div>
            <div className="field"><label htmlFor="lDesc">Description</label><textarea className="textarea" id="lDesc" placeholder="Enter video description" value={f.desc} onChange={set('desc')} /></div>
            <div className="form-actions"><button type="button" className="btn btn-ghost" onClick={() => navigate(`${BASE}/videos`)}>Cancel</button><button className="btn btn-primary" type="submit">Save Video</button></div>
          </form>
          <aside className="card preview-card">
            <div className="card-title">Preview</div>
            <div className="video" id="videoPrev">
              <button className="play" type="button" aria-label="Play preview" onClick={() => toast('Preview only. The video plays for students.')}><Icon name="play" box /></button>
              <span className="vlen">10:24</span>
              {f.title.trim() && <span className="vtitle">{f.title.trim()}</span>}
            </div>
            <p className="cap" id="videoCap">{f.video.trim() ? (yt ? `YouTube video · ${yt}` : 'Video linked') : 'Video Preview'}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
