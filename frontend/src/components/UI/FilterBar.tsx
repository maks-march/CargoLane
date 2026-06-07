import React, { useState } from 'react';
import { loadsService } from '../../services/loadsService';

interface FilterBarProps {
  onFilterChange?: (filters: { from: string; to: string; date: string }) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({ from: '', to: '', date: '' });
  const [suggestions, setSuggestions] = useState<{ from: string[], to: string[] }>({ from: [], to: [] });

  const handleCityInput = async (type: 'from' | 'to', value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);

    if (value.length > 0) {
      const cities = await loadsService.getCities(value);
      setSuggestions(prev => ({ ...prev, [type]: cities }));
    } else {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
    }
  };

  const selectCity = (type: 'from' | 'to', city: string) => {
    const newFilters = { ...filters, [type]: city };
    setFilters(newFilters);
    setSuggestions(prev => ({ ...prev, [type]: [] }));
    if (onFilterChange) onFilterChange(newFilters);
  };

  return (
    // Обертка с классом от MyListingsPage для белого фона и теней
    <div className="my-listings-toolbar-card" style={{ margin: '0 48px 24px 48px' }}>
      <div className="filter-bar" style={{ display: 'flex', gap: '10px' }}>
        
        <div style={{ position: 'relative' }}>
          <input 
            className="figma-input" 
            placeholder="From" 
            value={filters.from} 
            onChange={(e) => handleCityInput('from', e.target.value)} 
            style={{ width: '140px' }}
          />
          {suggestions.from.length > 0 && (
            <div className="autocomplete-dropdown">{suggestions.from.map(c => <div key={c} onClick={() => selectCity('from', c)}>{c}</div>)}</div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <input 
            className="figma-input" 
            placeholder="To" 
            value={filters.to} 
            onChange={(e) => handleCityInput('to', e.target.value)} 
            style={{ width: '140px' }}
          />
          {suggestions.to.length > 0 && (
            <div className="autocomplete-dropdown">{suggestions.to.map(c => <div key={c} onClick={() => selectCity('to', c)}>{c}</div>)}</div>
          )}
        </div>

        {/* Дата с принудительным английским плейсхолдером (через стили или фокус) */}
        <input 
            className="figma-input" 
            placeholder="Date" 
            type="date" 
            onChange={(e) => { const f = {...filters, date: e.target.value}; setFilters(f); if(onFilterChange) onFilterChange(f); }} 
            style={{ width: '120px' }} 
        />
        
        <input className="figma-input" placeholder="Cargo type" style={{ width: '140px' }} />
        <input className="figma-input" placeholder="Mass" style={{ width: '100px' }} />
      </div>
    </div>
  );
};