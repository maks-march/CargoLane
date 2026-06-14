import apiClient from '../api/api-client';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface RoutePointInputDto {
  city: string;
  address: string;
  arrivalTime: string | null;
  orderIndex: number;
}

export interface PayloadInputDto {
  length: number;
  width: number;
  height: number;
  weight: number;
  volume: number;
  amount: number;
  type: string;
}

export interface CreateLoadCommand {
  userId: string;
  startDate: string;
  payment: number;
  insurance: number;
  hScode: string | null;
  adr: number;
  suitableCargos: string[] | null;
  about: string;
  payloads: PayloadInputDto[];
  routePoints: RoutePointInputDto[];
}

export interface CreateLoadDraftCommand extends Partial<CreateLoadCommand> {}

export interface LoadListVm {
  id: string;
  from: string;
  to: string;
  dateStart: string;
  price: number;
  cargo: string;
  weight: number;
  recommendedVehicle: string;
  status: string;
}

export interface LoadDetailsVm {
  id: string;
  from: string;
  to: string;
  dateStart: string;
  price: number;
  cargo: string;
  weight: number;
  volume: number;
  recommendedVehicle: string;
  about: string;
  adr: number;
  hScode: string;
  insurance: number;
  status: string;
  companyName: string;
  payloads: PayloadInputDto[];
  routePoints: RoutePointInputDto[];
}

// ==========================================
// API SERVICE
// ==========================================

export const loadsService = {
  /**
   * Получение списка всех грузов (Marketplace)
   */
  getAllLoads: async (params?: any): Promise<LoadListVm[]> => {
    try {
      const response = await apiClient.get('/Load', { params });
      return response.data;
    } catch {
      return [];
    }
  },
  
  /**
   * Получение грузов текущего пользователя (My Listings)
   */
  getUserLoads: async (): Promise<LoadListVm[]> => {
    try {
      const response = await apiClient.get('/Load/user');
      return response.data;
    } catch {
      return [];
    }
  },
  
  /**
   * Получение деталей конкретного опубликованного груза
   */
  getLoadById: async (id: string): Promise<LoadDetailsVm> => {
    const response = await apiClient.get(`/Load/${id}`);
    return response.data;
  },

  /**
   * Получение деталей конкретного черновика груза
   */
  getLoadDraft: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/Load/draft/${id}`);
    return response.data;
  },
  
  /**
   * Создание нового груза (публикация на доску)
   */
  createLoad: async (data: CreateLoadCommand): Promise<string> => {
    const response = await apiClient.post('/Load', data);
    return response.data;
  },
  
  /**
   * Создание черновика груза (сохранение без публикации)
   */
  createLoadDraft: async (data: CreateLoadDraftCommand): Promise<string> => {
    const response = await apiClient.post('/Load/draft', data);
    return response.data;
  },

  /**
   * Обновление существующего черновика груза
   */
  updateLoadDraft: async (id: string, data: CreateLoadDraftCommand): Promise<void> => {
    const response = await apiClient.put(`/Load/draft/${id}`, data);
    return response.data;
  },
  
  /**
   * Удаление опубликованного груза
   */
  deleteLoad: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/Load/${id}`);
    return response.data;
  },

  /**
   * Удаление черновика груза
   */
  deleteLoadDraft: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/Load/draft/${id}`);
    return response.data;
  },

  /**
   * === ДОБАВЛЕНО: Для предотвращения краша компонента FilterBar ===
   */
  getCities: async (query: string): Promise<string[]> => {
    try {
      const response = await apiClient.get('/Cities', { params: { query } });
      return response.data;
    } catch {
      return [];
    }
  }
};