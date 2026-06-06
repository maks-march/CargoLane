import React from 'react';
import type { LoadData } from '../../types';
import { RoutingMap } from './RoutingMap';

interface Props {
  load: LoadData;
  routeInfo?: { distance: string; duration: string };
  onRouteCalculated?: (distance: string, duration: string) => void;
}

export const DetailRouteMap: React.FC<Props> = ({ load, routeInfo, onRouteCalculated }) => {
  const mapStops = [
    { address: load.from || 'Rotterdam', type: 'start' }
  ];
  if (load.extraRoute) {
    mapStops.push({ address: load.extraRoute.replace('+ ', ''), type: 'stop' });
  }
  mapStops.push({ address: load.to || 'Warsaw', type: 'end' });

  // Функция для получения кода страны (для красоты в заголовке)
  const getCountryCode = (city: string) => {
    const c = city.toLowerCase();
    if (c.includes('rotterdam') || c.includes('amsterdam')) return 'NL';
    if (c.includes('warsaw')) return 'PL';
    if (c.includes('hamburg') || c.includes('berlin') || c.includes('munich')) return 'DE';
    if (c.includes('paris') || c.includes('lyon')) return 'FR';
    if (c.includes('madrid')) return 'ES';
    if (c.includes('milan')) return 'IT';
    return '';
  };

  const fromCC = getCountryCode(load.from);
  const toCC = getCountryCode(load.to);
  
  // Убираем дублирование: пишем "Rotterdam, NL", только если город не содержит "NL"
  const fromTitle = fromCC && !load.from.includes(fromCC) ? `${load.from}, ${fromCC}` : load.from;
  const toTitle = toCC && !load.to.includes(toCC) ? `${load.to}, ${toCC}` : load.to;

  const stopsCount = mapStops.length;
  // Логика типа маршрута: если больше 2 точек — Multi-lane, иначе Direct
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
          <button className="route-tab">Combined</button>
        </div>
      </div>
      
      <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        <RoutingMap stops={mapStops} hideFloatingWidget={true} onRouteCalculated={onRouteCalculated} />
      </div>
    </div>
  );
};