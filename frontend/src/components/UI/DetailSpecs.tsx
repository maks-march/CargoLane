import React from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailSpecs: React.FC<Props> = ({ load }) => {
  // Высчитываем реальные цифровые метрики из массива payloads бэкенда
  let totalItems = 0;
  let totalVolume = load.totalVolume || 0; 
  let floorFootprint = 0;
  let totalWeight = load.totalWeight || 0;

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

  // Функция для вывода чисел без нулей на конце (20.0 -> 20)
  const formatNum = (num: number) => {
    return Number.isInteger(num) ? num.toString() : Number(num.toFixed(1)).toString();
  };

  // Расчёт метрик
  const calculatedLdmStr = floorFootprint > 0 ? formatNum(floorFootprint / 2.4) : '0';
  const weightInTonsStr = totalWeight > 0 ? formatNum(totalWeight / 1000) : '0';
  const floorFootprintStr = formatNum(floorFootprint);
  const totalVolumeStr = formatNum(totalVolume);
  
  // Собираем типы грузов без дубликатов
  const commodity = load.payloads && load.payloads.length > 0 
    ? Array.from(new Set(load.payloads.map(p => p.type).filter(Boolean))).join(' • ')
    : (load.cargoType || 'General Cargo');

  // Читаем vehicleTypes из бэкенда строго по контракту Swagger
  const vehicle = load.vehicleTypes?.[0] || 'Any';
  
  const adr = load.adr ? `Class ${load.adr}` : 'None';
  const hsCode = load.hScode || 'None';
  const insurance = load.insurance ? `€ ${load.insurance.toLocaleString('en-US')}` : 'Not insured';

  return (
    <>
      {/* Основной блок характеристик груза */}
      <div className="detail-card">
        <h3 className="dash-detail-specs-title">Cargo Details</h3>
        
        <div className="figma-specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          
          {/* === ПЕРВЫЙ РЯД (Цифры) === */}
          <div className="spec-card">
            <div className="spec-label">Total weight</div>
            <div className="spec-value" style={{ fontSize: '24px', marginTop: '4px' }}>{weightInTonsStr} t</div>
            {load.payloads && load.payloads.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {load.payloads.map((pkg, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: '#5C6470' }}>
                    {pkg.amount || 0} x {pkg.weight || 0} kg
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="spec-card">
            <div className="spec-label">Total volume</div>
            <div className="spec-value" style={{ fontSize: '24px', marginTop: '4px' }}>{totalVolumeStr} m³</div>
            <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '8px' }}>
              {totalItems} {commodity}
            </div>
          </div>

          <div className="spec-card">
            <div className="spec-label">Loading metres</div>
            <div className="spec-value" style={{ fontSize: '24px', marginTop: '4px' }}>{calculatedLdmStr} LDM</div>
            <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '8px' }}>
              {floorFootprintStr} / 2.4 m
            </div>
          </div>

          <div className="spec-card">
            <div className="spec-label">Floor footprint</div>
            <div className="spec-value" style={{ fontSize: '24px', marginTop: '4px' }}>{floorFootprintStr} m²</div>
            {load.payloads && load.payloads.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {load.payloads.map((pkg, idx) => {
                  const l = pkg.length || 0;
                  const w = pkg.width || 0;
                  const q = pkg.amount || 0;
                  if (l > 0 || w > 0 || q > 0) {
                    return (
                      <div key={idx} style={{ fontSize: '13px', color: '#5C6470' }}>
                        {formatNum(l)} x {formatNum(w)} x {q} m
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="spec-card">
            <div className="spec-label">Total items</div>
            <div className="spec-value" style={{ fontSize: '24px', marginTop: '4px' }}>{totalItems} units</div>
          </div>

          {/* === ВТОРОЙ РЯД (Текстовые значения) === */}
          <div className="spec-card">
            <div className="spec-label">Cargo type</div>
            <div className="spec-value" style={{ fontSize: '20px', marginTop: '4px', lineHeight: '1.2' }}>{commodity}</div>
          </div>
          
          <div className="spec-card">
            <div className="spec-label">Vehicle type</div>
            <div className="spec-value" style={{ fontSize: '20px', marginTop: '4px', lineHeight: '1.2' }}>{vehicle}</div>
          </div>

          <div className="spec-card">
            <div className="spec-label">ADR</div>
            <div className="spec-value" style={{ fontSize: '20px', marginTop: '4px', lineHeight: '1.2' }}>{adr}</div>
          </div>

          <div className="spec-card">
            <div className="spec-label">Insured value</div>
            <div className="spec-value" style={{ fontSize: '20px', marginTop: '4px', lineHeight: '1.2' }}>{insurance}</div>
          </div>

          <div className="spec-card">
            <div className="spec-label">HS code</div>
            <div className="spec-value" style={{ fontSize: '20px', marginTop: '4px', lineHeight: '1.2' }}>{hsCode}</div>
          </div>

        </div>
      </div>

      {/* Описание */}
      {load.about && (
        <div className="detail-card">
          <h3 className="dash-detail-specs-title">Description</h3>
          <div style={{ 
            padding: '16px', 
            background: '#F6F7FB', 
            borderRadius: '8px', 
            fontSize: '14px', 
            lineHeight: '1.6', 
            color: '#0E1116', 
            whiteSpace: 'pre-wrap',
            border: '1px solid #E6E8EE'
          }}>
            {load.about}
          </div>
        </div>
      )}
    </>
  );
};