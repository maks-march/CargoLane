import React from 'react';
import type { LoadData } from '../../types';
import mapBg from '../../assets/map.png';

interface Props {
  load: LoadData;
}

export const DetailRouteMap: React.FC<Props> = ({ load }) => {
  return (
    <div className="detail-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Route: {load.from} → {load.to}</h3>
          <p style={{ fontSize: '13px', color: '#888' }}>{load.extraRoute ? `Via ${load.extraRoute} · ` : ''}Multi-lane routing</p>
        </div>
        <div className="route-tabs">
          <button className="route-tab active">Driving</button>
          <button className="route-tab">Rail</button>
          <button className="route-tab">Combined</button>
        </div>
      </div>
      
      <div className="detail-map">
        <img src={mapBg} alt="Route map" />
        <div className="detail-map-zoom">
          <button className="zoom-btn">+</button>
          <button className="zoom-btn">−</button>
        </div>
      </div>
    </div>
  );
};