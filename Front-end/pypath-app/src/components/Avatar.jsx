const PAL = [['#8ec5ff', '#5b9cf2'], ['#ffc9a8', '#f59a6b'], ['#c8b6ff', '#9a7cf0'], ['#9be3c6', '#4fbf97'], ['#ffc2dc', '#ef8ab5'], ['#ffe08a', '#f2b632']];

/* initials on a colour picked from the name */
export default function Avatar({ name, className = '' }) {
  const ini = String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 997;
  const p = PAL[h % PAL.length];
  return <span className={`avatar ${className}`.trim()} style={{ background: `linear-gradient(135deg,${p[0]},${p[1]})` }}>{ini}</span>;
}
