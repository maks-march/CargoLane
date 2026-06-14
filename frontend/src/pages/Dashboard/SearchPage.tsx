import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';

interface LoadSearchFilters {
  query?: string;
  from?: string;
  to?: string;
  date?: string;
  cargoType?: string;
  mass?: string;
  volume?: string;
  vehicle?: string;
}

interface ExtendedLoadVm {
  id: string;
  from: string;
  to: string;
  dateStart: string;
  price: number;
  cargo: string;
  weight: number;
  recommendedVehicle: string;
  status: string;
  volumeStr?: string;
  matchPercent?: number;
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [loads, setLoads] = useState<ExtendedLoadVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState<ExtendedLoadVm | null>(null);
  const [mapData, setMapData] = useState({ distance: '0', duration: '0h 0m' });

  const [filters, setFilters] = useState<LoadSearchFilters>({
    query: '', from: '', to: '', date: '', cargoType: '', mass: '', volume: '', vehicle: ''
  });

  useEffect(() => {
    const fetchFilteredLoads = async () => {
      setIsLoading(true);
      try {
        let data;
        if (typeof loadsService.searchLoads === 'function') {
          data = await loadsService.searchLoads(filters);
        } else {
          data = await loadsService.getAllLoads();
        }

        if (data) {
          const mappedData = data.map((load: any) => ({
            ...load,
            volumeStr: load.volumeStr || '0 m³', 
            matchPercent: load.matchPercent || (Math.floor(Math.random() * 20) + 80)
          }));
          setLoads(mappedData);
          
          if (!mappedData.find((l: any) => l.id === selectedLoad?.id)) {
             setSelectedLoad(null); 
          }
        }
      } catch (error) {
        console.error("Backend Search API failed. Database is empty or server is down.");
        setLoads([]); 
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredLoads();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]); 

  const handleOpenChat = (e: React.MouseEvent, partnerId: string, loadId: string) => {
    e.stopPropagation(); 
    navigate(`/chat?partnerId=${partnerId}&loadId=${loadId}`);
  };

  const handleViewDetails = (loadId: string) => {
    navigate(`/load-details?loadId=${loadId}`);
  };

  // Возвращаем ТОЛЬКО контент страницы (без дублирования dashboard-page и dash-main)
  // КЛЮЧЕВАЯ ДОРАБОТКА: Возвращена высота 100vh и стили для флекс-контейнера на весь экран.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: '#F6F7FB' }}>
      
      <header className="dash-header" style={{ padding: '16px 32px', borderBottom: '1px solid #E6E8EE', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: '#A0AAB9', cursor: 'default' }}>Marketplace</span>
              <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px', color: '#E6E8EE' }}>›</span>
              <strong style={{ color: '#0E1116', fontWeight: 500 }}>Search</strong>
            </div>
            <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', letterSpacing:'-1px',marginTop: '4px' }}>Load board</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AAB9' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search lanes, cargo, ID..." 
                value={filters.query || ''}
                onChange={(e) => setFilters({...filters, query: e.target.value})}
                style={{ padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', width: '280px', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <button 
              className="btn-figma-primary" 
              onClick={() => navigate('/create-load')} 
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3D5AFE', color: 'white', fontWeight: 400, cursor: 'pointer' }}
            >
              + Post load
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', padding: '24px 32px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div className="filter-select-wrapper">
              <span className="filter-label">From:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.from || ''} onChange={(e) => setFilters({...filters, from: e.target.value})} style={{ width: '80px', padding: 0 }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">To:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.to || ''} onChange={(e) => setFilters({...filters, to: e.target.value})} style={{ width: '80px', padding: 0 }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">Date:</span>
              <input type="date" className="filter-select" placeholder="DD/MM/YYYY" value={filters.date || ''} onChange={(e) => setFilters({...filters, date: e.target.value})} style={{ padding: 0, color: filters.date ? '#0E1116' : '#A0AAB9' }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">Cargo type:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.cargoType || ''} onChange={(e) => setFilters({...filters, cargoType: e.target.value})} style={{ width: '80px', padding: 0 }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">Mass:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.mass || ''} onChange={(e) => setFilters({...filters, mass: e.target.value})} style={{ width: '60px', padding: 0 }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">Volume:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.volume || ''} onChange={(e) => setFilters({...filters, volume: e.target.value})} style={{ width: '60px', padding: 0 }} />
            </div>
            <div className="filter-select-wrapper">
              <span className="filter-label">Vehicle:</span>
              <input type="text" className="filter-select" placeholder="Any" value={filters.vehicle || ''} onChange={(e) => setFilters({...filters, vehicle: e.target.value})} style={{ width: '80px', padding: 0 }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', color: '#5C6470' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginRight: '8px' }}>{loads.length}</span> 
              matching loads 
            </div>
            <div style={{ fontSize: '13px', color: '#5C6470', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Sort
              <select style={{ background: 'transparent', fontWeight: 500, color: '#0E1116', outline: 'none', cursor: 'pointer', width:'95px', height:'40px',borderRadius: '15px', border:'1px solid #E6E8EE' }}>
                <option>Best match</option>
                <option>Newest first</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Load</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Route</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Cargo</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Mass</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Match</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E6E8EE' }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>Loading routes from database...</td></tr>
                ) : loads.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>No loads found. Waiting for backend data.</td></tr>
                ) : (
                  loads.map((load, idx) => (
                    <tr 
                      key={idx} 
                      style={{ borderBottom: '1px solid #F6F7FB', cursor: 'pointer' }} 
                      className={selectedLoad?.id === load.id ? "table-row-selected" : "table-row-hover"}
                      onClick={() => setSelectedLoad(load)}
                      onDoubleClick={() => handleViewDetails(load.id)}
                    >
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#5C6470' }}>{load.id}</div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#0E1116', marginBottom: '4px' }}>
                          <span style={{ width: '6px', height: '6px', background: '#3D5AFE', borderRadius: '50%', display: 'inline-block' }}></span> {load.from.split(',')[0]}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#0E1116' }}>
                          <span style={{ width: '6px', height: '6px', background: '#00C48C', borderRadius: '50%', display: 'inline-block' }}></span> {load.to.split(',')[0]}
                        </div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '13px', color: '#0E1116' }}>{load.dateStart}</td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116' }}>{load.cargo}</td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116' }}>{load.weight} t</td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <span style={{ padding: '4px 10px', background: '#F6F7FB', color: '#5C6470', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>{load.recommendedVehicle}</span>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '16px', fontWeight: 600, color: '#0E1116' }}>
                        €{load.price.toLocaleString('en-US')}
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '40px', height: '4px', background: '#E6E8EE', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${load.matchPercent}%`, background: (load.matchPercent || 0) > 90 ? '#00C48C' : '#3D5AFE', borderRadius: '2px' }}></div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#5C6470' }}>{load.matchPercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => handleOpenChat(e, 'system_id', load.id)}
                          style={{ background: 'none', border: 'none', color: '#A0AAB9', cursor: 'pointer', fontSize: '18px' }}
                          title="Open chat"
                        >
                          💬
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="dash-map-panel">
          <div className="dash-map-header">
            <h3>Map preview</h3>
            <span className="dash-map-count">{loads.length} loads</span>
          </div>
          
          <div className="dash-map-container" style={{ background: '#E8F0E8' }}>
            {selectedLoad ? (
              <RoutingMap 
                stops={[
                  { address: selectedLoad.from.split(',')[0], type: 'start' },
                  { address: selectedLoad.to.split(',')[0], type: 'end' }
                ]}
                hideFloatingWidget={true}
                onRouteCalculated={(dist, dur) => setMapData({ distance: dist, duration: dur })}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AAB9' }}>Map waiting for data...</div>
            )}
          </div>

          <div className="dash-map-footer">
            <div className="dash-map-footer-label">Selected lane</div>
            <div className="dash-map-footer-route">
              {selectedLoad ? `${selectedLoad.from.split(',')[0]} → ${selectedLoad.to.split(',')[0]}` : 'Select a load'}
            </div>
            <div className="dash-map-footer-meta">
              {selectedLoad 
                ? `${mapData.distance} km • 2 stops • ~${mapData.duration} drive` 
                : `0 km • ~0h 0m drive`
              }
            </div>
          </div>
        </aside>

      </div>

      <style>{`
        .table-row-hover:hover { background-color: #FAFAFA !important; }
        .table-row-selected { background-color: #EEF1FF !important; }
      `}</style>
    </div>
  );
};

export default SearchPage;