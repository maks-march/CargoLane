import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { LoadDetailsVm } from '../../api/types';

export const AdminLoadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadDetailsVm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Строго используем админский эндпоинт из Swagger
        const data = await adminService.getReviewDetails(id);
        setLoad(data);
      } catch (err) {
        // Если бэкенд еще не обновлен и блокирует просмотр Status != 1
        setError('Detailed information is currently blocked by backend rules. Awaiting backend update from developer.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#A0AAB9' }}>Loading admin route details...</div>;
  }

  if (error || !load) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#F6F7FB', padding: '48px', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E6E8EE', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚧</div>
          <div style={{ color: '#0E1116', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Access Restricted</div>
          <div style={{ color: '#5C6470', fontSize: '14px', marginBottom: '24px' }}>{error || 'Load not found'}</div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', background: '#3D5AFE', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const startCity = load.routePoints?.[0]?.city || load.from?.split(',')[0] || 'Unknown';
  const endCity = load.routePoints?.[(load.routePoints?.length || 1) - 1]?.city || load.to?.split(',')[0] || 'Unknown';
  const pricePerT = load.weight > 0 ? Math.round(load.price / load.weight) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#F6F7FB" }}>
      
      {/* ХЕДЕР С КРОШКАМИ */}
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb" style={{ fontSize: "13px", marginBottom: "4px" }}>
            <span style={{ color: "#A0AAB9", cursor: "pointer", transition: "color 0.2s" }} onClick={() => navigate(-1)} className="hover-link">Back to list</span>
            <span style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
            <strong style={{ color: "#0E1116", fontWeight: 500 }}>Listing details</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 500, color: "#0E1116", letterSpacing: "-0.5px", margin: 0 }}>
            {load.article || load.id.substring(0,8).toUpperCase()}
          </h1>
        </div>
      </header>

      <div style={{ padding: "32px", width: "100%", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* ЛЕВАЯ КОЛОНКА: ИНФОРМАЦИЯ О ГРУЗЕ */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ЕСЛИ ГРУЗ ОТКЛОНЕН - ПОКАЗЫВАЕМ ПРИЧИНУ */}
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

            {/* МАРШРУТ */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: '#0E1116' }}>Route details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {load.routePoints?.map((stop, index) => (
                  <div key={index} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: index === 0 ? '#3D5AFE' : (index === (load.routePoints?.length || 0) - 1 ? '#10B981' : '#F59E0B') }}></div>
                      {index < (load.routePoints?.length || 0) - 1 && <div style={{ width: '2px', height: '100%', background: '#E6E8EE', margin: '4px 0' }}></div>}
                    </div>
                    <div style={{ paddingBottom: index < (load.routePoints?.length || 0) - 1 ? '16px' : '0' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#A0AAB9', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {index === 0 ? 'Pick up' : (index === (load.routePoints?.length || 0) - 1 ? 'Drop off' : `Stop ${index}`)}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116', marginBottom: '4px' }}>{stop.address}</div>
                      <div style={{ fontSize: '13px', color: '#5C6470' }}>{stop.arrivalTime ? new Date(stop.arrivalTime).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ГРУЗ */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: '#0E1116' }}>Cargo information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Type</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{load.cargo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Weight</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{load.weight} t</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Volume</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{load.volume} m³</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>ADR Class</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{load.adr === 0 ? 'None' : load.adr}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Insured Value</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>€{load.insurance?.toLocaleString('en-US')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#A0AAB9', marginBottom: '6px' }}>Required Vehicle</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#0E1116' }}>{load.recommendedVehicle}</div>
                </div>
              </div>
            </div>

            {/* ОПИСАНИЕ */}
            {load.about && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#0E1116' }}>Description</h3>
                <p style={{ fontSize: '14px', color: '#5C6470', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{load.about}</p>
              </div>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА: ЦЕНА И КОМПАНИЯ (ИСПРАВЛЕНО: БЕЗ КНОПОК!) */}
          <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* БЛОК ОПЛАТЫ */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE' }}>
              <div style={{ fontSize: '13px', color: '#A0AAB9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Target payment</div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#0E1116', marginBottom: '24px' }}>€{load.price.toLocaleString('en-US')}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E6E8EE', paddingTop: '16px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#5C6470' }}>Distance</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0E1116' }}>{load.distance || 0} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#5C6470' }}>Price per ton</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0E1116' }}>€{pricePerT}</span>
              </div>
              
              {/* ЗАГЛУШКА ДЛЯ АДМИНА ВМЕСТО КНОПОК */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E6E8EE', textAlign: 'center', fontSize: '13px', color: '#A0AAB9', fontWeight: 500 }}>
                🔒 Admin View: Booking and messaging actions are disabled for moderators.
              </div>
            </div>

            {/* БЛОК ОТПРАВИТЕЛЯ */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E6E8EE' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: '#0E1116' }}>Shipper Info</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#EEF1FF', color: '#3D5AFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '18px' }}>
                  {load.companyName?.substring(0, 2).toUpperCase() || 'CL'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0E1116', marginBottom: '2px' }}>{load.companyName || 'CargoLane User'}</div>
                  <div style={{ fontSize: '13px', color: '#A0AAB9' }}>ID: {load.userId?.substring(0,8).toUpperCase()}</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      <style>{`.hover-link:hover { color: #0E1116 !important; }`}</style>
    </div>
  );
};

export default AdminLoadDetailPage;