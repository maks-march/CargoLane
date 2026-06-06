import React from 'react';
import type { PageType } from '../../types';
import { Navbar } from '../../components/Layout/Navbar';
import { Footer } from '../../components/Layout/Footer';
import mapBg from '../../assets/map.png';

interface LandingPageProps {
  onNavigate: (page: PageType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="page active">
      <Navbar onNavigate={onNavigate} />

      <section className="hero">
        <div className="hero-left">
          <div className="badge">Now live in 27 EU countries</div>
          <h1>The freight exchange <span className="highlight">built for Europe.</span></h1>
          <p className="hero-desc">
            Match cargo to capacity in seconds. Plan multi-stop routes, calculate volumes automatically, and trade with verified carriers — all GDPR-compliant, in 14 languages.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-large" onClick={() => onNavigate('signup')}>Post a load free →</button>
            <button className="btn-outline" onClick={() => onNavigate('signup')}>🚛 I'm a carrier</button>
          </div>
          <div className="hero-features">
            <span>No commission</span>
            <span>Verified VAT-IDs</span>
            <span>GDPR-native</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="map-container">
            <img src={mapBg} alt="Europe map" className="map-bg" />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(76,111,247,0.08) 0%, transparent 50%)' }}></div>
            
            <div className="search-card">
              <h3>Quick Search</h3>
              <div className="search-inputs">
                <div className="input-field">
                  <span className="dot"></span>
                  <span>Hamburg, DE</span>
                </div>
                <div className="input-field">
                  <span className="dot green"></span>
                  <span>Warsaw, PL</span>
                </div>
                <div className="search-row">
                  <div className="input-field" style={{ flex: 1 }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>Date<br /><strong style={{ color: '#333' }}>May 12 — 14</strong></span>
                  </div>
                  <div className="input-field" style={{ flex: 1 }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>Cargo<br /><strong style={{ color: '#333' }}>Pallets · 18 t</strong></span>
                  </div>
                </div>
              </div>
              <button className="search-btn" onClick={() => onNavigate('dashboard')}>Search 3,184 loads →</button>
            </div>
            <div className="result-card">
              <div className="result-header">
                <span className="match-badge">Match · 98%</span>
                <span className="price">€1,840</span>
              </div>
              <div className="result-title">FMCG · 22 EUR-pallets</div>
              <div className="result-meta">NORDHAFEN · ★ 4.9 · 312 deals</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <span className="trust-label">Trusted by carriers and shippers across Europe</span>
        <div className="trust-logos">
          <span>DACHSER</span>
          <span>GEODIS</span>
          <span>DSV</span>
          <span>RHENUS</span>
          <span>KUEHNE+NAGEL</span>
          <span>GIRTEKA</span>
        </div>
      </div>

      <section className="stats">
        <div className="stat-item">
          <div className="stat-number">184k</div>
          <div className="stat-label">Loads posted weekly</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">62k</div>
          <div className="stat-label">Active carriers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">€2.1B</div>
          <div className="stat-label">GMV processed in 2025</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">14</div>
          <div className="stat-label">Languages supported</div>
        </div>
      </section>

      <section className="features-section">
        <span className="section-tag">Platform</span>
        <h2 className="section-title">Everything you need to move freight, none of the friction.</h2>
        <p className="section-desc">
          One workspace for posting, finding, negotiating and tracking. Built around how European logistics actually works — not retrofitted for it.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <div className="feature-title">Multi-stop route planner</div>
            <div className="feature-desc">Drag waypoints, set load/unload windows, and the system maps the path with kilometres and ETA.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <div className="feature-title">Volume & weight calculator</div>
            <div className="feature-desc">Input pallet dimensions or carton counts — we compute LDM, m³ and total mass automatically.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <div className="feature-title">GDPR-native by design</div>
            <div className="feature-desc">Data residency in EU, granular consent, right-to-erasure tooling — audit-ready out of the box.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <div className="feature-title">Built-in negotiation</div>
            <div className="feature-desc">Counter-offer, accept and contract without leaving the platform. Threads stay attached to the load.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <div className="feature-title">14-language interface</div>
            <div className="feature-desc">From Polish to Portuguese — your team uses Cargolane in their native language, your partners theirs.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div className="feature-title">Lane analytics</div>
            <div className="feature-desc">See who really moves what, when, and at what price on every corridor. Win bids with data.</div>
          </div>
        </div>
      </section>

      <section className="steps-section">
        <div className="steps-container">
          <h2 className="steps-title">From posted to delivered in four steps.</h2>
          <p className="steps-subtitle">For shippers and carriers — same flow, different side of the trade.</p>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-title">Post or browse</div>
              <div className="step-desc">Publish a load or filter the live board by lane, date, type.</div>
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
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Move your first load this week.</h2>
        <p className="cta-desc">Free to post. Free to bid. Pay only when a deal closes — and even then, less than the others.</p>
        <div className="cta-buttons">
          <button className="btn-white" onClick={() => onNavigate('signup')}>Create free account →</button>
          <button className="btn-dark-outline">Talk to sales</button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};