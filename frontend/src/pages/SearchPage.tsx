import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadsTable } from '../components/UI/LoadsTable';
import { MapPanel } from '../components/UI/MapPanel';
import { FilterBar } from '../components/UI/FilterBar';
import { loadsService } from '../services/loadsService';
import type { LoadData } from '../utils/types';
import type { LoadListVm } from '../api/types';

const SearchPage: React.FC = () => {
  const [loads, setLoads] = useState<LoadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [filters, setFilters] = useState({ from: '', to: '', date: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoads = async () => {
      setIsLoading(true);
      try {
        const loadList: LoadListVm[] = await loadsService.getAllLoads({ 
          SearchWord: searchQuery,
          StartCity: filters.from,
          EndCity: filters.to,
          MinStartDate: filters.date || undefined
        });
        
        const mappedLoads: LoadData[] = loadList.map(l => ({
          id: l.id,
          from: l.startCity || '',
          to: l.endCity || '',
          dateStart: l.startDate || '',
          dateEnd: '',
          vehicle: '',
          weight: l.totalWeight,
          price: l.payment,
          status: 'active'
        }));
        
        setLoads(mappedLoads);
        if (mappedLoads.length > 0 && !selectedLoadId) {
          setSelectedLoadId(mappedLoads[0].id);
        }
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

  const handleNavigateDetails = (id: string) => {
    navigate(`/orders/${id}`);
  };

  return (
    <>
      <header className="create-header" style={{ padding: '16px 48px' }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
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
          <button className="btn-figma-primary" onClick={() => navigate('/orders/create')}>+ Post load</button>
          <div className="dash-notify">🔔</div>
        </div>
      </header>

      <FilterBar onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />

      <div className="dash-content">
        <div className="dash-table-area">
          <div className="dash-stats-bar">
            <div>
              <div className="dash-stat-number">
                {loads.length} <span>loads</span>
                <span className="dash-stat-growth">↑ {loads.length > 0 ? 'new' : ''}</span>
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
              onNavigateDetails={handleNavigateDetails}
            />
          )}
        </div>
        
        {selectedLoad && (
          <MapPanel 
            load={selectedLoad} 
            onNavigate={(page, payload) => {
              if (page === 'load-detail' && payload?.loadId) {
                navigate(`/orders/${payload.loadId}`);
              } else if (page === 'dashboard') {
                navigate('/orders');
              }
            }}
          />
        )}
      </div>
    </>
  );
};

export default SearchPage;
