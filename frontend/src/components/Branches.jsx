import { useState, useEffect } from 'react';
import './Branches.css';
import Reveal from './Reveal';
import { Pin, Phone, Clock, ArrowUpRight } from './Icons';

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function isOpenNow() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMins = h * 60 + m;
  return totalMins >= 5 * 60 && totalMins < 23 * 60;
}

export default function Branches({ selectedBranch, onBranchSelect }) {
  const [branches, setBranches] = useState([]);
  const [branch, setBranch]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const open = isOpenNow();

  useEffect(() => {
    fetch(`${API}/api/branches`)
      .then(r => r.json())
      .then(data => {
        setBranches(data);
        if (!selectedBranch && data.length) onBranchSelect(data[0].slug);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    setLoading(true);
    setBranch(null);
    fetch(`${API}/api/branches/${selectedBranch}`)
      .then((r) => r.json())
      .then((data) => { setBranch(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedBranch]);

  return (
    <section id="branches" className="branches-section">
      <div className="container">
        <Reveal className="section-head branches-head">
          <div>
            <p className="section-tag">OUR LOCATIONS</p>
            <h2 className="section-title">FIND YOUR <span>BRANCH</span></h2>
          </div>

          <div className="branch-selector" role="tablist">
            {branches.map((b) => (
              <button
                key={b._id}
                role="tab"
                aria-selected={selectedBranch === b.slug}
                className={`branch-tab ${selectedBranch === b.slug ? 'active' : ''}`}
                onClick={() => onBranchSelect(b.slug)}
              >
                {b.name}{b.tag ? <em> — {b.tag}</em> : ''}
              </button>
            ))}
          </div>
        </Reveal>

        {loading && (
          <div className="branch-card branch-skeleton" aria-label="Loading branch info…">
            <div className="sk sk-title" />
            <div className="branch-body">
              <div className="branch-left">
                <div className="sk sk-line" />
                <div className="sk sk-line short" />
                <div className="sk sk-line" />
                <div className="sk sk-chips" />
              </div>
              <div className="sk sk-map" />
            </div>
          </div>
        )}

        {branch && !loading && (
          <div className="branch-card" key={branch.slug || branch.name}>
            <div className="branch-header">
              <div className="branch-title">
                <h3>{branch.name}</h3>
                {branch.tag && <span className="branch-main-tag">{branch.tag}</span>}
              </div>
              <span className={`branch-badge ${open ? 'open' : 'closed'}`}>
                <span className="badge-dot" />
                {open ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <div className="branch-body">
              <div className="branch-left">
                <div className="branch-info">
                  <div className="info-row"><span className="info-icon"><Pin /></span><p>{branch.address}</p></div>
                  <div className="info-row"><span className="info-icon"><Phone /></span><p>{branch.phone}</p></div>
                  <div className="info-row"><span className="info-icon"><Clock /></span><p>{branch.hours}</p></div>
                </div>

                <div className="branch-facilities">
                  <h4>Facilities</h4>
                  <div className="facilities-grid">
                    {(branch.facilities || []).map((f) => (
                      <span key={f} className="facility-tag">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="branch-actions">
                  <a
                    href={branch.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    Get Directions <ArrowUpRight className="btn-arrow" />
                  </a>
                </div>
              </div>

              <div className="branch-map">
                <iframe
                  title={`Map – ${branch.name}`}
                  src={branch.mapUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
