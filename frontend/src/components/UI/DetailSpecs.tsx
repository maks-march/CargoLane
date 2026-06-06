import React from 'react';
import type { LoadData } from '../../types';

interface Props {
  load: LoadData;
}

export const DetailSpecs: React.FC<Props> = ({ load }) => {
  return (
    <>
      <div className="detail-card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Cargo specifications</h3>
        
        <div className="specs-grid">
          <div className="spec-card">
            <div className="spec-label">Total weight</div>
            <div className="spec-value">{load.mass}</div>
            <div className="spec-note">Gross mass</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">Total volume</div>
            <div className="spec-value">{load.volume}</div>
            <div className="spec-note">Estimated</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">Loading metres</div>
            <div className="spec-value">13.6 LDM</div>
            <div className="spec-note">full trailer</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">Unit dim.</div>
            <div className="spec-value">Standard</div>
            <div className="spec-note">EU-pallet compatible</div>
          </div>
        </div>
        
        <div className="specs-tags">
          <span className="spec-tag">⊘ Non-stackable</span>
          <span className="spec-tag">🛡️ Insured to €60k</span>
          <span className="spec-tag">⚡ ADR not required</span>
          <span className="spec-tag">🕐 Load: {load.dateStart}, 08:00–12:00</span>
          {load.dateEnd && <span className="spec-tag">🕐 Unload: {load.dateEnd}, 06:00–10:00</span>}
        </div>
      </div>
      
      <div className="detail-card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Description</h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
          Standard secure transport requested. <br />
          Please ensure vehicle matches required specifications: {load.vehicle}.<br />
          Contact dispatcher upon arrival.
        </p>
      </div>
    </>
  );
};