import type { LoadData } from '../types';
import { mockLoads } from './mockData';

export const loadsService = {
  // Получить все грузы (с имитацией задержки)
  getAllLoads: async (): Promise<LoadData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLoads), 500); 
    });
  },
  
  // Получить один груз по ID для страницы деталей
  getLoadById: async (id: string): Promise<LoadData | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLoads.find(load => load.id === id));
      }, 300);
    });
  }
};