import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/auth.service';

export const ConfirmEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your email...');

    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    useEffect(() => {
        let isMounted = true;
        const performConfirmation = async () => {
            if (!userId || !token) {
                if (isMounted) {
                    setStatus('error');
                    setMessage('Invalid confirmation link.');
                }
                return;
            }

            try {
                await authService.confirmEmail({ userId, token });
                if (isMounted) {
                    setStatus('success');
                    setMessage('Email confirmed successfully! You can now log in.');
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setStatus('error');
                    if (axios.isAxiosError(err) && err.response?.data) {
                        const data = err.response.data as { message?: string, details?: string, error?: string };
                        setMessage(data.details || data.error || data.message || 'Email confirmation failed.');
                    } else {
                        setMessage('Email confirmation failed. Please try again.');
                    }
                }
            }
        };
        performConfirmation();
        return () => { isMounted = false; };
    }, [userId, token]);

    return (
        <div className="auth-page active">
            <div className="auth-left" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', justifyContent: 'center', marginBottom: '24px' }}>
                        <div className="logo-icon">▲</div>
                        CargoLane
                    </div>
                    <h1 className="auth-title">Email Confirmation</h1>
                </div>

                {status === 'loading' && (
                    <div style={{ margin: '24px 0', fontSize: '16px', color: '#4B5563' }}>
                        ⏳ {message}
                    </div>
                )}
                
                {status === 'error' && (
                    <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '12px', borderRadius: '8px', margin: '24px 0', fontSize: '14px', border: '1px solid #EF4444', textAlign: 'center' }}>
                        {message}
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ color: '#10B981', background: '#ECFDF5', padding: '12px', borderRadius: '8px', margin: '24px 0', fontSize: '14px', border: '1px solid #10B981', textAlign: 'center' }}>
                        {message}
                    </div>
                )}

                {status !== 'loading' && (
                    <Link to="/login" className="btn-figma-primary" style={{ display: 'inline-block', padding: '12px 24px', marginTop: '24px', textAlign: 'center', textDecoration: 'none' }}>
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmailPage;