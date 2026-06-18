import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadsService } from '../../services/loadsService';
import { DetailHeaderCard } from '../../components/UI/DetailHeaderCard';
import { DetailRouteMap } from '../../components/UI/DetailRouteMap';
import { DetailSpecs } from '../../components/UI/DetailSpecs';
import { DetailRightPanel } from '../../components/UI/DetailRightPanel';
import type { LoadDetailsVm } from '../../api/types';

// ИСПРАВЛЕНО: Добавляем локальное поле isSaved, которого нет в бэкенде, чтобы TS не ругался
interface ExtendedLoadDetails extends LoadDetailsVm {
  isSaved?: boolean;
}

export const LoadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [load, setLoad] = useState<ExtendedLoadDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [routeInfo, setRouteInfo] = useState({ distance: '0 km', duration: '0h 0m' });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLoad = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await loadsService.getLoadById(id);
        setLoad(data as ExtendedLoadDetails);
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

  const handleSave = async () => {
    if (!load) return;
    setIsSaving(true);
    try {
      const isNowSaved = await loadsService.toggleSaveLoad(load.id);
      setLoad({ ...load, isSaved: isNowSaved });
      if (isNowSaved) {
        setSuccessMsg('Load successfully saved to your bookmarks!');
      } else {
        setSuccessMsg('Load removed from your bookmarks.');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to toggle save", err);
    } finally {
      setIsSaving(false);
    }
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

  // ИСПРАВЛЕНО: Безопасное извлечение городов из routePoints (from/to удалены)
  const startCity = load.routePoints?.[0]?.city || 'Origin';
  const endCity = load.routePoints?.[(load.routePoints?.length || 1) - 1]?.city || 'Destination';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflowY: 'auto', background: '#F6F7FB' }}>
      <header className="dash-header" style={{ padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #E6E8EE', flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            <strong className="dash-detail-breadcrumb-current">{load.id.substring(0, 8).toUpperCase()}</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', marginTop: '7px', letterSpacing: '-0.64px', marginBottom: 0 }}>
            {load.cargoType || 'General Cargo'} <span style={{ color: '#A0AAB9' }}>•</span> <span style={{ color: '#0E1116', fontWeight: 400 }}>{startCity} → {endCity}</span>
          </h1>
        </div>

        <div className="detail-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ 
              padding: '8px 16px', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              background: load.isSaved ? '#ECFDF5' : 'white',
              border: load.isSaved ? '1px solid #10B981' : '1px solid #E6E8EE',
              color: load.isSaved ? '#10B981' : '#0E1116',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {load.isSaved ? (
              <><span>✓</span> Saved</>
            ) : (
              <><span>☆</span> Save</>
            )}
          </button>
          
          <button className="btn-figma-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }}><span>↗</span> Share</button>
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
          
          {load.status === 'Rejected' && load.rejectReason && (
            <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '24px', border: '1px solid #FECACA' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Reason for rejection
              </div>
              <p style={{ fontSize: '14px', color: '#B91C1C', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                {load.rejectReason}
              </p>
            </div>
          )}

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