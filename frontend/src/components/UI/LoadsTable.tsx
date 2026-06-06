import React from 'react';
import type { LoadData } from '../../types';

interface LoadsTableProps {
  loads: LoadData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNavigateDetails: (id: string) => void;
}

export const LoadsTable: React.FC<LoadsTableProps> = ({ loads, selectedId, onSelect, onNavigateDetails }) => {
  return (
    <table className="loads-table">
      <thead>
        <tr>
          <th>Load</th>
          <th>Route</th>
          <th>Date</th>
          <th>Cargo</th>
          <th>Mass</th>
          <th>Volume</th>
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
            className={selectedId === load.id ? "selected" : ""} 
            onClick={() => onSelect(load.id)} 
            onDoubleClick={() => onNavigateDetails(load.id)}
            style={{ cursor: 'pointer' }}
          >
            <td>
              <div className="load-id">{load.id}</div>
              <div className="load-company">{load.company}</div>
            </td>
            <td>
              <div className="route-info">
                <div className="route-from"><span className="route-dot-blue"></span> {load.from}</div>
                <div className="route-to"><span className="route-dot-green"></span> {load.to}</div>
                {load.extraRoute && <div className="route-extra">{load.extraRoute}</div>}
              </div>
            </td>
            <td className="date-cell">
              {load.dateStart} {load.dateEnd && <><span className="date-arrow">→</span> {load.dateEnd}</>}
            </td>
            <td><span className="cargo-tag">{load.cargo}</span></td>
            <td>{load.mass}</td>
            <td>{load.volume}</td>
            <td><span className="vehicle-tag">{load.vehicle}</span></td>
            <td className="price-cell">{load.price}</td>
            <td>
              <div className="match-bar">
                <div className="match-progress">
                  <div 
                    className={`match-progress-fill ${load.match >= 90 ? 'match-high' : 'match-mid'}`} 
                    style={{ width: `${load.match}%` }}
                  ></div>
                </div>
                <span className="match-text">{load.match}%</span>
              </div>
            </td>
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