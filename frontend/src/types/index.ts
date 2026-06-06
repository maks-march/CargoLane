export type PageType = 'landing' | 'signin' | 'signup' | 'recovery' | 'dashboard' | 'saved' | 'load-detail' | 'create-load' | 'my-listings';

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
}