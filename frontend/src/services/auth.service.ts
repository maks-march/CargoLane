import apiClient from '../api/api-client';
import type { AuthResponse, LoginCommand, RegisterCommand } from '../api/types';

export const authService = {
  async login(data: LoginCommand): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data) {
      localStorage.setItem('tokens', JSON.stringify(response.data));
    }
    return response.data;
  },

  async register(data: RegisterCommand): Promise<boolean> {
    const response = await apiClient.post<boolean>('/api/auth/register', data);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  },

  async confirmEmail(userId: string, token: string): Promise<void> {
    await apiClient.get(`/api/auth/confirm`, {
      params: { userId, token },
    });
  },

  getCurrentUserTokens(): AuthResponse | null {
    const tokens = localStorage.getItem('tokens');
    return tokens ? JSON.parse(tokens) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUserTokens()?.accessToken;
  }
};
