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
    const responseData = response.data;
    
    const result: AuthResponse = {
      token: responseData.accessToken || responseData.token || '',
      accessToken: responseData.accessToken || responseData.token || '',
      refreshToken: responseData.refreshToken || '',
      userId: responseData.userId,
      role: responseData.role || 'Carrier',
      username: responseData.userName || responseData.username || '',
      userName: responseData.userName || responseData.username || ''
    };

    localStorage.setItem('tokens', JSON.stringify(result));
    
    if (result.token) {
      localStorage.setItem('accessToken', result.token);
      localStorage.setItem('userId', result.userId);
      if (result.username) {
         localStorage.setItem('userName', result.username);
      }
    }
    return result;
  },

  async register(data: RegisterCommand): Promise<AuthResponse> {
    const payload = {
      login: data.email || data.login,
      password: data.password,
      username: data.name || data.username || data.email || 'User'
    };
    // ИСПРАВЛЕНО: Убран any, добавлена строгая типизация ответа
    const response = await apiClient.post<{token?: string; id?: string}>('/api/auth/register', payload);
    return {
      token: response.data.token || '',
      accessToken: response.data.token || '',
      userId: response.data.id || '',
      role: 'Carrier', 
      username: payload.username || ''
    };
  },

  async refresh(data: RefreshCommand): Promise<AuthResponse> {
    const response = await apiClient.post<ApiAuthResult>('/api/auth/refresh', data);
    const responseData = response.data;
    const result: AuthResponse = {
      token: responseData.accessToken || responseData.token || '',
      accessToken: responseData.accessToken || responseData.token || '',
      refreshToken: responseData.refreshToken || '',
      userId: responseData.userId,
      role: responseData.role || 'Carrier',
      username: responseData.userName || responseData.username || '',
      userName: responseData.userName || responseData.username || ''
    };
    localStorage.setItem('tokens', JSON.stringify(result));
    if (result.token) {
      localStorage.setItem('accessToken', result.token);
      localStorage.setItem('userId', result.userId);
      if (result.username) {
         localStorage.setItem('userName', result.username);
      }
    }
    return result;
  },

  async confirmEmail(data: ConfirmEmailCommand): Promise<void> {
    await apiClient.post('/api/auth/confirm-email', data);
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
  },

  getCurrentUserTokens(): AuthResponse | null {
    const tokensStr = localStorage.getItem('tokens');
    if (tokensStr) {
        try {
            return JSON.parse(tokensStr);
        } catch {
            // ИСПРАВЛЕНО: Убрано объявление пустой переменной
        }
    }

    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (accessToken && userId) {
      return { 
        token: accessToken, 
        accessToken: accessToken, 
        userId: userId, 
        role: 'Carrier',
        username: userName || '',
        userName: userName || ''
      };
    }
    return null;
  }
};