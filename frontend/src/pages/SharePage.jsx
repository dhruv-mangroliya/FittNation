import { useAuth } from '../context/AuthContext';
import ShareStudio from '../share/ShareStudio';
import './SharePage.css';

/** Public share-card page — open to everyone, no login needed. */
export default function SharePage() {
  const { user } = useAuth();
  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div className="home share-page">
      <header className="sp-nav">
        <a href="/" className="sp-brand" aria-label="FittNation home">
          <img src="/fittnation logo.jpg" alt="FittNation" />
          <span>FITT<em>NATION</em></span>
        </a>
        <div className="sp-nav-actions">
          <a href="/" className="btn-outline">← Home</a>
          {user ? (
            <a href="/fitness-tracker" className="btn-primary">Fitness Tracker</a>
          ) : (
            <a href="/login" className="btn-primary">Member Login</a>
          )}
        </div>
      </header>

      <main className="sp-main">
        <div className="sp-hero">
          <p className="section-tag">FREE FOR EVERYONE</p>
          <h1 className="section-title">CREATE YOUR <span>SHARE CARD</span></h1>
          <p className="section-subtitle">
            Snap a selfie, add your PR and today&apos;s stats, and post a Strava-style story in seconds.
            Tag <strong>@fittnation.gym</strong> to get featured.
          </p>
        </div>

        {/* remount once the logged-in name is known so it can prefill */}
        <ShareStudio key={firstName || 'guest'} defaultName={firstName} />
      </main>
    </div>
  );
}
