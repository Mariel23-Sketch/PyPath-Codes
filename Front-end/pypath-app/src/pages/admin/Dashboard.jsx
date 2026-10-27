import { useState } from 'react';
import { Link } from 'react-router-dom';
import css from '../../styles/admin/admin-dashboard.css?inline';
import useStyles from '../../hooks/useStyles';
import { useCountUp, useReady } from '../../hooks/useAnimate';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import Avatar from '../../components/Avatar';
import { StatusChip } from '../../components/Chip';
import LineChart from '../../components/LineChart';
import { useToast } from '../../hooks/useToast';
import { ADMIN_DASHBOARD as DATA } from '../../data/adminDashboard';

const RING = 2 * Math.PI * 72;
const TICKS = [0, 300, 600, 900, 1200];
const tickLabel = (v) => (v === 1200 ? '1.2k' : v);
const tip = (l, v) => `${l} · ${v.toLocaleString('en-US')} users`;

function StatCard({ s }) {
  const n = useCountUp(s.val, 36);
  return (
    <Link className="card stat" to={s.to}>
      <span className={`tile ${s.tone}`}><Icon name={s.icon} /></span>
      <small>{s.label}</small>
      <b>{n.toLocaleString('en-US')}</b>
      <span className="delta"><Icon name="arrowup" />{s.delta}</span>
      <span className="vs">vs. last month</span>
    </Link>
  );
}

export default function Dashboard() {
  useStyles(css);
  const toast = useToast();
  const ready = useReady(150);
  const [range, setRange] = useState('7D');
  const [backup, setBackup] = useState('May 18, 2025');
  const chart = DATA.growth[range];

  return (
    <>
      <section className="top-grid">
        <div className="card welcome">
          <div className="welcome-copy">
            <span className="admin-tag">Admin</span>
            <h1>Welcome Back,<br />Admin!</h1>
            <p>Here&apos;s what&apos;s happening with your PyPath platform today.</p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <span className="spk s1" /><span className="spk s2" /><span className="spk s3" />
            <span className="wcloud" />
            <Img file="mascot-wink.png" label="Mascot" />
          </div>
        </div>
        <div className="stats" id="stats">{DATA.stats.map((s) => <StatCard key={s.label} s={s} />)}</div>
      </section>

      <section className="row-a">
        <div className="card">
          <div className="card-title"><Icon name="users" box />User Growth
            <div className="seg push" id="rangeSeg" role="tablist">
              {Object.keys(DATA.growth).map((r) => <button key={r} className={r === range ? 'on' : undefined} onClick={() => setRange(r)}>{r}</button>)}
            </div>
          </div>
          <LineChart labels={chart.labels} data={chart.data} max={1200} ticks={TICKS} tickLabel={tickLabel} tip={tip} ariaLabel="User growth chart" />
        </div>

        <div className="card">
          <div className="card-title"><Icon name="book" box />Course Progress</div>
          <div className="donut-wrap">
            <div className="donut">
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <circle cx="90" cy="90" r="72" fill="none" stroke="#cfe2fb" strokeWidth="18" />
                <circle cx="90" cy="90" r="72" fill="none" stroke="#2f9e86" strokeWidth="18" strokeLinecap="round" strokeDasharray={ready ? `${(RING * 0.68).toFixed(1)} ${RING.toFixed(1)}` : '0 452.4'} transform="rotate(-90 90 90)" />
              </svg>
              <div className="donut-c"><b>68%</b><small>Overall Progress</small></div>
            </div>
            <ul className="legend">
              <li><i style={{ background: '#2f9e86' }} />Completed<b>68%</b></li>
              <li><i style={{ background: '#4a90e8' }} />In Progress<b>24%</b></li>
              <li><i style={{ background: '#9b5de5' }} />Not Started<b>8%</b></li>
            </ul>
          </div>
          <svg className="books" viewBox="0 0 64 56" aria-hidden="true"><rect x="6" y="30" width="46" height="12" rx="3" fill="#7aa8f5" /><rect x="10" y="20" width="44" height="12" rx="3" fill="#a98bf1" transform="rotate(-6 10 20)" /><rect x="14" y="10" width="40" height="11" rx="3" fill="#61c7a4" transform="rotate(-12 14 10)" /><path d="m52 6 1.600 3.400L57 11l-3.400 1.600L52 16l-1.600-3.400L47 11l3.400-1.600z" fill="#f4b01f" /></svg>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="clock" box />Recent Activities
            <a className="view-all push" href="#" onClick={(e) => { e.preventDefault(); toast('Activity log is not part of this build yet.'); }}>View All <Icon name="arrowright" box /></a>
          </div>
          <ul className="activity" id="activity">
            {DATA.activities.map((a) => (
              <li key={a.title}>
                <span className={`ai ${a.tone}`}><Icon name={a.icon} /></span>
                <div><b>{a.title}</b><small>{a.sub}</small></div>
                <time>{a.ago}</time>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="row-b">
        <div className="card">
          <div className="card-title"><Icon name="book" box />Top Courses<Link className="view-all push" to="/admin/learning">View All <Icon name="arrowright" box /></Link></div>
          <ul className="top-courses" id="topCourses">
            {DATA.courses.map((c, i) => (
              <li key={c.name}>
                <span className="rank">{i + 1}</span>
                <span className={`tile ${c.tone}`}><Icon name={c.icon} /></span>
                <div className="tc-body">
                  <div className="tc-top"><b>{c.name}</b><span>{c.pct}%</span></div>
                  <small>{c.students} students</small>
                  <div className="bar"><i style={{ background: c.color, width: ready ? `${c.pct}%` : 0 }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="users" box />Recent Users<Link className="view-all push" to="/admin/users">View All <Icon name="arrowright" box /></Link></div>
          <div className="table-wrap">
            <table className="table stack">
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody id="recentUsers">
                {DATA.users.map((u) => (
                  <tr key={u.email}>
                    <td className="primary" data-label="Name"><div className="cell-user"><Avatar name={u.name} />{u.name}</div></td>
                    <td data-label="Email" className="sm">{u.email}</td>
                    <td data-label="Joined" className="sm">{u.joined}</td>
                    <td data-label="Status"><StatusChip status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><Icon name="gear" box />System Overview</div>
          <div className="sys-grid">
            <div className="sys"><span className="tile t-green"><Icon name="shield" box /></span><div><small>Server Status</small><b className="ok"><i className="ring-dot" />Online</b></div></div>
            <div className="sys"><span className="tile t-green"><Icon name="database" box /></span><div><small>Database</small><b className="ok sm"><i className="dot-g" />Connected</b></div></div>
            <div className="sys"><span className="tile t-blue"><Icon name="drive" box /></span><div><small>Storage Usage</small><b>42%</b><div className="meter"><span style={{ width: '42%' }} /></div></div></div>
            <div className="sys"><span className="tile t-blue"><Icon name="clock" box /></span><div><small>Last Backup</small><b className="sm2" id="lastBackup">{backup}</b><em>12:30 PM</em></div></div>
          </div>
          <div className="keep">
            <Img file="mascot-star.png" label="Mascot" />
            <div><b>Keep going!</b><small>Your platform is running smoothly.</small></div>
            <span className="kstar" />
          </div>
          <button className="btn btn-ghost btn-sm refresh" id="refreshBtn" onClick={() => {
            setBackup(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            toast('System status refreshed');
          }}><Icon name="clock" box />Refresh status</button>
        </div>
      </section>
    </>
  );
}
