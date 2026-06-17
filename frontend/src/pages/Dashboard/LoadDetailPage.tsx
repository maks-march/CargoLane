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
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [routeInfo, setRouteInfo] = useState({ distance: '0 km', duration: '0h 0m' });

  useEffect(() => {
    const fetchLoad = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await loadsService.getLoadById(id);
        setLoad(data as unknown as LoadDetailsVm);
      } catch (err: unknown) {
        console.error("API Error:", err);
        const errorObj = err as { response?: { data?: { details?: string; message?: string } } };
        setError(errorObj.response?.data?.details || errorObj.response?.data?.message || 'Failed to load details. The load might have been deleted.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [id]);

  const handleSave = () => {
    setSuccessMsg('Load successfully saved to your bookmarks!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="dash-loading-container" style={{ padding: '80px', textAlign: 'center', color: '#5C6470' }}>
        ⏳ Loading load details...
      </div>
    );
  }

  if (error || !load) {
    return (
      <div style={{ padding: '48px', width: '100%', background: '#F6F7FB', minHeight: '100vh', boxSizing: 'border-box' }}>
        <div className="dash-breadcrumb" style={{ marginBottom: '24px' }}>
          <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
          <span className="dash-detail-breadcrumb-arrow"> › </span>
          <strong className="dash-detail-breadcrumb-current">Error</strong>
        </div>
        <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '16px', borderRadius: '8px', fontSize: '15px', border: '1px solid #EF4444', maxWidth: '600px' }}>
          {error || '❌ Load not found or has been removed.'}
        </div>
      </div>
    );
  }

  const startCity = load.routePoints?.[0]?.city || load.from?.split(',')[0] || 'Origin';
  const endCity = load.routePoints?.[(load.routePoints?.length || 1) - 1]?.city || load.to?.split(',')[0] || 'Destination';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflowY: 'auto', background: '#F6F7FB' }}>
      <header className="dash-header" style={{ padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #E6E8EE', flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            <strong className="dash-detail-breadcrumb-current">{load.id.substring(0, 8).toUpperCase()}</strong>
          </div>
          {/* ИСПРАВЛЕНО: Выводится только Cargo type • Маршрут */}
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', marginTop: '7px', letterSpacing: '-0.64px', marginBottom: 0 }}>
            {load.cargo || 'General Cargo'} <span style={{ color: '#A0AAB9' }}>•</span> <span style={{ color: '#0E1116', fontWeight: 400 }}>{startCity} → {endCity}</span>
          </h1>
        </div>

        <div className="detail-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-figma-secondary" onClick={handleSave} style={{ padding: '8px 16px', cursor: 'pointer' }}><span>☆</span> Save</button>
          <button className="btn-figma-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }}><span>↗</span> Share</button>
          <div className="dash-notify" style={{ cursor: 'pointer' }}>🔔</div>
        </div>
      </header>

      {successMsg && (
        <div style={{ padding: '24px 48px 0 48px' }}>
          <div style={{ color: '#10B981', background: '#ECFDF5', padding: '12px', borderRadius: '8px', fontSize: '14px', border: '1px solid #10B981' }}>
            {successMsg}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', padding: successMsg ? '24px 48px 48px 48px' : '48px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <DetailHeaderCard load={load} />
          <DetailRouteMap load={load} onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} routeInfo={routeInfo} />
          <DetailSpecs load={load} />
        </div>
        <DetailRightPanel load={load} />
      </div>
    </div>
  );
};

export default LoadDetailPage;