import { useEffect } from 'react';
import './ContactModal.css';
import { Close, Mail, Phone, Pin } from './Icons';

const LOCATIONS = [
  { name: 'Mota Varachha (Main)', address: 'Om Arcade, Aminapark Society, 17/18/19, next to Amideep Honda, Mota Varachha, Surat, Gujarat 394101' },
  { name: 'Dharam Nagar',         address: '1 Floor, Sardavihar Soc, Sho 2-3, AK Rd, opp. Dharamjivan School, near Dharamnagr, Chkdi, Surat, Gujarat 395008' },
  { name: 'Katargam',             address: 'Gate no.1, Fitt nation gym, 1st floor, beside matrubhumi vidyalaya, Dabholi Char Rasta, Navjivan Society, Katargam, Surat, Gujarat 395004' },
];

export default function ContactModal({ isOpen, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="enq-modal" role="dialog" aria-modal="true" aria-labelledby="enquire-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Close width={18} height={18} /></button>

        <p className="section-tag">GET IN TOUCH</p>
        <h2 className="modal-title" id="enquire-title">ENQUIRE <span>NOW</span></h2>
        <p className="modal-sub">Reach out to us directly — we'd love to help.</p>

        <div className="modal-contact-info">
          <a href="mailto:hello@fittnation.in" className="modal-info-row">
            <span className="info-icon"><Mail /></span>
            <p>hello@fittnation.in</p>
          </a>
          <a href="tel:+919876543210" className="modal-info-row">
            <span className="info-icon"><Phone /></span>
            <p>+91 98765 43210</p>
          </a>
        </div>

        <div className="modal-divider" />

        <p className="modal-locations-label">OUR LOCATIONS</p>
        <div className="modal-locations">
          {LOCATIONS.map((l) => (
            <div key={l.name} className="modal-location-row">
              <span className="loc-pin"><Pin width={16} height={16} /></span>
              <div>
                <strong>{l.name}</strong>
                <p>{l.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
