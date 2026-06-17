import React from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailSpecs: React.FC<Props> = ({ load }) => {
  // Высчитываем реальные цифровые метрики из массива payloads бэкенда
  let totalItems = 0;
  let totalVolume = load.volume || 0; 
  let floorFootprint = 0;
  let totalWeight = load.weight || 0;

  if (load.payloads && load.payloads.length > 0) {
    let calcVol = 0;
    let calcWeight = 0;
    load.payloads.forEach(pkg => {
      const q = Number(pkg.amount) || 0;
      const l = Number(pkg.length) || 0;
      const wid = Number(pkg.width) || 0;
      const h = Number(pkg.height) || 0;
      const w = Number(pkg.weight) || 0;

      totalItems += q;
      calcVol += (l * wid * h * q);
      floorFootprint += (l * wid * q);
      calcWeight += (w * q);
    });
    if (!totalVolume) totalVolume = calcVol;
    if (!totalWeight) totalWeight = calcWeight;
  }

  // Расчёт LDM и перевод килограммов в тонны
  const calculatedLdm = floorFootprint > 0 ? (floorFootprint / 2.4).toFixed(1) : '0.0';
  const weightInTons = totalWeight > 0 ? (totalWeight / 1000).toFixed(1) : '0.0';
  
  // Собираем типы грузов без дубликатов
  const commodity = load.payloads && load.payloads.length > 0 
    ? Array.from(new Set(load.payloads.map(p => p.type).filter(Boolean))).join(' • ')
    : (load.cargo || 'General Cargo');

  const vehicle = load.recommendedVehicle || 'Any';
  const adr = load.adr ? `Class ${load.adr}` : 'None';
  const hsCode = load.hScode || 'None';
  const insurance = load.insurance ? `€ ${load.insurance.toLocaleString('en-US')}` : 'Not insured';

  return (
    <div className="detail-card">
      {/* Переименовали заголовок строго по макету */}
      <h3 className="dash-detail-specs-title">Cargo Details</h3>
      
      {/* Твоя оригинальная сетка для квадратных блоков под цифры */}
      <div className="figma-specs-grid">
        
        <div className="spec-card">
          <div className="spec-label">Total mass</div>
          <div className="spec-value">{weightInTons} t</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Total volume</div>
          <div className="spec-value">{totalVolume > 0 ? totalVolume.toFixed(1) : '0.0'} m³</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Loading metres</div>
          <div className="spec-value">{calculatedLdm} LDM</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Floor footprint</div>
          <div className="spec-value">{floorFootprint > 0 ? floorFootprint.toFixed(1) : '0.0'} m²</div>
        </div>

        <div className="spec-card">
          <div className="spec-label">Total items</div>
          <div className="spec-value">{totalItems} units</div>
        </div>

      </div>

      {/* Текстовые поля выводятся аккуратно ниже сетки */}
      <div style={{ display: 'flex', gap: '48px', borderTop: '1px solid #E6E8EE', paddingTop: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>Cargo type</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{commodity}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>Vehicle type</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{vehicle}</div>
        </div>

        <div>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>ADR</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{adr}</div>
        </div>

        <div>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>Insured value</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{insurance}</div>
        </div>

        <div>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>HS code</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{hsCode}</div>
        </div>
      </div>

      {/* Блок описания выводится снизу, забирая текст из about */}
      {load.about && (
        <div style={{ borderTop: '1px solid #E6E8EE', paddingTop: '20px', marginTop: '20px' }}>
          <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '8px' }}>Description</div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#0E1116', whiteSpace: 'pre-wrap' }}>
            {load.about}
          </div>
        </div>
      )}

    </div>
  );
};