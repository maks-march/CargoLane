// src/services/authService.ts
const API_BASE_URL = 'http://localhost:8080/api';

interface ErrorResponse {
  error: string;
  details: string;
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ErrorResponse = { error: 'Ошибка сервера', details: 'Проверьте подключение к бэкенду' };
  try {
    errorData = await response.json();
  } catch {}
  throw new Error(`${errorData.error}: ${errorData.details}`);
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) await handleApiError(response);
    return await response.json(); 
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) await handleApiError(response);
    return await response.json();
  }
};