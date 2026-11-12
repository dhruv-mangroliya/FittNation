import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logoImg from '/fittnation logo.jpg';

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export default function Navbar({ onBranchSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const dropdownRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/branches`)
      .then(r => r.json())
      .then(setBranches)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBranch = (id) => {
    onBranchSelect(id);
    setDropdownOpen(false);
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <a href="/" className="logo" aria-label="FittNation home">
        <img src={logoImg} alt="FittNation" className="logo-img" />
        <span className="brand-name">FITT<span>NATION</span></span>
      </a>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <a href="#app" onClick={close}>App</a>
        <a href="#services" onClick={close}>Plans</a>
        <a href="#gallery" onClick={close}>Gallery</a>
        <a href="#instagram" onClick={close}>Instagram</a>

        <div className="dropdown" ref={dropdownRef}>
          <button className="dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen}>
            Branches <span className={`arrow ${dropdownOpen ? 'up' : ''}`}>▾</span>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              {branches.map((b) => (
                <button key={b._id} onClick={() => handleBranch(b.slug)}>
                  {b.name}{b.tag ? ` (${b.tag})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        <a href="#contact" onClick={close}>Contact</a>
        <a href="/share-card" className="nav-share" onClick={close}>Share Card</a>

        <div className="nav-actions">
          {user && (
            <button className="btn-outline" onClick={() => { close(); navigate('/fitness-tracker'); }}>
              Fitness Tracker
            </button>
          )}

          {user?.isAdmin && (
            <button className="btn-outline admin-btn" onClick={() => { close(); navigate('/admin'); }}>
              Admin Panel
            </button>
          )}
          {user ? (
            <button className="btn-primary login-btn" onClick={() => { logout(); close(); }}>
              Logout
            </button>
          ) : (
            <button className="btn-primary login-btn" onClick={() => { close(); navigate('/login'); }}>
              Member Login
            </button>
          )}
        </div>
      </div>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <div className="nav-progress" ref={progressRef} />
    </nav>
  );
}
