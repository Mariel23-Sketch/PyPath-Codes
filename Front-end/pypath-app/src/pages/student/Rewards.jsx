import { Link, Navigate, useParams } from 'react-router-dom';
import css from '../../styles/student/rewards.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip, StatusChip } from '../../components/Chip';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { studentStore, useStudent } from '../../services/studentStore';
import { D } from '../../services/studentCatalog';

/* Tabs are routes: /student/rewards (badges), /rewards/rewards, /rewards/earn, /rewards/history.
   Badges unlock when your total points reach their target.
   Redeeming a reward takes its cost from your points (saved in this browser). */
const fmt = (n) => n.toLocaleString('en-US');
const TABS = [['badges', 'Badges'], ['rewards', 'Redeem Rewards'], ['earn', 'How to Earn'], ['history', 'Points History']];

/* badges use every point you ever earned, so redeeming a reward never takes a badge away */
const lifetime = (s) => s.points + s.history.filter((h) => h.pts < 0).reduce((a, h) => a - h.pts, 0);

function Stat({ tone, icon, label, val, unit, sub }) {
  return (
    <div className="card stat">
      <span className={`tile ${tone}`}><Icon name={icon} /></span>
      <small>{label}</small>
      <b>{val}{unit && <span>{unit}</span>}</b>
      <span className="vs">{sub}</span>
    </div>
  );
}

function Badges({ life }) {
  return (
    <div className="badge-grid">
      {D.badges.map((b) => {
        const got = life >= b.pts;
        const pct = Math.min(100, Math.round((life / b.pts) * 100));
        return (
          <div key={b.id} className={`card bdg${got ? '' : ' locked'}`}>
            <span className={`tile ${b.color}`}><Icon name={got ? 'award' : 'lock'} /></span>
            <h3>{b.name}</h3>
            <div className="row"><Chip kind="blue">{fmt(b.pts)} pts</Chip><StatusChip status={got ? 'Earned' : 'Locked'} /></div>
            <p>{b.desc}</p>
            {!got && <div className="pc"><div className="bar"><i style={{ width: `${pct}%` }} /></div><b>{pct}%</b></div>}
          </div>
        );
      })}
    </div>
  );
}

function Redeem({ s }) {
  const toast = useToast();
  const { confirm } = useDialogs();

  const redeem = async (r) => {
    if (!(await confirm({ title: `Redeem ${r.name}?`, text: `${fmt(r.cost)} points will be taken from your ${fmt(s.points)} points.`, confirm: 'Redeem', icon: 'gift', primary: true }))) return;
    studentStore.update((d) => { d.redeemed.push(r.id); });
    studentStore.earn(-r.cost, `Redeemed ${r.name}`);
    toast(`${r.name} redeemed! Your teacher will hand it over.`);
  };

  return (
    <div className="reward-grid">
      {D.rewards.map((r) => {
        const owned = s.redeemed.filter((x) => x === r.id).length;
        const left = r.stock - owned;
        const short = r.cost - s.points;
        return (
          <div key={r.id} className="card rw">
            <div className={`rw-img ${r.tone}`}><Icon name={r.icon} /></div>
            <h3>{r.name}</h3>
            <div className="rw-cost"><Icon name="star" />{fmt(r.cost)} pts</div>
            <small>{r.stock > 100 ? 'Always available' : `${left} left in stock`}{owned ? ` · You own ${owned}` : ''}</small>
            {left <= 0 ? <button className="btn btn-ghost" disabled>Sold out</button>
              : short > 0 ? <button className="btn btn-ghost" disabled><Icon name="lock" />Need {fmt(short)} more pts</button>
                : <button className="btn btn-primary" onClick={() => redeem(r)}><Icon name="gift" />Redeem</button>}
          </div>
        );
      })}
    </div>
  );
}

const Row = ({ tone, icon, t, sub, pts }) => (
  <div className="earn"><span className={`tile ${tone}`}><Icon name={icon} /></span><div><b>{t}</b><small>{sub}</small></div><span className="plus">{pts}</span></div>
);

function Earn() {
  const r = D.rules;
  return (
    <div className="card">
      <div className="card-title"><Icon name="star" />How to earn points</div>
      <div className="earn-list">
        <Row tone="t-blue" icon="book" t="Finish a lesson" sub="Mark a lecture as done" pts={`+${r.lesson}`} />
        <Row tone="t-purple" icon="quiz" t="Pass a quiz" sub="Score 60% or higher" pts={`+${r.quiz}`} />
        <Row tone="t-green" icon="code" t="Solve an exercise" sub="Points shown on each exercise" pts="+10 to +40" />
        <Row tone="t-orange" icon="flame" t="Keep your streak" sub="Learn every day" pts={`+${r.streak} / day`} />
      </div>
    </div>
  );
}

function History({ s }) {
  const h = s.history;
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table stack">
          <thead><tr><th>Activity</th><th>Date</th><th style={{ width: 120 }}>Points</th></tr></thead>
          <tbody>
            {h.length ? h.map((x, i) => (
              <tr key={i}>
                <td className="primary cell-strong" data-label="Activity">{x.what}</td>
                <td data-label="Date">{x.date}</td>
                <td data-label="Points"><span className={x.pts >= 0 ? 'pts-plus' : 'pts-minus'}>{x.pts >= 0 ? '+' : '−'}{fmt(Math.abs(x.pts))}</span></td>
              </tr>
            )) : <tr><td colSpan="3" className="empty">No points yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Rewards() {
  useStyles(css);
  const s = useStudent();
  const { tab = 'badges' } = useParams();
  if (!TABS.some(([k]) => k === tab)) return <Navigate to="/student/rewards" replace />;

  const life = lifetime(s);
  const earned = D.badges.filter((b) => life >= b.pts);
  const next = D.badges.find((b) => life < b.pts);
  const spent = s.history.filter((h) => h.pts < 0).reduce((a, h) => a - h.pts, 0);

  return (
    <>
      <div className="page-head">
        <div><h1>Points &amp; Rewards</h1><p>Earn points by learning, unlock badges, and redeem rewards.</p></div>
      </div>

      <div className="card hero">
        <div className="hero-copy">
          <span className="tag">Your points</span>
          <h2><span id="heroPts">{fmt(s.points)}</span> points</h2>
          <p id="heroSub">You have earned {earned.length} of {D.badges.length} badges. Keep learning to unlock more!</p>
          <div className="next-badge" id="nextBadge">
            {next ? (
              <>
                <small><span>Next badge: {next.name}</span><span>{fmt(life)} / {fmt(next.pts)}</span></small>
                <div className="bar"><i style={{ width: `${Math.round((life / next.pts) * 100)}%` }} /></div>
              </>
            ) : <small><span>You unlocked every badge!</span></small>}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="spk s1" /><span className="spk s2" /><span className="spk s3" /><span className="wcloud" />
          <Img file="mascot-star.png" label="Mascot" />
        </div>
      </div>

      <div className="stats" id="rwStats">
        <Stat tone="t-yellow" icon="star" label="Total Points" val={fmt(s.points)} sub="Available to spend" />
        <Stat tone="t-purple" icon="award" label="Badges Earned" val={earned.length} unit={`/ ${D.badges.length}`} sub="From points you earned" />
        <Stat tone="t-green" icon="gift" label="Rewards Redeemed" val={s.redeemed.length} sub={`${fmt(spent)} pts spent`} />
        <Stat tone="t-orange" icon="flame" label="Day Streak" val={s.streak} unit="days" sub={`+${D.rules.streak} pts per day`} />
      </div>

      <div className="pills" id="tabs" role="tablist">
        {TABS.map(([k, l]) => <Link key={k} className={`pill${tab === k ? ' on' : ''}`} to={k === 'badges' ? '/student/rewards' : `/student/rewards/${k}`}>{l}</Link>)}
      </div>
      <div id="tabBody">
        {tab === 'badges' && <Badges life={life} />}
        {tab === 'rewards' && <Redeem s={s} />}
        {tab === 'earn' && <Earn />}
        {tab === 'history' && <History s={s} />}
      </div>
    </>
  );
}
