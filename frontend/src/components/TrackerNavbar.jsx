import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '/fittnation logo.jpg';
import './TrackerNavbar.css';

export default function TrackerNavbar({ activeTab, onTabChange, tabs }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <nav className={`tnav ${menuOpen ? 'menu-open' : ''}`}>
      <div className="tnav-left">
        <a href="/" className="tnav-logo" aria-label="FittNation home">
          <img src={logoImg} alt="FittNation" className="tnav-logo-img" />
        </a>
        <div className="tnav-brand">
          <span className="tnav-brand-name">FITT<span>NATION</span></span>
          <em>Tracker</em>
        </div>
      </div>

      <div className={`tnav-tabs ${menuOpen ? 'open' : ''}`}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`tnav-tab${activeTab === key ? ' active' : ''}`}
            onClick={() => { onTabChange(key); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {label}
          </button>
        ))}
        <div className="tnav-mobile-actions">
          <button className="btn-outline tnav-home-btn" onClick={() => navigate('/')}>Home</button>
          <button className="btn-primary tnav-logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="tnav-right">
        <div className="tnav-user" title={user?.name}>
          <span className="tnav-avatar">{initial}</span>
          <span className="tnav-user-name">{user?.name}</span>
        </div>
        <button className="btn-outline tnav-home-btn" onClick={() => navigate('/')}>Home</button>
        <button className="btn-primary tnav-logout-btn" onClick={logout}>Logout</button>
      </div>

      <button
        className={`tnav-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
