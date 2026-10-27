import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import css from '../../styles/admin/points-reward.css?inline';
import useStyles from '../../hooks/useStyles';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip } from '../../components/Chip';
import Pager from '../../components/Pager';
import { usePageSearch } from '../../hooks/usePageSearch';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { pointsStore, usePoints } from '../../services/pointsStore';

/* Student "Points and Reward" preview shown inside the admin shell. All balances, awards and
   redemptions go through services/pointsStore; this file only draws and asks.
   Tabs are routes: /admin/student/points-reward, /earn, /rewards, /history */
const BASE = '/admin/student/points-reward';
const TABS = [['badges', 'Badges'], ['rewards', 'Redeem Rewards'], ['earn', 'How to Earn'], ['history', 'Points History']];
const TILE = { blue: 't-blue', green: 't-green', purple: 't-purple', yellow: 't-yellow', red: 't-red', pink: 't-pink', orange: 't-orange' };
const TYPE = { lesson: ['Lesson', 'blue'], quiz: ['Quiz', 'purple'], practice: ['Exercise', 'green'], course: ['Course', 'orange'], streak: ['Streak', 'orange'], redeem: ['Reward', 'red'] };
const fmt = (n) => Number(n).toLocaleString();
const when = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function Hero({ m }) {
  const all = !m.next;
  const pct = all ? 100 : Math.min(100, Math.round((m.next.have / m.next.pts) * 100));
  return (
    <section className="card pr-hero" aria-label="Your points">
      <div className="pr-hero-copy">
        <span className="pr-tag">Your points</span>
        <h2><span id="heroPts">{fmt(m.balance)}</span> points</h2>
        <p>{all ? 'You unlocked every badge. Amazing work!' : `You have earned ${m.badgesEarned} of ${m.badgesTotal} badges. Keep learning to unlock more!`}</p>
        <div className="pr-next"><b>{all ? 'All badges unlocked' : `Next badge: ${m.next.name}`}</b><span>{all ? '' : `${fmt(m.next.have)} / ${fmt(m.next.pts)}`}</span></div>
        <div className="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="pr-hero-art" aria-hidden="true">
        <span className="pr-cloud" /><Img file="mascot-star.png" />
        <i className="spk a" /><i className="spk b" /><i className="spk c" /><i className="spk d" />
      </div>
    </section>
  );
}

function StatCard({ tile, icon, label, val, unit, sub }) {
  return (
    <div className="card stat">
      <span className={`tile ${tile}`}><Icon name={icon} /></span>
      <small>{label}</small>
      <b>{val}{unit && <em>{unit}</em>}</b>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function Badges() {
  return (
    <div className="badge-grid">
      {pointsStore.badges().map((b) => {
        const left = Math.max(0, b.pts - b.have);
        const pct = Math.min(100, Math.round((b.have / b.pts) * 100));
        return (
          <article key={b.id} className={`card bdg${b.earned ? '' : ' locked'}`}>
            <span className={`tile ${b.earned ? TILE[b.color] : 't-lock'}`}><Icon name={b.earned ? 'award' : 'lock'} /></span>
            <h3>{b.name}</h3>
            <p>{b.desc}</p>
            <div className="bdg-foot">
              {b.earned ? <Chip kind="green">Earned</Chip> : <><div className="pr-bar sm"><i style={{ width: `${pct}%` }} /></div><small>{fmt(left)} more pts</small></>}
              <span className="bdg-pts">{fmt(b.pts)} pts</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RewardsPanel({ m }) {
  const toast = useToast();
  const { confirm } = useDialogs();

  const redeem = async (id) => {
    const r = pointsStore.rewards().find((x) => x.id === +id);
    if (!r) return;
    const have = pointsStore.balance();
    if (r.status === 'redeemed') { toast('You have already redeemed this reward.', 'error'); return; }
    if (r.status === 'soldout') { toast('Sorry, this reward is out of stock.', 'error'); return; }
    if (r.status === 'short') { toast(`Not enough points. You need ${fmt(r.need)} more pts to redeem ${r.name}.`, 'error'); return; }
    const ok = await confirm({
      title: `Redeem ${r.name}?`, icon: 'gift', tone: 'ok', primary: true, confirm: 'Redeem',
      text: (<><b>{fmt(r.cost)} pts</b> will be deducted from your balance.<br />You will have <b>{fmt(have - r.cost)} pts</b> left.</>)
    });
    if (!ok) return;
    const res = pointsStore.redeem(id);
    if (res.ok) toast(`${res.reward} redeemed! ${fmt(res.cost)} pts deducted. Balance: ${fmt(res.balance)} pts.`);
    else toast(res.error, 'error');
  };

  const note = { redeemed: <Chip kind="green">Redeemed</Chip>, soldout: <Chip kind="red">Out of stock</Chip> };
  return (
    <>
      <p className="pr-balance-note">Your balance: <b>{fmt(m.balance)} pts</b></p>
      <div className="rw-grid">
        {pointsStore.rewards().map((r) => (
          <article key={r.id} className={`card rw ${r.status}`}>
            <span className={`tile lg ${TILE[r.color] || 't-blue'}`}><Icon name={r.icon} /></span>
            <div className="rw-top"><h3>{r.name}</h3>{note[r.status] || (r.status === 'short' ? <Chip kind="orange">Need {fmt(r.need)} more pts</Chip> : <Chip kind="blue">Available</Chip>)}</div>
            <p>{r.desc}</p>
            <div className="rw-meta"><span className="rw-cost"><Icon name="star" />{fmt(r.cost)} pts</span>{r.stock < 999 && <small>{r.left} left</small>}</div>
            {r.status === 'redeemed' && <button className="btn btn-soft btn-block" disabled><Icon name="check" />Redeemed</button>}
            {r.status === 'soldout' && <button className="btn btn-ghost btn-block" disabled>Out of stock</button>}
            {r.status === 'short' && <button className="btn btn-ghost btn-block" aria-label={`Redeem ${r.name} (not enough points)`} onClick={() => redeem(r.id)}><Icon name="lock" />Redeem</button>}
            {r.status === 'available' && <button className="btn btn-primary btn-block" aria-label={`Redeem ${r.name}`} onClick={() => redeem(r.id)}><Icon name="gift" />Redeem</button>}
          </article>
        ))}
      </div>
    </>
  );
}

const EarnRow = ({ tile, icon, t, d, pts }) => (
  <div className="earn-row"><span className={`tile ${tile}`}><Icon name={icon} /></span><div><b>{t}</b><small>{d}</small></div><span className="earn-pts">+{pts} pts</span></div>
);

function Earn() {
  const toast = useToast();
  const R = pointsStore.rules();
  const pointsToast = (res) => {
    if (!res.ok) { toast(res.error, 'error'); return; }
    toast(`+${res.points} pts earned!${res.unlocked && res.unlocked.length ? ` Badge unlocked: ${res.unlocked.join(', ')}.` : ''}`);
  };
  return (
    <>
      <div className="card">
        <div className="card-title"><Icon name="star" />Ways to earn points</div>
        <div className="earn-list">
          <EarnRow tile="t-blue" icon="book" t="Complete a lesson" d="Finish every step of a lesson." pts={R.lesson} />
          <EarnRow tile="t-purple" icon="quiz" t="Pass a quiz" d={`Score at least ${pointsStore.PASS_MARK}% on a quiz.`} pts={R.quiz} />
          <EarnRow tile="t-green" icon="code" t="Complete a programming exercise" d="Submit a working solution." pts={R.practice} />
          <EarnRow tile="t-orange" icon="award" t="Complete a course" d="Finish all lessons in a course." pts={R.course} />
          <EarnRow tile="t-yellow" icon="flame" t="Learn every day" d="Open PyPath and learn each day to grow your streak." pts={R.streak} />
        </div>
        <p className="note-line">Points are awarded once per lesson, quiz, exercise or course, so repeating the same one doesn’t add more.</p>
      </div>
      <div className="card demo">
        <div className="card-title"><Icon name="play" />Try it out <span className="chip chip-purple push">Prototype demo</span></div>
        <p className="note-line top">There is no lesson player in this preview yet. Use these buttons to see how points are awarded. Each one can only pay out once.</p>
        {pointsStore.ACTIVITIES.map((a) => {
          const done = pointsStore.isDone(a.type, a.id);
          return (
            <div className="demo-row" key={a.id}>
              <span>{a.label}<small>+{R[a.type]} pts</small></span>
              {done ? <span className="chip chip-green">Done</span>
                : a.needsScore ? (
                  <div className="acts">
                    <button className="btn btn-soft btn-sm" onClick={() => pointsToast(pointsStore.complete({ type: a.type, id: a.id, score: 85, label: a.label }))}>Pass (85%)</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => pointsToast(pointsStore.complete({ type: a.type, id: a.id, score: 55, label: a.label }))}>Fail (55%)</button>
                  </div>
                ) : <button className="btn btn-soft btn-sm" onClick={() => pointsToast(pointsStore.complete({ type: a.type, id: a.id, label: a.label }))}>Complete</button>}
            </div>
          );
        })}
        <div className="demo-row"><span>Daily check-in<small>+{R.streak} pts, once per day</small></span>
          <button className="btn btn-soft btn-sm" onClick={() => {
            const res = pointsStore.dailyCheckIn();
            if (res.ok) toast(`Day ${res.days} streak! +${res.points} pts`); else toast('You already checked in today. Come back tomorrow!', 'error');
          }}>Check in today</button>
        </div>
        <div className="demo-foot"><button className="link-btn" onClick={() => { pointsStore.reset(); toast('Demo data reset'); }}>Reset demo data</button></div>
      </div>
    </>
  );
}

function History() {
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);
  const all = pointsStore.history();
  const pages = Math.max(1, Math.ceil(all.length / per));
  const cur = Math.min(page, pages);
  const rows = all.slice((cur - 1) * per, cur * per);
  return (
    <div className="card">
      <div className="table-wrap">
        {rows.length ? (
          <table className="table stack">
            <thead><tr><th>Activity</th><th>Type</th><th>Date</th><th style={{ textAlign: 'right' }}>Points</th></tr></thead>
            <tbody>
              {rows.map((x) => {
                const t = TYPE[x.type] || ['Other', 'blue'];
                return (
                  <tr key={x.id}>
                    <td className="primary"><span className="cell-strong">{x.label}</span></td>
                    <td data-label="Type"><Chip kind={t[1]}>{t[0]}</Chip></td>
                    <td data-label="Date">{when(x.ts)}</td>
                    <td data-label="Points" className={`pts-cell ${x.pts < 0 ? 'neg' : 'pos'}`}>{x.pts > 0 ? '+' : '−'}{fmt(Math.abs(x.pts))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty"><Img file="mascot-sad.png" />No points activity yet.</div>}
      </div>
      <Pager total={all.length} page={cur} per={per} onPage={setPage} onPer={(n) => { setPer(n); setPage(1); }} />
    </div>
  );
}

export default function PointsReward() {
  useStyles(css);
  usePoints(); // redraw whenever the ledger changes
  const toast = useToast();
  usePageSearch((q) => toast(`Search for “${q}” isn’t available in this preview yet.`));
  const { tab = 'badges' } = useParams();
  if (!TABS.some(([k]) => k === tab)) return <Navigate to={BASE} replace />;

  const m = pointsStore.summary();
  return (
    <>
      <div className="page-head"><div><h1>Points and Reward</h1><p>Earn points by learning, unlock badges, and redeem rewards.</p></div></div>
      <div id="pg" className="stack-v" aria-live="polite">
        <Hero m={m} />
        <div className="stats">
          <StatCard tile="t-yellow" icon="star" label="Total Points" val={fmt(m.balance)} sub="Available to spend" />
          <StatCard tile="t-purple" icon="award" label="Badges Earned" val={m.badgesEarned} unit={`/ ${m.badgesTotal}`} sub="From points you earned" />
          <StatCard tile="t-green" icon="gift" label="Rewards Redeemed" val={m.redeemed} sub={`${fmt(m.spent)} pts spent`} />
          <StatCard tile="t-orange" icon="flame" label="Day Streak" val={m.streak} unit={m.streak === 1 ? 'day' : 'days'} sub={`+${m.streakBonus} pts per day`} />
        </div>
        <div className="pills" role="tablist" aria-label="Points and Reward sections">
          {TABS.map(([k, n]) => <Link key={k} className={`pill${tab === k ? ' on' : ''}`} role="tab" aria-selected={tab === k} to={k === 'badges' ? BASE : `${BASE}/${k}`}>{n}</Link>)}
        </div>
        <div id="panel" role="tabpanel">
          {tab === 'badges' && <Badges />}
          {tab === 'rewards' && <RewardsPanel m={m} />}
          {tab === 'earn' && <Earn />}
          {tab === 'history' && <History />}
        </div>
      </div>
    </>
  );
}
