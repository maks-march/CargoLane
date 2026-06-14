import React from 'react';
import type { LoadDetailsVm } from '../../api/types';
import { RoutingMap } from './RoutingMap';

interface Props {
  load: LoadDetailsVm;
  routeInfo?: { distance: string; duration: string };
  onRouteCalculated?: (distance: string, duration: string) => void;
}

export const DetailRouteMap: React.FC<Props> = ({ load, routeInfo, onRouteCalculated }) => {
  // Безопасное чтение городов (в зависимости от того, как их отдаст бэкенд: startCity или from)
  const start = (load as any).startCity || (load as any).from || 'Rotterdam';
  const end = (load as any).endCity || (load as any).to || 'Warsaw';

  const mapStops = [
    { address: start, type: 'start' }
  ];
  
  if ((load as any).extraRoute) {
    mapStops.push({ address: String((load as any).extraRoute).replace('+ ', ''), type: 'stop' });
  }
  
  mapStops.push({ address: end, type: 'end' });

  // Функция для получения кода страны (для красоты в заголовке)
  const getCountryCode = (city?: string) => {
    if (!city) return 'EU';
    const c = city.toLowerCase();
    if (c.includes('rotterdam') || c.includes('amsterdam')) return 'NL';
    if (c.includes('warsaw')) return 'PL';
    if (c.includes('hamburg') || c.includes('berlin') || c.includes('munich')) return 'DE';
    if (c.includes('paris') || c.includes('lyon')) return 'FR';
    if (c.includes('madrid')) return 'ES';
    if (c.includes('milan')) return 'IT';
    return 'EU';
  };

  const fromCC = getCountryCode(start);
  const toCC = getCountryCode(end);

  const fromTitle = start.includes(fromCC) ? start : `${start}, ${fromCC}`;
  const toTitle = end.includes(toCC) ? end : `${end}, ${toCC}`;

  const stopsCount = mapStops.length;
  const routeType = stopsCount > 2 ? 'Multi-lane routing' : 'Direct routing';

  return (
    <div className="detail-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>
            Route: {fromTitle} → {toTitle}
          </h3>
          <p style={{ fontSize: '14px', color: '#5C6470', fontWeight: 500 }}>
            {stopsCount} stops <span style={{ margin: '0 6px', color: '#E6E8EE' }}>•</span> 
            {routeInfo?.distance ? `${routeInfo.distance} km` : '~ km'} <span style={{ margin: '0 6px', color: '#E6E8EE' }}>•</span> 
            {routeType}
          </p>
        </div>
        
        <div className="route-tabs-container">
          <button className="route-tab active">Driving</button>
          <button className="route-tab">Rail</button>
          <button className="route-tab">Sea</button>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', background: '#F6F7FB', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        <RoutingMap stops={mapStops} onRouteCalculated={onRouteCalculated} />
      </div>
    </div>
  );
};