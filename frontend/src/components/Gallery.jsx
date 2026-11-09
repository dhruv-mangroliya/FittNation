import { useEffect, useRef } from 'react';
import './Gallery.css';
import Reveal from './Reveal';
import { Play } from './Icons';

const MEDIA = [
  { type: 'video', url: '/Reel6.mp4', label: 'Women Power' },
  { type: 'video', url: '/Reel2.mp4', label: 'Stay Motivated' },
  { type: 'video', url: '/Reel3.mp4', label: 'Infra & Night Vibes' },
  { type: 'video', url: '/Reel4.mp4', label: 'Competition' },
  { type: 'video', url: '/Reel5.mp4', label: 'Support' },
  { type: 'video', url: '/Reel1.mp4', label: 'Our Facility' },
  { type: 'video', url: '/Reel7.mp4', label: 'Our Muscle Gorillas' },
];

/** Plays only while on screen to save bandwidth and CPU. */
function AutoVideo({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" />;
}

export default function Gallery() {
  return (
    <section id="gallery" className="gallery-section">
      <Reveal className="section-head gallery-head">
        <div>
          <p className="section-tag">LIFE AT FITTNATION</p>
          <h2 className="section-title">OUR <span>COMMUNITY</span></h2>
        </div>
        <p className="section-subtitle">Real people. Real sweat. Real results.</p>
      </Reveal>

      <div className="gallery-grid">
        {MEDIA.map((item, i) => (
          <Reveal key={i} className="gallery-item" delay={(i % 4) * 90}>
            {item.type === 'video' ? (
              <AutoVideo src={item.url} />
            ) : (
              <img src={item.url} alt={item.label} loading="lazy" />
            )}
            <div className="gallery-overlay">
              <span className="g-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="g-label">{item.label}</span>
              <span className="g-play"><Play width={14} height={14} /></span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
