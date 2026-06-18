import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import type { LoadListVm, LoadDetailsVm } from '../../api/types';

export const ReviewQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<LoadListVm[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<LoadDetailsVm | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const data = await adminService.getReviews();
      setQueue(data);
    } catch (error) {
      console.error("Failed to load review queue", error);
    } finally {
      setIsLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleSelectLoad = async (id: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await adminService.getReviewDetails(id);
      setSelectedLoad(details);
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLoad) return;
    setIsProcessing(true);
    try {
      await adminService.approveLoad(selectedLoad.id);
      setQueue(prev => prev.filter(q => q.id !== selectedLoad.id));
      setSelectedLoad(null);
    } catch (error) {
      console.error("Failed to approve load", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoad || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await adminService.rejectLoad(selectedLoad.id, rejectReason);
      setQueue(prev => prev.filter(q => q.id !== selectedLoad.id));
      setSelectedLoad(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error("Failed to reject load", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const startCity = selectedLoad?.routePoints?.[0]?.city || selectedLoad?.routePoints?.[0]?.address || selectedLoad?.from?.split(',')[0] || 'Unknown';
  const endCity = selectedLoad?.routePoints?.[(selectedLoad?.routePoints?.length || 1) - 1]?.city || selectedLoad?.routePoints?.[(selectedLoad?.routePoints?.length || 1) - 1]?.address || selectedLoad?.to?.split(',')[0] || 'Unknown';
  
  const pricePerT = (selectedLoad && selectedLoad.weight > 0) 
    ? Math.round(selectedLoad.price / selectedLoad.weight) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: '#FFFFFF' }}>
      
      {/* ИСПРАВЛЕНО: Единый идеальный хедер с некликабельными серыми крошками */}
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb" style={{ fontSize: "13px", marginBottom: "4px" }}>
            <span style={{ color: "#A0AAB9", cursor: "default" }}>Moderation</span>
            <span style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
            <strong style={{ color: "#0E1116", fontWeight: 500 }}>Review queue</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 500, color: "#0E1116", letterSpacing: "-0.5px", margin: 0 }}>Review queue</h1>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ width: '340px', background: 'white', borderRight: '1px solid #E6E8EE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E6E8EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0E1116' }}>Pending review</div>
            <div style={{ fontSize: '12px', color: '#A0AAB9' }}>{queue.length} items</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isLoadingQueue ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#A0AAB9' }}>Loading queue...</div>
            ) : queue.length === 0 ? (
              <div style={{ padding: '48px 32px', textAlign: 'center', color: '#A0AAB9' }}>No loads waiting for review.</div>
            ) : (
              queue.map(item => {
                const isSelected = selectedLoad?.id === item.id;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelectLoad(item.id)}
                    style={{ 
                      padding: '16px 20px', 
                      borderBottom: '1px solid #E6E8EE', 
                      cursor: 'pointer',
                      background: isSelected ? '#EEF1FF' : 'white',
                      transition: 'background 0.2s ease',
                      borderLeft: isSelected ? '3px solid #3D5AFE' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#A0AAB9', fontWeight: 500 }}>{item.article || item.id.substring(0,8).toUpperCase()}</span>
                      <span style={{ fontSize: '12px', color: '#A0AAB9' }}>{timeAgo(item.dateStart)}</span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: '14px', color: '#0E1116', marginBottom: '6px' }}>
                      {item.from?.split(',')[0]} → {item.to?.split(',')[0]}
                    </div>
                    <div style={{ fontSize: '13px', color: '#5C6470' }}>
                      {item.cargo} · {item.weight} t
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', position: 'relative' }}>
          {isLoadingDetails ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#A0AAB9', fontSize: '16px' }}>Loading details...</div>
          ) : !selectedLoad ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#A0AAB9', fontSize: '16px' }}>
              Select a load from the left queue to review
            </div>
          ) : (
            <div style={{ padding: '32px', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ background: '#F6F7FB', color: '#5C6470', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 500, border: '1px solid #E6E8EE' }}>
                    Submitted {timeAgo(selectedLoad.dateStart)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button disabled={isProcessing} onClick={() => setShowRejectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #FECACA', background: 'white', color: '#EF4444', fontSize: '14px', fontWeight: 500, cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      Reject
                    </button>
                    <button disabled={isProcessing} onClick={handleApprove} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#3D5AFE', color: 'white', fontSize: '14px', fontWeight: 500, cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve
                    </button>
                  </div>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#0E1116', margin: '0 0 8px 0' }}>
                  {startCity} → {endCity} · {selectedLoad.cargo}
                </h2>
                <div style={{ fontSize: '13px', color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', fontWeight: 500 }}>
                  {selectedLoad.article || selectedLoad.id.substring(0,8).toUpperCase()} · {selectedLoad.companyName || 'CargoLane User'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  <div style={{ background: '#F9FAFB', padding: '16px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Distance</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>{selectedLoad.distance || 0} km</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '16px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Total mass</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>{selectedLoad.weight} t</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '16px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Total volume</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>{selectedLoad.volume} m³</div>
                  </div>
                  <div style={{ background: '#F9FAFB', padding: '16px 20px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Price/t</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>€{pricePerT}</div>
                  </div>
                </div>

                {selectedLoad.about && (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0E1116', marginBottom: '8px' }}>Description</div>
                    <p style={{ fontSize: '14px', color: '#5C6470', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {selectedLoad.about}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(14, 17, 22, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Reject listing</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#5C6470' }}>Please specify the reason for rejection. This will be sent to the user.</p>
            
            <textarea 
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid cargo dimensions or prohibited items..."
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #E6E8EE', marginBottom: '24px', outline: 'none', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: 'none', color: '#5C6470', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRejectConfirm} disabled={!rejectReason.trim()} style={{ padding: '10px 20px', background: '#EF4444', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewQueuePage;