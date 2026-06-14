import React from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailSpecs: React.FC<Props> = ({ load }) => {
  // Безопасное извлечение данных, так как структура грузов (Payloads) теперь лежит в массиве
  const payloads = load.payloads || [];
  const firstPayload = payloads.length > 0 ? payloads[0] : null;
  
  const weight = firstPayload?.weight ? `${firstPayload.weight} kg` : ((load as any).weight ? `${(load as any).weight} kg` : '24,000 kg');
  const volume = firstPayload?.volume ? `${firstPayload.volume} m³` : ((load as any).volume ? `${(load as any).volume} m³` : '82 m³');
  const vehicle = load.recommendedVehicle || (load as any).vehicle || 'Tautliner';
  const commodity = firstPayload?.type || ((load as any).cargo ? String((load as any).cargo).split('·')[0].trim() : 'General Cargo');
  const adr = load.adr ? `Class ${load.adr}` : 'None';
  const hsCode = load.hScode || '3402.20.90';
  const insurance = load.insurance ? `€ ${load.insurance.toLocaleString()}` : '€ 60,000';

  return (
    <div className="detail-card">
      <h3 className="dash-detail-specs-title">Cargo Specifications</h3>
      
      <div className="figma-specs-grid">
        
        <div className="spec-card">
          <div className="spec-label">Weight</div>
          <div className="spec-value">{weight}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Volume</div>
          <div className="spec-value">{volume}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Vehicle Type</div>
          <div className="spec-value">{vehicle}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Commodity</div>
          <div className="spec-value">{commodity}</div>
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
          <div className="spec-label">ADR</div>
          <div className="spec-value">{adr}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Insured value</div>
          <div className="spec-value">{insurance}</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">HS code</div>
          <div className="spec-value">{hsCode}</div>
        </div>

      </div>
    </div>
  );
};