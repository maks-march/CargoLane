import React, { useState } from 'react';
import type { PageType } from '../../types';
import mapBg from '../../assets/map.png';

interface AuthProps {
  onNavigate: (page: PageType) => void;
}

export const SignInPage: React.FC<AuthProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('elena@nordhafen.de');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending to backend:', { email, password }); 
    onNavigate('dashboard');
  };

  return (
    <div className="auth-page active">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Cargolane workspace.</p>
          
          <button className="google-btn">
             <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.842 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.116-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
             Google
          </button>
          
          <div className="divider">OR</div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label"><label>Work email</label></div>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <div className="form-label">
                <label>Password</label>
                <span className="link" onClick={() => onNavigate('recovery')}>Forgot?</span>
              </div>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="form-submit">Sign in →</button>
          </form>
          
          <p className="auth-footer-text">
            New to Cargolane? <span className="link" onClick={() => onNavigate('signup')}>Create an account</span>
          </p>
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