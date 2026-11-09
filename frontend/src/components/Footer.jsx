import './Footer.css';
import logoImg from '/fittnation logo.jpg';
import { InstagramIcon, ArrowUpRight } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={logoImg} alt="FittNation" className="footer-logo" />
            <p className="footer-quote">"Self-belief and hard work will always earn you success."</p>
            <p className="footer-quote-author">— Virat Kohli</p>
            <p className="footer-desc">Forging champions since 2018. Premium fitness across Surat.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#instagram">Instagram</a>
            <a href="#branches">Branches</a>
            <a href="#contact">Contact</a>
            <a href="/share-card">Share Card</a>
          </div>
          <div className="footer-links">
            <h4>Branches</h4>
            <span>Mota Varachha</span>
            <span>Dharam Nagar</span>
            <span>Katargam</span>
          </div>
          <div className="footer-links">
            <h4>Follow Us</h4>
            <a href="https://www.instagram.com/fittnation.gym/" target="_blank" rel="noreferrer" aria-label="Instagram" className="footer-social">
              <InstagramIcon width={18} height={18} /> Instagram <ArrowUpRight width={14} height={14} />
            </a>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">FITTNATION</div>

        <div className="footer-bottom">
          <p>© 2025 FittNation. All rights reserved.</p>
          <a href="#hero" className="back-top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
