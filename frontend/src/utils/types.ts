export type PageType = 
  | 'landing' 
  | 'signin' 
  | 'signup' 
  | 'recovery' 
  | 'dashboard' 
  | 'search' 
  | 'messages' 
  | 'saved' 
  | 'settings' 
  | 'load-detail' 
  | 'create-load' 
  | 'createload' 
  | 'my-listings'
  | 'mylistings'
  | 'chat';

export interface NavigationPayload {
  loadId?: string;
  fromPage?: string;
}

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
  status?: 'active' | 'pending' | 'draft' | 'closed'; // Добавлено поле
}