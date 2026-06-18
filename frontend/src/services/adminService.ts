import apiClient from '../api/api-client';
import type { LoadListVm, LoadDetailsVm } from '../api/types';

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
  // ИСПРАВЛЕНО: Теперь ждем shipper вместо companyName
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

interface BackendLoadResponse {
  id: string;
  article?: string | number; 
  startCity?: string;
  endCity?: string;
  startDate?: string;
  payment?: number;
  totalWeight?: number;
  totalVolume?: number;
  cargoType?: string;
  vehicleTypes?: string[]; 
  vihicleTypes?: string[];
  status?: string;
  created?: string;
  // ИСПРАВЛЕНО: Теперь ждем shipper вместо companyName
  shipper?: string | null;
  payloadCount?: number;
}

// Экспортируем тот же тип, так как UI теперь переписан на LoadListVm
export type ExtendedLoadListVm = LoadListVm;

export const adminService = {
  getReviews: async (): Promise<ExtendedLoadListVm[]> => {
    const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/reviews');
    const data = response.data;
    
    return data.map(item => ({
        id: item.id,
        // ИСПРАВЛЕНО: Строго конвертируем в Number или undefined
        article: item.article ? Number(item.article) : undefined,
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        totalVolume: item.totalVolume || 0,
        cargoType: item.cargoType || 'General',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || ['Any'],
        status: item.status || 'Pending',
        created: item.created || new Date().toISOString(),
        // ИСПРАВЛЕНО: Мапим shipper
        shipper: item.shipper || 'CargoLane Partner',
        payloadCount: item.payloadCount || 0
    }));
  },

  getReviewDetails: async (id: string): Promise<LoadDetailsVm> => {
    const response = await apiClient.get<LoadDetailsBackendResponse>(`/api/loadadmin/${id}/review`);
    const item = response.data;
    
    return {
        id: item.id,
        userId: item.userId || 'system_id',
        // ИСПРАВЛЕНО: Строго конвертируем в Number или undefined
        article: item.article ? Number(item.article) : undefined,
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        totalVolume: item.totalVolume || 0,
        cargoType: item.cargoType || 'General Cargo',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || ['Any'],
        about: item.about || '',
        adr: item.adr || 0,
        hScode: item.hScode || '',
        insurance: item.insurance || 0,
        status: item.status || 'Pending',
        // ИСПРАВЛЕНО: Мапим shipper вместо companyName
        shipper: item.shipper || 'CargoLane Partner',
        created: item.created || new Date().toISOString(),
        distance: item.distance || 0,
        duration: item.duration || "00:00:00",
        rejectReason: item.rejectReason || null,
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

  approveLoad: async (id: string): Promise<void> => {
    await apiClient.post(`/api/loadadmin/${id}/approve`);
  },

  rejectLoad: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/api/loadadmin/${id}/reject`, reason, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getApprovedLoads: async (): Promise<ExtendedLoadListVm[]> => {
    const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/approved');
    return response.data.map(item => ({
        id: item.id,
        article: item.article ? Number(item.article) : undefined,
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        totalVolume: item.totalVolume || 0,
        cargoType: item.cargoType || 'General',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || ['Any'],
        status: item.status || 'Active',
        created: item.created || new Date().toISOString(),
        shipper: item.shipper || 'CargoLane Partner',
        payloadCount: item.payloadCount || 0
    }));
  },

  getRejectedLoads: async (): Promise<ExtendedLoadListVm[]> => {
    const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/rejected');
    return response.data.map(item => ({
        id: item.id,
        article: item.article ? Number(item.article) : undefined,
        startCity: item.startCity || '',
        endCity: item.endCity || '',
        startDate: item.startDate || new Date().toISOString(),
        payment: item.payment || 0,
        totalWeight: item.totalWeight || 0,
        totalVolume: item.totalVolume || 0,
        cargoType: item.cargoType || 'General',
        vehicleTypes: item.vehicleTypes || item.vihicleTypes || ['Any'],
        status: item.status || 'Rejected',
        created: item.created || new Date().toISOString(),
        shipper: item.shipper || 'CargoLane Partner',
        payloadCount: item.payloadCount || 0
    }));
  }
};