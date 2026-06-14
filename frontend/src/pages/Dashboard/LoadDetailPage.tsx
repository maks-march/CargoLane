import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadsService } from '../../services/loadsService';
import { DetailHeaderCard } from '../../components/UI/DetailHeaderCard';
import { DetailRouteMap } from '../../components/UI/DetailRouteMap';
import { DetailSpecs } from '../../components/UI/DetailSpecs';
import { DetailRightPanel } from '../../components/UI/DetailRightPanel';
import type { LoadDetailsVm } from '../../api/types';

export const LoadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadDetailsVm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });

  useEffect(() => {
    const fetchLoad = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await loadsService.getLoadById(id);
        setLoad(data as unknown as LoadDetailsVm);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [id]);

  if (isLoading) {
    return (
      <div className="dash-loading-container" style={{ padding: '80px', textAlign: 'center' }}>
        ⏳ Loading load details...
      </div>
    );
  }

  if (!load) {
    return (
      <div className="dash-loading-container" style={{ padding: '80px', textAlign: 'center', color: '#DC2626' }}>
        ❌ Load not found.
      </div>
    );
  }

  return (
    <>
      <header className="dash-header" style={{ padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="dash-breadcrumb">
          <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
          <span className="dash-detail-breadcrumb-arrow"> › </span>
          <strong className="dash-detail-breadcrumb-current">{load.id.substring(0, 8).toUpperCase()}</strong>
        </div>

        <div className="detail-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-figma-secondary" style={{ padding: '8px 16px' }}><span>☆</span> Save</button>
          <button className="btn-figma-secondary" style={{ padding: '8px 16px' }}><span>↗</span> Share</button>
          <div className="dash-notify">🔔</div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '24px', padding: '0 48px 48px 48px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <DetailHeaderCard load={load} routeInfo={routeInfo} />
          <DetailRouteMap load={load} onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} />
          <DetailSpecs load={load} />
        </div>
        <DetailRightPanel load={load} />
      </div>
    </>
  );
};

export default LoadDetailPage;