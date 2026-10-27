import { useEffect } from 'react';

/*
  The original student and admin sites were separate multi-page apps whose CSS
  files define the same class names, :root variables and body rules. To keep every
  page looking exactly as it did, each stylesheet is injected only while the
  component that needs it is mounted, and removed when it unmounts.

  `order` keeps the cascade the same as the old <link> order:
  0 = portal base CSS, 1 = page CSS.
*/
const sheets = new Map(); // css text -> { el, count, order }

function insert(css, order) {
  let s = sheets.get(css);
  if (!s) {
    const el = document.createElement('style');
    el.dataset.order = String(order);
    el.textContent = css;
    s = { el, count: 0, order };
    sheets.set(css, s);
  }
  if (!s.el.isConnected) {
    const later = [...document.head.querySelectorAll('style[data-order]')].find((n) => +n.dataset.order > order);
    document.head.insertBefore(s.el, later || null);
  }
  s.count++;
}

function release(css) {
  const s = sheets.get(css);
  if (!s) return;
  s.count--;
  if (s.count <= 0) {
    s.el.remove();
    sheets.delete(css);
  }
}

export default function useStyles(css, order = 1) {
  useEffect(() => {
    insert(css, order);
    return () => release(css);
  }, [css, order]);
}
