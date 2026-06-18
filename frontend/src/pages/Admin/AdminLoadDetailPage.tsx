import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DetailHeaderCard } from '../../components/UI/DetailHeaderCard';
import { DetailRouteMap } from '../../components/UI/DetailRouteMap';
import { DetailSpecs } from '../../components/UI/DetailSpecs';
import type { LoadDetailsVm, UserDetailsVm } from '../../api/types';
import apiClient from '../../api/api-client'; 

export const AdminLoadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [load, setLoad] = useState<LoadDetailsVm | null>(null);
  const [shipper, setShipper] = useState<UserDetailsVm | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState({ distance: '0 km', duration: '0h 0m' });

  useEffect(() => {
    const fetchDetailsAndShipper = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const loadData = await adminService.getReviewDetails(id);
        setLoad(loadData);
        
        if (loadData.userId && loadData.userId !== 'system_id') {
          try {
            const userRes = await apiClient.get<UserDetailsVm>(`/api/user/${loadData.userId}`);
            setShipper(userRes.data);
          } catch {
            console.warn("Failed to fetch real shipper data");
          }
        }
      } catch (err: unknown) {
        console.error("Failed to fetch load details", err);
        setError("Failed to load details. It might have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailsAndShipper();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await adminService.approveLoad(id);
      navigate('/admin/review-queue');
    } catch (err: unknown) {
      console.error("Failed to approve", err);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await adminService.rejectLoad(id, reason);
      navigate('/admin/review-queue');
    } catch (err: unknown) {
      console.error("Failed to reject", err);
    }
  };

  if (isLoading) return <div style={{ padding: '80px', textAlign: 'center', color: '#5C6470' }}>Loading details...</div>;
  if (error || !load) return <div style={{ padding: '80px', textAlign: 'center', color: '#EF4444' }}>{error || "Load not found."}</div>;

  // Безопасное извлечение городов
  const startCity = load.routePoints?.[0]?.city || 'Origin';
  const endCity = load.routePoints?.[(load.routePoints?.length || 1) - 1]?.city || 'Destination';

  // ИСПРАВЛЕНО: Берем имя из полей UserDetailsVm по контракту Сваггера (name/surname или email)
  let shipperName = load.shipper || 'Verified Shipper';
  if (shipper) {
    if (shipper.companyName) shipperName = shipper.companyName;
    else if (shipper.name || shipper.surname) shipperName = `${shipper.name || ''} ${shipper.surname || ''}`.trim();
    else if (shipper.email) shipperName = shipper.email;
  }
  const shipperInitials = shipperName.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflowY: 'auto', background: '#F6F7FB' }}>
      
      <header className="dash-header" style={{ padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #E6E8EE', flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/admin/review-queue')}>Review Queue</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            <strong className="dash-detail-breadcrumb-current">{load.id.substring(0, 8).toUpperCase()}</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', marginTop: '7px', letterSpacing: '-0.64px', marginBottom: 0 }}>
            {load.cargoType || 'General Cargo'} <span style={{ color: '#A0AAB9' }}>•</span> <span style={{ color: '#0E1116', fontWeight: 400 }}>{startCity} → {endCity}</span>
          </h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '24px', padding: '48px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <DetailHeaderCard load={load} />
          <DetailRouteMap load={load} onRouteCalculated={(dist, dur) => setRouteInfo({ distance: dist, duration: dur })} routeInfo={routeInfo} />
          <DetailSpecs load={load} />
        </div>

        <aside className="detail-right-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
          
          <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', margin: 0 }}>Moderation</h3>
                <div style={{ 
                  background: load.status === 'Pending' ? '#FEF3C7' : '#F6F7FB', 
                  color: load.status === 'Pending' ? '#D97706' : '#5C6470', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  border: load.status === 'Pending' ? '1px solid #FDE68A' : '1px solid #E6E8EE' 
                }}>
                  {load.status}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E6E8EE', paddingTop: '20px' }}>
                {load.status === 'Pending' ? (
                  <>
                    <button 
                      className="btn-figma-primary" 
                      onClick={handleApprove} 
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
                    >
                      Approve Load
                    </button>
                    <button 
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        padding: '12px', 
                        fontSize: '15px',
                        background: '#FEF2F2',
                        color: '#EF4444',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={handleReject}
                    >
                      Reject Load
                    </button>
                  </>
                ) : (
                  <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E6E8EE', textAlign: 'center', fontSize: '13px', color: '#A0AAB9', fontWeight: 500 }}>
                    🔒 Admin View: Action restricted. Status is <b>{load.status === 'Active' ? 'Approved' : load.status}</b>.
                  </div>
                )}
            </div>
          </div>

          <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', margin: '0 0 16px 0' }}>Shipper Info</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#EEF1FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D5AFE', fontWeight: 600, fontSize: '18px' }}>
                {shipperInitials}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0E1116', fontSize: '15px' }}>{shipperName}</div>
                <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{shipper?.country || 'Location hidden'}</div>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};