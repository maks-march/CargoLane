import React from 'react';
import { RoutingMap } from './RoutingMap';
import type { LoadListVm } from '../../api/types';

interface MapPanelProps {
  load: LoadListVm | null;
  onNavigate: (page: string, payload?: { loadId: string }) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ load, onNavigate }) => {
  if (!load) return null;

  // Безопасное извлечение городов (поддерживаем оба формата: и старый, и новый от API)
  const startCity = (load as any).startCity || (load as any).from || 'Rotterdam';
  const endCity = (load as any).endCity || (load as any).to || 'Warsaw';

  const stops = [
    { address: startCity, type: 'start' },
    { address: endCity, type: 'end' }
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
          <strong>{startCity}</strong>
        </div>
        <div className="dash-map-stat">
          <span>To</span>
          <strong>{endCity}</strong>
        </div>
        <div className="dash-map-stat">
          <span>Vehicle</span>
          <strong>{load.recommendedVehicle || 'Tautliner'}</strong>
        </div>
      </div>
    </div>
  );
};