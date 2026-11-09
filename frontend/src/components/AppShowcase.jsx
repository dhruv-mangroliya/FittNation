import './AppShowcase.css';
import Reveal from './Reveal';
import { useInView } from '../hooks/useInView';
import { ListCheck, Dumbbell, Activity, Scale, Video, Leaf } from './Icons';

const FEATURES = [
  { icon: ListCheck, title: 'Workout Tracker & Planner', text: "Your plan for the day, ready the moment you walk in." },
  { icon: Dumbbell,  title: 'Daily Exercise Tracker',    text: 'Log every set and rep and watch your strength climb.' },
  { icon: Activity,  title: 'Daily Cardio Tracker',      text: 'Record your cardio sessions and keep your engine running.' },
  { icon: Scale,     title: 'Weight Progress Tracker',   text: 'See your transformation plotted week after week.' },
  { icon: Video,     title: 'Workout Video Explanations',text: 'Learn proper form with tutorials for key exercises.' },
  { icon: Leaf,      title: 'Nutrition Guidance',        text: 'Fuel your training with guidance on what to eat.' },
];

const BARS = [46, 72, 58, 88, 64, 94, 38];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function Dashboard() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} className={`dash ${inView ? 'play' : ''}`}>
      <div className="dash-head">
        <div>
          <span className="dash-kicker">Member Dashboard</span>
          <h4>This Week</h4>
        </div>
        <span className="dash-pill"><span className="dash-dot" /> Live</span>
      </div>

      <div className="dash-bars">
        {BARS.map((h, i) => (
          <div key={i} className="dash-bar-col">
            <div className="dash-bar" style={{ '--h': `${h}%`, '--i': i }} />
            <span>{DAYS[i]}</span>
          </div>
        ))}
      </div>

      <div className="dash-row">
        <div className="dash-card">
          <svg viewBox="0 0 64 64" className="dash-ring">
            <circle cx="32" cy="32" r="26" className="bg" />
            <circle cx="32" cy="32" r="26" className="fg" />
          </svg>
          <div>
            <span className="dash-num">5/6</span>
            <span className="dash-lbl">Workouts</span>
          </div>
        </div>
        <div className="dash-card dash-weight">
          <span className="dash-lbl">Weight Trend</span>
          <svg viewBox="0 0 120 40" className="dash-line" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dashFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#E3271B" stopOpacity="0.35" />
                <stop offset="1" stopColor="#E3271B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="area" d="M0 8 L20 12 L40 11 L60 18 L80 22 L100 27 L120 31 L120 40 L0 40 Z" fill="url(#dashFill)" />
            <path className="stroke" d="M0 8 L20 12 L40 11 L60 18 L80 22 L100 27 L120 31" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function AppShowcase() {
  return (
    <section id="app" className="app-section">
      <div className="app-bg-word" aria-hidden="true">TRACK</div>
      <div className="container app-grid">
        <div>
          <Reveal className="section-head">
            <p className="section-tag">THE FITTNATION APP</p>
            <h2 className="section-title">TRAIN SMARTER.<br /><span>TRACK EVERYTHING.</span></h2>
            <p className="section-subtitle">
              The first gym to offer an end-to-end member tracking app — workouts, diet, cardio,
              and progress all in one place.
            </p>
          </Reveal>

          <div className="feature-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="feature">
                  <div className="feature-icon"><f.icon /></div>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="app-visual" delay={150}>
          <Dashboard />
          <a href="/share-card" className="app-share-cta">
            <span className="app-share-icon" aria-hidden="true">↗</span>
            <span>
              <strong>Create your share card</strong>
              <small>Selfie + PR + stats, ready for your Instagram story. Free for everyone.</small>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
