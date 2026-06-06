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
        const found = await loadsService.getLoadById(loadId);
        // Фикс: если found - undefined, передаем null явно
        setLoad(found || null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [loadId]);

  if (isLoading) {
    return (
      <div className="load-detail-page active">
        <Sidebar onNavigate={onNavigate} activePage="dashboard" />
        <div style={{ flex: 1, marginLeft: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#888', fontSize: '18px' }}>⏳ Loading details from server...</div>
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="load-detail-page active">
        <Sidebar onNavigate={onNavigate} activePage="dashboard" />
        <div style={{ flex: 1, marginLeft: '240px', padding: '40px' }}>
          <h2>Load not found</h2>
          <p style={{ color: '#888', marginTop: '8px' }}>The requested load does not exist in the database.</p>
          <button className="btn-figma-primary" onClick={() => onNavigate('dashboard')} style={{ marginTop: '20px' }}>← Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="load-detail-page active">
      <Sidebar onNavigate={onNavigate} activePage={fromPage === 'my-listings' ? 'listings' : 'dashboard'} />
      
      <main className="detail-main">
        <header className="detail-header">
          <div className="detail-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Marketplace</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            {fromPage === 'my-listings' ? (
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('my-listings')}>My listings</span>
            ) : (
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Search</span>
            )}
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            <strong className="dash-detail-breadcrumb-current">{load.id}</strong>
          </div>

          <div className="detail-actions">
            <button className="detail-action-btn"><span>☆</span> Save</button>
            <button className="detail-action-btn"><span>↗</span> Share</button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <div className="detail-layout-container">
          <div className="detail-center-column">
            <DetailHeaderCard load={load} routeInfo={routeInfo} />
            <DetailRouteMap load={load} routeInfo={routeInfo} onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} />
            <DetailSpecs load={load} />
          </div>
          <DetailRightPanel load={load} />
        </div>
      </main>
    </div>
  );
};