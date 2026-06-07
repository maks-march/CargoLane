import type { LoadData } from '../types';

const API_BASE_URL = 'http://localhost:8080/api'; 

interface ErrorResponse {
  error: string;
  details: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json' 
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ErrorResponse = { error: 'Ошибка API', details: 'Сбой при запросе к серверу' };
  try {
    errorData = await response.json();
  } catch {}
  throw new Error(`${errorData.error}: ${errorData.details}`);
};

export const loadsService = {
  // Получение всех грузов (для главной)
  getAllLoads: async (filters?: { search?: string, from?: string, to?: string, date?: string }): Promise<LoadData[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);
      if (filters?.date) params.append('date', filters.date);

      const response = await fetch(`${API_BASE_URL}/Order?${params.toString()}`, { 
        method: 'GET', 
        headers: getAuthHeaders() 
      });
      
      if (!response.ok) return [];
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.orders || []);
      
      return items.map((order: any) => ({
        id: order.id?.toString() || '',
        company: order.company || 'Unknown',
        from: order.from || '',
        to: order.to || '',
        dateStart: order.dateStart || '',
        cargo: order.cargo || '',
        price: order.price ? `€ ${order.price}` : '',
        match: order.match || 0,
        status: order.status || 'active',
        vehicle: order.vehicle || '',
        // Добавлены обязательные поля для соответствия LoadData
        mass: order.mass?.toString() || '0',
        volume: order.volume?.toString() || '0',
        extraRoute: order.extraRoute || ''
      }));
    } catch {
      return [];
    }
  },

  // Получение ЛИЧНЫХ грузов пользователя
  getUserLoads: async (): Promise<LoadData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order/my`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.orders || []);
      
      return items.map((order: any) => ({
        id: order.id?.toString() || '',
        company: order.company || 'Unknown',
        from: order.from || '',
        to: order.to || '',
        dateStart: order.dateStart || '',
        cargo: order.cargo || '',
        price: order.price ? `€ ${order.price}` : '',
        match: order.match || 0,
        status: order.status || 'active',
        vehicle: order.vehicle || '',
        // Добавлены обязательные поля для соответствия LoadData
        mass: order.mass?.toString() || '0',
        volume: order.volume?.toString() || '0',
        extraRoute: order.extraRoute || ''
      }));
    } catch {
      return [];
    }
  },

  // Получение деталей конкретного груза
  getLoadById: async (id: string): Promise<LoadData | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order/${id}`, { 
        method: 'GET', 
        headers: getAuthHeaders() 
      });
      if (!response.ok) return undefined;
      const order = await response.json();
      
      return {
        id: order.id?.toString() || id,
        company: order.company || 'Unknown',
        from: order.from || '',
        to: order.to || '',
        dateStart: order.dateStart || '',
        cargo: order.cargo || '',
        price: order.price ? `€ ${order.price}` : '',
        match: order.match || 0,
        status: order.status || 'active',
        vehicle: order.vehicle || '',
        mass: order.mass?.toString() || '0',
        volume: order.volume?.toString() || '0',
        extraRoute: order.extraRoute || ''
      };
    } catch { 
      return undefined; 
    }
  },

  getCities: async (query: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Cities?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch { return []; }
  },

  createLoad: async (loadData: any): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(loadData) 
      });
      
      if (!response.ok) await handleApiError(response);
      const data = await response.json();
      return data.toString();
    } catch (error: any) {
      console.error("API Error (createLoad):", error);
      throw error;
    }
  }
};