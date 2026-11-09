import { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';

/** Animates a number from 0 to `to` once it scrolls into view. */
export default function CountUp({ to, suffix = '', duration = 1800, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: '0px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    let start;
    const tick = (now) => {
      start ??= now + delay;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, delay]);

  return <span ref={ref}>{value}{suffix}</span>;
}
