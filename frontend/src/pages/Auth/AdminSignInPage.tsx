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
      // ИСПРАВЛЕНО: Делаем РЕАЛЬНЫЙ запрос к бэкенду. 
      // Бэкендер уже создал админа в базе данных через миграции.
      await loginForm({ login: loginInput, password: passwordInput });
      
      // Жесткий редирект для полного обновления приложения с новыми реальными токенами
      window.location.href = '/admin/reviews';
    } catch (err: unknown) {
      setErrorText('Invalid administrator credentials. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#F6F7FB', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div className="auth-card" style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #E6E8EE', width: '100%', maxWidth: '440px', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#0E1116', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Control Panel</h2>
          <p style={{ fontSize: '14px', color: '#5C6470', margin: 0 }}>Sign in as Platform Administrator</p>
        </div>

        {errorText && (
          <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #EF4444' }}>
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
            {isSubmitting ? 'Signing in...' : 'Sign In as Admin ›'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminSignInPage;