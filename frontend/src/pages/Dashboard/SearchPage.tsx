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

  useEffect(() => {
    const fetchLoads = async () => {
      setIsLoading(true);
      try {
        const data = await loadsService.getAllLoads();
        const safeData = Array.isArray(data) ? data : [];
        setLoads(safeData);
        if (safeData.length > 0) setSelectedLoadId(safeData[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoads();
  }, []);

  const filteredLoads = useMemo(() => {
    if (!Array.isArray(loads)) return [];
    if (!searchQuery.trim()) return loads;
    const query = searchQuery.toLowerCase();
    return loads.filter((load) => 
      load.from.toLowerCase().includes(query) ||
      load.to.toLowerCase().includes(query) ||
      load.cargo.toLowerCase().includes(query) ||
      load.id.toLowerCase().includes(query)
    );
  }, [loads, searchQuery]);

  const selectedLoad = useMemo(() => {
    if (!Array.isArray(loads)) return null;
    return loads.find(l => l.id === selectedLoadId) || null;
  }, [loads, selectedLoadId]);

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="dashboard" />
      
      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-breadcrumb">
            Marketplace <strong>› Search</strong>
          </div>
          <div className="dash-header-right">
            <input 
              type="text" 
              className="dash-search" 
              placeholder="Search by city, ID or cargo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="dash-post-btn" onClick={() => onNavigate('create-load')}>+ Post load</button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <FilterBar />

        <div className="dash-content">
          <div className="dash-table-area">
            <div className="dash-stats-bar">
              <div>
                <div className="dash-stat-number">
                  {filteredLoads.length} <span>loads</span>
                  <span className="dash-stat-growth">↑ 124 new</span>
                </div>
              </div>
              {/* Сортировка "Sort by" удалена отсюда */}
            </div>

            {isLoading ? (
              <div className="dash-loading-container">⏳ Loading available loads...</div>
            ) : filteredLoads.length === 0 ? (
              <div className="dash-loading-container">No loads found matching your search.</div>
            ) : (
              <LoadsTable 
                loads={filteredLoads} 
                selectedId={selectedLoadId}
                onSelect={setSelectedLoadId}
                onNavigateDetails={(id) => onNavigate('load-detail', { loadId: id, fromPage: 'dashboard' })}
              />
            )}
          </div>
          
          {selectedLoad && (
            <MapPanel 
              load={selectedLoad} 
              onNavigate={(page, payload) => onNavigate(page, payload)}
            />
          )}
        </div>
      </main>
    </div>
  );
};