import React, { useState, useEffect } from 'react';
import type { PageType, LoadData } from '../../types';
import { Sidebar } from '../../components/Layout/Sidebar';
import { FilterBar } from '../../components/UI/FilterBar';
import { LoadsTable } from '../../components/UI/LoadsTable';
import { MapPanel } from '../../components/UI/MapPanel';
import { loadsService } from '../../services/loadsService';

interface SearchPageProps {
  onNavigate: (page: PageType, payload?: { loadId?: string }) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoads = async () => {
      setIsLoading(true);
      const data = await loadsService.getAllLoads();
      setLoads(data);
      setIsLoading(false);
    };
    fetchLoads();
  }, []);

  const handleNavigateDetails = (id: string) => {
    onNavigate('load-detail', { loadId: id });
  };

  const selectedLoad = loads.find(load => load.id === selectedLoadId) || null;

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="dashboard" />
      
      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-breadcrumb">
            Marketplace <span style={{ color: '#ccc' }}>›</span> <strong>Search</strong>
          </div>
          <div className="dash-header-right">
            <input type="text" className="dash-search" placeholder="🔍 Search lanes, cargo, ID..." />
            <button className="dash-post-btn">+ Post load</button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>
        
        <FilterBar />
        
        <div className="dash-content">
          <div className="dash-table-area">
            <div className="dash-stats-bar">
              <div>
                <span className="dash-stat-number">
                  {loads.length.toLocaleString()} <span>matching loads</span>
                </span>
                <span className="dash-stat-growth">+12% today</span>
              </div>
              <div className="dash-sort">
                Sort
                <select defaultValue="Best match" style={{ padding: '6px 12px', border: '1px solid #eee', borderRadius: '6px', fontSize: '14px', outline: 'none', background: 'white' }}>
                  <option>Best match</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#888' }}>⏳ Connecting...</div>
            ) : (
              <LoadsTable 
                loads={loads} 
                selectedId={selectedLoadId}
                onSelect={(id) => setSelectedLoadId(id)}
                onNavigateDetails={handleNavigateDetails}
              />
            )}
          </div>
          
          <MapPanel 
            loadsCount={loads.length} 
            selectedLoad={selectedLoad} 
            onViewDetails={handleNavigateDetails} 
          />
        </div>
      </main>
    </div>
  );
};