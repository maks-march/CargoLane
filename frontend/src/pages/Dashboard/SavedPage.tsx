import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';
import type { LoadListVm } from '../../api/types';

interface LoadSearchFilters {
  query?: string;
  startCity?: string;
  endCity?: string;
  fromDate?: string;
  cargoType?: string;
  weight?: string;
  volume?: string;
  vehicleType?: string;
  sortChoices?: number;
  isDescending?: boolean;
}

const formatMonthDay = (dateStr?: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();

  // ИСПРАВЛЕНО: Строгий тип из Сваггера
  const [loads, setLoads] = useState<LoadListVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState<LoadListVm | null>(null);
  const [mapData, setMapData] = useState({ distance: '0', duration: '0h 0m' });

  const [filters, setFilters] = useState<LoadSearchFilters>({
    query: '', startCity: '', endCity: '', fromDate: '', cargoType: '', weight: '', volume: '', vehicleType: '', sortChoices: 0, isDescending: false
  });

  useEffect(() => {
    const fetchSavedLoads = async () => {
      setIsLoading(true);
      try {
        const data = await loadsService.getSavedLoads();

        if (data) {
          // ИСПРАВЛЕНО: Прямое использование данных без костылей
          setLoads(data);
          
          setSelectedLoad((prevLoad) => {
            if (prevLoad && !data.find((l) => l.id === prevLoad.id)) {
              return null;
            }
            return prevLoad;
          });
        }
      } catch (error: unknown) {
        console.error("Backend API failed:", error);
        setLoads([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedLoads();
  }, [filters]); 

  const handleViewDetails = (loadId: string) => {
    navigate(`/orders/${loadId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: '#F6F7FB' }}>
      
      <header className="dash-header" style={{ padding: '16px 32px', borderBottom: '1px solid #E6E8EE', background: 'white', flexShrink: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: '#A0AAB9', cursor: 'default' }}>Workspace</span>
              <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px', color: '#E6E8EE' }}>›</span>
              <strong style={{ color: '#0E1116', fontWeight: 500 }}>Saved</strong>
            </div>
            <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', letterSpacing:'-1px',marginTop: '4px' }}>Saved loads</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '800px', marginLeft: '32px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AAB9' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search saved loads..." 
                value={filters.query || ''}
                onChange={(e) => setFilters({...filters, query: e.target.value})}
                style={{ padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="split-layout-container">
        <div className="split-layout-left">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', color: '#5C6470' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginRight: '8px' }}>{loads.length}</span> 
              saved loads 
            </div>
          </div>

          <div style={{ flex: 1, overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Load</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Route</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Cargo</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Mass</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Volume</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E6E8EE', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>Loading saved loads...</td></tr>
                ) : loads.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>You haven't saved any loads yet.</td></tr>
                ) : (
                  loads.map((load, idx) => (
                    <tr 
                      key={idx} 
                      style={{ borderBottom: '1px solid #F6F7FB', cursor: 'pointer' }} 
                      className={selectedLoad?.id === load.id ? "table-row-selected" : "table-row-hover"}
                      onClick={() => setSelectedLoad(load)}
                      onDoubleClick={() => handleViewDetails(load.id)}
                    >
                      {/* КОЛОНКА 1: LOAD (ID + Company Name) */}
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0E1116' }}>{load.article || load.id.substring(0,8).toUpperCase()}</div>
                        <div style={{ fontSize: '12px', color: '#5C6470', marginTop: '4px' }}>{load.shipper || 'Verified Shipper'}</div>
                      </td>
                      
                      {/* КОЛОНКА 2: ROUTE */}
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#0E1116' }}>
                          {load.startCity || 'Origin'} <span style={{ color: '#A0AAB9' }}>→</span> {load.endCity || 'Destination'}
                        </div>
                      </td>

                      {/* КОЛОНКА 3: DATE */}
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116', fontWeight: 500 }}>
                        {formatMonthDay(load.startDate)}
                      </td>

                      {/* КОЛОНКИ 4, 5, 6: CARGO, MASS, VOLUME */}
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116' }}>{load.cargoType || 'General'}</td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116' }}>{load.totalWeight || 0} t</td>
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '14px', color: '#0E1116' }}>{load.totalVolume || 0} m³</td>
                      
                      {/* КОЛОНКА 7: VEHICLE (Все типы машин) */}
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {load.vehicleTypes?.map((v, i) => (
                            <span key={i} style={{ padding: '4px 10px', background: '#F6F7FB', color: '#5C6470', borderRadius: '6px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* КОЛОНКА 8: PRICE */}
                      <td style={{ padding: '16px', verticalAlign: 'top', fontSize: '16px', fontWeight: 600, color: '#0E1116', textAlign: 'right' }}>
                        €{(load.payment || 0).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="split-layout-right dash-map-panel">
          <div className="dash-map-header">
            <h3>Map preview</h3>
            <span className="dash-map-count">{loads.length} saved</span>
          </div>
          
          <div className="dash-map-container" style={{ background: '#E8F0E8', flex: 1 }}>
            {selectedLoad ? (
              <RoutingMap 
                stops={[
                  { address: selectedLoad.startCity?.split(',')[0] || 'Origin', type: 'start' },
                  { address: selectedLoad.endCity?.split(',')[0] || 'Destination', type: 'end' }
                ]}
                hideFloatingWidget={true}
                onRouteCalculated={(dist, dur) => setMapData({ distance: dist, duration: dur })}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AAB9' }}>Select a load to view map...</div>
            )}
          </div>

          <div className="dash-map-footer">
            <div className="dash-map-footer-label">Selected lane</div>
            <div className="dash-map-footer-route">
              {selectedLoad ? `${selectedLoad.startCity?.split(',')[0] || 'Origin'} → ${selectedLoad.endCity?.split(',')[0] || 'Destination'}` : 'Select a load'}
            </div>
            <div className="dash-map-footer-meta">
              {selectedLoad 
                ? `${mapData.distance} km • ~${mapData.duration} drive` 
                : `0 km • ~0h 0m drive`
              }
            </div>
          </div>
        </aside>

      </div>

      <style>{`
        .table-row-hover:hover { background-color: #FAFAFA !important; }
        .table-row-selected { background-color: #EEF1FF !important; }
        ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; }
        * { scrollbar-width: none; -ms-overflow-style: none; }

        .split-layout-container { display: flex; flex-direction: row; flex: 1; width: 100%; overflow: hidden; }
        .split-layout-left { flex: 1.5 1 600px !important; display: flex; flex-direction: column; background: white; padding: 24px 32px; overflow-y: auto; min-width: 0; min-height: 350px !important; }
        .split-layout-right { flex: 1 1 400px !important; display: flex; flex-direction: column; background: white; border-left: 1px solid #E6E8EE; min-height: 350px !important; }

        @media (max-width: 1200px) {
          .split-layout-container { flex-direction: column !important; overflow-y: auto !important; overflow-x: hidden !important; }
          .split-layout-left { flex: 1 0 400px !important; min-height: 400px !important; padding: 16px 32px !important; border-bottom: 1px solid #E6E8EE !important; width: 100% !important; max-width: 100% !important; }
          .split-layout-right { flex: 1 0 450px !important; min-height: 450px !important; width: 100% !important; max-width: 100% !important; border-left: none !important; }
        }
      `}</style>
    </div>
  );
};

export default SavedPage;