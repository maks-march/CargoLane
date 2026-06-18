import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../api/api-client'; // ИСПРАВЛЕНО: Добавлен импорт apiClient

export const ConfirmEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your email...');

    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    useEffect(() => {
        const performConfirmation = async () => {
            if (!userId || !token) {
                setStatus('error');
                setMessage('Invalid confirmation link.');
                return;
            }

            try {
                // ИСПРАВЛЕНО: Прямой вызов apiClient вместо несуществующего метода в authService
                await apiClient.post('/api/auth/confirm-email', { userId, token });
                setStatus('success');
                setMessage('Email confirmed successfully! You can now log in.');
            } catch (err: unknown) {
                setStatus('error');
                if (axios.isAxiosError(err) && err.response?.data) {
                    const data = err.response.data as { message?: string, details?: string, error?: string };
                    setMessage(data.details || data.error || data.message || 'Email confirmation failed.');
                } else {
                    setMessage('Email confirmation failed.');
                }
            }
        };

        performConfirmation();
    }, [userId, token, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-header">
                    <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', justifyContent: 'center' }}>
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
                    <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '12px', borderRadius: '8px', margin: '24px 0', fontSize: '14px', border: '1px solid #EF4444', textAlign: 'left' }}>
                        {message}
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ color: '#10B981', background: '#ECFDF5', padding: '12px', borderRadius: '8px', margin: '24px 0', fontSize: '14px', border: '1px solid #10B981', textAlign: 'left' }}>
                        {message}
                    </div>
                )}

                {status !== 'loading' && (
                    <Link to="/login" className="btn-figma-primary" style={{ display: 'block', padding: '12px', marginTop: '24px', textAlign: 'center', textDecoration: 'none' }}>
                        Go to Sign in
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmailPage;