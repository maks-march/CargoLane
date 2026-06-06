import type { LoadData } from '../types';

// Базовый URL бэкенда. Если бэкенд крутится на другом порту (например, 8080), поменяй здесь.
const API_BASE_URL = 'http://localhost:5000/api'; 

export const loadsService = {
  // Получить все грузы (GET /api/Order)
  getAllLoads: async (): Promise<LoadData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch from backend');
      
      const data = await response.json();
      
      // Поддержка структуры от бэкенда (если приходит массив напрямую или объект { orders: [] })
      const items = Array.isArray(data) ? data : (data.orders || data.items || []);
      
      // Маппим данные. Если бэкенд пока возвращает пустые поля, ставим красивые заглушки для верстки
      return items.map((order: any) => ({
        id: order.id?.toString() || `CL-${Math.floor(1000 + Math.random() * 9000)}`,
        company: order.company || 'Nordhafen Logistics',
        from: order.from || 'Unknown Origin',
        to: order.to || 'Unknown Destination',
        extraRoute: order.extraRoute || '',
        dateStart: order.dateStart || 'May 12 • 08:00',
        dateEnd: order.dateEnd || '',
        cargo: order.cargo || 'General Cargo',
        mass: order.mass?.toString() || '0 t',
        volume: order.volume?.toString() || '0 m³',
        vehicle: order.vehicle || 'Not specified',
        price: order.price ? `€ ${order.price}` : 'Open to bids',
        match: order.match || 0,
        status: order.status || 'active'
      }));
    } catch (error) {
      console.error("API Error (getAllLoads):", error);
      return []; // Возвращаем пустой массив, чтобы фронт не падал, если бэкенд недоступен
    }
  },

  // Получить один груз по ID (GET /api/Order/{id})
  getLoadById: async (id: string): Promise<LoadData | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) return undefined;
      
      const order = await response.json();
      
      return {
        id: order.id?.toString() || id,
        company: order.company || 'Nordhafen Logistics',
        from: order.from || 'Unknown Origin',
        to: order.to || 'Unknown Destination',
        extraRoute: order.extraRoute || '',
        dateStart: order.dateStart || 'May 12 • 08:00',
        dateEnd: order.dateEnd || '',
        cargo: order.cargo || 'General Cargo',
        mass: order.mass?.toString() || '0 t',
        volume: order.volume?.toString() || '0 m³',
        vehicle: order.vehicle || 'Not specified',
        price: order.price ? `€ ${order.price}` : 'Open to bids',
        match: order.match || 0,
        status: order.status || 'active'
      };
    } catch (error) {
      console.error(`API Error (getLoadById ${id}):`, error);
      return undefined;
    }
  },

  // Создать новый груз (POST /api/Order)
  createLoad: async (loadData: any): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loadData) 
      });
      
      if (!response.ok) throw new Error('Failed to create load');
      
      const data = await response.json();
      return data.id?.toString() || null;
    } catch (error) {
      console.error("API Error (createLoad):", error);
      return null;
    }
  }
};