import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const RecoveryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Заглушка, потом подключишь бэкенд
    navigate('/login');
  };

  return (
    <div className="auth-page active">
      <div className="auth-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-content">
          <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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
                <span className="resend-link" style={{ color: '#3D5AFE', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Resend</span>
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

          <p className="auth-footer-text" style={{ marginTop: '24px' }}>Remember your password? <Link to="/login" className="link">Sign in</Link></p>
        </div>

        <div className="auth-bottom" style={{ position: 'absolute', bottom: '32px', left: '48px', right: '48px', display: 'flex', justifyContent: 'space-between', color: '#5C6470', fontSize: '14px' }}>
          <span>© 2026 Cargolane</span>
          <span className="lang">EN ▾</span>
        </div>
      </div>
      
      <div className="auth-right">
        {/* Картинка с картой из public/assets */}
        <img src="/src/assets/map.png" alt="Europe map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="auth-right-overlay"></div>
        <div className="auth-right-content">
          <div className="growth-badge">12% week-over-week</div>
          <h2 className="auth-right-title">184,000 loads<br /><span className="light">matched last week.</span></h2>
          <p className="auth-right-desc">From the North Sea to the Aegean — Cargolane keeps Europe's freight moving securely.</p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPage;