import React from 'react';
import type { LoadListVm } from '../../api/types';

interface LoadsTableProps {
  loads: LoadListVm[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNavigateDetails: (id: string) => void;
}

export const LoadsTable: React.FC<LoadsTableProps> = ({ 
  loads, 
  selectedId, 
  onSelect, 
  onNavigateDetails 
}) => {
  return (
    <table className="loads-table figma-table">
      <thead>
        <tr>
          <th style={{ paddingLeft: '24px' }}>ID</th>
          <th>Lane</th>
          <th>Date</th>
          <th>Cargo</th>
          <th>Vehicle</th>
          <th>Price</th>
          <th>Match</th>
          <th style={{ paddingRight: '24px' }}></th>
        </tr>
      </thead>
      <tbody>
        {loads.map((load) => {
          // ИСПРАВЛЕНО: Убран any, добавлена строгая промежуточная типизация
          const loadData = load as unknown as { startCity?: string; from?: string; endCity?: string; to?: string; company?: string; companyName?: string };
          
          const startCity = loadData.startCity || loadData.from || 'Origin';
          const endCity = loadData.endCity || loadData.to || 'Destination';
          const company = loadData.company || loadData.companyName || 'Verified Shipper';
          
          return (
            <tr 
              key={load.id} 
              onClick={() => onSelect(load.id)}
              onDoubleClick={() => onNavigateDetails(load.id)}
              className={selectedId === load.id ? 'selected' : ''}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ paddingLeft: '24px' }}>
                <span className="load-id">{load.id.substring(0, 8).toUpperCase()}</span>
                <div className="load-company" style={{ fontSize: '12px', color: '#5C6470', marginTop: '4px' }}>{company}</div>
              </td>
              <td>
                <div className="route-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="route-from" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                    <div className="route-dot-blue" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3D5AFE' }}></div> {startCity}
                  </div>
                  <div className="route-to" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#5C6470' }}>
                    <div className="route-dot-green" style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #059669' }}></div> {endCity}
                  </div>
                </div>
              </td>
              <td className="date-cell" style={{ color: '#5C6470' }}>
                 {load.dateStart ? new Date(load.dateStart).toLocaleDateString() : 'Flexible'}
              </td>
              <td><span className="cargo-tag" style={{ background: '#F6F7FB', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>{load.cargo || 'General'}</span></td>
              <td><span className="vehicle-tag" style={{ color: '#5C6470', fontSize: '13px' }}>{load.recommendedVehicle || 'Tautliner'}</span></td>
              <td className="price-cell" style={{ fontWeight: 600, color: '#0E1116' }}>€{load.price || 'Offer'}</td>
              <td>
                 <span style={{ background: '#ECFDF5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>
                   98%
                 </span>
              </td>
              <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                <button 
                  className="more-btn"
                  style={{ background: 'transparent', border: 'none', fontSize: '18px', color: '#A0AAB9', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateDetails(load.id);
                  }}
                >
                  ⋯
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};