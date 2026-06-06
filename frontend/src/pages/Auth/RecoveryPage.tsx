import React from 'react';
import type { PageType } from '../../types';
import mapBg from '../../assets/map.png';

interface RecoveryPageProps {
  onNavigate: (page: PageType) => void;
}

export const RecoveryPage: React.FC<RecoveryPageProps> = ({ onNavigate }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('signin');
  };

  return (
    <div className="auth-page active">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <h1 className="auth-title">Password recovery</h1>
          <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <div className="form-group">
              <div className="form-label"><label>Your email</label></div>
              <input type="email" className="form-input" defaultValue="elena@nordhafen.de" />
            </div>
            <div className="form-group">
              <div className="form-label">
                <label>Code</label>
                <span className="resend-link">Resend</span>
              </div>
              <input type="text" className="form-input" defaultValue="A1B2C3" />
            </div>
            <div className="form-group">
              <div className="form-label"><label>New password</label></div>
              <input type="password" className="form-input" defaultValue="••••••••••" />
            </div>
            <div className="form-group">
              <div className="form-label"><label>Retry new password</label></div>
              <input type="password" className="form-input" defaultValue="••••••••••" />
            </div>
            <button type="submit" className="form-submit">Continue</button>
          </form>
        </div>
        <div className="auth-bottom">
          <span>© 2026 Cargolane</span>
          <span className="lang">EN ▾</span>
        </div>
      </div>
      <div className="auth-right">
        <img src={mapBg} alt="Europe map" />
        <div className="auth-right-overlay"></div>
        <div className="auth-right-content">
          <div className="growth-badge">12% week-over-week</div>
          <h2 className="auth-right-title">184,000 loads<br /><span className="light">matched last week.</span></h2>
          <p className="auth-right-desc">From the North Sea to the Aegean — Cargolane keeps Europe's freight moving without the spreadsheet drama.</p>
        </div>
      </div>
    </div>
  );
};