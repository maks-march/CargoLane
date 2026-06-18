import apiClient from '../api/api-client';
import type { LoadListVm, LoadDetailsVm, CreateLoadCommand, CreateLoadDraftCommand } from '../api/types';

interface BackendLoadResponse {
  id: string;
  article?: string | number;
  startCity?: string;
  endCity?: string;
  startDate?: string;
  payment?: number;
  totalWeight?: number;
  cargoType?: string;
  vehicleTypes?: string[]; 
  vihicleTypes?: string[]; 
  vehicleType?: string;
  status?: string;
  created?: string;
  shipper?: string | null;
  payloadCount?: number;
}

interface LoadDetailsBackendResponse {
  id: string;
  userId?: string; 
  article?: string | number;
  payment?: number;
  totalWeight?: number;
  totalVolume?: number;
  cargoType?: string;
  vehicleTypes?: string[]; 
  vihicleTypes?: string[];
  about?: string;
  adr?: number;
  hScode?: string;
  insurance?: number;
  status?: string;
  distance?: number | null; 
  duration?: string | null; 
  isSaved?: boolean; 
  rejectReason?: string | null;
  shipper?: string | null;
  created?: string;
  payloads?: Array<{
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    volume?: number;
    amount?: number;
    type?: string;
  }>;
  routePoints?: Array<{
    city: string;
    address: string;
    arrivalTime: string | null;
    orderIndex: number;
  }>;
}

// ИСПРАВЛЕНО: Безопасная функция конвертации article в число
const parseArticle = (article?: string | number): number | undefined => {
  if (article === undefined || article === null) return undefined;
  const num = Number(article);
  return isNaN(num) ? undefined : num;
};

export const loadsService = {
  getAllLoads: async (params?: Record<string, string | number | boolean>): Promise<LoadListVm[]> => {
    try {
      const backendParams: Record<string, string | number | boolean> = {};
      if (params?.searchBy || params?.query) backendParams.SearchBy = params.searchBy || params.query;
      if (params?.startCity || params?.from) backendParams.StartCity = params.startCity || params.from;
      if (params?.endCity || params?.to) backendParams.EndCity = params.endCity || params.to;
      if (params?.cargoType) backendParams.CargoType = params.cargoType;
      
      const response = await apiClient.get<BackendLoadResponse[]>('/api/load', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        article: parseArticle(item.article),
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        cargoType: item.cargoType || 'General Cargo',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || (item.vehicleType ? [item.vehicleType] : ['Any']),
        status: item.status || 'Active',
        created: item.created || new Date().toISOString(),
        shipper: item.shipper || 'Unknown Company',
        payloadCount: item.payloadCount || 0
      }));
    } catch {
      return [];
    }
  },

  getMyLoads: async (status?: string): Promise<LoadListVm[]> => {
    try {
      const response = await apiClient.get<BackendLoadResponse[]>('/api/load/me', {
        params: status ? { status } : {}
      });
      return response.data.map((item) => ({
        id: item.id,
        article: parseArticle(item.article),
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        cargoType: item.cargoType || 'General Cargo',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || (item.vehicleType ? [item.vehicleType] : ['Any']),
        status: item.status || 'Active',
        created: item.created || new Date().toISOString(),
        shipper: item.shipper || 'Unknown Company',
        payloadCount: item.payloadCount || 0
      }));
    } catch {
      return [];
    }
  },

  getSavedLoads: async (params?: Record<string, string | number | boolean>): Promise<LoadListVm[]> => {
    try {
      const backendParams: Record<string, string | number | boolean> = {};
      if (params?.searchBy || params?.query) backendParams.SearchBy = params.searchBy || params.query;
      if (params?.startCity || params?.from) backendParams.StartCity = params.startCity || params.from;
      if (params?.endCity || params?.to) backendParams.EndCity = params.endCity || params.to;
      if (params?.cargoType) backendParams.CargoType = params.cargoType;
      
      const response = await apiClient.get<BackendLoadResponse[]>('/api/load/user/saved', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        article: parseArticle(item.article),
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        cargoType: item.cargoType || 'General Cargo',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || (item.vehicleType ? [item.vehicleType] : ['Any']),
        status: item.status || 'Active',
        created: item.created || new Date().toISOString(),
        shipper: item.shipper || 'Unknown Company',
        payloadCount: item.payloadCount || 0
      }));
    } catch {
      return [];
    }
  },

  getLoadById: async (id: string): Promise<LoadDetailsVm> => {
    const response = await apiClient.get<LoadDetailsBackendResponse>(`/api/load/${id}`);
    const item = response.data;
    
    return {
      id: item.id,
      userId: item.userId || 'system',
      article: parseArticle(item.article),
      payment: item.payment || 0,
      totalWeight: item.totalWeight || 0,
      totalVolume: item.totalVolume || 0,
      cargoType: item.cargoType || 'General Cargo',
      vehicleTypes: item.vehicleTypes || item.vihicleTypes || ['Any'],
      about: item.about || '',
      adr: item.adr || 0,
      hScode: item.hScode || '',
      insurance: item.insurance || 0,
      status: item.status || 'Active',
      shipper: item.shipper || 'Unknown Company',
      distance: item.distance || 0,
      duration: item.duration || "00:00:00",
      rejectReason: item.rejectReason || null,
      created: item.created || new Date().toISOString(),
      payloads: (item.payloads || []).map(p => ({
        length: p.length || 0,
        width: p.width || 0,
        height: p.height || 0,
        weight: p.weight || 0,
        volume: p.volume || 0,
        amount: p.amount || 0,
        type: String(p.type || "Pallets") 
      })),
      routePoints: (item.routePoints || []).map(rp => ({
        city: rp.city || '',
        address: rp.address || '',
        arrivalTime: rp.arrivalTime || null,
        orderIndex: rp.orderIndex || 0
      }))
    };
  },

  createLoad: async (data: CreateLoadCommand): Promise<string> => {
    const response = await apiClient.post<string>('/api/load', data);
    return response.data;
  },

  toggleSaveLoad: async (id: string): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`/api/load/${id}/save`);
    return response.data;
  },

  bookLoad: async (id: string): Promise<string> => {
    const response = await apiClient.post<string>(`/api/load/${id}/book`);
    return response.data;
  },

  deleteLoad: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/load/${id}`);
  },

  // --- МЕТОДЫ ДЛЯ ЧЕРНОВИКОВ ---
  createDraft: async (data: CreateLoadDraftCommand): Promise<string> => {
    const response = await apiClient.post<string>('/api/load/draft', data);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMyDrafts: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/load/draft/me');
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDraftById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/api/load/draft/${id}`);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDraft: async (id: string, data: any): Promise<string> => {
    const response = await apiClient.put<string>(`/api/load/draft/${id}`, data);
    return response.data;
  },

  deleteDraft: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/load/draft/${id}`);
  }
};