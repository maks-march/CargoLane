import React, { useState } from 'react';
import type { LoadData, PageType, NavigationPayload } from '../../types';
import { RoutingMap } from './RoutingMap';

interface Props {
  load: LoadData | null;
  onNavigate?: (page: PageType, payload?: NavigationPayload) => void;
}

export const MapPanel: React.FC<Props> = ({ load, onNavigate }) => {
  const [routeInfo, setRouteInfo] = useState({ distance: '-', duration: '-' });

  if (!load) {
    return (
      <div className="dash-map-panel">
        <div className="dash-empty-state">Select a load to view details</div>
      </div>
    );
  }

  const mapStops = [
    { address: load.from || '', type: 'start' },
    ...(load.extraRoute ? [{ address: load.extraRoute.replace('+ ', ''), type: 'stop' }] : []),
    { address: load.to || '', type: 'end' }
  ];

  return (
    <div className="dash-map-panel">
      <div className="dash-map-header">
        <h3>Load map</h3>
      </div>
      <div className="dash-map-container" style={{ position: 'relative' }}>
        <RoutingMap 
          stops={mapStops} 
          hideFloatingWidget={true} 
          onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} 
        />
      </div>
      <div className="dash-map-footer">
        <div className="dash-map-footer-label">Route</div>
        <div className="dash-map-footer-route">{load.from} → {load.to}</div>
        <div className="dash-map-footer-meta">
          {routeInfo.distance !== '-' ? `${routeInfo.distance} km` : '-'} · {routeInfo.duration} · {load.cargo.split('·')[0].trim()}
        </div>
        <div className="dash-map-footer-action-row">
          <div className="dash-map-footer-btn-specs">
            <span className="cargo-tag">{load.vehicle}</span>
          </div>
          <button 
            className="btn-figma-primary" 
            style={{ padding: '8px 16px' }}
            onClick={() => onNavigate && onNavigate('load-detail', { loadId: load.id, fromPage: 'dashboard' })}
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
};