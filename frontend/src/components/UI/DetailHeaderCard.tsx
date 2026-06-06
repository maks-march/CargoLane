import React from 'react';
import type { LoadData } from '../../types';

interface Props {
  load: LoadData;
}

export const DetailHeaderCard: React.FC<Props> = ({ load }) => {
  return (
    <div className="detail-card">
      <div className="detail-card-header">
        <div>
          <div className="detail-badges">
            <span className="detail-badge verified">✓ Verified shipper</span>
            <span className="detail-badge match">Match · {load.match}%</span>
            <span className="detail-badge time">Posted recently</span>
          </div>
          <h2 className="detail-title">{load.cargo}</h2>
          <p className="detail-subtitle">{load.id} · {load.company} GmbH</p>
        </div>
        <div className="detail-price">
          <div className="detail-price-value">{load.price}</div>
          <div className="detail-price-note">excl. VAT · negotiable</div>
        </div>
      </div>
      
      <div className="detail-stats-row">
        <div className="detail-stat">
          <div className="detail-stat-label">Distance</div>
          <div className="detail-stat-value">1,283 km</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Drive time</div>
          <div className="detail-stat-value">~17 h</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Stops</div>
          <div className="detail-stat-value">2 + final</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Vehicle</div>
          <div className="detail-stat-value" style={{ fontSize: '15px' }}>{load.vehicle}</div>
        </div>
      </div>
    </div>
  );
};