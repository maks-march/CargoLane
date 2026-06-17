import apiClient from '../api/api-client';
import type { LoadListVm, LoadDetailsVm, CreateLoadCommand, CreateLoadDraftCommand } from '../api/types';

interface BackendLoadResponse {
  id: string;
  startCity?: string;
  endCity?: string;
  startDate?: string;
  payment?: number;
  totalWeight?: number;
  cargoType?: string;
  vihicleTypes?: string[]; // ОПЕЧАТКА БЭКЕНДА
  vehicleType?: string;
}

interface LoadDetailsBackendResponse {
  id: string;
  payment?: number;
  totalWeight?: number;
  totalVolume?: number;
  cargoType?: string;
  vihicleTypes?: string[]; // ОПЕЧАТКА БЭКЕНДА
  about?: string;
  adr?: number;
  hScode?: string;
  insurance?: number;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payloads?: any[];
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

// СТРОГИЙ МАППИНГ: Переводим любые слова с UI в 5 разрешенных слов бэкенда
const mapPayloadTypeToString = (typeStr: string): string => {
  if (!typeStr) return "Pallets";
  const type = String(typeStr).toLowerCase();
  
  if (type.includes('box')) return "Boxes";
  if (type.includes('container')) return "Containers";
  if (type.includes('refrig') || type.includes('temp')) return "Refrigirated"; // Опечатка бэкенда
  if (type.includes('adr') || type.includes('hazmat')) return "ADR";
  
  return "Pallets"; 
};

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
        recommendedVehicle: item.vihicleTypes?.[0] || item.vehicleType || 'Any',
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
        recommendedVehicle: item.vihicleTypes?.[0] || item.vehicleType || 'Any',
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
        recommendedVehicle: item.vihicleTypes?.[0] || 'Any',
        about: item.about || '',
        adr: item.adr || 0,
        hScode: item.hScode || '',
        insurance: item.insurance || 0,
        status: item.status || 'Active',
        companyName: 'CargoLane Partner',
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
          arrivalTime: rp.arrivalTime || new Date().toISOString(),
          orderIndex: rp.orderIndex || 0
        }))
    };
  },

  getLoadDraft: async (id: string): Promise<unknown> => {
    const response = await apiClient.get(`/api/load/draft/${id}`);
    return response.data;
  },
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createLoad: async (uiData: any): Promise<string> => {
    const vTypes = Array.isArray(uiData.vehicleTypes) 
        ? uiData.vehicleTypes 
        : (uiData.vehicleTypes ? [uiData.vehicleTypes] : (uiData.vehicle ? [uiData.vehicle] : ["Tautliner trailer"]));

    const payload: CreateLoadCommand = {
      payment: uiData.payment || 0,
      insurance: uiData.insurance || 0,
      hScode: uiData.hScode || null,
      adr: uiData.adr || 0,
      vihicleTypes: vTypes, // ОТПРАВЛЯЕМ С ОПЕЧАТКОЙ (КАК ЖДЕТ БЭКЕНД)
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: p.length || 0,
        width: p.width || 0,
        height: p.height || 0,
        weight: p.weight || 0,
        volume: p.volume || 0,
        amount: p.amount || 0,
        type: mapPayloadTypeToString(p.type) 
      })),
      routePoints: uiData.routePoints || []
    };

    const response = await apiClient.post('/api/load', payload);
    return response.data?.id || response.data;
  },
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createLoadDraft: async (uiData: any): Promise<string> => {
    const vTypes = Array.isArray(uiData.vehicleTypes) 
        ? uiData.vehicleTypes 
        : (uiData.vehicleTypes ? [uiData.vehicleTypes] : (uiData.vehicle ? [uiData.vehicle] : ["Tautliner trailer"]));

    const payload: CreateLoadDraftCommand = {
      payment: uiData.payment || 0,
      insurance: uiData.insurance || 0,
      hScode: uiData.hScode || null,
      adr: uiData.adr || 0,
      vihicleTypes: vTypes, // С ОПЕЧАТКОЙ
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: p.length || 0,
        width: p.width || 0,
        height: p.height || 0,
        weight: p.weight || 0,
        volume: p.volume || 0,
        amount: p.amount || 0,
        type: mapPayloadTypeToString(p.type)
      })),
      routePoints: uiData.routePoints || []
    };

    const response = await apiClient.post('/api/load/draft', payload);
    return response.data?.id || response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateLoadDraft: async (id: string, uiData: any): Promise<void> => {
    const vTypes = Array.isArray(uiData.vehicleTypes) 
        ? uiData.vehicleTypes 
        : (uiData.vehicleTypes ? [uiData.vehicleTypes] : (uiData.vehicle ? [uiData.vehicle] : ["Tautliner trailer"]));

    const payload = {
      id: id,
      payment: uiData.payment || 0,
      insurance: uiData.insurance || 0,
      hScode: uiData.hScode || null,
      adr: uiData.adr || 0,
      vihicleTypes: vTypes, // С ОПЕЧАТКОЙ
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: p.length || 0,
        width: p.width || 0,
        height: p.height || 0,
        weight: p.weight || 0,
        volume: p.volume || 0,
        amount: p.amount || 0,
        type: mapPayloadTypeToString(p.type)
      })),
      routePoints: uiData.routePoints || []
    };

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