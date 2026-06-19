import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/auth.store';
import { RoutingMap } from '../../components/UI/RoutingMap';

interface RouteStop {
  address: string;
  type: 'start' | 'end';
}

interface ApiErrorResponse {
  error?: string;
  details?: string;
  message?: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // ИСПРАВЛЕНО: Состояние успешной регистрации

  const [backgroundStops] = useState<RouteStop[]>([
    { address: 'Berlin', type: 'start' },
    { address: 'Munich', type: 'end' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
        setError('Please fill in all required fields.');
        return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ username, email, password });
      // ИСПРАВЛЕНО: Убрали navigate('/orders'). Показываем сообщение об успехе.
      setIsSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data as any;
        
        if (responseData.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0];
          const firstErrorMessage = responseData.errors[firstErrorKey][0];
          setError(firstErrorMessage);
        } else {
          const data = responseData as ApiErrorResponse;
          setError(data.details || data.error || data.message || 'Registration failed.');
        }
      } else {
        setError('Registration failed. Check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '' && username.trim() !== '';

  return (
    <div className="auth-page active">
      <div className="auth-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-content">
          <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>

          {/* ИСПРАВЛЕНО: Если регистрация успешна - показываем красивое уведомление */}
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ color: '#10B981', fontSize: '32px' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginBottom: '12px' }}>Check your email</h2>
              <p style={{ color: '#5C6470', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
                We've sent an activation link to <strong style={{ color: '#0E1116' }}>{email}</strong>.<br />
                Please check your inbox and click the link to activate your account before signing in.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-figma-secondary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 600, border: '1px solid #E6E8EE', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >
                Return to Sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Create an account</h1>
              <p className="auth-subtitle">Join thousands of businesses managing their logistics</p>

              {error && <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #EF4444' }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="form-label"><label>Company / User name</label></div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Cargo Logistics GmbH" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Email address</label></div>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Password</label></div>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Create a strong password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                
                <button 
                  className="form-submit" 
                  type="submit" 
                  disabled={loading || !isFormValid} 
                  style={{ 
                    marginTop: '8px', 
                    opacity: (!isFormValid || loading) ? 0.6 : 1, 
                    cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="auth-footer-text" style={{ marginTop: '24px' }}>
                Already have an account? <Link to="/login" className="link">Sign in</Link>
              </p>
            </>
          )}
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
          <div className="growth-badge">Global Coverage</div>
          <h2 className="auth-right-title">Start shipping <br/><span className="light">worldwide.</span></h2>
          <p className="auth-right-desc">Create your account in seconds and gain access to our extensive transport network.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;