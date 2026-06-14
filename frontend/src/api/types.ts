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
  PayloadVm
};

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
  password: string;
}

interface RegisterCommand {
  login: string;
  password: string;
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

interface PayloadInputDto {
  length: number;
  width: number;
  height: number;
  weight: number;
  volume: number;
  amount: number;
  type: string | null;
}

interface RoutePointInputDto {
  city: string | null;
  address: string | null;
  arrivalTime: string | null;
  orderIndex: number;
}

interface CreateLoadCommand {
  userId: string;
  startDate: string;
  payment: number;
  insurance: number;
  hScode: string | null;
  adr: number;
  suitableCargos: string[] | null;
  about: string | null;
  payloads: PayloadInputDto[] | null;
  routePoints: RoutePointInputDto[] | null;
}

interface CreateLoadDraftCommand {
  userId: string;
  startDate: string | null;
  payment: number | null;
  insurance: number | null;
  hScode: string | null;
  adr: number | null;
  suitableCargos: string[] | null;
  about: string | null;
}

interface UpdateLoadDraftCommand {
  id: string;
  userId: string;
  startDate: string | null;
  payment: number | null;
  insurance: number | null;
  hScode: string | null;
  adr: number | null;
  suitableCargos: string[] | null;
  about: string | null;
}

interface LoadDraftVm {
  id: string;
  startDate: string | null;
  payment: number | null;
  insurance: number | null;
  hScode: string | null;
  adr: number | null;
  suitableCargos: string[] | null;
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

interface LoadListVm {
  id: string;
  startDate: string | null;
  payment: number;
  startCity: string | null;
  endCity: string | null;
  totalWeight: number;
  payloadCount: number;
}

interface LoadDetailsVm {
  id: string;
  payment: number;
  insurance: number;
  hScode: string | null;
  adr: number;
  suitableCargos: string[] | null;
  about: string | null;
  status: string | null;
  isReviewed: boolean;
  userId: string;
  payloads: PayloadVm[] | null;
  routePoints: LoadRoutePointVm[] | null;
  photos: string[] | null;
}

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
