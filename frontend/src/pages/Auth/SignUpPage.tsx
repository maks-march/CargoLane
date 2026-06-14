import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/auth.service';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('Carrier'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [backgroundStops, setBackgroundStops] = useState<any[]>([
    { address: 'Berlin', type: 'start' },
    { address: 'Paris', type: 'end' }
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
        console.warn('Using default background route for signup page.');
      }
    };
    fetchLatestRoute();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    setLoading(true);
    setError('');

    try {
      await authService.register({ username, email, password, role });
      navigate('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { error?: string, details?: string, message?: string };
        setError(data.error || data.details || data.message || 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Проверка: заполнены ли все поля
  const isFormValid = username.trim() !== '' && email.trim() !== '' && password.trim() !== '';

  return (
    <div className="auth-page active">
      <div className="auth-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-content">
          <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Get started with CargoLane logistics network today</p>

          {error && (
            <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px', padding: '10px', background: '#FEF2F2', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label"><label>Full Name</label></div>
              <input 
                type="text" 
                className="form-input" 
                placeholder="" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <div className="form-label"><label>Email Address</label></div>
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
                placeholder="••••••••" 
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
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: '24px' }}>
            Already have an account? <Link to="/login" className="link">Sign in</Link>
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

export default SignUpPage;