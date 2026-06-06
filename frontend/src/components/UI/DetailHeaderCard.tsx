import React from 'react';
import type { LoadData } from '../../types';

interface Props {
  load: LoadData;
  routeInfo?: { distance: string; duration: string };
}

export const DetailHeaderCard: React.FC<Props> = ({ load, routeInfo }) => {
  const getCountryCode = (city: string) => {
    const c = city.toLowerCase();
    if (c.includes('rotterdam') || c.includes('amsterdam')) return 'NL';
    if (c.includes('berlin') || c.includes('munich') || c.includes('hamburg')) return 'DE';
    if (c.includes('warsaw')) return 'PL';
    if (c.includes('paris') || c.includes('lyon')) return 'FR';
    if (c.includes('milan')) return 'IT';
    if (c.includes('madrid')) return 'ES';
    return 'EU';
  };

  const borderStr = `${getCountryCode(load.from)} → ${getCountryCode(load.to)}`;

  // Парсинг названия груза из ТЗ (разбиваем строку "FMCG · 22 plt")
  const cargoParts = load.cargo.split('·').map(s => s.trim());
  const cargoCategory = cargoParts[0] || 'General Cargo';
  const cargoPallets = cargoParts.length > 1 ? cargoParts.slice(1).join(' · ') : load.mass;

  return (
    <div className="detail-card">
      <div className="detail-card-header">
        <div>
          <div className="detail-badges">
            <span className="detail-badge verified">✓ Verified shipper</span>
            <span className="detail-badge match">Match · {load.match}%</span>
            <span className="detail-badge time">Posted recently</span>
          </div>
          
          {/* СЛОЖНОЕ НАЗВАНИЕ КАК В МАКЕТЕ */}
          <h2 className="detail-title">
            {cargoPallets} <span style={{ color: '#E6E8EE', margin: '0 4px' }}>•</span> <span style={{ color: '#5C6470', fontWeight: 500 }}>{cargoCategory}</span>
          </h2>
          
          <p className="detail-subtitle">{load.id} · {load.company || 'Unknown'} GmbH</p>
        </div>
        <div className="detail-price">
          <div className="detail-price-value">{load.price}</div>
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
          <div className="detail-stat-value">{load.extraRoute ? '2 + final' : '1 + final'}</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Border</div>
          <div className="detail-stat-value">{borderStr}</div>
        </div>
      </div>
    </div>
  );
};