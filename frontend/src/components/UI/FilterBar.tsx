import React from 'react';

export const FilterBar: React.FC = () => {
  return (
    <div className="dash-filters">
      <button className="filter-btn">From <strong>Any</strong> ▾</button>
      <button className="filter-btn">→</button>
      <button className="filter-btn">To <strong>Any</strong> ▾</button>
      <button className="filter-btn">Date <strong>Any</strong> ▾</button>
      <button className="filter-btn">Cargo type <strong>Any</strong> ▾</button>
      <button className="filter-btn">Mass <strong>Any</strong> ▾</button>
      <button className="filter-btn">Volume <strong>Any</strong> ▾</button>
      <button className="filter-btn">Vehicle <strong>Any</strong> ▾</button>
    </div>
  );
};