import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadsService } from "../../services/loadsService";

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Стейт для данных
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        // TODO ДЛЯ БЕКЕНДЕРА: Заменить getAllLoads() на метод получения только грузов текущего юзера
        const data = await loadsService.getAllLoads();
        if (data && data.length > 0) {
          setListings(data);
        }
      } catch (error) {
        console.warn("Backend API /api/Load failed. Database is empty.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const getTabCount = (tabName: string) => {
    if (tabName === "All") return listings.length;
    return listings.filter((load) => (load.status || "Active") === tabName)
      .length;
  };

  const filteredListings = listings.filter((load) => {
    const matchesSearch =
      load.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.to?.toLowerCase().includes(searchQuery.toLowerCase());

    const loadStatus = load.status || "Active";
    const matchesTab = activeTab === "All" || loadStatus === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        background: "#F6F7FB",
      }}
    >
      {/* ХЕДЕР - Заменил 5% на фиксированные 32px */}
      <header
        className="dash-header"
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #E6E8EE",
          background: "white",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: "#A0AAB9", cursor: "default" }}>
                Workspace
              </span>
              <span
                className="dash-detail-breadcrumb-arrow"
                style={{ margin: "0 8px", color: "#E6E8EE" }}
              >
                ›
              </span>
              <strong style={{ color: "#0E1116", fontWeight: 500 }}>
                My listings
              </strong>
            </div>
            <h1
              className="dash-title"
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: "#0E1116",
                letterSpacing: "-1px",
                marginTop: "4px",
              }}
            >
              My listings
            </h1>
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ - Заменил 5% на фиксированные 32px */}
      <div
        className="my-listings-layout"
        style={{
          padding: "32px 32px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          className="my-listings-toolbar-card"
          style={{
            background: "white",
            border: "1px solid #E6E8EE",
            borderRadius: "12px",
            padding: "10px 16px",
            display: "flex",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          <div
            className="my-listings-tabs"
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              flexShrink: 0,
            }}
          >
            {["All", "Active", "Pending", "Drafts", "Closed"].map((tab) => (
              <button
                key={tab}
                className={`my-listings-tab ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "#0E1116" : "transparent",
                  color: activeTab === tab ? "white" : "#5C6470",
                  border: "none",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
                <span
                  style={{
                    margin: "0 6px",
                    opacity: activeTab === tab ? 0.5 : 0.3,
                  }}
                >
                  ·
                </span>
                <span
                  className="tab-count"
                  style={{
                    background: "rgba(255, 255, 255, 0)",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </div>

          <div
            className="my-listings-actions-right"
            style={{
              flex: "0 1 280px",
              minWidth: "120px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              className="my-listings-search-wrapper"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span
                className="search-icon"
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#A0AAB9",
                  fontSize: "14px",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px 10px 36px",
                  border: "1px solid #E6E8EE",
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "100%",
                  outline: "none",
                  color: "#0E1116",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="my-listings-table-card"
          style={{
            background: "white",
            border: "1px solid #E6E8EE",
            borderRadius: "12px",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              className="my-listings-table"
              style={{
                width: "100%",
                minWidth: "800px",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Load ID</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Route</th>
                  <th style={{ padding: "12px 24px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Date</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Cargo</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", fontWeight: 600, borderBottom: "1px solid #E6E8EE" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                      Loading your listings...
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "80px", textAlign: "center", color: "#A0AAB9" }}>
                      No listings found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((load) => (
                    <tr
                      key={load.id}
                      style={{ borderBottom: "1px solid #F6F7FB", cursor: "pointer" }}
                      onClick={() => navigate(`/load-details?loadId=${load.id}`)}
                      className="table-row-hover"
                    >
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#0E1116" }}>
                        {load.id}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#0E1116", fontWeight: 500 }}>
                        {load.from.split(",")[0]} → {load.to.split(",")[0]}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#0E1116" }}>
                        {load.dateStart}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#0E1116" }}>
                        {load.cargo}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          className="status-pill active"
                          style={{
                            background: "#ECFDF5",
                            color: "#059669",
                            border: "1px solid #A7F3D0",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {load.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .table-row-hover:hover { background-color: #FAFAFA !important; }

        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        * {
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default MyListingsPage;