import apiClient from '../api/api-client';
import type { LoadListVm, LoadDetailsVm, CreateLoadCommand, CreateLoadDraftCommand } from '../api/types';

interface BackendLoadResponse {
  id: string;
  article?: string;
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
}

interface LoadDetailsBackendResponse {
  id: string;
  userId?: string; 
  article?: string;
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
  query?: string;
  searchBy?: string; 
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
  status?: string;
}

const mapPayloadTypeToString = (typeStr: string): string => {
  if (!typeStr) return "Pallets";
  const type = String(typeStr).toLowerCase();
  
  if (type.includes('box')) return "Boxes";
  if (type.includes('container')) return "Containers";
  if (type.includes('refrig') || type.includes('temp')) return "Refrigerated"; 
  if (type.includes('adr') || type.includes('hazmat')) return "ADR";
  
  return "Pallets"; 
};

export const loadsService = {
  getAllLoads: async (params?: LoadSearchFilters): Promise<LoadListVm[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendParams: Record<string, any> = {};
      
      if (params?.searchBy || params?.query) backendParams.SearchBy = params.searchBy || params.query;
      
      if (params?.startCity || params?.from) backendParams.StartCity = params.startCity || params.from;
      if (params?.endCity || params?.to) backendParams.EndCity = params.endCity || params.to;
      if (params?.fromDate || params?.date) backendParams.FromDate = params.fromDate || params.date;
      if (params?.cargoType) backendParams.CargoType = params.cargoType;
      if (params?.vehicleType || params?.vehicle) backendParams.VehicleType = params.vehicleType || params.vehicle;
      if (params?.weight || params?.mass) backendParams.Weight = Number(params.weight || params.mass);
      if (params?.volume) backendParams.Volume = Number(params.volume);
      if (params?.sortChoices !== undefined) backendParams.SortBy = params.sortChoices;
      
      backendParams.Status = params?.status || 'Active';

      const response = await apiClient.get<BackendLoadResponse[]>('/api/load', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        article: item.article || item.id.substring(0, 8).toUpperCase(), 
        from: item.startCity || 'Unknown',
        to: item.endCity || 'Unknown',
        dateStart: item.startDate || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        cargo: item.cargoType || 'General Cargo', 
        recommendedVehicle: item.vehicleTypes?.[0] || item.vihicleTypes?.[0] || item.vehicleType || 'Any',
        status: item.status || 'Active' 
      }));
    } catch {
      return [];
    }
  },
  
  getUserLoads: async (params?: LoadSearchFilters): Promise<LoadListVm[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendParams: Record<string, any> = {};
      if (params?.startCity) backendParams.StartCity = params.startCity;
      if (params?.endCity) backendParams.EndCity = params.endCity;
      if (params?.cargoType) backendParams.CargoType = params.cargoType;
      if (params?.status) backendParams.Status = params.status;

      const response = await apiClient.get<BackendLoadResponse[]>('/api/load/me', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        article: item.article || item.id.substring(0, 8).toUpperCase(),
        from: item.startCity || 'Unknown',
        to: item.endCity || 'Unknown',
        dateStart: item.startDate || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        cargo: item.cargoType || 'General Cargo',
        recommendedVehicle: item.vehicleTypes?.[0] || item.vihicleTypes?.[0] || item.vehicleType || 'Any',
        status: item.status || 'Active'
      }));
    } catch {
      return [];
    }
  },

  getUserDrafts: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/load/draft/me');
      return response.data || [];
    } catch {
      return [];
    }
  },
  
  getLoadById: async (id: string): Promise<LoadDetailsVm> => {
    const response = await apiClient.get<LoadDetailsBackendResponse>(`/api/load/${id}`);
    const item = response.data;
    
    return {
        id: item.id,
        userId: item.userId || 'system_id', 
        article: item.article || item.id.substring(0, 8).toUpperCase(),
        isSaved: item.isSaved || false, 
        from: item.routePoints?.[0]?.city || 'Unknown',
        to: item.routePoints?.[(item.routePoints?.length || 1) - 1]?.city || 'Unknown',
        dateStart: item.routePoints?.[0]?.arrivalTime || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        volume: item.totalVolume || 0,
        cargo: item.cargoType || 'General Cargo',
        recommendedVehicle: item.vehicleTypes?.[0] || item.vihicleTypes?.[0] || 'Any',
        about: item.about || '',
        adr: item.adr || 0,
        hScode: item.hScode || '',
        insurance: item.insurance || 0,
        status: item.status || 'Active',
        companyName: 'CargoLane Partner',
        distance: item.distance || 0,
        duration: item.duration || "00:00:00",
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
    let vTypes = Array.isArray(uiData.vehicleTypes) ? uiData.vehicleTypes : [];
    if (vTypes.length === 0) {
      vTypes = ["Tautliner trailer"];
    }

    const storedUserId = localStorage.getItem('userId') || undefined;
    const defaultDate = new Date().toISOString();
    
    const safeDistance = Number(uiData.distance) > 0 ? Number(uiData.distance) : 1;

    const payload: CreateLoadCommand = {
      userId: storedUserId,
      startDate: uiData.routePoints?.[0]?.arrivalTime || defaultDate,
      payment: Number(uiData.payment) || 0,
      insurance: Number(uiData.insurance) || 0,
      hScode: uiData.hScode || null,
      adr: Number(uiData.adr) || 0,
      vehicleTypes: vTypes, 
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      distance: safeDistance, 
      duration: uiData.duration || "00:00:00",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: Number(p.length) > 0 ? Number(p.length) : 0.1,
        width: Number(p.width) > 0 ? Number(p.width) : 0.1,
        height: Number(p.height) > 0 ? Number(p.height) : 0.1,
        weight: Number(p.weight) > 0 ? Number(p.weight) : 1,
        volume: Number(p.volume) > 0 ? Number(p.volume) : 0.1,
        amount: Number(p.amount) > 0 ? Number(p.amount) : 1,
        type: mapPayloadTypeToString(p.type) 
      })),
      routePoints: uiData.routePoints || []
    };

    const response = await apiClient.post('/api/load', payload);
    return response.data?.id || response.data;
  },
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createLoadDraft: async (uiData: any): Promise<string> => {
    let vTypes = Array.isArray(uiData.vehicleTypes) ? uiData.vehicleTypes : [];
    if (vTypes.length === 0) {
      vTypes = ["Tautliner trailer"];
    }

    const storedUserId = localStorage.getItem('userId') || undefined;

    const payload: CreateLoadDraftCommand = {
      userId: storedUserId,
      payment: Number(uiData.payment) || 0,
      insurance: Number(uiData.insurance) || 0,
      hScode: uiData.hScode || null,
      adr: Number(uiData.adr) || 0,
      vehicleTypes: vTypes, 
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: Number(p.length) > 0 ? Number(p.length) : 0.1,
        width: Number(p.width) > 0 ? Number(p.width) : 0.1,
        height: Number(p.height) > 0 ? Number(p.height) : 0.1,
        weight: Number(p.weight) > 0 ? Number(p.weight) : 1,
        volume: Number(p.volume) > 0 ? Number(p.volume) : 0.1,
        amount: Number(p.amount) > 0 ? Number(p.amount) : 1,
        type: mapPayloadTypeToString(p.type)
      })),
      routePoints: uiData.routePoints || []
    };

    const response = await apiClient.post('/api/load/draft', payload);
    return response.data?.id || response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateLoadDraft: async (id: string, uiData: any): Promise<void> => {
    let vTypes = Array.isArray(uiData.vehicleTypes) ? uiData.vehicleTypes : [];
    if (vTypes.length === 0) {
      vTypes = ["Tautliner trailer"];
    }

    const storedUserId = localStorage.getItem('userId') || undefined;

    const payload = {
      id: id,
      userId: storedUserId,
      payment: Number(uiData.payment) || 0,
      insurance: Number(uiData.insurance) || 0,
      hScode: uiData.hScode || null,
      adr: Number(uiData.adr) || 0,
      vehicleTypes: vTypes, 
      cargoType: uiData.cargoType || "General",
      about: uiData.about || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payloads: (uiData.payloads || []).map((p: any) => ({
        length: Number(p.length) > 0 ? Number(p.length) : 0.1,
        width: Number(p.width) > 0 ? Number(p.width) : 0.1,
        height: Number(p.height) > 0 ? Number(p.height) : 0.1,
        weight: Number(p.weight) > 0 ? Number(p.weight) : 1,
        volume: Number(p.volume) > 0 ? Number(p.volume) : 0.1,
        amount: Number(p.amount) > 0 ? Number(p.amount) : 1,
        type: mapPayloadTypeToString(p.type)
      })),
      routePoints: uiData.routePoints || []
    };

    await apiClient.put(`/api/load/draft/${id}`, payload);
  },

  uploadLoadFiles: async (id: string, files: File[]): Promise<void> => {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); 
    });

    await apiClient.put(`/api/load/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  deleteLoad: async (id: string): Promise<void> => {
    await apiClient.put(`/api/load/${id}/close`);
  },

  deleteLoadDraft: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/load/draft/${id}`);
  },

  bookLoad: async (id: string): Promise<void> => {
    await apiClient.post(`/api/load/${id}/book`);
  },

  acceptLoad: async (id: string): Promise<void> => {
    await apiClient.post(`/api/load/${id}/accept`);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCities: async (_query: string): Promise<string[]> => {
    return Promise.resolve([]);
  },

  getSavedLoads: async (params?: LoadSearchFilters): Promise<LoadListVm[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendParams: Record<string, any> = {};
      if (params?.searchBy || params?.query) backendParams.SearchBy = params.searchBy || params.query;
      if (params?.startCity || params?.from) backendParams.StartCity = params.startCity || params.from;
      if (params?.endCity || params?.to) backendParams.EndCity = params.endCity || params.to;
      if (params?.cargoType) backendParams.CargoType = params.cargoType;
      
      const response = await apiClient.get<BackendLoadResponse[]>('/api/load/user/saved', { params: backendParams });
      
      return response.data.map((item) => ({
        id: item.id,
        article: item.article || item.id.substring(0, 8).toUpperCase(),
        from: item.startCity || 'Unknown',
        to: item.endCity || 'Unknown',
        dateStart: item.startDate || new Date().toISOString(),
        price: item.payment || 0,
        weight: item.totalWeight || 0,
        cargo: item.cargoType || 'General Cargo',
        recommendedVehicle: item.vehicleTypes?.[0] || item.vihicleTypes?.[0] || item.vehicleType || 'Any',
        status: item.status || 'Active'
      }));
    } catch {
      return [];
    }
  },

  toggleSaveLoad: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<boolean>(`/api/load/${id}/save`);
      return response.data; 
    } catch {
      return false;
    }
  }
};