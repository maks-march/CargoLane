import type { OrderListVm, OrderDetailsVm } from '../api/types';
import type { LoadData } from './types';

export const mapOrderToLoad = (order: OrderListVm | OrderDetailsVm): LoadData => {
  const isDetail = (o: any): o is OrderDetailsVm => 'about' in o;

  if (isDetail(order)) {
    return {
      id: order.id,
      company: 'Verified Shipper', // Usually comes from a separate user fetch or nested user object if added later
      from: order.routePoints?.[0]?.city || 'Unknown',
      to: order.routePoints?.[order.routePoints.length - 1]?.city || 'Unknown',
      dateStart: order.startDate,
      dateEnd: order.routePoints?.[order.routePoints.length - 1]?.date || undefined,
      cargo: order.payloads?.[0]?.name || 'General Cargo',
      mass: (order.payloads?.reduce((acc, p) => acc + (p.weight || 0), 0) || 0) + ' kg',
      volume: (order.payloads?.reduce((acc, p) => acc + (p.volume || 0), 0) || 0) + ' m³',
      vehicle: order.transport?.bodyType?.[0] || 'Standard Truck',
      price: (order.payment?.byCash || order.payment?.taxedByCard || 0) + ' €',
      match: 100,
      status: (order.status?.toLowerCase() as any) || 'active',
    };
  }

  return {
    id: order.id,
    company: 'Carrier',
    from: order.startCity || 'Unknown',
    to: order.endCity || 'Unknown',
    dateStart: order.startDate,
    cargo: 'Cargo',
    mass: order.totalWeight + ' kg',
    volume: order.totalVolume + ' m³',
    vehicle: 'Truck',
    price: order.minCost + ' €',
    match: 100,
    status: (order.status?.toLowerCase() as any) || 'active',
  };
};
