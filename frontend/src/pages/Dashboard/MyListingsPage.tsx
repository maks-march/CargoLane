import React, { useState, useEffect, useMemo } from 'react';
import type { PageType, LoadData, NavigationPayload } from '../../types';
import { Sidebar } from '../../components/Layout/Sidebar';
import { loadsService } from '../../services/loadsService';

interface MyListingsPageProps {
  onNavigate: (page: PageType, payload?: NavigationPayload) => void;
}

interface MyLoadData extends LoadData {
  status: 'active' | 'pending' | 'draft' | 'closed';
  bids?: number;
  views?: number;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({ onNavigate }) => {
  const [loads, setLoads] = useState<MyLoadData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'draft' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMyLoads = async () => {
      setIsLoading(true);
      try {
        const data = await loadsService.getAllLoads();
        const safeData = (Array.isArray(data) ? data : []) as LoadData[];
        
        const loadsWithStatus: MyLoadData[] = safeData.slice(0, 7).map((load, index) => {
          let status: MyLoadData['status'] = 'active';
          let bids = 14;
          let views = 312;

          if (index === 1) { status = 'pending'; bids = 0; views = 12; }
          if (index === 2) { status = 'active'; bids = 22; views = 412; }
          if (index === 3) { status = 'draft'; bids = 0; views = 0; }
          if (index === 4) { status = 'closed'; bids = 18; views = 280; }
          if (index === 5) { status = 'closed'; bids = 11; views = 198; }

          return { ...load, status, bids, views };
        });
        
        setLoads(loadsWithStatus);
      } catch (error) {
        console.error("Data fetch error:", error);
        setLoads([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyLoads();
  }, []);

  const filteredLoads = useMemo(() => {
    if (!Array.isArray(loads)) return [];
    return loads.filter(load => {
      const matchesTab = activeTab === 'all' || load.status === activeTab;
      const matchesSearch = (load.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (load.from || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (load.to || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [loads, activeTab, searchQuery]);

  const counts = {
    all: Array.isArray(loads) ? loads.length : 0,
    active: Array.isArray(loads) ? loads.filter(l => l.status === 'active').length : 0,
    pending: Array.isArray(loads) ? loads.filter(l => l.status === 'pending').length : 0,
    draft: Array.isArray(loads) ? loads.filter(l => l.status === 'draft').length : 0,
    closed: Array.isArray(loads) ? loads.filter(l => l.status === 'closed').length : 0,
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = { active: 'Active', pending: 'In review', draft: 'Draft', closed: 'Closed' };
    return <span className={`status-pill ${status}`}>{labels[status]}</span>;
  };

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="listings" />
      
      <main className="dash-main" style={{ background: '#F6F7FB', minHeight: '100vh' }}>
        <header className="create-header" style={{ padding: '16px 48px' }}>
          <div>
            <div className="dash-breadcrumb">
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Workspace</span> 
              <span className="dash-detail-breadcrumb-arrow"> › </span> 
              <strong style={{color: '#0E1116'}}>My listings</strong>
            </div>
            <h1 className="create-header-title">My listings</h1>
          </div>
          
          <div className="create-header-actions">
            <button className="btn-figma-primary" onClick={() => onNavigate('create-load')}>
              + New listing
            </button>
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <div className="my-listings-layout">
          
          <div className="my-listings-toolbar-card">
            <div className="my-listings-tabs">
              <button className={`my-listings-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                All <span className="tab-count">{counts.all}</span>
              </button>
              <button className={`my-listings-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                Active <span className="tab-count">{counts.active}</span>
              </button>
              <button className={`my-listings-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                Pending <span className="tab-count">{counts.pending}</span>
              </button>
              <button className={`my-listings-tab ${activeTab === 'draft' ? 'active' : ''}`} onClick={() => setActiveTab('draft')}>
                Drafts <span className="tab-count">{counts.draft}</span>
              </button>
              <button className={`my-listings-tab ${activeTab === 'closed' ? 'active' : ''}`} onClick={() => setActiveTab('closed')}>
                Closed <span className="tab-count">{counts.closed}</span>
              </button>
            </div>
            
            <div className="my-listings-actions-right">
              <div className="my-listings-search-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by ID, city, cargo..." 
                  className="my-listings-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* КНОПКА FILTER ВЕРНУЛАСЬ СЮДА */}
              <button className="btn-figma-secondary">
                <span style={{ fontSize: '16px' }}>⚙</span> Filter
              </button>
            </div>
          </div>

          <div className="my-listings-table-card">
            {isLoading ? (
              <div className="dash-loading-container" style={{ padding: '60px' }}>⏳ Loading your listings...</div>
            ) : filteredLoads.length === 0 ? (
              <div className="dash-loading-container" style={{ padding: '60px', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '48px' }}>📦</div>
                <div style={{ color: '#0E1116', fontWeight: 600 }}>No listings found</div>
              </div>
            ) : (
              <table className="my-listings-table figma-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '24px' }}>Listing ID</th>
                    <th>Lane</th>
                    <th>Date</th>
                    <th>Cargo</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Bids</th>
                    <th>Views</th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map((load) => (
                    <tr 
                      key={load.id} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => onNavigate('load-detail', { loadId: load.id, fromPage: 'my-listings' })}
                    >
                      <td style={{ paddingLeft: '24px' }}>
                        <div className="load-id" style={{ color: '#3D5AFE', fontWeight: 600, fontSize: '14px' }}>{load.id}</div>
                      </td>
                      <td>
                        <div className="lane-cell">
                          {load.from} <span className="lane-arrow">›</span> {load.to}
                        </div>
                      </td>
                      <td style={{ color: '#5C6470' }}>{load.dateStart}</td>
                      <td>{load.cargo}</td>
                      <td style={{ fontWeight: 600 }}>{load.price}</td>
                      <td>{getStatusBadge(load.status)}</td>
                      <td style={{ fontWeight: 500 }}>{load.bids}</td>
                      <td style={{ color: '#5C6470' }}>{load.views}</td>
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                           {/* КНОПКА "ТРОЕТОЧИЕ" КАК В FIGMA */}
                          <button className="action-dots">⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};