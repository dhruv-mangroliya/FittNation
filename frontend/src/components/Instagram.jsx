import './Instagram.css';
import Reveal from './Reveal';
import { InstagramIcon, ArrowUpRight } from './Icons';

const POSTS = [
  { url: 'https://www.instagram.com/fittnation.gym/', thumb: '/Post1.png' },
  { url: 'https://www.instagram.com/fittnation.gym/', thumb: '/Post2.png' },
  { url: 'https://www.instagram.com/fittnation.gym/', thumb: '/Post3.png' },
];

export default function Instagram() {
  return (
    <section id="instagram" className="instagram-section">
      <div className="container ig-layout">
        <Reveal className="ig-intro">
          <p className="section-tag">FOLLOW ALONG</p>
          <h2 className="section-title">WE'RE ON <span>INSTAGRAM</span></h2>
          <p className="section-subtitle">
            Real members. Real results. Follow{' '}
            <a href="https://www.instagram.com/fittnation.gym/" target="_blank" rel="noreferrer">
              @fittnation.gym
            </a>{' '}
            for daily motivation.
          </p>
          <a
            href="https://www.instagram.com/fittnation.gym/"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <InstagramIcon width={18} height={18} /> View All Posts
          </a>
        </Reveal>

        <div className="ig-grid">
          {POSTS.map((post, i) => (
            <Reveal key={i} delay={i * 120} className="ig-reveal">
              <a href={post.url} target="_blank" rel="noreferrer" className="ig-card">
                <img src={post.thumb} alt={`FittNation Instagram post ${i + 1}`} loading="lazy" />
                <div className="ig-overlay">
                  <span className="ig-icon-wrap"><InstagramIcon width={26} height={26} /></span>
                  <span className="ig-open">Open post <ArrowUpRight /></span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
