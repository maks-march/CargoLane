import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { LoadListVm } from '../../api/types';

// Выносим функцию наружу, чтобы ESLint не ругался на impure function during render
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

export const RejectedQueuePage: React.FC = () => {
  const navigate = useNavigate();
  // ИСПРАВЛЕНО: Используем строгий LoadListVm из Сваггера
  const [queue, setQueue] = useState<LoadListVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getRejectedLoads();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setQueue(data as any); 
    } catch (error) {
      console.error("Failed to load rejected queue", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQueue();
  }, [fetchQueue]);

  const filteredQueue = queue.filter(item => {
    const query = searchQuery.toLowerCase();
    const article = item.article ? String(item.article).toLowerCase() : '';
    // ИСПРАВЛЕНО: Берем официальные поля
    const startCity = item.startCity ? String(item.startCity).toLowerCase() : '';
    const company = item.shipper ? String(item.shipper).toLowerCase() : '';
    return article.includes(query) || startCity.includes(query) || company.includes(query);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#F6F7FB" }}>
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: "#A0AAB9", cursor: "default" }}>Admin</span>
              <span className="dash-detail-breadcrumb-arrow" style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
              <strong style={{ color: "#0E1116", fontWeight: 500 }}>Rejected Queue</strong>
            </div>
            <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 400, color: "#0E1116", letterSpacing: "-1px", marginTop: "4px" }}>Rejected Queue</h1>
          </div>
        </div>
      </header>

      <div style={{ padding: "32px", width: "100%", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", boxSizing: "border-box" }}>
        
        <div style={{ background: "white", border: "1px solid #E6E8EE", borderRadius: "12px", padding: "10px 16px", display: "flex", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => navigate('/admin/review-queue')} style={{ background: "transparent", color: "#5C6470", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              Pending
            </button>
            <button onClick={() => navigate('/admin/approved-queue')} style={{ background: "transparent", color: "#5C6470", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              Approved
            </button>
            <button style={{ background: "#0E1116", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              Rejected
            </button>
          </div>

          <div style={{ position: "relative", width: "240px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#A0AAB9", fontSize: "14px" }}>🔍</span>
            <input
              type="text"
              placeholder="Search ID, city, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "10px 16px 10px 36px", border: "1px solid #E6E8EE", borderRadius: "8px", fontSize: "14px", width: "100%", outline: "none", color: "#0E1116", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #E6E8EE", borderRadius: "12px", overflow: "hidden", width: "100%" }}>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Load ID</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Route</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Cargo</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Shipper</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Reviewer</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Price</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE", textAlign: "right" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading rejected loads...</td></tr>
                ) : filteredQueue.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "80px", textAlign: "center", color: "#A0AAB9" }}>No rejected loads found.</td></tr>
                ) : (
                  filteredQueue.map((load, idx) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const l = load as any;
                    return (
                    <tr 
                      key={idx} 
                      style={{ borderBottom: "1px solid #F6F7FB", cursor: "pointer" }} 
                      onClick={() => navigate(`/admin/load/${load.id}`)}
                      className="table-row-hover"
                    >
                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#5C6470" }}>{load.article || load.id.substring(0,8).toUpperCase()}</div>
                      </td>
                      
                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#0E1116" }}>
                          {load.startCity || 'Origin'} <span style={{ color: "#A0AAB9" }}>→</span> {load.endCity || 'Destination'}
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "14px", color: "#0E1116" }}>
                        {load.cargoType || 'General'} <span style={{ color: "#A0AAB9" }}>• {load.totalWeight || 0}t</span>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#0E1116" }}>{load.shipper || 'Unknown Company'}</div>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <span style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>
                          Rejected
                        </span>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#5C6470" }}>{l.reviewerName || 'Admin'}</div>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "16px", fontWeight: 600, color: "#0E1116" }}>
                        €{(load.payment || 0).toLocaleString('en-US')}
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "14px", color: "#5C6470", textAlign: "right" }}>
                        {timeAgo(load.created)}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <style>{`
        .table-row-hover:hover { background-color: #FAFAFA !important; }
      `}</style>
    </div>
  );
};