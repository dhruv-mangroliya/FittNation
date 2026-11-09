import './Hero.css';
import CountUp from './CountUp';
import { Arrow, Heart, Dumbbell } from './Icons';

const STATS = [
  { to: 300, suffix: '+', label: 'Members' },
  { to: 3, label: 'Branches' },
  { to: 15, suffix: '+', label: 'Trainers' },
  { text: '24/7', label: 'Support' },
];

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-glow" />
      <div className="hero-lines" aria-hidden="true"><span /><span /><span /></div>
      <div className="grain" />

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-tag"><span className="live-dot" />FITNESS MEETS TECHNOLOGY</p>

          <h1 className="hero-title">
            <span className="line"><span>FITNESS</span></span>
            <span className="line"><span className="red">SPORTS</span></span>
            <span className="line"><span className="outline">STRENGTH</span></span>
          </h1>

          <p className="hero-sub">
            Premium fitness facilities across Surat. Expert trainers, cutting-edge equipment,
            and <span className="hero-highlight">the first gym to offer an end-to-end member tracking app</span> — workouts, diet, cardio, and progress all in one place.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="btn-primary">
              Start Free Trial <Arrow className="btn-arrow" />
            </a>
            <a href="#services" className="btn-outline">View Plans</a>
          </div>

          <div className="hero-stats">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-num">
                  {s.text ? s.text : <CountUp to={s.to} suffix={s.suffix} delay={1200} />}
                </span>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="reel-frame">
            <video src="/Reel1.mp4" autoPlay muted loop playsInline preload="metadata" />
            <div className="reel-shade" />
            <div className="reel-caption">
              <span className="reel-rec" /> Our Facility
            </div>
          </div>

          <div className="chip chip-heart">
            <div className="chip-head">
              <Heart className="beat" width={16} height={16} />
              <span>Heart Rate</span>
            </div>
            <svg className="ecg" viewBox="0 0 160 40" preserveAspectRatio="none">
              <path d="M0 22 H38 L44 22 L50 8 L57 34 L63 16 L68 22 H96 L102 22 L108 6 L115 36 L121 14 L126 22 H160" />
            </svg>
            <div className="chip-value">142 <small>bpm</small></div>
          </div>

          <div className="chip chip-ring">
            <svg viewBox="0 0 44 44" className="ring">
              <circle cx="22" cy="22" r="18" className="ring-bg" />
              <circle cx="22" cy="22" r="18" className="ring-fg" />
            </svg>
            <div>
              <div className="chip-value">78%</div>
              <div className="chip-label">Daily goal</div>
            </div>
          </div>

          <div className="spin-badge">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="badgeCircle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text>
                <textPath href="#badgeCircle">TRAIN • SWEAT • REPEAT • FITTNATION • </textPath>
              </text>
            </svg>
            <Dumbbell className="spin-badge-icon" width={30} height={30} />
          </div>
        </div>
      </div>

      <a href="#app" className="scroll-cue" aria-label="Scroll down">
        <span className="mouse"><span /></span>
        <span className="scroll-text">Scroll</span>
      </a>
    </section>
  );
}
