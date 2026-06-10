export type { 
  AuthResponse,
  LoginCommand,
  RegisterCommand,
  RefreshCommand,
  UserDetailsVm,
  ErrorResponse,
  OrderListVm,
  OrderDetailsVm,
  CreateOrderCommand,
  UpdateOrderCommand,
  PaymentCreateCommand,
  TransportCreateCommand,
  PayloadCreateCommand,
  RoutePointVm,
  PaymentUpdateCommand,
  TransportUpdateCommand,
  PayloadUpdateCommand,
  RoutePointUpdateCommand,
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

interface OrderListVm {
  id: string;
  specNumber: number;
  status: string | null;
  startDate: string;
  startCity: string | null;
  endCity: string | null;
  totalWeight: number;
  totalVolume: number;
  paymentType: string | null;
  minCost: number;
  firstPhoto: string | null;
}

interface OrderDetailsVm {
  id: string;
  userId: string;
  startDate: string;
  status: string | null;
  about: string | null;
  specNumber: number;
  payment: PaymentCreateCommand;
  transport: TransportCreateCommand;
  payloads: PayloadCreateCommand[] | null;
  routePoints: RoutePointVm[] | null;
  created: string;
  updated: string;
  photos: string[] | null;
}

interface CreateOrderCommand {
  userId: string;
  startDate: string;
  status: string | null;
  about: string | null;
  specNumber: number;
  payment: PaymentCreateCommand;
  transport: TransportCreateCommand;
  payloads: PayloadCreateCommand[] | null;
  routePoints: RoutePointVm[] | null;
}

interface UpdateOrderCommand {
  id: string;
  userId: string;
  startDate: string | null;
  status: string | null;
  about: string | null;
  specNumber: number | null;
  payment: PaymentUpdateCommand | null;
  transport: TransportUpdateCommand | null;
  payloads: PayloadUpdateCommand[] | null;
  routePoints: RoutePointUpdateCommand[] | null;
}

interface RoutePointVm {
  city: string | null;
  address: string | null;
  loadTimeStart: string;
  loadTimeEnd: string;
  date: string;
  isLoad: boolean;
}

interface RoutePointUpdateCommand {
  city: string | null;
  address: string | null;
  loadTimeStart: string | null;
  loadTimeEnd: string | null;
  date: string | null;
  isLoad: boolean | null;
}

interface PaymentCreateCommand {
  paymentType: string | null;
  isTaxedByCard: boolean;
  isNotTaxedByCard: boolean;
  isByCash: boolean;
  taxedByCard: number;
  notTaxedByCard: number;
  byCash: number;
  isVisible: boolean;
  paymentAfterDays: number;
  prepayment: number;
  isPrepaymentByFuel: boolean;
}

interface PaymentUpdateCommand {
  paymentType: string | null;
  isTaxedByCard: boolean | null;
  isNotTaxedByCard: boolean | null;
  isByCash: boolean | null;
  taxedByCard: number | null;
  notTaxedByCard: number | null;
  byCash: number | null;
  isVisible: boolean | null;
  paymentAfterDays: number | null;
  prepayment: number | null;
  isPrepaymentByFuel: boolean | null;
}

interface TransportCreateCommand {
  bodyType: string[] | null;
  loadType: string[] | null;
  unloadType: string[] | null;
  vehicles: number;
  temperatureFrom: number | null;
  temperatureTo: number | null;
  isCrewFull: boolean;
  adr: number;
  isHitch: boolean;
  isPneumaticVehicle: boolean;
  isStakes: boolean;
  isTir: boolean;
  isT1: boolean;
  isCmr: boolean;
  isMedicalBook: boolean;
}

interface TransportUpdateCommand {
  bodyType: string[] | null;
  loadType: string[] | null;
  unloadType: string[] | null;
  vehicles: number | null;
  temperatureFrom: number | null;
  temperatureTo: number | null;
  isCrewFull: boolean | null;
  adr: number | null;
  isHitch: boolean | null;
  isPneumaticVehicle: boolean | null;
  isStakes: boolean | null;
  isTir: boolean | null;
  isT1: boolean | null;
  isCmr: boolean | null;
  isMedicalBook: boolean | null;
}

interface PayloadCreateCommand {
  name: string | null;
  weight: number;
  volume: number;
  amount: number;
  wrap: string | null;
}

interface PayloadUpdateCommand {
  name: string | null;
  weight: number | null;
  volume: number | null;
  amount: number | null;
  wrap: string | null;
}

// Load types
export type { 
  CreateLoadCommand,
  CreateLoadDraftCommand,
  UpdateLoadDraftCommand,
  LoadDraftVm,
  LoadDetailsVm,
  LoadListVm,
  PayloadInputDto,
  RoutePointInputDto,
  LoadDraftRoutePoint,
  RoutePointDraftVm
};

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
