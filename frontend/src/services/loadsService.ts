import apiClient from '../api/api-client';
import type { OrderListVm, CreateOrderCommand, OrderDetailsVm, CreateLoadCommand, CreateLoadDraftCommand, UpdateLoadDraftCommand, LoadDraftVm, LoadListVm, LoadDetailsVm } from '../api/types';

export const loadsService = {
  async getAllLoads(params?: any): Promise<OrderListVm[]> {
    const response = await apiClient.get<OrderListVm[]>('/api/order', { params });
    return response.data;
  },

  async getLoadById(id: string): Promise<OrderDetailsVm> {
    const response = await apiClient.get<OrderDetailsVm>(`/api/order/${id}`);
    return response.data;
  },

  async createLoad(data: CreateOrderCommand): Promise<string> {
    const response = await apiClient.post<string>('/api/order', data);
    return response.data;
  },

  async getUserLoads(): Promise<OrderListVm[]> {
    const response = await apiClient.get<OrderListVm[]>('/api/order/user/me');
    return response.data;
  },

  async getCities(_query?: string): Promise<string[]> {
    return ['Rotterdam', 'Berlin', 'Warsaw', 'Paris', 'Madrid'];
  },

  // Load API methods
  async getAllLoads(params?: any): Promise<LoadListVm[]> {
    const response = await apiClient.get<LoadListVm[]>('/api/load', { params });
    return response.data;
  },

  async getLoadById(id: string): Promise<LoadDetailsVm> {
    const response = await apiClient.get<LoadDetailsVm>(`/api/load/${id}`);
    return response.data;
  },

  async createLoad(data: CreateLoadCommand): Promise<string> {
    const response = await apiClient.post<string>('/api/load', data);
    return response.data;
  },

  async getUserLoads(): Promise<LoadListVm[]> {
    const response = await apiClient.get<LoadListVm[]>('/api/load/me');
    return response.data;
  },

  // Draft methods
  async createLoadDraft(data: CreateLoadDraftCommand): Promise<string> {
    const response = await apiClient.post<string>('/api/load/draft', data);
    return response.data;
  },

  async getLoadDraft(id: string): Promise<LoadDraftVm> {
    const response = await apiClient.get<LoadDraftVm>(`/api/load/draft/${id}`);
    return response.data;
  },

  async updateLoadDraft(id: string, data: UpdateLoadDraftCommand): Promise<string> {
    const response = await apiClient.put<string>(`/api/load/draft/${id}`, data);
    return response.data;
  },

  async deleteLoadDraft(id: string): Promise<void> {
    await apiClient.delete(`/api/load/draft/${id}`);
  }
};
