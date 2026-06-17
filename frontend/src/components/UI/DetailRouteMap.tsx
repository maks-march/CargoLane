import React from 'react';
import type { LoadDetailsVm } from '../../api/types';
import { RoutingMap } from './RoutingMap';

interface Props {
  load: LoadDetailsVm;
  onRouteCalculated?: (distance: string, duration: string) => void;
  routeInfo: { distance: string, duration: string };
}

export const DetailRouteMap: React.FC<Props> = ({ load, onRouteCalculated, routeInfo }) => {
  const mapStops = load.routePoints.map((p, i) => ({
    address: p.address || p.city || 'Unknown',
    type: i === 0 ? 'start' : (i === load.routePoints.length - 1 ? 'end' : 'stop') as 'start' | 'stop' | 'end'
  }));

  const startCity = load.routePoints?.[0]?.city || load.from?.split(',')[0] || 'Origin';
  const endCity = load.routePoints?.[(load.routePoints?.length || 1) - 1]?.city || load.to?.split(',')[0] || 'Destination';
  const stopsCount = load.routePoints.length;

  return (
    <div className="detail-card" style={{ padding: '0', overflow: 'hidden', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
      
      {/* ИСПРАВЛЕНО: Вернули верхний блок с динамической информацией */}
      <div style={{ padding: '24px 24px 20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E6E8EE' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>
            Route: {startCity} → {endCity}
          </div>
          <div style={{ fontSize: '14px', color: '#5C6470', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{stopsCount} stops</span>
            <span>•</span>
            <span>{routeInfo.distance !== '0 km' ? `~${routeInfo.distance}` : 'Calculating...'} km</span>
            <span>•</span>
            <span>Direct routing</span>
          </div>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%', background: '#E8F0E8', position: 'relative' }}>
         <RoutingMap 
           stops={mapStops} 
           hideFloatingWidget={true}
           onRouteCalculated={onRouteCalculated}
         />
      </div>
    </div>
  );
};