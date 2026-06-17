import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { loadsService } from '../../services/loadsService';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailRightPanel: React.FC<Props> = ({ load }) => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const user = useAuthStore((state) => state.user);
  
  const isMyLoad = 
    (user?.companyName && load.companyName === user.companyName) || 
    (user?.name && load.companyName === user.name) || 
    load.companyName === 'CargoLane Partner'; 

  const startPoint = load.routePoints?.[0];
  const endPoint = load.routePoints?.[(load.routePoints?.length || 1) - 1];

  // ИСПРАВЛЕНО: Вернули время. Формат "Jun 8 • 18:00"
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
      await loadsService.acceptLoad(load.id);
      navigate(`/chat?partnerId=system_id&loadId=${load.id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Failed to accept load. Please try again later.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMessage = () => {
    if (isMyLoad) return;
    navigate(`/chat?partnerId=system_id&loadId=${load.id}`);
  };

  return (
    <aside className="detail-right-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
      
      <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', margin: 0 }}>Stops</h3>
            <div style={{ 
              background: load.status === 'Active' ? '#ECFDF5' : '#F6F7FB', 
              color: load.status === 'Active' ? '#059669' : '#5C6470', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: 600, 
              border: load.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #E6E8EE' 
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
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{startPoint?.city || load.from.split(',')[0]}</div>
                {startPoint?.address && startPoint.address !== startPoint.city && (
                  <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{startPoint.address}</div>
                )}
              </div>
            </div>
            {/* ИСПРАВЛЕНО: Дата + Время */}
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
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>{endPoint?.city || load.to.split(',')[0]}</div>
                {endPoint?.address && endPoint.address !== endPoint.city && (
                  <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>{endPoint.address}</div>
                )}
              </div>
            </div>
            {/* ИСПРАВЛЕНО: Дата + Время */}
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
              className={`btn-figma-primary ${isMyLoad ? 'disabled' : ''}`} 
              onClick={handleAccept} 
              disabled={isAccepting || isMyLoad}
              title={isMyLoad ? "This is your listing. You cannot accept your own load." : ""}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px', 
                fontSize: '15px',
                opacity: isMyLoad ? 0.5 : 1,
                cursor: isMyLoad ? 'not-allowed' : 'pointer'
              }}
            >
              {isAccepting ? 'Processing...' : 'Take order'}
            </button>
        </div>
      </div>

      <div className="detail-card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #E6E8EE' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', margin: '0 0 16px 0' }}>Shipper</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', background: '#EEF1FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D5AFE', fontWeight: 600, fontSize: '18px' }}>
            {load.companyName ? load.companyName.substring(0, 2).toUpperCase() : 'CP'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0E1116', fontSize: '15px' }}>{load.companyName || 'Verified Shipper'}</div>
            <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>CargoLane Partner</div>
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