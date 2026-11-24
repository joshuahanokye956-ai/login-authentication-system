'use client';
import { useEffect, useState } from 'react';

export default function CountUp({ value }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (value < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf, start;
    const tick = (t) => {
      start ??= t;
      const p = Math.min((t - start) / 700, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}
