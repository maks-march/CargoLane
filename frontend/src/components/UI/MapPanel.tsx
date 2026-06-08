import React from 'react';
import type { LoadData } from '../../utils/types';
import { RoutingMap } from './RoutingMap';

interface MapPanelProps {
  load: LoadData | null;
  onNavigate: (page: string, payload?: any) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ load, onNavigate }) => {
  if (!load) return null;

  // Формируем точки для карты на основе реальных данных из БД
  const stops = [
    { id: 'start', type: 'start' as const, address: load.from, datetime: load.dateStart },
    { id: 'end', type: 'end' as const, address: load.to, datetime: load.dateEnd || '' }
  ];

  return (
    <div className="dash-map-panel">
      <div className="dash-map-header">
        <h3>Route Preview</h3>
        <button className="btn-figma-text" onClick={() => onNavigate('load-detail', { loadId: load.id })}>
          View details ›
        </button>
      </div>
      
      <div className="dash-map-container" style={{ height: '300px', background: '#F6F7FB', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
         <RoutingMap stops={stops} />
      </div>

      <div className="dash-map-info">
        <div className="dash-map-stat">
          <span>From</span>
          <strong>{load.from || 'Unknown'}</strong>
        </div>
        <div className="dash-map-stat">
          <span>To</span>
          <strong>{load.to || 'Unknown'}</strong>
        </div>
        <div className="dash-map-stat">
          <span>Vehicle</span>
          <strong>{load.vehicle || 'Any'}</strong>
        </div>
      </div>
    </div>
  );
};