import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/auth.service';
import useAuthStore from '../store/auth.store'; // Исправлен импорт
import type { LoginCommand, RegisterCommand } from '../services/auth.service';

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Получаем функцию login из стора
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogin = async (data: LoginCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      // loginStore сам вызывает authService.login внутри себя
      await loginStore(data);
      navigate('/orders');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { error?: string, message?: string };
        setError(data.error || data.message || 'Failed to login');
      } else {
        setError('Failed to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterCommand) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await authService.register(data);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { Error?: string, message?: string };
        setError(data.Error || data.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutStore();
    navigate('/login');
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    error,
    isLoading,
    isSuccess,
  };
};