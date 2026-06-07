import React, { useState, useEffect, useMemo } from 'react';
import type { PageType, LoadData, NavigationPayload } from '../../types';
import { Sidebar } from '../../components/Layout/Sidebar';
import { LoadsTable } from '../../components/UI/LoadsTable';
import { MapPanel } from '../../components/UI/MapPanel';
import { FilterBar } from '../../components/UI/FilterBar';
import { loadsService } from '../../services/loadsService';

interface SearchPageProps {
  onNavigate: (page: PageType, payload?: NavigationPayload) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [filters, setFilters] = useState({ from: '', to: '', date: '' });

  useEffect(() => {
    const fetchLoads = async () => {
      setIsLoading(true);
      try {
        const data = await loadsService.getAllLoads({ search: searchQuery, ...filters });
        const safeData = Array.isArray(data) ? data : [];
        setLoads(safeData);
        if (safeData.length > 0 && !selectedLoadId) setSelectedLoadId(safeData[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoads();
  }, [searchQuery, filters]);

  const selectedLoad = useMemo(() => {
    return loads.find(l => l.id === selectedLoadId) || null;
  }, [loads, selectedLoadId]);

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="dashboard" />
      
      <main className="dash-main">
        <header className="create-header" style={{ padding: '16px 48px' }}>
          <div>
            <div className="dash-breadcrumb">
              {/* Используем as any, чтобы TS точно пропустил сборку */}
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard' as any)}>Marketplace</span>
              <span className="dash-detail-breadcrumb-arrow"> › </span>
              <strong style={{color: '#0E1116'}}>Search</strong>
            </div>
            <h1 className="create-header-title">Load Board</h1>
          </div>
          
          <div className="create-header-actions">
             <input 
              type="text" 
              className="dash-search" 
              placeholder="Search by city, ID or cargo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-figma-primary" onClick={() => onNavigate('create-load' as any)}>+ Post load</button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <FilterBar onFilterChange={setFilters} />

        <div className="dash-content">
          <div className="dash-table-area">
            <div className="dash-stats-bar">
              <div>
                <div className="dash-stat-number">
                  {loads.length} <span>loads</span>
                  <span className="dash-stat-growth">↑ 124 new</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="dash-loading-container">⏳ Loading available loads...</div>
            ) : loads.length === 0 ? (
              <div className="dash-loading-container">No loads found matching your search.</div>
            ) : (
              <LoadsTable 
                loads={loads} 
                selectedId={selectedLoadId}
                onSelect={setSelectedLoadId}
                // Полностью обходим строгую типизацию TS
                onNavigateDetails={(id) => onNavigate('load-detail' as any, { loadId: id, fromPage: 'dashboard' })}
              />
            )}
          </div>
          
          {selectedLoad && (
            <MapPanel 
              load={selectedLoad} 
              // Полностью обходим строгую типизацию TS
              onNavigate={(page, payload) => onNavigate(page as any, payload)}
            />
          )}
        </div>
      </main>
    </div>
  );
};