import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Layout/Sidebar';
import { loadsService } from '../../services/loadsService';

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // АБСОЛЮТНО ПУСТОЙ СТЕЙТ - Ждем базу данных!
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        // БЕКЕНДЕРУ: Тут нужен отдельный метод GET /api/Load/my-listings
        // Сейчас используем общий запрос для заглушки архитектуры
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

  const handleSidebarNavigate = (page: string) => {
    if (page === 'messages') navigate('/chat');
    else if (page === 'settings') navigate('/settings');
    else if (page === 'create-load') navigate('/create-load');
    else if (page === 'dashboard') navigate('/orders');
    else if (page === 'my-listings') navigate('/my-listings');
    else navigate(`/${page}`);
  };

  // Фронтенд поиск по таблице (мгновенная фильтрация без нагрузки на БД)
  const filteredListings = listings.filter(load => 
    load.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.to?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={handleSidebarNavigate} activePage="my-listings" />

      <main className="dash-main" style={{ background: '#F6F7FB', minHeight: '100vh' }}>
        
        {/* ХЕДЕР */}
        <header className="dash-header" style={{ padding: '16px 32px', borderBottom: '1px solid #E6E8EE', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <div className="dash-breadcrumb">
                {/* АРХИТЕКТУРА: Слово Workspace серое, некликабельное, как в макете */}
                <span style={{ color: '#A0AAB9', cursor: 'default' }}>Workspace</span>
                <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px', color: '#E6E8EE' }}>›</span>
                <strong style={{ color: '#0E1116', fontWeight: 500 }}>My listings</strong>
              </div>
              <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginTop: '4px' }}>My listings</h1>
            </div>
          </div>
        </header>

        <div className="my-listings-layout" style={{ padding: '32px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="my-listings-toolbar-card" style={{ background: 'white', border: '1px solid #E6E8EE', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="my-listings-tabs" style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Active', 'Pending', 'Drafts', 'Closed'].map(tab => (
                <button 
                  key={tab}
                  className={`my-listings-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#0E1116' : 'transparent',
                    color: activeTab === tab ? 'white' : '#5C6470',
                    border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                  }}
                >
                  {tab} 
                  <span className="tab-count" style={{
                    background: activeTab === tab ? 'rgba(255, 255, 255, 0.15)' : '#F6F7FB',
                    color: activeTab === tab ? 'white' : '#5C6470',
                    padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600
                  }}>
                    {tab === 'All' ? listings.length : 0}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="my-listings-actions-right">
              <div className="my-listings-search-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span className="search-icon" style={{ position: 'absolute', left: '12px', color: '#A0AAB9', fontSize: '14px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search listings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 16px 10px 36px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', width: '280px', outline: 'none', color: '#0E1116' }}
                />
              </div>
            </div>
          </div>

          <div className="my-listings-table-card" style={{ background: 'white', border: '1px solid #E6E8EE', borderRadius: '12px', overflow: 'hidden' }}>
            <table className="my-listings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAFAFA' }}>
                  <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600, borderBottom: '1px solid #E6E8EE' }}>Load ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600, borderBottom: '1px solid #E6E8EE' }}>Route</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600, borderBottom: '1px solid #E6E8EE' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600, borderBottom: '1px solid #E6E8EE' }}>Cargo</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600, borderBottom: '1px solid #E6E8EE' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading your listings...</td></tr>
                ) : filteredListings.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#A0AAB9' }}>You have no listings yet. Create a load to see it here.</td></tr>
                ) : (
                  filteredListings.map(load => (
                    <tr key={load.id} style={{ borderBottom: '1px solid #F6F7FB', cursor: 'pointer' }} onClick={() => navigate(`/load-details?loadId=${load.id}`)}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0E1116' }}>{load.id}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0E1116', fontWeight: 500 }}>{load.from.split(',')[0]} → {load.to.split(',')[0]}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0E1116' }}>{load.dateStart}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#0E1116' }}>{load.cargo}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className="status-pill active" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 500 }}>
                          {load.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MyListingsPage;