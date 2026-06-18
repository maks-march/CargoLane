import apiClient from '../api/api-client';

export interface LoginCommand {
  email?: string;
  password?: string;
  login?: string;
}

export interface RegisterCommand {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  login?: string;
}

export interface ConfirmEmailCommand {
  userId: string;
  token: string;
}

export interface RefreshCommand {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordCommand {
  email: string;
  code: string;
  newPassword: string;
}

export interface GoogleAuthCommand {
  token: string;
}

export interface AuthResponse {
  token: string;
  accessToken?: string;
  userId: string;
  role: string;
  username: string;
  userName?: string;
  refreshToken?: string; 
}

interface ApiAuthResult {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  userId: string;
  role?: string;
  userName?: string;
  username?: string;
}

export const authService = {
  async login(data: LoginCommand): Promise<AuthResponse> {
    const payload = {
      login: data.email || data.login,
      password: data.password
    };
    const response = await apiClient.post<ApiAuthResult>('/api/auth/login', payload);
    const result = response.data;
    return {
      token: result.accessToken || result.token || '',
      accessToken: result.accessToken || result.token,
      userId: result.userId,
      role: result.role || 'User',
      username: result.userName || result.username || '',
      refreshToken: result.refreshToken
    };
  },

  async register(data: RegisterCommand): Promise<AuthResponse> {
    const payload = {
      login: data.email || data.login,
      password: data.password,
      username: data.username || data.name || data.email
    };
    const response = await apiClient.post<ApiAuthResult>('/api/auth/register', payload);
    const result = response.data;
    return {
      token: result.accessToken || result.token || '',
      accessToken: result.accessToken || result.token,
      userId: result.userId || '',
      role: result.role || 'User',
      username: result.userName || result.username || '',
      refreshToken: result.refreshToken
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', { userId, currentPassword, newPassword });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(data: ResetPasswordCommand): Promise<void> {
    await apiClient.post('/api/auth/reset-password', data);
  },

  logout(): void {
    localStorage.removeItem('tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  },

  getCurrentUserTokens(): AuthResponse | null {
    const tokensStr = localStorage.getItem('tokens');
    if (tokensStr) {
        try {
            return JSON.parse(tokensStr);
        } catch {
            // ИСПРАВЛЕНО: Комментарий решает проблему "Empty block statement"
            // Игнорируем ошибку парсинга, фоллбек ниже
        }
    }

    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (accessToken && userId) {
      return { 
        token: accessToken, 
        accessToken: accessToken, 
        userId: userId, 
        role: userRole || 'User',
        username: userName || '' 
      };
    }
    return null;
  }
};