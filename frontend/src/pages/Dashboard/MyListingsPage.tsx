import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadsService } from "../../services/loadsService";
import type { LoadListVm } from "../../api/types";

const formatMonthDay = (dateStr?: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [listings, setListings] = useState<LoadListVm[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        // ИСПРАВЛЕНО: Последовательная загрузка статусов. 
        // Спасает SQLite от блокировки (Parallel Locks) и забирает АБСОЛЮТНО ВСЕ заявки с бэкенда.
        const statuses = ["Active", "Pending", "Booked", "Rejected", "Closed"];
        let allLoads: LoadListVm[] = [];
        
        for (const st of statuses) {
          try {
            const loadsForStatus = await loadsService.getMyLoads(st);
            if (loadsForStatus && loadsForStatus.length > 0) {
              allLoads = [...allLoads, ...loadsForStatus];
            }
          } catch (err) {
            console.warn(`Failed to fetch ${st} loads`);
          }
        }
        
        const draftsData = await loadsService.getMyDrafts();
        
        if (isMounted) {
          // Сортируем по свежести
          allLoads.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
          setListings(allLoads);
          if (draftsData) setDrafts(draftsData);
        }
      } catch (error) {
        console.warn("API Error while fetching listings:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchMyListings();

    return () => { isMounted = false; };
  }, []);

  const getTabCount = (tabName: string) => {
    if (tabName === "All") return listings.length;
    return listings.filter((load) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (load as any).status || "Active";
      return status === tabName;
    }).length;
  };

  const getFilteredData = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetData: any[] = []; 
    
    if (activeTab === "Drafts") {
      targetData = drafts;
    } else {
      if (activeTab === "All") {
        targetData = listings;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        targetData = listings.filter(l => ((l as any).status || "Active") === activeTab);
      }
    }
    
    return targetData.filter((item) => {
      if (!searchQuery) return true;

      const searchStr = searchQuery.toLowerCase();
      const isDraft = activeTab === "Drafts";
      
      const start = isDraft 
        ? (item.routePoints?.[0]?.city || "") 
        : (item.from || item.startCity || "");
        
      const end = isDraft 
        ? (item.routePoints?.[item.routePoints.length - 1]?.city || "") 
        : (item.to || item.endCity || "");
        
      const article = item.article ? String(item.article) : "";
      const id = item.id || "";
      
      return (
        id.toLowerCase().includes(searchStr) ||
        article.toLowerCase().includes(searchStr) ||
        start.toLowerCase().includes(searchStr) ||
        end.toLowerCase().includes(searchStr)
      );
    });
  };

  const displayData = getFilteredData();

  const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await loadsService.deleteDraft(draftId);
        setDrafts(prev => prev.filter(d => d.id !== draftId));
      } catch (error) {
        console.error('Failed to delete draft', error);
        alert('Failed to delete draft. It might have already been removed.');
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#F6F7FB" }}>
      
      <header className="dash-header" style={{ padding: "16px 32px", borderBottom: "1px solid #E6E8EE", background: "white", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: "#A0AAB9", cursor: "default" }}>Workspace</span>
              <span className="dash-detail-breadcrumb-arrow" style={{ margin: "0 8px", color: "#E6E8EE" }}>›</span>
              <strong style={{ color: "#0E1116", fontWeight: 500 }}>My listings</strong>
            </div>
            <h1 className="dash-title" style={{ fontSize: "24px", fontWeight: 400, color: "#0E1116", letterSpacing: "-1px", marginTop: "4px" }}>My listings</h1>
          </div>
        </div>
      </header>

      <div style={{ padding: "32px 32px", width: "100%", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", boxSizing: "border-box" }}>
        
        <div style={{ background: "white", border: "1px solid #E6E8EE", borderRadius: "12px", padding: "10px 16px", display: "flex", gap: "16px", justifyContent: "space-between", alignItems: "center", overflowX: "auto" }}>
          
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", flexShrink: 0 }}>
            {["All", "Active", "Pending", "Booked", "Rejected", "Closed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "#0E1116" : "transparent",
                  color: activeTab === tab ? "white" : "#5C6470",
                  border: "none", 
                  padding: "8px 12px", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  transition: "all 0.2s", 
                  whiteSpace: "nowrap"
                }}
              >
                {tab}
                <span style={{ margin: "0 6px", opacity: activeTab === tab ? 0.5 : 0.3 }}>·</span>
                <span style={{ fontSize: "12px", fontWeight: 500 }}>{getTabCount(tab)}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            <button
              onClick={() => setActiveTab("Drafts")}
              style={{
                background: activeTab === "Drafts" ? "#EEF1FF" : "transparent",
                color: activeTab === "Drafts" ? "#3D5AFE" : "#5C6470",
                border: activeTab === "Drafts" ? "1px solid #3D5AFE" : "1px solid transparent",
                padding: "8px 16px", 
                borderRadius: "8px", 
                fontSize: "14px", 
                fontWeight: 600, 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                transition: "all 0.2s", 
                whiteSpace: "nowrap"
              }}
            >
              Drafts
              <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>{drafts.length}</span>
            </button>

            <div style={{ width: "1px", height: "24px", background: "#E6E8EE" }}></div> 

            <div style={{ position: "relative", width: "240px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#A0AAB9", fontSize: "14px" }}>🔍</span>
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "10px 16px 10px 36px", border: "1px solid #E6E8EE", borderRadius: "8px", fontSize: "14px", width: "100%", outline: "none", color: "#0E1116", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #E6E8EE", borderRadius: "12px", overflow: "hidden", width: "100%" }}>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                {activeTab === "Drafts" ? (
                  <tr style={{ background: "#FAFAFA" }}>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Draft ID</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Route</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Cargo</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Price</th>
                    <th style={{ padding: "16px 24px", borderBottom: "1px solid #E6E8EE" }}></th>
                  </tr>
                ) : (
                  <tr style={{ background: "#FAFAFA" }}>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Load ID</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Route</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Date</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Cargo</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Price</th>
                    <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Status</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === "Drafts" ? 5 : 6} style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                      Loading...
                    </td>
                  </tr>
                ) : displayData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "Drafts" ? 5 : 6} style={{ padding: "80px", textAlign: "center", color: "#A0AAB9" }}>
                      No listings found in this category.
                    </td>
                  </tr>
                ) : activeTab === "Drafts" ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  displayData.map((draft: any, idx) => {
                    const startCity = draft.routePoints?.[0]?.city || draft.routePoints?.[0]?.address || 'Incomplete route';
                    const endCity = draft.routePoints?.[draft.routePoints.length - 1]?.city || draft.routePoints?.[draft.routePoints.length - 1]?.address || '...';
                    
                    return (
                      <tr 
                        key={idx} 
                        style={{ borderBottom: "1px solid #F6F7FB", cursor: "pointer" }} 
                        onClick={() => navigate(`/orders/create?draftId=${draft.id}`)} 
                        className="table-row-hover"
                      >
                        <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#5C6470" }}>
                            {draft.id.substring(0, 10).toUpperCase()}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: "#0E1116", display: "flex", alignItems: "center", gap: "8px" }}>
                             {startCity} <span style={{ color: "#A0AAB9" }}>→</span> {endCity}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "14px", color: "#5C6470" }}>
                          {draft.cargoType || 'Cargo not specified'}
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "15px", fontWeight: 600, color: "#0E1116" }}>
                          {draft.payment ? `€${draft.payment.toLocaleString('en-US')}` : '-'}
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button 
                            onClick={(e) => handleDeleteDraft(e, draft.id)}
                            style={{ color: '#EF4444', border: '1px solid #FCA5A5', background: '#FEF2F2', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: "background 0.2s" }}
                          >
                            Delete
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/orders/create?draftId=${draft.id}`); }}
                            style={{ color: "#3D5AFE", background: "#EEF1FF", padding: "6px 16px", borderRadius: "6px", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "13px", transition: "background 0.2s" }}
                          >
                            Edit draft ›
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  displayData.map((load: any, idx) => {
                    const rawStatus = load.status || "Active";
                    
                    let statusColor = "#059669"; 
                    let statusBg = "#ECFDF5"; 
                    let statusBorder = "#A7F3D0";
                    
                    if (rawStatus === "Booked") { 
                      statusColor = "#10B981"; statusBg = "#ECFDF5"; statusBorder = "#A7F3D0"; 
                    } else if (rawStatus === "Rejected") { 
                      statusColor = "#EF4444"; statusBg = "#FEF2F2"; statusBorder = "#FECACA"; 
                    } else if (rawStatus === "Pending") { 
                      statusColor = "#3D5AFE"; statusBg = "#EEF1FF"; statusBorder = "#C7D2FE"; 
                    } else if (rawStatus === "Closed") {
                      statusColor = "#5C6470"; statusBg = "#F6F7FB"; statusBorder = "#E6E8EE";
                    }

                    return (
                      <tr 
                        key={idx} 
                        style={{ borderBottom: "1px solid #F6F7FB", cursor: "pointer" }} 
                        onClick={() => navigate(`/orders/${load.id}`)} 
                        className="table-row-hover"
                      >
                        <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#5C6470" }}>
                            {load.article || load.id.substring(0,8).toUpperCase()}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: "#0E1116", marginBottom: "4px" }}>
                            <span style={{ width: "6px", height: "6px", background: "#3D5AFE", borderRadius: "50%", display: "inline-block" }}></span> 
                            {load.from?.split(',')[0] || 'N/A'}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: "#0E1116" }}>
                            <span style={{ width: "6px", height: "6px", background: "#00C48C", borderRadius: "50%", display: "inline-block" }}></span> 
                            {load.to?.split(',')[0] || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "13px", color: "#0E1116" }}>
                          {formatMonthDay(load.dateStart)}
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "14px", color: "#0E1116" }}>
                          {load.cargo} <span style={{ color: "#A0AAB9" }}>• {load.weight}t</span>
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top", fontSize: "16px", fontWeight: 600, color: "#0E1116" }}>
                          €{load.price.toLocaleString('en-US')}
                        </td>
                        <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                          <span style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 600 }}>
                            {rawStatus}
                          </span>
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
        ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  );
};

export default MyListingsPage;