import React from 'react';
import type { LoadData, PageType, NavigationPayload } from '../../types';

interface LoadsTableProps {
  loads: LoadData[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNavigateDetails: (id: string) => void;
  onNavigate?: (page: PageType, payload?: NavigationPayload) => void;
}

export const LoadsTable: React.FC<LoadsTableProps> = ({ 
  loads, 
  selectedId, 
  onSelect, 
  onNavigateDetails 
}) => {
  return (
    <table className="loads-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Lane</th>
          <th>Date</th>
          <th>Cargo</th>
          <th>Vehicle</th>
          <th>Price</th>
          <th>Match</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {loads.map((load) => (
          <tr 
            key={load.id} 
            onClick={() => onSelect(load.id)}
            onDoubleClick={() => onNavigateDetails(load.id)}
            className={selectedId === load.id ? 'selected' : ''}
            style={{ cursor: 'pointer' }}
          >
            <td>
              <span className="load-id">{load.id}</span>
              <div className="load-company">{load.company}</div>
            </td>
            <td>
              <div className="route-info">
                <div className="route-from">
                  <div className="route-dot-blue"></div> {load.from}
                </div>
                <div className="route-to">
                  <div className="route-dot-green"></div> {load.to}
                </div>
              </div>
            </td>
            <td className="date-cell">{load.dateStart}</td>
            <td><span className="cargo-tag">{load.cargo}</span></td>
            <td><span className="vehicle-tag">{load.vehicle}</span></td>
            <td className="price-cell">{load.price}</td>
            <td>{load.match}%</td>
            <td>
              <button 
                className="more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateDetails(load.id);
                }}
              >
                ⋯
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};