import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, type ExtendedLoadListVm } from '../../services/adminService';

export const RejectedQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<ExtendedLoadListVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getRejectedLoads();
      setQueue(data);
    } catch (error) {
      console.error("Failed to load rejected queue", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredQueue = queue.filter(item => {
    const query = searchQuery.toLowerCase();
    const article = item.article ? String(item.article).toLowerCase() : '';
    const from = item.from ? String(item.from).toLowerCase() : '';
    const company = item.companyName ? String(item.companyName).toLowerCase() : '';
    return article.includes(query) || from.includes(query) || company.includes(query);
  });

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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#F6F7FB" }}>
      
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div>
          <div className="dash-breadcrumb" style={{ fontSize: "13px", marginBottom: "4px" }}>
            <span style={{ color: "#A0AAB9", cursor: "default" }}>Moderation</span>
            <span style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
            <strong style={{ color: "#0E1116", fontWeight: 500 }}>Rejected</strong>
          </div>
          <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 500, color: "#0E1116", letterSpacing: "-0.5px", margin: 0 }}>Rejected</h1>
        </div>
      </header>

      <div style={{ padding: "32px", width: "100%", overflowY: "auto", boxSizing: "border-box" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AAB9', fontSize: '14px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID, Shipper, or Lane..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', width: '100%', outline: 'none', color: '#0E1116', boxSizing: 'border-box' }} 
            />
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #E6E8EE", borderRadius: "12px", overflow: "hidden", width: "100%" }}>
          
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E6E8EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#0E1116" }}>Rejected listings</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#5C6470" }}>{filteredQueue.length} items</div>
          </div>
          
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Load ID</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Lane & Cargo</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Shipper</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Decision</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Reviewer</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em" }}>Price</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#5C6470", fontWeight: 600, borderBottom: "1px solid #E6E8EE", letterSpacing: "0.05em", textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#A0AAB9" }}>Loading rejected loads...</td></tr>
                ) : filteredQueue.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "80px", textAlign: "center", color: "#A0AAB9" }}>No rejected loads found.</td></tr>
                ) : (
                  filteredQueue.map((load, idx) => (
                    <tr 
                      key={idx} 
                      style={{ borderBottom: "1px solid #F6F7FB", cursor: "pointer" }} 
                      // ИСПРАВЛЕНО: Переход СТРОГО на админскую изолированную страницу
                      onClick={() => navigate(`/admin/orders/${load.id}`)} 
                      className="table-row-hover"
                    >
                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#0E1116" }}>{load.article ? String(load.article) : load.id.substring(0,8).toUpperCase()}</div>
                      </td>
                      
                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ color: "#0E1116", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                          {load.from?.split(',')[0]} → {load.to?.split(',')[0]}
                        </div>
                        <div style={{ color: "#5C6470", fontSize: "13px" }}>
                          {load.cargo} · {load.weight} t
                        </div>
                      </td>
                      
                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#0E1116" }}>{load.companyName}</div>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <span style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>
                          Rejected
                        </span>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#5C6470" }}>{load.reviewerName}</div>
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "16px", fontWeight: 600, color: "#0E1116" }}>
                        €{load.price.toLocaleString('en-US')}
                      </td>

                      <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "14px", color: "#5C6470", textAlign: "right" }}>
                        {timeAgo(load.createdDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.table-row-hover:hover { background-color: #FAFAFA !important; }`}</style>
    </div>
  );
};

export default RejectedQueuePage;