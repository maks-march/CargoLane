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
      if (!loadId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const found = await loadsService.getLoadById(loadId);
        setLoad(found || null);
      } catch (error) {
        console.error("API Error (LoadDetail):", error);
        setLoad(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [loadId]);

  if (isLoading) {
    return (
      <div className="load-detail-page active">
        <Sidebar onNavigate={onNavigate} activePage={fromPage === 'my-listings' ? 'listings' : 'dashboard'} />
        <main className="detail-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#5C6470' }}>
          ⏳ Loading listing details...
        </main>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="load-detail-page active">
        <Sidebar onNavigate={onNavigate} activePage={fromPage === 'my-listings' ? 'listings' : 'dashboard'} />
        <main className="detail-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ color: '#0E1116' }}>Listing not found</h2>
          <p style={{ color: '#5C6470', marginBottom: '24px' }}>The listing you are looking for does not exist or has been removed.</p>
          <button className="btn-figma-primary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
        </main>
      </div>
    );
  }

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