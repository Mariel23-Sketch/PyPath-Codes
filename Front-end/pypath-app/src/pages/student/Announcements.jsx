import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import css from '../../styles/student/announcements.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip } from '../../components/Chip';
import Pager from '../../components/Pager';
import { usePageSearch } from '../../hooks/usePageSearch';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { studentStore, useStudent } from '../../services/studentStore';
import { D } from '../../services/studentCatalog';

/* Cards come from the catalogue. "Read more" opens the full message and marks it as read.
   /student/announcements?open=3 opens announcement 3 right away. */
const PER = 4;

export default function Announcements() {
  useStyles(css);
  const s = useStudent();
  const toast = useToast();
  const { message } = useDialogs();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  usePageSearch((v) => { setQ(v); setPage(1); });

  const openAnn = (id) => {
    const a = D.announcements.find((x) => x.id === +id);
    if (!a) return;
    if (!studentStore.get().read.includes(a.id)) studentStore.update((d) => { d.read.push(a.id); });
    message(a.title, (<><div className="modal-date"><Icon name="calendar" />{a.date}</div><p>{a.msg}</p></>), 'Got it');
  };

  /* deep link from the home page */
  useEffect(() => {
    const id = params.get('open');
    if (id) { openAnn(id); setParams({}, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ql = q.trim().toLowerCase();
  const list = D.announcements.filter((a) => (!ql || `${a.title} ${a.msg}`.toLowerCase().includes(ql))
    && (!filter || (filter === 'read') === s.read.includes(a.id)));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * PER;

  return (
    <>
      <div className="page-head">
        <div><h1>Announcements</h1><p>Stay updated with the latest news, reminders, and important information.</p></div>
        <button className="btn btn-ghost" id="markAll" disabled={D.announcements.every((a) => s.read.includes(a.id))}
          onClick={() => { studentStore.update((d) => { d.read = D.announcements.map((a) => a.id); }); toast('All announcements marked as read'); }}>
          <Icon name="check" box />Mark all as read
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <label className="searchbox"><Icon name="search" box /><input id="search" type="search" placeholder="Search announcements…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <div className="pills" id="readFilter" role="group" aria-label="Filter announcements">
            {[['', 'All'], ['new', 'Unread'], ['read', 'Read']].map(([v, l]) => (
              <button key={l} className={`pill${filter === v ? ' on' : ''}`} onClick={() => { setFilter(v); setPage(1); }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="a-list" id="list">
          {list.length ? list.slice(start, start + PER).map((a) => {
            const unread = !s.read.includes(a.id);
            return (
              <article key={a.id} className={`a-card${unread ? ' unread' : ''}`}>
                {unread && <span className="a-new"><Chip kind="blue">New</Chip></span>}
                <div className={`a-ico a-${a.tone}`}><Icon name={a.icon} /></div>
                <div className="a-body">
                  <h3>{a.title}</h3>
                  <p>{a.msg}</p>
                  <div className="a-foot">
                    <span><Icon name="calendar" />{a.date}</span>
                    <button className="a-more" onClick={() => openAnn(a.id)}>Read more <Icon name="arrowright" /></button>
                  </div>
                </div>
              </article>
            );
          }) : <div className="empty"><Img file="mascot-sad.png" label="Mascot" />No announcements found.</div>}
        </div>
        <Pager total={list.length} page={cur} per={PER} onPage={setPage} />
      </div>
    </>
  );
}
