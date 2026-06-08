import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../services/orders.service';
import { mapOrderToLoad } from '../utils/mappers';
import { LoadData } from '../utils/types';
import { DetailHeaderCard } from '../components/UI/DetailHeaderCard';
import { DetailRouteMap } from '../components/UI/DetailRouteMap';
import { DetailSpecs } from '../components/UI/DetailSpecs';
import { DetailRightPanel } from '../components/UI/DetailRightPanel';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const order = await ordersService.getOrderById(id);
        setLoad(mapOrderToLoad(order));
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <main className="detail-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#5C6470' }}>
        ⏳ Loading listing details...
      </main>
    );
  }

  if (!load) {
    return (
      <main className="detail-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <h2 style={{ color: '#0E1116' }}>Listing not found</h2>
        <p style={{ color: '#5C6470', marginBottom: '24px' }}>The listing you are looking for does not exist or has been removed.</p>
        <button className="btn-figma-primary" onClick={() => navigate('/orders')}>Back to Dashboard</button>
      </main>
    );
  }

  return (
    <main className="detail-main">
      <header className="detail-header">
        <div className="detail-breadcrumb">
          <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/orders')}>Marketplace</span>
          <span className="dash-detail-breadcrumb-arrow"> › </span>
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
  );
};

export default OrderDetailPage;
