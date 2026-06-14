import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/auth.service';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'Carrier' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        role: formData.role,
        login: formData.email
      });
      navigate('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { Error?: string, message?: string };
        setError(data.Error || data.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page active">
      <div className="auth-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="auth-content">
          <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join us and start managing your shipments</p>

          {error && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px', padding: '10px', background: '#FEF2F2', borderRadius: '8px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label"><label>Company Name</label></div>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Nordhafen GmbH" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <div className="form-label"><label>Email address</label></div>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@company.com" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <div className="form-label"><label>Password</label></div>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Sign up'}
            </button>
          </form>

          <div className="divider">or</div>
          <button className="google-btn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{width: '20px'}}/>
            Sign up with Google
          </button>

          <p className="auth-footer-text">Already have an account? <Link to="/login" className="link">Sign in</Link></p>
        </div>

        <div className="auth-bottom" style={{ position: 'absolute', bottom: '32px', left: '48px', right: '48px', display: 'flex', justifyContent: 'space-between', color: '#5C6470', fontSize: '14px' }}>
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
          <p className="auth-right-desc">Connect with verified partners, get paid faster, and manage your fleet from one dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;