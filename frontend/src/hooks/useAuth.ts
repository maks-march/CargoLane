import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import type { LoginCommand, RegisterCommand } from '../api/types';

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogin = async (data: LoginCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      loginStore(response);
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
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
    } catch (err: any) {
      // Correctly handle ErrorResponse based on backend structure
      console.log(err);
      setError(err.response.data.Error || 'Registration failed');
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
