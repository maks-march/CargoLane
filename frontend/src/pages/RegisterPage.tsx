import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { handleRegister, error, isLoading, isSuccess } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister({ login: formData.email, password: formData.password });
  };

  return (
    <div className="auth-page active">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo">
            <div className="logo-icon">C</div>
            CargoLane
          </div>
          
          {isSuccess ? (
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: '#ECFDF5', 
                color: '#10B981', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '32px', 
                margin: '0 auto 24px' 
              }}>
                ✓
              </div>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
                We've sent a confirmation link to <strong>{formData.email}</strong>. 
                Please follow the link to activate your account.
              </p>
              <Link to="/login" className="form-submit" style={{ textDecoration: 'none' }}>
                Go to Sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Join us and start managing your shipments</p>
              
              {error && (
                <div style={{ 
                  color: '#EF4444', 
                  background: '#FEF2F2', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '16px', 
                  fontSize: '14px', 
                  border: '1px solid #EF4444' 
                }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="form-label">
                    <label>Email</label>
                  </div>
                  <input 
                    className="form-input" 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <div className="form-label">
                    <label>Password</label>
                  </div>
                  <input 
                    className="form-input" 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                  />
                </div>
                <button className="form-submit" type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Sign up'}
                </button>
              </form>
              
              <div className="divider">or</div>
              <button className="google-btn">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px'}}/>
                Sign up with Google
              </button>
              
              <p className="auth-footer-text">
                Already have an account? <Link to="/login" className="link">Sign in</Link>
              </p>
            </>
          )}
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
          <div className="growth-badge">Join our network</div>
          <h2 className="auth-right-title">Scale your business <br/><span className="light">globally.</span></h2>
          <p className="auth-right-desc">Access thousands of loads daily and connect with reliable shippers across Europe.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
