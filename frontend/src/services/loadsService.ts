import apiClient from '../api/api-client';
import type { LoadListVm, LoadDetailsVm, CreateLoadCommand, CreateLoadDraftCommand, PayloadInputDto } from '../api/types';

interface BackendLoadResponse {
  id: string;
  startCity?: string;
  endCity?: string;
  startDate?: string;
  payment?: number;
  totalWeight?: number;
  cargoType?: string;
  vehicleTypes?: string[];
  vehicleType?: string;
}

interface LoadDetailsBackendResponse {
  id: string;
  payment?: number;
  totalWeight?: number;
  totalVolume?: number;
  cargoType?: string;
  vehicleTypes?: string[];
  about?: string;
  adr?: number;
  hScode?: string;
  insurance?: number;
  status?: string;
  payloads?: PayloadInputDto[];
  routePoints?: {
    city: string;
    address: string;
    arrivalTime: string | null;
    orderIndex: number;
  }[];
}

interface LoadSearchFilters {
  from?: string;
  startCity?: string;
  to?: string;
  endCity?: string;
  date?: string;
  fromDate?: string;
  cargoType?: string;
  vehicle?: string;
  vehicleType?: string;
  mass?: string;
  weight?: string;
  volume?: string;
  sortChoices?: number;
  isDescending?: boolean;
}

export const loadsService = {
  getAllLoads: async (params?: LoadSearchFilters): Promise<LoadListVm[]> => {
    try {
      const backendParams = {
        startCity: params?.from || params?.startCity,
        endCity: params?.to || params?.endCity,
        fromDate: params?.date || params?.fromDate,
        cargoType: params?.cargoType,
        vehicleType: params?.vehicle || params?.vehicleType,
        weight: params?.mass || params?.weight,
        volume: params?.volume,
        sortChoices: params?.sortChoices,
        isDescending: params?.isDescending
      };

      const response = await apiClient.get<BackendLoadResponse[]>('/api/load', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        from: item.startCity || 'Unknown',
        to: item.endCity || 'Unknown',
        dateStart: item.startDate || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        cargo: item.cargoType || 'General Cargo', 
        recommendedVehicle: item.vehicleTypes?.[0] || item.vehicleType || 'Any',
        status: 'Active' 
      }));
    } catch {
      return [];
    }
  },
  
  getUserLoads: async (): Promise<LoadListVm[]> => {
    try {
      const response = await apiClient.get<BackendLoadResponse[]>('/api/load/me');
      
      return response.data.map((item) => ({
        id: item.id,
        from: item.startCity || 'Unknown',
        to: item.endCity || 'Unknown',
        dateStart: item.startDate || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        cargo: item.cargoType || 'General Cargo',
        recommendedVehicle: item.vehicleTypes?.[0] || item.vehicleType || 'Any',
        status: 'Active'
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
        from: item.routePoints?.[0]?.city || 'Unknown',
        to: item.routePoints?.[(item.routePoints?.length || 1) - 1]?.city || 'Unknown',
        dateStart: item.routePoints?.[0]?.arrivalTime || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        volume: item.totalVolume || 0,
        cargo: item.cargoType || 'General Cargo',
        recommendedVehicle: item.vehicleTypes?.[0] || 'Any',
        about: item.about || '',
        adr: item.adr || 0,
        hScode: item.hScode || '',
        insurance: item.insurance || 0,
        status: item.status || 'Active',
        companyName: 'CargoLane Partner',
        payloads: item.payloads || [],
        routePoints: (item.routePoints || []).map(rp => ({
          city: rp.city || '',
          address: rp.address || '',
          arrivalTime: rp.arrivalTime || new Date().toISOString(),
          orderIndex: rp.orderIndex || 0
        }))
    };
  },

  getLoadDraft: async (id: string): Promise<unknown> => {
    const response = await apiClient.get(`/api/load/draft/${id}`);
    return response.data;
  },
  
  // Никаких костылей. Передаем ровно то, что пришло из UI
  createLoad: async (data: CreateLoadCommand): Promise<string> => {
    const response = await apiClient.post('/api/load', data);
    return response.data?.id || response.data;
  },
  
  createLoadDraft: async (data: CreateLoadDraftCommand): Promise<string> => {
    const response = await apiClient.post('/api/load/draft', data);
    return response.data?.id || response.data;
  },

  updateLoadDraft: async (id: string, data: CreateLoadDraftCommand): Promise<void> => {
    const payload = { ...data, id }; 
    await apiClient.put(`/api/load/draft/${id}`, payload);
  },
  
  deleteLoad: async (id: string): Promise<void> => {
    await apiClient.put(`/api/load/${id}/close`);
  },

  deleteLoadDraft: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/load/draft/${id}`);
  },

  acceptLoad: async (id: string): Promise<void> => {
    await apiClient.post(`/api/load/${id}/accept`);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCities: async (_query: string): Promise<string[]> => {
    return Promise.resolve([]);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSavedLoads: async (_params?: unknown): Promise<LoadListVm[]> => {
    return [];
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleSaveLoad: async (_id: string, _isCurrentlySaved: boolean): Promise<void> => {
    // do nothing
  }
};