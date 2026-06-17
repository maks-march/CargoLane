export type { 
  AuthResponse,
  LoginCommand,
  RegisterCommand,
  RefreshCommand,
  UserDetailsVm,
  ErrorResponse,
  CreateLoadCommand,
  CreateLoadDraftCommand,
  UpdateLoadDraftCommand,
  LoadDraftVm,
  LoadDetailsVm,
  LoadListVm,
  PayloadInputDto,
  RoutePointInputDto,
  RoutePointDraftVm,
  PayloadDraftVm,
  LoadDraftRoutePoint,
  LoadRoutePointVm,
  PayloadVm,
  ChatDto,
  ChatMessageDto,
  TimelineEventDto,
  ActiveDealDto
};

// ==========================================
// AUTH & USER TYPES
// ==========================================
interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string;
  userName: string | null;
}

interface ErrorResponse {
  error: string | null;
  details: string | null;
}

interface LoginCommand {
  login: string;
  password?: string;
}

interface RegisterCommand {
  login?: string;
  password?: string;
  username?: string;
  email?: string;
  name?: string;
  role?: string;
}

interface RefreshCommand {
  accessToken: string;
  refreshToken: string;
}

interface UserDetailsVm {
  id: string;
  email: string | null;
  name: string | null;
  surname: string | null;
  nickName: string | null;
  role: string | null;
  timeZone: number;
  phoneNumber: string | null;
  companyName: string | null;
  companyCountry: string | null;
  companyType: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  purpose: string | null;
  avatarPath: string | null;
  created: string;
  updated: string;
}

// ==========================================
// BACKEND COMMANDS & DTOs
// ==========================================
interface PayloadInputDto {
  length: number;
  width: number;
  height: number;
  weight: number;
  volume: number;
  amount: number;
  type: string; // Строго string по методичке
}

interface RoutePointInputDto {
  city: string | null;
  address: string | null;
  arrivalTime: string; // Бэкенд жестко требует строку с датой
  orderIndex: number;
}

interface CreateLoadCommand {
  userId?: string;
  startDate?: string;
  payment: number;
  insurance: number;
  hScode: string | null;
  adr: number;
  vehicleTypes: string[]; // Строго по методичке (без опечаток)
  cargoType: string;      
  about: string | null;
  payloads: PayloadInputDto[];
  routePoints: RoutePointInputDto[];
}

interface CreateLoadDraftCommand {
  userId?: string;
  startDate?: string | null;
  payment: number | null;
  insurance: number | null;
  hScode: string | null;
  adr: number | null;
  vehicleTypes?: string[]; // Строго по методичке
  cargoType?: string;
  about: string | null;
  payloads?: PayloadInputDto[];
  routePoints?: RoutePointInputDto[];
}

interface UpdateLoadDraftCommand extends CreateLoadDraftCommand {
  id: string;
}

interface LoadDraftVm {
  id: string;
  startDate: string | null;
  payment: number | null;
  insurance: number | null;
  hScode: string | null;
  adr: number | null;
  vehicleTypes: string[] | null;
  cargoType: string | null;
  about: string | null;
  payloads: PayloadDraftVm[] | null;
  routePoints: RoutePointDraftVm[] | null;
}

interface PayloadDraftVm {
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  volume: number | null;
  amount: number | null;
  type: string | null;
}

interface RoutePointDraftVm {
  city: string | null;
  address: string | null;
  arrivalTime: string | null;
  orderIndex: number | null;
}

// ==========================================
// UI ADAPTED MODELS
// ==========================================
interface LoadListVm {
  id: string;
  from: string;
  to: string;
  dateStart: string;
  price: number;
  cargo: string;
  weight: number;
  recommendedVehicle: string;
  status: string;
  volumeStr?: string;
  matchPercent?: number;
}

interface LoadDetailsVm {
  id: string;
  from: string;
  to: string;
  dateStart: string;
  price: number;
  cargo: string;
  weight: number;
  volume: number;
  recommendedVehicle: string;
  about: string;
  adr: number;
  hScode: string | null;
  insurance: number;
  status: string;
  companyName: string;
  payloads: PayloadInputDto[];
  routePoints: RoutePointInputDto[];
}

// ==========================================
// OTHER DTOs
// ==========================================
interface PayloadVm {
  length: number;
  width: number;
  height: number;
  weight: number;
  volume: number;
  amount: number;
  type: string | null;
}

interface LoadRoutePointVm {
  city: string | null;
  address: string | null;
  arrivalTime: string | null;
  orderIndex: number;
}

interface LoadDraftRoutePoint {
  id: string;
  entityId: string;
  orderIndex: number;
  city: string | null;
  address: string | null;
  loadTimeStart: string;
  loadTimeEnd: string;
  date: string;
  arrivalTime: string | null;
  isLoad: boolean;
}

// ==========================================
// CHAT & MESSAGES TYPES
// ==========================================
interface ChatDto {
  id: string;
  partnerName: string;
  partnerCompany: string;
  avatarInitials: string;
  avatarColor: 'blue' | 'green';
  loadId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatMessageDto {
  id: string;
  senderId: string; 
  text: string;
  timestamp: string;
  isSystemMessage?: boolean;
}

interface TimelineEventDto {
  title: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}

interface ActiveDealDto {
  loadId: string;
  route: string;
  details: string;
  price: string;
  status: string;
  timeline: TimelineEventDto[];
}