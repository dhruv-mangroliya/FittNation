import { useState } from 'react';
import './Services.css';
import ContactModal from './ContactModal';
import Reveal from './Reveal';
import { Arrow, Check } from './Icons';

const EXERCISE_VIDEOS = [
  { name: 'Lat Pull Down',      videos: ['https://youtube.com/shorts/bNmvKpJSWKM', 'https://www.youtube.com/shorts/h_II9FcSgZ0'] },
  { name: 'Seated Rows',        videos: ['https://www.youtube.com/shorts/qD1WZ5pSuvk', 'https://www.youtube.com/shorts/yrRHFZ3MDxA'] },
  { name: 'Incline Bench Press',videos: ['https://www.youtube.com/shorts/98HWfiRonkE', 'https://www.youtube.com/shorts/MRmeUet5VUw'] },
  { name: 'Pec Fly',            videos: ['https://www.youtube.com/shorts/a9vQ_hwIksU', 'https://www.youtube.com/shorts/NEXwXAJ3D2A'] },
  { name: 'Leg Extension',      videos: ['https://www.youtube.com/shorts/uM86QE59Tgc', 'https://www.youtube.com/shorts/iQ92TuvBqRo'] },
  { name: 'Leg Curls',          videos: ['https://www.youtube.com/shorts/xdbEG3xGLI8', 'https://www.youtube.com/shorts/_lgE0gPvbik'] },
  { name: 'Barbell Curls',      videos: ['https://www.youtube.com/shorts/54x2WF1_Suc', 'https://www.youtube.com/shorts/MKWBV29S6c0'] },
  { name: 'Pulley Push Down',   videos: ['https://www.youtube.com/shorts/Rc7-euA8FDI', 'https://www.youtube.com/shorts/u36jNfqh8_U'] },
  { name: 'Shoulder Press',     videos: ['https://www.youtube.com/shorts/k6tzKisR3NY', 'https://www.youtube.com/shorts/cOKFf_8z3NM'] },
  { name: 'Lateral Raises',     videos: ['https://www.youtube.com/shorts/Kl3LEzQ5Zqs', 'https://www.youtube.com/shorts/iK22GwXJji0'] },
];

function VideoExplainer() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <div className="ve-wrap">
      <button className="ve-toggle" onClick={() => setOpen(o => !o)}>
        <span className="ve-toggle-icon">{open ? '▲' : '▶'}</span>
        Exercise Video Tutorials
        <span className="ve-badge">{EXERCISE_VIDEOS.length}</span>
      </button>

      {open && (
        <div className="ve-panel">
          <div className="ve-list">
            {EXERCISE_VIDEOS.map((ex, i) => (
              <button
                key={ex.name}
                className={`ve-item${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="ve-num">{String(i + 1).padStart(2, '0')}</span>
                {ex.name}
              </button>
            ))}
          </div>
          <div className="ve-videos">
            {EXERCISE_VIDEOS[active].videos.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="ve-video-btn">
                <span className="ve-play">&#9654;</span>
                Watch Tutorial {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PLANS = [
  {
    name: 'Monthly',
    price: '₹1,000',
    period: '/month',
    tag: null,
    premium: false,
    features: [
      'Access to gym floor',
      'Weight progress tracker',
      'Workout video explanations',
    ],
  },
  {
    name: '6 Months',
    price: '₹2,499',
    period: '/6 months',
    tag: 'Most Popular',
    premium: false,
    features: [
      'Access to gym floor',
      'Weight progress tracker',
      'Workout video explanations',
      'Workout tracker & planner',
      'Daily exercise tracker',
      'Daily cardio tracker',
    ],
  },
  {
    name: 'Annual',
    price: '₹3,999',
    period: '/year',
    tag: 'Best Value',
    premium: true,
    features: [
      'Access to gym floor',
      'Weight progress tracker',
      'Workout video explanations',
      'Workout tracker & planner',
      'Daily exercise tracker',
      'Daily cardio tracker',
      'Nutrition guidance',
    ],
  },
];

function PlanCard({ plan, index, onEnquire }) {
  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const featured = plan.tag === 'Most Popular';

  return (
    <Reveal delay={index * 120} className="plan-reveal">
      <div
        className={`plan-card ${featured ? 'featured' : ''} ${plan.premium ? 'premium' : ''}`}
        onMouseMove={handleMove}
      >
        <div className="plan-spot" />
        {plan.tag && <span className="plan-tag">{plan.tag}</span>}
        <div className="plan-top">
          <span className="plan-index">0{index + 1}</span>
          <h3>{plan.name}</h3>
        </div>
        <div className="plan-price">
          <span className="price">{plan.price}</span>
          <span className="period">{plan.period}</span>
        </div>
        <div className="plan-divider" />
        <ul>
          {plan.features.map((f) => (
            <li key={f}><span className="check"><Check /></span>{f}</li>
          ))}
        </ul>
        <button className={featured ? 'btn-primary plan-btn' : 'btn-outline plan-btn'} onClick={onEnquire}>
          Enquire Now <Arrow className="btn-arrow" />
        </button>
      </div>
    </Reveal>
  );
}

export default function Services() {
  const [modal, setModal] = useState({ open: false, subject: '' });

  return (
    <section id="services" className="services-section">
      <div className="services-glow" aria-hidden="true" />
      <Reveal className="section-head center">
        <p className="section-tag">MEMBERSHIP PLANS</p>
        <h2 className="section-title">CHOOSE YOUR <span>PLAN</span></h2>
        <p className="section-subtitle">Flexible memberships designed to match your fitness goals and budget.</p>
      </Reveal>

      <div className="plans-grid">
        {PLANS.map((plan, i) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            index={i}
            onEnquire={() => setModal({ open: true, subject: plan.name })}
          />
        ))}
      </div>

      <Reveal className="plans-cta">
        <p>Not sure which plan fits you?</p>
        <button className="btn-primary" onClick={() => setModal({ open: true, subject: '' })}>
          Enquire Now <Arrow className="btn-arrow" />
        </button>
      </Reveal>

      <ContactModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, subject: '' })}
        subject={modal.subject}
      />
    </section>
  );
}
