import { useEffect, useState } from 'react';
import './Preloader.css';

const KEY = 'fn-intro-seen';

function alreadySeen() {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

/** Barbell "lift" intro — shown once per browser session. */
export default function Preloader() {
  const [phase, setPhase] = useState(() => (alreadySeen() ? 'done' : 'loading'));

  useEffect(() => {
    if (phase === 'done') return;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setPhase('leaving'), 1900);
    const t2 = setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
    }, 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`preloader ${phase === 'leaving' ? 'leaving' : ''}`} aria-hidden="true">
      <div className="pl-inner">
        <svg className="pl-barbell" viewBox="0 0 260 90">
          <g className="pl-lift">
            <rect className="pl-bar" x="18" y="43" width="224" height="4" rx="2" />
            <g className="pl-plates-l">
              <rect x="30" y="14" width="13" height="62" rx="3" />
              <rect x="45" y="22" width="10" height="46" rx="3" className="pl-plate-2" />
              <rect x="57" y="36" width="6" height="18" rx="1.5" className="pl-collar" />
            </g>
            <g className="pl-plates-r">
              <rect x="217" y="14" width="13" height="62" rx="3" />
              <rect x="205" y="22" width="10" height="46" rx="3" className="pl-plate-2" />
              <rect x="197" y="36" width="6" height="18" rx="1.5" className="pl-collar" />
            </g>
          </g>
        </svg>
        <div className="pl-word">
          {'FITTNATION'.split('').map((c, i) => (
            <span key={i} style={{ '--i': i }} className={i < 4 ? 'red' : ''}>{c}</span>
          ))}
        </div>
        <div className="pl-tagline">Fitness · Sports · Strength</div>
        <div className="pl-progress"><span /></div>
      </div>
    </div>
  );
}
