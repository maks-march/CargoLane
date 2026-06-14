import apiClient from '../api/api-client';

export interface LoginCommand {
  email?: string;
  password?: string;
  login?: string;
}

export interface RegisterCommand {
  username?: string;
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
  refreshToken: string;
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
  refreshToken?: string; // Добавлено для совместимости с api-client
}

// Вспомогательный интерфейс для ответа от бэкенда (чтобы убрать any)
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
    
    // ВНИМАНИЕ: Вернул правильный путь /api/auth/login
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

    // ВАЖНО: api-client.ts ожидает объект 'tokens' в localStorage!
    localStorage.setItem('tokens', JSON.stringify(result));
    
    // Оставляем старые ключи для обратной совместимости других компонентов
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
      email: data.email,
      username: data.username,
      role: data.role
    };
    // ВНИМАНИЕ: Вернул правильный путь /api/auth/register
    const response = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    return response.data;
  },

  async confirmEmail(data: ConfirmEmailCommand): Promise<void> {
    await apiClient.post('/api/auth/confirm-email', data);
  },

  logout(): void {
    localStorage.removeItem('tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  },

  getCurrentUserTokens(): AuthResponse | null {
    // Сначала пытаемся получить из 'tokens' (как ожидает новый api-client)
    const tokensStr = localStorage.getItem('tokens');
    if (tokensStr) {
        try {
            return JSON.parse(tokensStr);
        } catch (e) {}
    }

    // Запасной вариант
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