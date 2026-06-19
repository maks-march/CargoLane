import apiClient from '../api/api-client';

// Строгое соответствие Swagger-контракту, который ты прислал!
export interface UserProfileUpdate {
  firstName: string;
  lastName: string;
  displayName: string;
  timezone: number;
  isMetric: number; // Бэкенд ждет число (0 или 1)
  phone: string;
  companyName: string;
  companyCountry: string;
  companyType: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postalCode: string;
}

export const userService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProfile: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/user/me');
      return response.data;
    } catch (e) {
      console.warn("Using fallback profile data");
      return {};
    }
  },
  
  updateProfile: async (data: UserProfileUpdate): Promise<void> => {
    // Используем PUT для полного обновления данных профиля
    await apiClient.patch('/api/user/me', data);
  },
  
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data?.avatarUrl || response.data?.avatarPath || URL.createObjectURL(file);
  },
  
  removeAvatar: async (): Promise<void> => {
    await apiClient.delete('/api/user/avatar');
  }
};