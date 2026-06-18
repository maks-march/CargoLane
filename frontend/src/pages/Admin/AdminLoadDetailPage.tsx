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
          } catch (userErr) {
            console.warn("Failed to fetch real shipper data", userErr);
          }
        }
      } catch (err) {
        setError('Load not found. It may have been deleted or access is denied.');
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
      navigate('/admin/reviews');
    } catch (err) {
      console.error(err);
      alert('Failed to approve load');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return;
    try {
      await adminService.rejectLoad(id, reason);
      navigate('/admin/reviews');
    } catch (err) {
      console.error(err);
      alert('Failed to reject load');
    }
  };

  if (isLoading) {
    return (
      <div className="dash-loading-container" style={{ padding: '80px', textAlign: 'center', color: '#5C6470' }}>
        ⏳ Loading admin route details...
      </div>
    );
  }

  if (error || !load) {
    return (
      <div style={{ padding: '48px', width: '100%', background: '#F6F7FB', minHeight: '100vh', boxSizing: 'border-box' }}>
        <div className="dash-breadcrumb" style={{ marginBottom: '24px' }}>
          <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate(-1)}>Moderation</span>
          <span className="dash-detail-breadcrumb-arrow"> › </span>
          <strong className="dash-detail-breadcrumb-current">Error</strong>
        </div>
        <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '16px', borderRadius: '8px', fontSize: '15px', border: '1px solid #EF4444', maxWidth: '600px' }}>
          {error || '❌ Load not found or has been removed.'}
        </div>
      </div>
    );
  }

  const startPoint = load.routePoints?.[0];
  const endPoint = load.routePoints?.[(load.routePoints?.length || 1) - 1];
  
  const formatShortDateTime = (isoString?: string | null) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${months[date.getMonth()]} ${date.getDate()} • ${hours}:${minutes}`;
  };

  const startCity = startPoint?.city || load.from?.split(',')[0] || 'Origin';
  const endCity = endPoint?.city || load.to?.split(',')[0] || 'Destination';

  // ИСПРАВЛЕНО: Синхронизировано с юзером. Берем Company Name и Страну/Город вместо почты.
  const shipperName = shipper?.companyName || shipper?.displayName || (shipper?.firstName ? `${shipper.firstName} ${shipper.lastName || ''}` : '') || load.companyName || 'Verified Shipper';
  const shipperLocation = [shipper?.country, shipper?.city].filter(Boolean).join(', ') || 'Location not specified';
  const shipperInitials = shipperName.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflowY: 'auto', background: '#F6F7FB' }}>
      
      <header className="dash-header" style={{ padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #E6E8EE', flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate(-1)}>Moderation</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span>
            <strong className="dash-detail-breadcrumb-current">{load.id.substring(0, 8).toUpperCase()}</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 400, color: '#0E1116', marginTop: '7px', letterSpacing: '-0.64px', marginBottom: 0 }}>
            {load.cargo || 'General Cargo'} <span style={{ color: '#A0AAB9' }}>•</span> <span style={{ color: '#0E1116', fontWeight: 400 }}>{startCity} → {endCity}</span>
          </h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '24px', padding: '48px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {load.rejectReason && (
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

        <aside className="detail-right-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
          
          <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', margin: 0 }}>Stops</h3>
                <div style={{ 
                  background: load.status === 'Active' ? '#ECFDF5' : (load.status === 'Rejected' ? '#FEF2F2' : '#F6F7FB'), 
                  color: load.status === 'Active' ? '#059669' : (load.status === 'Rejected' ? '#EF4444' : '#5C6470'), 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  border: load.status === 'Active' ? '1px solid #A7F3D0' : (load.status === 'Rejected' ? '1px solid #FECACA' : '1px solid #E6E8EE') 
                }}>
                  {load.status === 'Active' ? 'Approved' : load.status}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                     <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3D5AFE' }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{startCity}</div>
                    {startPoint?.address && startPoint.address !== startPoint.city && (
                      <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{startPoint.address}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0E1116', textAlign: 'right' }}>
                  {formatShortDateTime(startPoint?.arrivalTime)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                     <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669' }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{endCity}</div>
                    {endPoint?.address && endPoint.address !== endPoint.city && (
                      <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{endPoint.address}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0E1116', textAlign: 'right' }}>
                  {formatShortDateTime(endPoint?.arrivalTime)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E6E8EE', paddingTop: '20px' }}>
                {load.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleApprove} style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                      Approve
                    </button>
                    <button onClick={handleReject} style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                      Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E6E8EE', textAlign: 'center', fontSize: '13px', color: '#A0AAB9', fontWeight: 500 }}>
                    🔒 Admin View: Action restricted. Status is <b>{load.status === 'Active' ? 'Approved' : load.status}</b>.
                  </div>
                )}
            </div>
          </div>

          <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', margin: '0 0 16px 0' }}>Shipper Info</h3>
            
            {/* ИСПРАВЛЕНО: Выводим Компанию и Страну вместо Имени и Почты */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#EEF1FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D5AFE', fontWeight: 600, fontSize: '18px' }}>
                {shipperInitials}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0E1116', fontSize: '15px' }}>{shipperName}</div>
                <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>
                  {shipperLocation}
                </div>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default AdminLoadDetailPage;