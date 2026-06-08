import apiClient from '../api/api-client';
import type { OrderListVm, CreateOrderCommand, OrderDetailsVm } from '../api/types';

export const ordersService = {
  async getOrders(params?: any): Promise<OrderListVm[]> {
    const response = await apiClient.get<OrderListVm[]>('/api/order', { params });
    return response.data;
  },

  async getOrderById(id: string): Promise<OrderDetailsVm> {
    const response = await apiClient.get<OrderDetailsVm>(`/api/order/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderCommand): Promise<string> {
    const response = await apiClient.post<string>('/api/order', data);
    return response.data;
  },

  async getMyOrders(): Promise<OrderListVm[]> {
    const response = await apiClient.get<OrderListVm[]>('/api/order/user/me');
    return response.data;
  }
};
