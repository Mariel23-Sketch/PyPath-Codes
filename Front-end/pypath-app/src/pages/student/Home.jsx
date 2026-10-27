import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import css from '../../styles/student/home.css?inline';
import useStyles from '../../hooks/useStyles';
import { useCountUp, useReady } from '../../hooks/useAnimate';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip, StatusChip } from '../../components/Chip';
import LineChart from '../../components/LineChart';
import { useStudent } from '../../services/studentStore';
import { D, find, courseProgress, moduleStatus, nextLecture, openLectures } from '../../services/studentCatalog';

/* Everything here is filled from the catalogue and the student store, so finishing a lesson or a
   quiz on another page updates these numbers. */

const SETS = {
  '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [15, 40, 20, 65, 35, 80, 55] },
  '30D': { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'], data: [60, 110, 95, 150, 185] }
};
const TONE = { 'c-blue': 't-blue', 'c-green': 't-green', 'c-orange': 't-orange' };
const RING = 2 * Math.PI * 72;
const tipPts = (l, v) => `${l} · ${v} pts`;

function StatCard({ s }) {
  const n = useCountUp(s.val);
  return (
    <Link className="card stat" to={s.to}>
      <span className={`tile ${s.tone}`}><Icon name={s.icon} /></span>
      <small>{s.label}</small>
      <b><em style={{ fontStyle: 'normal' }}>{n.toLocaleString('en-US')}</em><span>{s.unit}</span></b>
      <span className="vs">{s.sub}</span>
    </Link>
  );
}

function activityIcon(h) {
  const plus = h.pts >= 0;
  if (/quiz/i.test(h.what)) return ['quiz', 't-purple'];
  if (/lesson/i.test(h.what)) return ['book', 't-blue'];
  if (/exercise/i.test(h.what)) return ['code', 't-green'];
  return !plus ? ['gift', 't-orange'] : ['flame', 't-yellow'];
}

export default function Home() {
  useStyles(css);
  const S = useStudent();
  const ready = useReady(150);
  const [range, setRange] = useState('7D');

  const nx = nextLecture(S);
  const openL = openLectures();
  const doneL = openL.filter((l) => S.done.includes(l.id)).length;
  const actsTotal = D.quizzes.length + D.exercises.length;
  const actsDone = Object.keys(S.quiz).length + Object.keys(S.ex).length;

  const stats = [
    { label: 'Total Points', val: S.points, unit: 'pts', icon: 'star', tone: 't-yellow', to: '/student/rewards', sub: 'Redeem rewards' },
    { label: 'Lessons Done', val: doneL, unit: `/ ${openL.length}`, icon: 'book', tone: 't-blue', to: '/student/learning', sub: 'Learning Materials' },
    { label: 'Activities Done', val: actsDone, unit: `/ ${actsTotal}`, icon: 'quiz', tone: 't-purple', to: '/student/activities', sub: 'Quizzes & exercises' },
    { label: 'Day Streak', val: S.streak, unit: 'days', icon: 'flame', tone: 't-orange', to: '/student/rewards/earn', sub: `+${D.rules.streak} pts each day` }
  ];

  /* progress donut */
  const inProg = openL.filter((l) => !S.done.includes(l.id) && moduleStatus(find.module(l.moduleId), S) === 'In progress').length;
  const total = openL.length || 1;
  const pDone = Math.round((doneL / total) * 100);
  const pProg = Math.round((inProg / total) * 100);
  const pNot = Math.max(0, 100 - pDone - pProg);

  const upcoming = D.quizzes.filter((q) => !S.quiz[q.id])
    .map((q) => ({ t: q.title, to: `/student/activities/quiz/${q.id}`, due: q.due, icon: 'quiz', tone: 't-purple', chip: q.diff }))
    .concat(D.exercises.filter((x) => !S.ex[x.id]).map((x) => ({ t: x.title, to: `/student/activities/exercise/${x.id}`, due: x.due, icon: 'code', tone: 't-green', chip: x.diff })))
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 4);

  const chart = SETS[range];
  const ticks = useMemo(() => {
    const max = Math.ceil((Math.max(...chart.data) * 1.2) / 20) * 20;
    return { max, ticks: [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f)) };
  }, [chart]);

  return (
    <>
      {/* Welcome + stats */}
      <section className="top-grid">
        <div className="card hero welcome">
          <div className="hero-copy">
            <span className="tag">Student</span>
            <h1>Hello, <span id="hello">{S.name.split(' ')[0]}</span>! <span aria-hidden="true">&#128075;</span></h1>
            <p id="continueSub">{nx ? `Keep going! Next up: ${nx.title}.` : 'Amazing! You finished every open lesson.'}</p>
            <Link className="btn btn-primary" id="continueBtn" to={nx ? `/student/learning/lecture/${nx.id}` : '/student/learning'}>
              Continue Learning <Icon name="arrowright" box />
            </Link>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="spk s1" /><span className="spk s2" /><span className="spk s3" />
            <span className="wcloud" />
            <Img file="mascot-wave.png" label="Mascot" />
          </div>
        </div>
        <div className="stats" id="stats">{stats.map((s) => <StatCard key={s.label} s={s} />)}</div>
      </section>

      {/* Quick Access */}
      <section>
        <h2 className="sec-title">Quick Access</h2>
        <div className="pp-quick">
          <Link className="pp-card pp-q" to="/student/learning"><span className="pp-q-ico pp-tint-green"><Icon name="book" box /></span><b>Modules</b><small>Learn Python</small></Link>
          <Link className="pp-card pp-q" to="/student/activities?tab=exercises"><span className="pp-q-ico pp-tint-blue"><Icon name="code" box /></span><b>Practice</b><small>Write &amp; Run Code</small></Link>
          <Link className="pp-card pp-q" to="/student/activities?tab=quizzes"><span className="pp-q-ico pp-tint-purple"><Icon name="quiz" box /></span><b>Quiz</b><small>Test Your Knowledge</small></Link>
          <Link className="pp-card pp-q" to="/student/rewards"><span className="pp-q-ico pp-tint-gold"><Icon name="star" box /></span><b>Rewards</b><small>Earn Points</small></Link>
        </div>
      </section>

      {/* Points chart, progress donut, recent activity */}
      <section className="row-a">
        <div className="card">
          <div className="card-title"><Icon name="star" box />Points Earned
            <div className="seg push" id="rangeSeg" role="tablist">
              {Object.keys(SETS).map((r) => (
                <button key={r} className={r === range ? 'on' : undefined} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>
          <LineChart labels={chart.labels} data={chart.data} max={ticks.max} ticks={ticks.ticks} tip={tipPts} ariaLabel="Points earned chart" />
        </div>

        <div className="card">
          <div className="card-title"><Icon name="target" box />Your Learning Progress</div>
          <div className="donut-wrap">
            <div className="donut">
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <circle cx="90" cy="90" r="72" fill="none" stroke="#cfe2fb" strokeWidth="18" />
                <circle cx="90" cy="90" r="72" fill="none" stroke="#4a90e8" strokeWidth="18" strokeDasharray={ready ? `${(RING * (pDone + pProg) / 100).toFixed(1)} ${RING.toFixed(1)}` : '0 452.4'} transform="rotate(-90 90 90)" />
                <circle cx="90" cy="90" r="72" fill="none" stroke="#2f9e86" strokeWidth="18" strokeDasharray={ready ? `${(RING * pDone / 100).toFixed(1)} ${RING.toFixed(1)}` : '0 452.4'} transform="rotate(-90 90 90)" />
              </svg>
              <div className="donut-c"><b>{pDone}%</b><small>Lessons done</small></div>
            </div>
            <ul className="legend">
              <li><i style={{ background: '#2f9e86' }} />Completed<b>{pDone}%</b></li>
              <li><i style={{ background: '#4a90e8' }} />In Progress<b>{pProg}%</b></li>
              <li><i style={{ background: '#cfe2fb' }} />Not Started<b>{pNot}%</b></li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="clock" box />Recent Activity<Link className="view-all push" to="/student/rewards/history">View All <Icon name="arrowright" box /></Link></div>
          <ul className="activity" id="activity">
            {S.history.slice(0, 4).map((h, i) => {
              const plus = h.pts >= 0;
              const [ico, tone] = activityIcon(h);
              return (
                <li key={i}>
                  <span className={`ai ${tone}`}><Icon name={ico} /></span>
                  <div><b>{h.what}</b><small className={plus ? 'plus' : 'minus'}>{plus ? '+ ' : '− '}{Math.abs(h.pts)} pts</small></div>
                  <time>{h.date}</time>
                </li>
              );
            })}
            {!S.history.length && <li className="empty">No activity yet.</li>}
          </ul>
        </div>
      </section>

      {/* My courses, upcoming activities, announcements */}
      <section className="row-b">
        <div className="card">
          <div className="card-title"><Icon name="book" box />My Courses<Link className="view-all push" to="/student/learning">View All <Icon name="arrowright" box /></Link></div>
          <ul className="top-courses" id="myCourses">
            {D.courses.map((c) => {
              const p = courseProgress(c.id, S);
              return (
                <li key={c.id}>
                  <Link to={`/student/learning/course/${c.id}`}>
                    <span className={`tile ${TONE[c.tone]}`}>{c.icon === 'python' ? <Img file="logo-icon.png" label="Logo" /> : <Icon name={c.icon} />}</span>
                    <div>
                      <div className="tc-top"><b>{c.title}</b><span>{p.pct}%</span></div>
                      <small>{p.done} of {p.total} lessons · {c.level}</small>
                      <div className={`bar${p.pct === 100 ? ' green' : ''}`}><i style={{ width: ready ? `${p.pct}%` : 0 }} /></div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="calendar" box />Upcoming Activities<Link className="view-all push" to="/student/activities">View All <Icon name="arrowright" box /></Link></div>
          <ul className="upcoming" id="upcoming">
            {upcoming.length ? upcoming.map((u) => (
              <li key={u.to}>
                <Link to={u.to}>
                  <span className={`tile ${u.tone}`}><Icon name={u.icon} /></span>
                  <div className="up-main"><b>{u.t}</b><small>Due: {u.due}</small></div>
                  <StatusChip status={u.chip} />
                </Link>
              </li>
            )) : <li className="empty">You are all caught up!</li>}
          </ul>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="megaphone" box />Announcements<Link className="view-all push" to="/student/announcements">View All <Icon name="arrowright" box /></Link></div>
          <div id="latestNews">
            {D.announcements.slice(0, 2).map((a) => (
              <Link key={a.id} className="news" to={`/student/announcements?open=${a.id}`}>
                <b><span>{a.title}</span>{!S.read.includes(a.id) && <Chip kind="blue">New</Chip>}</b>
                <small>{a.date}</small>
              </Link>
            ))}
          </div>
          <div className="keep">
            <Img file="mascot-star.png" label="Mascot" />
            <div><b>&ldquo;Small progress leads to big results.&rdquo;</b><small>Keep going!</small></div>
            <span className="kstar" />
          </div>
        </div>
      </section>
    </>
  );
}
