import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page active">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <div className="nav-links">
            <a href="#find-cargo">Find cargo</a>
            <a href="#find-transport">Find transport</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </div>
        </div>
        <div className="nav-right">
          <div className="lang-selector">🌐 EN</div>
          <button className="nav-btn" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Get started →</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <div className="badge">Now live in 27 EU countries</div>
          <h1>The freight exchange <span className="highlight">built for Europe.</span></h1>
          <p className="hero-desc">
            Match cargo to capacity in seconds. Plan multi-stop routes, calculate volumes automatically, and trade with verified carriers — all GDPR-compliant, in 14 languages.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Post a load free →</button>
            <button className="btn-outline" onClick={() => navigate('/register')}>🚛 I'm a carrier</button>
          </div>
          <div className="hero-features">
            <span>No commission</span>
            <span>Verified VAT-IDs</span>
            <span>GDPR-native</span>
          </div>
        </div>
        <div className="hero-right">
          <img src="/src/assets/map.png" alt="Europe Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </section>

      {/* STATS SECTION (Вернул по макету!) */}
      <section className="stats-section" style={{ display: 'flex', justifyContent: 'space-between', padding: '64px 48px', borderTop: '1px solid #E6E8EE', borderBottom: '1px solid #E6E8EE', background: '#FAFAFA' }}>
        <div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#0E1116' }}>184k+</div>
          <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Loads matched monthly</div>
        </div>
        <div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#0E1116' }}>12,000+</div>
          <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Verified EU carriers</div>
        </div>
        <div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#0E1116' }}>€0</div>
          <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Subscription fee</div>
        </div>
        <div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#0E1116' }}>24/7</div>
          <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Multilingual support</div>
        </div>
      </section>

      {/* STEPS SECTION */}
      <section className="steps-section">
        <h2 className="steps-header">How it works</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">01</div>
            <div className="step-title">Post or Search</div>
            <div className="step-desc">Enter route details. Our system auto-calculates LDM, tonnage, and ETA in real-time.</div>
          </div>
          <div className="step-item">
            <div className="step-number">02</div>
            <div className="step-title">Match</div>
            <div className="step-desc">Smart suggestions surface compatible counterparties on your route.</div>
          </div>
          <div className="step-item">
            <div className="step-number">03</div>
            <div className="step-title">Negotiate</div>
            <div className="step-desc">Counter, accept and lock the price in the integrated chat.</div>
          </div>
          <div className="step-item">
            <div className="step-number">04</div>
            <div className="step-title">Track & close</div>
            <div className="step-desc">Status updates, POD upload, and a clean audit trail per shipment.</div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (Вернул по макету!) */}
      <section className="testimonials-section" style={{ padding: '80px 48px', background: '#0E1116', color: 'white' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '48px', textAlign: 'center' }}>Trusted by European Logistics Leaders</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
          <div style={{ background: '#1A1D24', padding: '32px', borderRadius: '16px' }}>
            <p style={{ fontSize: '16px', color: '#A0AAB9', marginBottom: '24px', lineHeight: 1.6 }}>"Cargolane cut our dispatch time by 40%. The auto-calculation for LDM is a lifesaver when dealing with mixed pallets."</p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: '#3D5AFE', borderRadius: '50%' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Markus Weber</div>
                <div style={{ color: '#A0AAB9', fontSize: '14px' }}>Logistics Manager, Berlin</div>
              </div>
            </div>
          </div>
          <div style={{ background: '#1A1D24', padding: '32px', borderRadius: '16px' }}>
            <p style={{ fontSize: '16px', color: '#A0AAB9', marginBottom: '24px', lineHeight: 1.6 }}>"The safest board we've used. Verified VAT-IDs mean we never worry about fake carriers picking up our electronics."</p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: '#059669', borderRadius: '50%' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Elena Rossi</div>
                <div style={{ color: '#A0AAB9', fontSize: '14px' }}>Shipper, Milan</div>
              </div>
            </div>
          </div>
          <div style={{ background: '#1A1D24', padding: '32px', borderRadius: '16px' }}>
            <p style={{ fontSize: '16px', color: '#A0AAB9', marginBottom: '24px', lineHeight: 1.6 }}>"I love that there are no hidden subscription fees. We only pay a tiny fraction when a deal is actually closed."</p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: '#F59E0B', borderRadius: '50%' }}></div>
              <div>
                <div style={{ fontWeight: 600 }}>Jan Kowalski</div>
                <div style={{ color: '#A0AAB9', fontSize: '14px' }}>Fleet Owner, Warsaw</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h2 className="cta-title">Move your first load this week.</h2>
        <p className="cta-desc">Free to post. Free to bid. Pay only when a deal closes — and even then, less than the others.</p>
        <div className="cta-buttons">
          <button className="btn-white" onClick={() => navigate('/register')}>Create free account →</button>
          <button className="btn-dark-outline">Talk to sales</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-left">
          <div className="footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <span className="footer-copy">© 2026 Cargolane EU. All rights reserved.</span>
        </div>
        <div className="footer-right" style={{ display: 'flex', gap: '24px', color: '#5C6470', fontSize: '14px' }}>
          <a href="#terms">Terms of Service</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#status">System Status</a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;