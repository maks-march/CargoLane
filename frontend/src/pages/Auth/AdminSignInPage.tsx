import React, { useState } from 'react';
import useAuthStore from '../../store/auth.store';

export const AdminSignInPage: React.FC = () => {
  const loginForm = useAuthStore((state) => state.login);

  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    try {
      // ИСПРАВЛЕНО: Передаем loginInput в поле email, так как новый бэкенд ждет email
      await loginForm({ email: loginInput, password: passwordInput });
      window.location.href = '/admin/reviews';
    } catch (err: unknown) {
      setErrorText('Invalid administrator credentials. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#F6F7FB', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: '#0E1116', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>▲</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: '#5C6470', fontSize: '14px' }}>Restricted access area.</p>
        </div>

        {errorText && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5C6470', marginBottom: '6px' }}>Login</label>
            <input 
              type="text" 
              className="figma-input" 
              placeholder="Enter admin login"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              required
              disabled={isSubmitting}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5C6470', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              className="figma-input" 
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              disabled={isSubmitting}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-figma-primary" 
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', fontWeight: 600, marginTop: '8px' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignInPage;