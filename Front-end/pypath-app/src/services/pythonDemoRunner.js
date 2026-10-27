/* Tiny demo "Python" runner used by the practice exercises.
   Understands print(...), simple variables, a, b = b, a, and + - * / // % math.
   Anything else (if, for, def...) throws, and the student can still press Submit for the teacher to check.
   It does NOT execute Python – a real runner/grader needs a backend sandbox. */
export default function runPython(code) {
  const vars = {};
  const out = [];
  const has = (n) => Object.prototype.hasOwnProperty.call(vars, n);

  const splitTop = (s) => {
    const parts = [];
    let depth = 0;
    let quote = '';
    let cur = '';
    for (const ch of s) {
      if (quote) { cur += ch; if (ch === quote) quote = ''; continue; }
      if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    return parts.map((x) => x.trim());
  };

  const val = (expr) => {
    const e = expr.trim();
    let m = e.match(/^(["'])(.*)\1$/);
    if (m) return m[2];
    if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);
    if (e === 'True' || e === 'False') return e;
    if (/^int\(\s*input\(.*\)\s*\)$/.test(e)) return 7;
    if (has(e)) return vars[e];
    if (/^[\w\s+\-*/%().]+$/.test(e)) {
      const floor = e.includes('//');
      const js = e.replace(/\/\//g, '/').replace(/[A-Za-z_]\w*/g, (n) => (has(n) && typeof vars[n] === 'number' ? String(vars[n]) : 'NaN'));
      try {
        // arithmetic only: the regex above allows nothing but digits, names (replaced by numbers/NaN) and + - * / % ( ) .
        const r = Function(`"use strict";return (${js})`)();
        if (typeof r === 'number' && isFinite(r)) return floor ? Math.floor(r) : r;
      } catch { /* fall through to the error below */ }
    }
    throw new Error(`The demo runner can't work out: ${e}`);
  };
  const show = (v) => (typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(10)) : String(v));

  code.split('\n').forEach((raw, n) => {
    let line = raw.replace(/\s+$/, '');
    if (!/["']/.test(line)) line = line.replace(/#.*$/, '');
    if (!line.trim()) return;
    if (/^\s/.test(line) || /^(if|elif|else|for|while|def|class|return|import|from|try|except)\b/.test(line.trim())) {
      throw new Error(`Line ${n + 1}: the demo runner only understands print() and simple variables. Press Submit and your teacher will check it.`);
    }
    line = line.trim();
    let m = line.match(/^print\((.*)\)$/);
    if (m) { out.push(m[1].trim() ? splitTop(m[1]).map(val).map(show).join(' ') : ''); return; }
    m = line.match(/^([A-Za-z_][\w\s,]*?)\s*=\s*([^=].*)$/);
    if (m) {
      const names = m[1].split(',').map((x) => x.trim());
      const values = splitTop(m[2]).map(val);
      if (names.length !== values.length) throw new Error(`Line ${n + 1}: ${names.length} names but ${values.length} values.`);
      names.forEach((nm, i) => { vars[nm] = values[i]; });
      return;
    }
    throw new Error(`Line ${n + 1}: the demo runner does not understand "${line}".`);
  });
  return out.join('\n');
}
