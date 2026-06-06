import React from 'react';

export const FilterBar: React.FC = () => {
  return (
    <div className="dash-filters-card">
      <div className="filter-select-wrapper">
        <span className="filter-label">From</span>
        <select className="filter-select">
          <option>Any</option>
          <option>Rotterdam</option>
          <option>Berlin</option>
          <option>Paris</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>

      <button className="filter-btn-arrow">→</button>

      <div className="filter-select-wrapper">
        <span className="filter-label">To</span>
        <select className="filter-select">
          <option>Any</option>
          <option>Warsaw</option>
          <option>Milan</option>
          <option>Madrid</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>

      <div className="filter-select-wrapper">
        <span className="filter-label">Date</span>
        <select className="filter-select">
          <option>Any</option>
          <option>Today</option>
          <option>This Week</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>

      <div className="filter-select-wrapper">
        <span className="filter-label">Cargo type</span>
        <select className="filter-select">
          <option>Any</option>
          <option>Pallets</option>
          <option>Boxes</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>

      <div className="filter-select-wrapper">
        <span className="filter-label">Mass</span>
        <select className="filter-select">
          <option>Any</option>
          <option>&lt; 5t</option>
          <option>5t - 20t</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>

      <div className="filter-select-wrapper">
        <span className="filter-label">Vehicle</span>
        <select className="filter-select">
          <option>Any</option>
          <option>Tautliner</option>
          <option>Mega trailer</option>
        </select>
        <span className="filter-select-arrow">▼</span>
      </div>
    </div>
  );
};