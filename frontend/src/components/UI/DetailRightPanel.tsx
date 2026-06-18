import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { loadsService } from '../../services/loadsService';
import apiClient from '../../api/api-client'; 
import type { LoadDetailsVm, UserDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailRightPanel: React.FC<Props> = ({ load }) => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [shipper, setShipper] = useState<UserDetailsVm | null>(null); 
  
  const user = useAuthStore((state) => state.user);
  
  const isMyLoad = load.userId === user?.id; 

  const startPoint = load.routePoints?.[0];
  const endPoint = load.routePoints?.[(load.routePoints?.length || 1) - 1];

  useEffect(() => {
    const fetchShipper = async () => {
      if (load.userId && load.userId !== 'system_id') {
        try {
          const res = await apiClient.get<UserDetailsVm>(`/api/user/${load.userId}`);
          setShipper(res.data);
        } catch (err) {
          console.warn("Failed to fetch real shipper data", err);
        }
      }
    };
    fetchShipper();
  }, [load.userId]);

  const formatShortDateTime = (isoString?: string | null) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${months[date.getMonth()]} ${date.getDate()} • ${hours}:${minutes}`;
  };

  const handleAccept = async () => {
    if (isMyLoad) return;
    setIsAccepting(true);
    setErrorMsg('');
    try {
      await loadsService.bookLoad(load.id);
      navigate(`/chat?partnerId=${load.userId}&loadId=${load.id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to accept load. Please try again later.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMessage = () => {
    if (isMyLoad) return;
    navigate(`/chat?partnerId=${load.userId}&loadId=${load.id}`);
  };

  const shipperName = shipper?.companyName || load.shipper || 'Verified Shipper';
  const shipperLocation = shipper?.country || 'Location not specified';
  const shipperInitials = shipperName.substring(0, 2).toUpperCase();

  return (
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
              {load.status}
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3D5AFE' }}></div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{startPoint?.city || 'Origin'}</div>
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
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{endPoint?.city || 'Destination'}</div>
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

        {errorMsg && (
          <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px', background: '#FEF2F2', padding: '8px', borderRadius: '6px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E6E8EE', paddingTop: '20px' }}>
            <button 
              className={`btn-figma-primary ${isMyLoad || load.status !== 'Active' ? 'disabled' : ''}`} 
              onClick={handleAccept} 
              disabled={isAccepting || isMyLoad || load.status !== 'Active'}
              title={isMyLoad ? "This is your listing. You cannot accept it." : (load.status !== 'Active' ? "You can only accept active loads." : "")}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px', 
                fontSize: '15px',
                opacity: (isMyLoad || load.status !== 'Active') ? 0.5 : 1,
                cursor: (isMyLoad || load.status !== 'Active') ? 'not-allowed' : 'pointer'
              }}
            >
              {isAccepting ? 'Processing...' : 'Take order'}
            </button>
        </div>
      </div>

      <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', margin: '0 0 16px 0' }}>Shipper Info</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', background: '#EEF1FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D5AFE', fontWeight: 600, fontSize: '18px' }}>
            {shipperInitials}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0E1116', fontSize: '15px' }}>{shipperName}</div>
            <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{shipperLocation}</div>
          </div>
        </div>

        <button 
          className="btn-figma-secondary" 
          onClick={handleMessage}
          disabled={isMyLoad}
          title={isMyLoad ? "This is your listing. You cannot message yourself." : ""}
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            padding: '12px', 
            fontSize: '15px',
            opacity: isMyLoad ? 0.5 : 1,
            cursor: isMyLoad ? 'not-allowed' : 'pointer'
          }}
        >
          Message
        </button>
      </div>
    </aside>
  );
};