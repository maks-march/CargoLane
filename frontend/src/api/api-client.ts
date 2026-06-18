import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, RefreshCommand } from './types';

const API_BASE_URL = 'http://localhost:8080'; // Тот самый порт докера

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

const getTokens = () => {
  const tokens = localStorage.getItem('tokens');
  return tokens ? JSON.parse(tokens) as AuthResponse : null;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Обработка 401 (Протух токен)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = getTokens();

      if (tokens?.refreshToken && tokens?.accessToken) {
        try {
          const refreshData: RefreshCommand = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };

          const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/api/auth/refresh`,
            refreshData
          );

          if (response.data) {
            localStorage.setItem('tokens', JSON.stringify(response.data));
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem('tokens');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        localStorage.removeItem('tokens');
        window.location.href = '/login';
      }
    }

    // 2. УМНАЯ ОБРАБОТКА ОШИБОК 400 (Validation) и 500
    if (error.response && error.response.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = error.response.data as any;
      
      let detailedMessage = data.details || data.message || data.title || 'Ошибка сервера';
      
      // Парсинг ASP.NET Core Validation Errors
      if (data.errors && typeof data.errors === 'object') {
        detailedMessage = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join(' | ');
      }
      
      // Перезаписываем стандартное сообщение axios на наше детальное
      error.message = detailedMessage;
    }

    return Promise.reject(error);
  }
);

export default apiClient;