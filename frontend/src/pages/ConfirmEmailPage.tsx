import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (userId && token) {
      authService.confirmEmail(userId, token)
        .then(() => setStatus('success'))
        .catch((err: any) => {
          setStatus('error');
          setErrorMessage(err.response?.data?.error || err.response?.data?.Error || 'Invalid or expired token');
        });
    } else {
      setStatus('error');
      setErrorMessage('Missing user ID or confirmation token');
    }
  }, [userId, token]);

  return (
    <div className="auth-page active">
      <div className="auth-left">
        <div className="auth-content" style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="logo-icon">C</div>
            CargoLane
          </div>

          <div style={{ padding: '40px 0' }}>
            {status === 'loading' && (
              <>
                <h1 className="auth-title">Confirming email...</h1>
                <p className="auth-subtitle">Please wait while we activate your account.</p>
                <div className="dash-loading-container" style={{ marginTop: '20px' }}>⏳</div>
              </>
            )}

            {status === 'success' && (
              <>
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
                <h1 className="auth-title">Email Verified!</h1>
                <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
                  Your account has been successfully activated. You can now access all features of CargoLane.
                </p>
                <Link to="/login" className="form-submit" style={{ textDecoration: 'none' }}>
                  Sign in to Dashboard
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: '#FEF2F2', 
                  color: '#EF4444', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '32px', 
                  margin: '0 auto 24px' 
                }}>
                  !
                </div>
                <h1 className="auth-title">Verification failed</h1>
                <p className="auth-subtitle" style={{ marginBottom: '32px' }}>
                  {errorMessage}
                </p>
                <Link to="/login" className="btn-figma-secondary" style={{ textDecoration: 'none', width: '100%' }}>
                  Back to Sign in
                </Link>
              </>
            )}
          </div>
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
          <div className="growth-badge">Email confirmation</div>
          <h2 className="auth-right-title">Almost there! <br/><span className="light">Confirm to start.</span></h2>
          <p className="auth-right-desc">Activate your account to join thousands of logistics professionals already using CargoLane.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
