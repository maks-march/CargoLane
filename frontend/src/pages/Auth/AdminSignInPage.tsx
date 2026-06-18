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
      // Делаем РЕАЛЬНЫЙ запрос к бэкенду. 
      // Бэкендер уже создал админа в базе данных через миграции.
      await loginForm({ login: loginInput, password: passwordInput });
      
      // Жесткий редирект для полного обновления приложения с новыми реальными токенами
      window.location.href = '/admin/reviews';
    } catch {
      // ИСПРАВЛЕНО: Убран неиспользуемый (err: unknown), теперь просто catch
      setErrorText('Invalid administrator credentials. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#F6F7FB', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', width: '100%', maxWidth: '400px', border: '1px solid #E6E8EE' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', justifyContent: 'center', color: '#0E1116' }}>
          <div style={{ color: '#3D5AFE', fontSize: '24px' }}>▲</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>CargoLane Admin</h2>
        </div>

        {errorText && (
          <div style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', fontWeight: 500, textAlign: 'center' }}>
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
            {isSubmitting ? 'Authenticating...' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignInPage;