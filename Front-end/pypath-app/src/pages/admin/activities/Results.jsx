import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Img from '../../../components/Img';
import Avatar from '../../../components/Avatar';
import { Chip, StatusChip } from '../../../components/Chip';
import { actPoints, quizPoints, useAdminData } from '../../../services/adminDb';
import { Crumbs } from './shared';
import { BASE } from './helpers';

/* Sample attempts, shown so you can preview how results look (generated, not real student data). */
const STUDENTS = ['Jasmine Santos', 'Marco Rivera', 'Lian Cruz', 'Aira Delgado'];

function attemptQuiz(quiz, si) {
  const answers = quiz.qs.map((q, qi) => {
    const wrong = (si * 7 + qi * 3 + quiz.id) % 5 === 0 && !(si === 0 && qi === 0);
    const n = q.opts.length;
    const pick = wrong ? (q.correct + 1 + ((qi + si) % (n - 1))) % n : q.correct;
    return { q, pick, ok: pick === q.correct };
  });
  const earned = answers.reduce((s, a) => s + (a.ok ? +a.q.points || 0 : 0), 0);
  const total = quizPoints(quiz) || 1;
  const secs = 150 + ((si * 53 + quiz.id * 41) % 260);
  return { answers, earned, total, pct: Math.round((earned / total) * 100), time: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` };
}

export default function Results() {
  const { id } = useParams();
  const activities = useAdminData('activities');
  const [si, setSi] = useState(0);
  const a = activities.find((z) => z.id === +id);
  if (!a) return <Navigate to={BASE} replace />;

  const quiz = a.type === 'quiz';
  const r = quiz && a.qs.length ? attemptQuiz(a, si) : null;
  const pass = r && r.pct >= (a.pass || 60);
  const rows = !quiz ? STUDENTS.map((s, i) => { const pct = [100, 80, 60, 40][(i + a.id) % 4]; return { s, pct, pts: Math.round((a.pts * pct) / 100), tries: 1 + ((i + a.id) % 3) }; }) : [];
  const avg = rows.length ? Math.round(rows.reduce((t, x) => t + x.pct, 0) / rows.length) : 0;

  return (
    <>
      <Crumbs items={[[a.title, `${BASE}/${a.id}/edit`], ['Results']]} />
      <section className="view" id="v-results">
        <div className="card">
          <div className="res-head">
            <h2 id="resTitle">{quiz ? 'Quiz' : 'Exercise'} Results – {a.title}</h2>
            {quiz && (
              <select className="select" id="studentSel" aria-label="Choose student" value={si} onChange={(e) => setSi(+e.target.value)}>
                {STUDENTS.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            )}
          </div>
          <p className="sub" style={{ margin: '-8px 0 16px' }}>Sample attempts, shown so you can preview how results look.</p>

          {quiz && !a.qs.length && (
            <div className="table-wrap"><table className="table stack"><tbody><tr><td className="empty"><Img file="mascot-sad.png" />This quiz has no questions yet, so there are no results.</td></tr></tbody></table></div>
          )}

          {r && (
            <>
              <div className="res-stats" id="resStats">
                <div className="rs"><small>Score</small><b>{r.pct}%</b></div>
                <div className="rs"><small>Points</small><b>{r.earned}/{r.total}</b></div>
                <div className="rs"><small>Time</small><b>{r.time}</b></div>
                <div className="rs"><small>Status (pass {a.pass || 60}%)</small><div style={{ marginTop: 6 }}><StatusChip status={pass ? 'Passed' : 'Failed'} /></div></div>
              </div>
              <div className="table-wrap">
                <table className="table stack" id="resTable">
                  <thead><tr><th style={{ width: 56 }}>#</th><th>Question</th><th>Student’s Answer</th><th>Correct Answer</th><th>Result</th></tr></thead>
                  <tbody>
                    {r.answers.map((x, i) => (
                      <tr key={i}>
                        <td className="hide-m" data-label="#">{i + 1}</td>
                        <td className="primary cell-strong" data-label="Question">{x.q.text}</td>
                        <td data-label="Student’s Answer">{x.q.opts[x.pick]}</td>
                        <td data-label="Correct Answer">{x.q.opts[x.q.correct]}</td>
                        <td data-label="Result"><StatusChip status={x.ok ? 'Correct' : 'Incorrect'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!quiz && (
            <>
              <div className="res-stats" id="resStats">
                <div className="rs"><small>Average score</small><b>{avg}%</b></div>
                <div className="rs"><small>Passed</small><b>{rows.filter((x) => x.pct >= 60).length}/{rows.length}</b></div>
                <div className="rs"><small>Points possible</small><b>{actPoints(a)}</b></div>
                <div className="rs"><small>Checking</small><div style={{ marginTop: 6 }}><Chip kind="blue">{a.validation === 'manual' ? 'Manual review' : 'Auto-checked'}</Chip></div></div>
              </div>
              <div className="table-wrap">
                <table className="table stack" id="resTable">
                  <thead><tr><th>Student</th><th>Attempts</th><th>Points</th><th>Result</th></tr></thead>
                  <tbody>
                    {rows.map((x) => (
                      <tr key={x.s}>
                        <td className="primary" data-label="Student"><div className="cell-user"><Avatar name={x.s} />{x.s}</div></td>
                        <td data-label="Attempts">{x.tries}</td>
                        <td data-label="Points">{x.pts}/{a.pts}</td>
                        <td data-label="Result"><StatusChip status={x.pct >= 60 ? 'Passed' : 'Failed'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
