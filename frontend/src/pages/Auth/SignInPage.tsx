// src/pages/Auth/SignInPage.tsx
import React, { useState } from 'react';
import type { PageType } from '../../types';
import { authService } from '../../services/authService';

interface SignInPageProps {
  onNavigate: (page: PageType) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.accessToken);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page active">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo">
            <div className="logo-icon">C</div>
            CargoLane
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Enter your details to sign in to your account</p>
          
          {error && <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #EF4444' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label">
                <label>Email</label>
              </div>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <div className="form-label">
                <label>Password</label>
                <span className="link" onClick={() => onNavigate('recovery')}>Forgot password?</span>
              </div>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="divider">or</div>
          <button className="google-btn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px'}}/>
            Sign in with Google
          </button>
          
          <p className="auth-footer-text">Don't have an account? <span className="link" onClick={() => onNavigate('signup')}>Sign up</span></p>
        </div>
        
        <div className="auth-bottom">
          <span>© 2026 CargoLane</span>
          <span className="lang">English (US)</span>
        </div>
      </div>
      
      <div className="auth-right">
        <img src="/src/assets/hero.png" alt="Truck" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="auth-right-overlay"></div>
        <div className="auth-right-content">
          <div className="growth-badge">New routes available</div>
          <h2 className="auth-right-title">Manage your logistics <br/><span className="light">efficiently.</span></h2>
          <p className="auth-right-desc">Connect with verified carriers, track shipments in real-time, and optimize your supply chain.</p>
        </div>
      </div>
    </div>
  );
};