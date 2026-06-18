import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/auth.store';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';
import type { LoadListVm } from '../../api/types';

interface RouteStop {
  address: string;
  type: 'start' | 'end';
}

interface ApiErrorResponse {
  error?: string;
  details?: string;
  message?: string;
}

interface AuthRegisterData {
  username: string;
  email: string;
  password: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  // ИСПРАВЛЕНО: Безопасное извлечение метода без использования any
  const register = useAuthStore((state) => (state as unknown as { register: (data: AuthRegisterData) => Promise<void> }).register);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [backgroundStops, setBackgroundStops] = useState<RouteStop[]>([
    { address: 'Berlin', type: 'start' },
    { address: 'Munich', type: 'end' }
  ]);

  useEffect(() => {
    const fetchLatestRoute = async () => {
      try {
        const data = await loadsService.getAllLoads();
        if (data && data.length > 0) {
          const latestLoad = data[0] as LoadListVm;
          
          // ИСПРАВЛЕНО: Официальные поля из Сваггера (startCity и endCity)
          if (latestLoad.startCity && latestLoad.endCity) {
            setBackgroundStops([
              { address: latestLoad.startCity.split(',')[0], type: 'start' },
              { address: latestLoad.endCity.split(',')[0], type: 'end' }
            ]);
          }
        }
      } catch {
        console.warn('Backend is down or empty. Using default background route.');
      }
    };
    fetchLatestRoute();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return;

    setLoading(true);
    setError('');

    try {
      await register({ username, email, password });
      navigate('/orders');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0];
          const firstErrorMessage = responseData.errors[firstErrorKey][0];
          setError(`${firstErrorKey}: ${firstErrorMessage}`);
        } else {
          const data = responseData as ApiErrorResponse;
          setError(data.details || data.error || data.message || 'Registration failed.');
        }
      } else {
        setError('Registration failed. Server might be down.');
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