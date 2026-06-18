import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import type { LoadListVm, LoadDetailsVm } from '../../api/types';

// Выносим функцию наружу для чистоты компонента (убираем ошибку ESLint)
const timeAgo = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Форматер даты
const formatMonthDay = (dateStr?: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      setSelectedLoad(null);
      fetchQueue();
    } catch (error) {
      console.error("Approve failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLoad || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await adminService.rejectLoad(selectedLoad.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLoad(null);
      fetchQueue();
    } catch (error) {
      console.error("Reject failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: '#F6F7FB' }}>
      
      {/* Левая панель: Список грузов (Очередь) */}
      <div style={{ width: '400px', background: 'white', borderRight: '1px solid #E6E8EE', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E6E8EE' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, color: '#0E1116' }}>Review Queue</h2>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AAB9' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              style={{ width: '100%', padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoadingQueue ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>Loading queue...</div>
          ) : queue.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#A0AAB9' }}>Queue is empty. Great job!</div>
          ) : (
            queue.map(load => (
              <div 
                key={load.id}
                onClick={() => handleSelectLoad(load.id)}
                style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid #F6F7FB', 
                  cursor: 'pointer',
                  background: selectedLoad?.id === load.id ? '#EEF1FF' : 'white',
                  borderLeft: selectedLoad?.id === load.id ? '3px solid #3D5AFE' : '3px solid transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#5C6470' }}>{load.article || load.id.substring(0,8).toUpperCase()}</span>
                  <span style={{ fontSize: '12px', color: '#A0AAB9' }}>{timeAgo(load.created)}</span>
                </div>
                {/* ИСПРАВЛЕНО: Безопасное обращение к полям LoadListVm */}
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>
                  {load.startCity || 'Origin'} → {load.endCity || 'Destination'}
                </div>
                <div style={{ fontSize: '13px', color: '#5C6470' }}>
                  {load.cargoType || 'General'} • {load.totalWeight || 0}t
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Правая панель: Детали выбранного груза */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F6F7FB', overflowY: 'auto' }}>
        {isLoadingDetails ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AAB9' }}>Loading details...</div>
        ) : !selectedLoad ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AAB9' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>Select a load to review</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '24px', margin: 0, color: '#0E1116', fontWeight: 600 }}>Review Details</h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  style={{ padding: '10px 20px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reject
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  style={{ padding: '10px 24px', background: '#3D5AFE', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isProcessing ? 'Processing...' : 'Approve Load'}
                </button>
              </div>
            </div>

            {/* Load Info Card */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E6E8EE', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#5C6470', fontWeight: 600, marginBottom: '8px' }}>
                    LOAD ID: {selectedLoad.article || selectedLoad.id.substring(0,8).toUpperCase()}
                  </div>
                  {/* ИСПРАВЛЕНО: Безопасное извлечение городов из routePoints для LoadDetailsVm */}
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116' }}>
                    {selectedLoad.routePoints?.[0]?.city || 'Origin'} → {selectedLoad.routePoints?.[(selectedLoad.routePoints?.length || 1) - 1]?.city || 'Destination'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#5C6470', marginBottom: '4px' }}>Date</div>
                  {/* ИСПРАВЛЕНО: Берем дату создания или прибытия */}
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116' }}>{formatMonthDay(selectedLoad.created || selectedLoad.routePoints?.[0]?.arrivalTime)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px 0', borderTop: '1px solid #E6E8EE', borderBottom: '1px solid #E6E8EE' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#A0AAB9', marginBottom: '4px' }}>Shipper</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{selectedLoad.shipper || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#A0AAB9', marginBottom: '4px' }}>Cargo</div>
                  {/* ИСПРАВЛЕНО: Поля из LoadDetailsVm */}
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{selectedLoad.cargoType || 'General Cargo'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#A0AAB9', marginBottom: '4px' }}>Weight & Volume</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{selectedLoad.totalWeight || 0} t • {selectedLoad.totalVolume || 0} m³</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#A0AAB9', marginBottom: '4px' }}>Price</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#10B981' }}>€{(selectedLoad.payment || 0).toLocaleString('en-US')}</div>
                </div>
              </div>

              {selectedLoad.about && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0E1116', marginBottom: '8px' }}>Description / Notes</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#5C6470', background: '#F6F7FB', padding: '16px', borderRadius: '8px' }}>
                    {selectedLoad.about}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(14,17,22,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
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
              <button onClick={handleRejectConfirm} disabled={!rejectReason.trim()} style={{ padding: '10px 20px', background: '#EF4444', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', opacity: rejectReason.trim() ? 1 : 0.5 }}>
                {isProcessing ? 'Rejecting...' : 'Reject Load'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};