import React, { useState } from 'react';
import type { LoadDetailsVm } from '../../api/types';

interface Props {
  load: LoadDetailsVm;
}

export const DetailRightPanel: React.FC<Props> = ({ load }) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:8080/api/Order/${load.id}/accept`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        console.error("Failed to accept load");
        alert("Failed to process request. Please try again.");
      } else {
        alert("Load accepted successfully!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="detail-right-panel" style={{ width: '320px', flexShrink: 0 }}>
      <div className="detail-card">
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>Actions</h3>
        
        <button 
          className="btn-figma-primary" 
          style={{ width: '100%', marginBottom: '12px', padding: '12px', justifyContent: 'center' }}
          onClick={handleAccept}
          disabled={isAccepting}
        >
          {isAccepting ? 'Processing...' : 'Accept Load'}
        </button>

        <button 
          className="btn-figma-secondary" 
          style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
        >
          Contact Shipper
        </button>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E6E8EE' }}>
           <p style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Shipper Info</p>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F6F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#0E1116' }}>
                V
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0E1116', fontSize: '14px' }}>Verified Shipper</div>
                <div style={{ color: '#5C6470', fontSize: '13px' }}>Member since 2024</div>
              </div>
           </div>
           
           <div style={{ fontSize: '13px', color: '#5C6470', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span>Rating</span>
             <strong style={{ color: '#0E1116' }}>★ 4.9 (124)</strong>
           </div>
           <div style={{ fontSize: '13px', color: '#5C6470', display: 'flex', justifyContent: 'space-between' }}>
             <span>Payment speed</span>
             <strong style={{ color: '#059669' }}>14 days avg.</strong>
           </div>
        </div>
      </div>
    </div>
  );
};