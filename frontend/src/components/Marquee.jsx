import './Marquee.css';
import { Dumbbell } from './Icons';

const WORDS = ['No Excuses', 'Train Hard', 'Stay Consistent', 'Fitness', 'Sports', 'Strength', 'FittNation'];

function Track({ reverse }) {
  // duplicated so the loop is seamless
  const items = [...WORDS, ...WORDS];
  return (
    <div className={`mq-track ${reverse ? 'reverse' : ''}`}>
      {items.map((w, i) => (
        <span key={i} className="mq-item">
          {w}
          <Dumbbell className="mq-icon" width={26} height={26} />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-band mq-back"><Track reverse /></div>
      <div className="mq-band mq-front"><Track /></div>
    </div>
  );
}
