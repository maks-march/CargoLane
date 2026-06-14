import React from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
  routeInfo?: { distance: string; duration: string };
}

export const DetailHeaderCard: React.FC<Props> = ({ load, routeInfo }) => {
  const getCountryCode = (city?: string) => {
    if (!city) return 'EU';
    const c = city.toLowerCase();
    if (c.includes('rotterdam') || c.includes('amsterdam')) return 'NL';
    if (c.includes('berlin') || c.includes('munich') || c.includes('hamburg')) return 'DE';
    if (c.includes('warsaw')) return 'PL';
    if (c.includes('paris') || c.includes('lyon')) return 'FR';
    if (c.includes('milan')) return 'IT';
    if (c.includes('madrid')) return 'ES';
    return 'EU'; 
  };

  const borderStr = `${getCountryCode(load.startCity)} → ${getCountryCode(load.endCity)}`;

  // Безопасный доступ к массиву payloads (грузов)
  const cargoCategory = load.payloads && load.payloads.length > 0 ? load.payloads[0].type : 'General Cargo';
  const cargoPallets = load.payloads && load.payloads.length > 0 ? `${load.payloads[0].amount} items` : 'Full Truckload';

  return (
    <div className="detail-card">
      <div className="detail-header-top">
        <div>
          <div className="detail-badges">
            <span className="detail-badge verified">✓ Verified shipper</span>
            <span className="detail-badge document">Document attached</span>
          </div>
          
          <h2 className="detail-title">
            {cargoPallets} <span style={{ color: '#E6E8EE', margin: '0 4px' }}>•</span> <span style={{ color: '#5C6470', fontWeight: 500 }}>{cargoCategory}</span>
          </h2>
          
          <p className="detail-subtitle">{load.id.substring(0, 8).toUpperCase()} · Verified Company</p>
        </div>
        <div className="detail-price">
          <div className="detail-price-value">€{load.payment || 'Request price'}</div>
          <div className="detail-price-note">excl. VAT · negotiable</div>
        </div>
      </div>
      
      <div className="detail-stats-row">
        <div className="detail-stat">
          <div className="detail-stat-label">Distance</div>
          <div className="detail-stat-value">{routeInfo?.distance ? `${routeInfo.distance} km` : '~ Auto'}</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Drive time</div>
          <div className="detail-stat-value">{routeInfo?.duration || '~ Auto'}</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Stops</div>
          <div className="detail-stat-value">1 + final</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Border crossing</div>
          <div className="detail-stat-value">{borderStr}</div>
        </div>
      </div>
    </div>
  );
};