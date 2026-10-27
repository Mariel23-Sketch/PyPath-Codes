import { useCallback, useEffect, useRef, useState } from 'react';
import useTheme from '../hooks/useTheme';

/* Canvas line/area chart with hover tooltip – the drawing code of the old student "Points earned"
   and admin "User growth" charts, which were the same. Props:
     labels, data  – x labels and y values
     max, ticks    – y axis top and the tick values to draw
     tickLabel(v)  – text for a tick;  tip(label, value) – tooltip text */
export default function LineChart({ labels, data, max, ticks, tickLabel = (v) => v, tip, ariaLabel }) {
  const cvRef = useRef(null);
  const pts = useRef([]);
  const [hover, setHover] = useState(null);
  const theme = useTheme();

  const draw = useCallback(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const box = cv.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = box.clientWidth;
    const h = box.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 40, r: 16, t: 14, b: 30 };
    const X = (i) => pad.l + 12 + (i * (w - pad.l - pad.r - 24)) / (data.length - 1);
    const Y = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    ctx.font = '11.5px "Plus Jakarta Sans", sans-serif';
    const dark = theme === 'dark';
    const C = dark
      ? { grid: '#24395f', grid2: '#1c2f52', txt: '#8ea3c6', dotRing: '#13223f', tipBg: '#e6eefc', tipTx: '#0b1630' }
      : { grid: '#e4edf9', grid2: '#eef3fb', txt: '#7589a9', dotRing: '#fff', tipBg: '#16294f', tipTx: '#fff' };

    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.txt;
    ticks.forEach((v) => {
      const y = Math.round(Y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(tickLabel(v), pad.l - 8, y + 4);
    });

    const P = data.map((v, i) => ({ x: X(i), y: Y(v), v, l: labels[i] }));
    pts.current = P;
    P.forEach((p) => { ctx.strokeStyle = C.grid2; ctx.beginPath(); ctx.moveTo(Math.round(p.x) + 0.5, pad.t); ctx.lineTo(Math.round(p.x) + 0.5, h - pad.b); ctx.stroke(); });
    ctx.fillStyle = C.txt; ctx.textAlign = 'center';
    P.forEach((p) => ctx.fillText(p.l, p.x, h - 8));

    const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    g.addColorStop(0, 'rgba(74,144,232,.32)'); g.addColorStop(1, 'rgba(74,144,232,.03)');
    ctx.beginPath(); ctx.moveTo(P[0].x, h - pad.b); P.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(P[P.length - 1].x, h - pad.b); ctx.closePath(); ctx.fillStyle = g; ctx.fill();

    ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < P.length; i++) { const a = P[i - 1]; const b = P[i]; const cx = (a.x + b.x) / 2; ctx.bezierCurveTo(cx, a.y, cx, b.y, b.x, b.y); }
    ctx.strokeStyle = '#4a90e8'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
    P.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, i === hover ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4a90e8'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.dotRing; ctx.stroke();
    });

    if (hover != null && P[hover]) {
      const p = P[hover];
      const t = tip(p.l, p.v);
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(t).width + 18;
      const tx = Math.min(Math.max(p.x - tw / 2, 2), w - tw - 2);
      const ty = Math.max(p.y - 40, 2);
      ctx.fillStyle = C.tipBg; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tx, ty, tw, 26, 9); else ctx.rect(tx, ty, tw, 26);
      ctx.fill();
      ctx.fillStyle = C.tipTx; ctx.textAlign = 'left'; ctx.fillText(t, tx + 9, ty + 17);
    }
  }, [labels, data, max, ticks, tickLabel, tip, hover, theme]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    window.addEventListener('resize', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  const nearest = (clientX) => {
    const r = cvRef.current.getBoundingClientRect();
    const mx = clientX - r.left;
    let b = 0;
    pts.current.forEach((p, i) => { if (Math.abs(p.x - mx) < Math.abs(pts.current[b].x - mx)) b = i; });
    return b;
  };

  return (
    <div className="chart-box">
      <canvas
        ref={cvRef}
        aria-label={ariaLabel}
        onMouseMove={(e) => setHover(nearest(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => setHover(nearest(e.touches[0].clientX))}
      />
    </div>
  );
}
