import { useEffect, useState } from 'react';

/* Counts from 0 up to `target` like the old stat cards (about 30-36 steps, 24ms apart). */
export function useCountUp(target, steps = 30) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / steps));
    const iv = setInterval(() => {
      cur = Math.min(target, cur + step);
      setN(cur);
      if (cur >= target) clearInterval(iv);
    }, 24);
    return () => clearInterval(iv);
  }, [target, steps]);
  return n;
}

/* false for the first `delay` ms, then true – lets CSS transitions (bars, donut rings) animate in. */
export function useReady(delay = 150) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}
