import { useState } from 'react';
import './Contact.css';
import Reveal from './Reveal';
import { Mail, Phone, Clock, Arrow, Dumbbell } from './Icons';

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-bg-word" aria-hidden="true">NO EXCUSES</div>
      <div className="container contact-grid">
        <Reveal className="contact-info">
          <p className="section-tag">GET IN TOUCH</p>
          <h2 className="section-title">CONTACT <span>US</span></h2>
          <p className="contact-desc">
            Have questions about memberships, training programs, or our facilities?
            We'd love to hear from you.
          </p>
          <div className="contact-details">
            <a className="contact-item" href="mailto:hello@fittnation.in">
              <span className="info-icon"><Mail /></span>
              <div><small>Email</small><p>hello@fittnation.in</p></div>
            </a>
            <a className="contact-item" href="tel:+919876543210">
              <span className="info-icon"><Phone /></span>
              <div><small>Phone</small><p>+91 98765 43210</p></div>
            </a>
            <div className="contact-item">
              <span className="info-icon"><Clock /></span>
              <div><small>Hours</small><p>Mon-Sat: 5:00 AM – 11:00 PM</p></div>
            </div>
          </div>
        </Reveal>

        <Reveal className="contact-quote" delay={150}>
          <div className="cq-rings" aria-hidden="true"><span /><span /><span /></div>
          <Dumbbell className="cq-icon" width={40} height={40} />
          <p className="cq-text">"Still thinking about it? Every day you wait is a day someone else is getting stronger. What's your excuse?"</p>
          <p className="cq-call">You are one call away from changing yourself.</p>
          <button className="btn-primary" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
            Stop Waiting. Start Now <Arrow className="btn-arrow" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
