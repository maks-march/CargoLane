import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (userId && token) {
      authService.confirmEmail(userId, token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [userId, token]);

  if (!userId || !token) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Invalid confirmation link</h2>
        <button className="btn-figma-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      {status === 'loading' && <h2>Confirming your email...</h2>}
      {status === 'success' && (
        <>
          <h2>Email confirmed successfully!</h2>
          <p>You can now sign in to your account.</p>
          <button className="btn-figma-primary" onClick={() => navigate('/login')}>Sign in</button>
        </>
      )}
      {status === 'error' && (
        <>
          <h2>Confirmation failed</h2>
          <p>The link may be expired or invalid.</p>
          <button className="btn-figma-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </>
      )}
    </div>
  );
};

export default ConfirmEmailPage;
