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
  cargoType?: string;
  vehicleTypes?: string[]; 
  vihicleTypes?: string[]; 
  vehicleType?: string;
  status?: string;
  companyName?: string;
  reviewerName?: string;
  created?: string;
}

export interface ExtendedLoadListVm extends LoadListVm {
  companyName?: string;
  reviewerName?: string;
  createdDate?: string;
}

const mapToListVm = (item: BackendLoadResponse): ExtendedLoadListVm => ({
  id: item.id,
  article: item.article ? String(item.article) : item.id.substring(0, 8).toUpperCase(), 
  from: item.startCity || 'Unknown',
  to: item.endCity || 'Unknown',
  dateStart: item.startDate || new Date().toISOString(),
  price: item.payment || 0,
  weight: item.totalWeight || 0,
  cargo: item.cargoType || 'General Cargo', 
  recommendedVehicle: item.vehicleTypes?.[0] || item.vihicleTypes?.[0] || item.vehicleType || 'Any',
  status: item.status || 'Pending',
  companyName: item.companyName || 'CargoLane Partner',
  reviewerName: item.reviewerName || 'System Admin',
  createdDate: item.created || item.startDate || new Date().toISOString()
});

export const adminService = {
  getReviews: async (): Promise<ExtendedLoadListVm[]> => {
    try {
      const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/reviews');
      return response.data.map(mapToListVm);
    } catch (error) {
      console.error("Failed to fetch admin reviews", error);
      return [];
    }
  },

  getApprovedLoads: async (): Promise<ExtendedLoadListVm[]> => {
    try {
      const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/approved');
      return response.data.map(mapToListVm);
    } catch (error) {
      console.error("Failed to fetch approved loads", error);
      return [];
    }
  },

  getRejectedLoads: async (): Promise<ExtendedLoadListVm[]> => {
    try {
      const response = await apiClient.get<BackendLoadResponse[]>('/api/loadadmin/rejected');
      return response.data.map(mapToListVm);
    } catch (error) {
      console.error("Failed to fetch rejected loads", error);
      return [];
    }
  },

  getReviewDetails: async (id: string): Promise<LoadDetailsVm> => {
    // ИСПРАВЛЕНО: Бэкенд блокирует роут /api/loadadmin/{id}/review для статусов, отличных от Pending (Status=1).
    // Поэтому для просмотра карточки мы дергаем универсальный эндпоинт, который отдает детали ЛЮБОГО груза.
    const response = await apiClient.get<LoadDetailsBackendResponse>(`/api/load/${id}`);
    const item = response.data;
    
    return {
        id: item.id,
        userId: item.userId || 'system_id', 
        article: item.article ? String(item.article) : item.id.substring(0, 8).toUpperCase(),
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
        status: item.status || 'Pending',
        companyName: item.companyName || 'CargoLane Partner',
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
    await apiClient.post(`/api/loadadmin/${id}/reject`, JSON.stringify(reason), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};