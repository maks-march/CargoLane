import React from 'react';
import type { LoadData } from '../../utils/types';

interface Props {
  load: LoadData;
}

export const DetailSpecs: React.FC<Props> = ({ load }) => {
  return (
    <div className="detail-card">
      <h3 className="dash-detail-specs-title">Cargo Specifications</h3>
      
      <div className="figma-specs-grid">
        
        <div className="spec-card">
          <div className="spec-label">Weight</div>
          <div className="spec-value">{load.mass}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Volume</div>
          <div className="spec-value">{load.volume}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Vehicle Type</div>
          <div className="spec-value">{load.vehicle}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Commodity</div>
          <div className="spec-value">{load.cargo.split('·')[0].trim()}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Loading metres</div>
          <div className="spec-value">13.6 LDM</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Floor footprint</div>
          <div className="spec-value">32.6 m²</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Stackability</div>
          <div className="spec-value">Non-stackable</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Temperature</div>
          <div className="spec-value">Ambient</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Insured value</div>
          <div className="spec-value">€ 60,000</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">HS code</div>
          <div className="spec-value">3402.20.90</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">ADR class</div>
          <div className="spec-value">Not applicable</div>
        </div>

      </div>
    </div>
  );
};