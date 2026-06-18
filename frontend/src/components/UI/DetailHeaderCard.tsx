import React from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailHeaderCard: React.FC<Props> = ({ load }) => {
  // Подсчет количества и выбор имени груза из БД
  let totalItems = 0;
  let payloadType = 'General Cargo';
  if (load.payloads && load.payloads.length > 0) {
    payloadType = load.payloads[0].type || 'General Cargo';
    load.payloads.forEach(pkg => {
      totalItems += Number(pkg.amount) || 0;
    });
  }
  const cargoPallets = totalItems > 0 ? `${totalItems} ${payloadType}` : payloadType;

  // Умное форматирование цены (без .00 если число круглое)
  let priceStr = 'Request price';
  if (load.price) {
    priceStr = load.price % 1 === 0 
      ? `€${load.price.toLocaleString('en-US')}` 
      : `€${load.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Транспорт берем из бэкенда с подстраховкой на разные варианты свойств API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadAny = load as any;
  const vehicleType = loadAny.vehicleTypes?.[0] || loadAny.vihicleTypes?.[0] || load.recommendedVehicle || 'Any';

  // Статистика СТРОГО ИЗ БАЗЫ ДАННЫХ
  const distanceVal = loadAny.distance ? `${loadAny.distance} km` : '0 km';
  const durationVal = loadAny.duration ? loadAny.duration : '0h 0m';
  const stopsCount = load.routePoints ? load.routePoints.length : 0;
  const stopsVal = stopsCount > 2 ? `${stopsCount - 1} + final` : (stopsCount === 2 ? '1 + final' : `${stopsCount}`);

  return (
    <div className="detail-card">
      <div className="detail-header-top">
        <div>       
          <h2 className="detail-title">
            {cargoPallets} <span style={{ color: 'rgb(160, 170, 185)', margin: '0 4px' }}>•</span> <span style={{ color: '#0E1116', fontWeight: 400 }}>{vehicleType}</span>
          </h2>  
          <p className="detail-subtitle">{load.id.substring(0, 8).toUpperCase()} · {load.companyName || 'Unknown Company'}</p>
        </div>
        <div className="detail-price">
          <div className="detail-price-value">{priceStr}</div>
        </div>
      </div>
      
      <div className="detail-stats-row">
        <div className="detail-stat">
          <div className="detail-stat-label">Distance</div>
          <div className="detail-stat-value">{distanceVal}</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Drive time</div>
          <div className="detail-stat-value">{durationVal}</div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Stops</div>
          <div className="detail-stat-value">{stopsVal}</div>
        </div>
      </div>
    </div>
  );
};
