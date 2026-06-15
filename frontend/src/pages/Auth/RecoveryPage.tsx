import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';
import { authService } from '../../services/auth.service';

export const RecoveryPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [backgroundStops, setBackgroundStops] = useState<any[]>([
    { address: 'Brussels', type: 'start' },
    { address: 'Frankfurt', type: 'end' }
  ]);

  useEffect(() => {
    const fetchLatestRoute = async () => {
      try {
        const data = await loadsService.getAllLoads();
        if (data && data.length > 0) {
          const latestLoad = data[data.length - 1];
          if (latestLoad.from && latestLoad.to) {
            setBackgroundStops([
              { address: latestLoad.from.split(',')[0], type: 'start' },
              { address: latestLoad.to.split(',')[0], type: 'end' }
            ]);
          }
        }
      } catch (err) {
        console.warn('Using default background route for recovery page.');
      }
    };
    fetchLatestRoute();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Логика запроса кода с бэкенда
  const handleSendCode = async () => {
    if (!isEmailValid) return;
    setError('');
    setMessage('');
    
    try {
      await authService.forgotPassword(email);
      setIsCodeSent(true);
      setTimer(60); 
      setMessage('Verification code sent to your email.');
    } catch (err: any) {
      const serverErr = err.response?.data?.details || err.response?.data?.message || 'Failed to send code. User might not exist.';
      setError(serverErr);
    }
  };

  // Логика отправки нового пароля на бэкенд
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.resetPassword({ email, code, newPassword });
      setMessage('Password successfully reset! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const serverErr = err.response?.data?.details || err.response?.data?.message || 'Invalid code or email.';
      setError(serverErr);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && code.trim() !== '' && newPassword.trim() !== '' && confirmPassword.trim() !== '';

  return (
    <div className="auth-page active">
      <div className="auth-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-content">
          <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your email to receive a code and set a new password</p>

          {/* КРАСИВОЕ ОКНО ВЫВОДА ОШИБКИ */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', marginBottom: '24px' }}>
              <span style={{ color: '#DC2626', fontSize: '18px', lineHeight: 1 }}>⚠️</span>
              <div style={{ color: '#991B1B', fontSize: '14px', fontWeight: 500, lineHeight: '1.4' }}>
                {error}
              </div>
            </div>
          )}

          {/* КРАСИВОЕ ОКНО ВЫВОДА УСПЕХА */}
          {message && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', marginBottom: '24px' }}>
              <span style={{ color: '#059669', fontSize: '18px' }}>✅</span>
              <div style={{ color: '#065F46', fontSize: '15px', fontWeight: 500 }}>
                {message}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label"><label>Email address</label></div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', paddingRight: '80px' }} 
                  required 
                />
                {timer > 0 ? (
                  <span style={{ position: 'absolute', right: '16px', color: '#A0AAB9', fontSize: '14px', fontWeight: 600 }}>
                    0:{timer < 10 ? `0${timer}` : timer}
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendCode}
                    disabled={!isEmailValid}
                    style={{ 
                      position: 'absolute', 
                      right: '6px', 
                      background: '#EEF1FF', 
                      color: '#3D5AFE', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      cursor: !isEmailValid ? 'not-allowed' : 'pointer',
                      opacity: !isEmailValid ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {isCodeSent ? 'Resend' : 'Send'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label"><label>Verification Code</label></div>
              <input type="text" className="form-input" placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>

            <div className="form-group">
              <div className="form-label"><label>New Password</label></div>
              <input type="password" className="form-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <div className="form-label"><label>Confirm New Password</label></div>
              <input type="password" className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button 
              className="form-submit" 
              type="submit" 
              disabled={loading || !isFormValid} 
              style={{ marginTop: '8px', opacity: (!isFormValid || loading) ? 0.6 : 1, cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: '24px' }}>
            Remember your password? <Link to="/login" className="link">Back to sign in</Link>
          </p>
        </div>

        <div className="auth-bottom" style={{ position: 'absolute', bottom: '32px', left: '48px', right: '48px', display: 'flex', justifyContent: 'space-between', color: '#5C6470', fontSize: '14px' }}>
          <span>© 2026 CargoLane</span>
          <span className="lang">English (US)</span>
        </div>
      </div>

      <div className="auth-right" style={{ position: 'relative', overflow: 'hidden' }}>
        <RoutingMap stops={backgroundStops} hideFloatingWidget={true} />
        <div className="auth-right-overlay" style={{ pointerEvents: 'none' }}></div>
        <div className="auth-right-content" style={{ zIndex: 10, position: 'absolute' }}>
          <div className="growth-badge">Live Network Map</div>
          <h2 className="auth-right-title">Manage your logistics <br/><span className="light">efficiently.</span></h2>
          <p className="auth-right-desc">Join thousands of carriers and shippers connecting daily across the EU network.</p>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPage;