import React, { useEffect, useState } from 'react';
import type { PageType, LoadData, NavigationPayload } from '../../types';
import { Sidebar } from '../../components/Layout/Sidebar';
import { loadsService } from '../../services/loadsService';
import { DetailHeaderCard } from '../../components/UI/DetailHeaderCard';
import { DetailRouteMap } from '../../components/UI/DetailRouteMap';
import { DetailSpecs } from '../../components/UI/DetailSpecs';
import { DetailRightPanel } from '../../components/UI/DetailRightPanel';

interface LoadDetailPageProps {
  onNavigate: (page: PageType, payload?: NavigationPayload) => void;
  loadId?: string | null;
  fromPage?: string; 
}

export const LoadDetailPage: React.FC<LoadDetailPageProps> = ({ onNavigate, loadId, fromPage }) => {
  const [load, setLoad] = useState<LoadData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });

  useEffect(() => {
    const fetchLoad = async () => {
      if (!loadId) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const allLoads = await loadsService.getAllLoads();
        let found = allLoads.find(l => l.id === loadId);
        
        if (!found && loadId.startsWith('CL-')) {
          found = {
            id: loadId, company: 'Nordhafen', from: 'Rotterdam', to: 'Warsaw',
            dateStart: 'May 12 • 08:00', cargo: 'FMCG · 22 plt', mass: '22 t',
            volume: '60 m³', vehicle: 'Tautliner trailer', price: '€ 1,840', match: 100
          };
        } else if (!found) {
          found = allLoads[0]; 
        }
        setLoad(found);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [loadId]);

  if (isLoading || !load) return <div />;

  return (
    <div className="load-detail-page active">
      <Sidebar onNavigate={onNavigate} activePage={fromPage === 'my-listings' ? 'listings' : 'dashboard'} />
      
      <main className="detail-main">
        <header className="detail-header">
          <div className="detail-breadcrumb">
            {fromPage === 'my-listings' ? (
              <>
                <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Workspace</span>
                <span className="dash-detail-breadcrumb-arrow"> › </span>
                <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('my-listings')}>My listings</span>
                <span className="dash-detail-breadcrumb-arrow"> › </span>
              </>
            ) : (
              <>
                <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Marketplace</span>
                <span className="dash-detail-breadcrumb-arrow"> › </span>
              </>
            )}
            <strong className="dash-detail-breadcrumb-current">{load.id}</strong>
          </div>

          <div className="detail-actions">
            <button className="btn-figma-secondary" style={{ padding: '8px 16px' }}><span>☆</span> Save</button>
            <button className="btn-figma-secondary" style={{ padding: '8px 16px' }}><span>↗</span> Share</button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <DetailHeaderCard load={load} routeInfo={routeInfo} />
            <DetailRouteMap load={load} onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} />
            <DetailSpecs load={load} />
          </div>
          <DetailRightPanel load={load} />
        </div>
      </main>
    </div>
  );
};