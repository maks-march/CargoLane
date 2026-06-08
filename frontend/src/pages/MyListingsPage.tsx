import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadsService } from '../services/loadsService';
import { mapOrderToLoad } from '../utils/mappers';
import type { LoadData } from '../utils/types';
// import type { OrderListVm } from '../api/types';

interface MyLoadData extends LoadData {
  status: 'active' | 'pending' | 'draft' | 'closed';
  bids?: number;
  views?: number;
}

const MyListingsPage: React.FC = () => {
  const [loads, setLoads] = useState<MyLoadData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'draft' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyLoads = async () => {
      setIsLoading(true);
      try {
        const orders = await loadsService.getUserLoads();
        
        const loadsWithStatus: MyLoadData[] = orders.map((order) => {
          const load = mapOrderToLoad(order);
          let status: MyLoadData['status'] = 'active';
          if (order.status) {
            const lowerStatus = order.status.toLowerCase();
            if (['active', 'pending', 'draft', 'closed'].includes(lowerStatus)) {
              status = lowerStatus as MyLoadData['status'];
            } else if (lowerStatus === 'ready') {
              status = 'active'; 
            }
          }
          return { 
            ...load, 
            status, 
            bids: 0, 
            views: 0 
          };
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
    return loads.filter(load => {
      const matchesTab = activeTab === 'all' || load.status === activeTab;
      const matchesSearch = (load.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (load.from || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (load.to || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [loads, activeTab, searchQuery]);

  const counts = {
    all: loads.length,
    active: loads.filter(l => l.status === 'active').length,
    pending: loads.filter(l => l.status === 'pending').length,
    draft: loads.filter(l => l.status === 'draft').length,
    closed: loads.filter(l => l.status === 'closed').length,
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = { active: 'Active', pending: 'In review', draft: 'Draft', closed: 'Closed' };
    return <span className={`status-pill ${status}`}>{labels[status] || 'Active'}</span>;
  };

  return (
    <>
      <header className="create-header" style={{ padding: '16px 48px' }}>
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/')}>Workspace</span> 
            <span className="dash-detail-breadcrumb-arrow"> › </span> 
            <strong style={{color: '#0E1116'}}>My listings</strong>
          </div>
          <h1 className="create-header-title">My listings</h1>
        </div>
        
        <div className="create-header-actions">
          <button className="btn-figma-primary" onClick={() => navigate('/orders/create')}>
            + New listing
          </button>
          <div className="dash-notify">🔔</div>
        </div>
      </header>

      <div className="my-listings-layout">
        <div className="my-listings-toolbar-card">
          <div className="my-listings-tabs">
            {(['all', 'active', 'pending', 'draft', 'closed'] as const).map(tab => (
              <button 
                key={tab}
                className={`my-listings-tab ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} <span className="tab-count">{counts[tab]}</span>
              </button>
            ))}
          </div>
          
          <div className="my-listings-actions-right" style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
            <div className="my-listings-search-wrapper" style={{ width: '300px' }}>
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by ID, city, cargo..." 
                className="my-listings-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="my-listings-table-card">
          {isLoading ? (
            <div className="dash-loading-container" style={{ padding: '60px', textAlign: 'center', color: '#5C6470' }}>⏳ Loading your listings...</div>
          ) : filteredLoads.length === 0 ? (
            <div className="dash-loading-container" style={{ padding: '60px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
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
                    onClick={() => navigate(`/orders/${load.id}`)}
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
    </>
  );
};

export default MyListingsPage;
