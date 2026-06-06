export type PageType = 
  | 'landing' 
  | 'signin' 
  | 'signup' 
  | 'recovery' 
  | 'dashboard' 
  | 'dashboard-filters' 
  | 'dashboard-empty' 
  | 'saved' 
  | 'load-detail';

// Новый интерфейс для данных таблицы грузов
export interface LoadData {
  id: string;
  company: string;
  from: string;
  to: string;
  extraRoute?: string;
  dateStart: string;
  dateEnd?: string;
  cargo: string;
  mass: string;
  volume: string;
  vehicle: string;
  price: string;
  match: number;
}