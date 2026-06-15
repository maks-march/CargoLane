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
        // Выносим валидацию внутрь функции, чтобы не вызывать setStatus напрямую в теле useEffect
        const performConfirmation = async () => {
            if (!userId || !token) {
                setStatus('error');
                setMessage('Invalid confirmation link.');
                return;
            }

            try {
                await authService.confirmEmail({ userId, token });
                setStatus('success');
                setMessage('Email confirmed successfully! You can now log in.');
            } catch (err: unknown) {
                setStatus('error');
                // Правильная обработка ошибки Axios без использования 'any'
                if (axios.isAxiosError(err) && err.response?.data) {
                    const data = err.response.data as { message?: string };
                    setMessage(data.message || 'Email confirmation failed.');
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
                        <div className="logo-icon"></div>
                        CargoLane
                    </div>
                    <h1 className="auth-title">Email Confirmation</h1>
                </div>

                <div style={{ margin: '24px 0', fontSize: '16px', color: status === 'error' ? '#DC2626' : (status === 'success' ? '#059669' : '#4B5563') }}>
                    {status === 'loading' && <span>⏳ </span>}
                    {status === 'success' && <span>✅ </span>}
                    {status === 'error' && <span>❌ </span>}
                    {message}
                </div>

                {status !== 'loading' && (
                    <Link to="/login" className="btn-figma-primary" style={{ display: 'block', padding: '12px', marginTop: '24px' }}>
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmailPage;