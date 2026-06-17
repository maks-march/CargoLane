import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.store'; 

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user); 

  const [sidebarStats, setSidebarStats] = useState({ listings: 0, messages: 0 });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const dbListings = 0; 
        const dbMessages = 0; 
        
        setSidebarStats({ listings: dbListings, messages: dbMessages });
      } catch {
        console.error("Failed to load sidebar stats");
      }
    };
    fetchUserStats();
  }, []);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
    return 'U';
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-logo" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">▲</div>
        <span>Cargolane</span>
      </div>

      <button className="dash-new-listing" onClick={() => navigate('/orders/create')}>
        + New listing
      </button>

      <div className="dash-nav-section">Marketplace</div>
      <div className={`dash-nav-item ${isActive('/orders', true) ? 'active' : ''}`} onClick={() => navigate('/orders')}>
        🔍 Search
      </div>
      <div className={`dash-nav-item ${isActive('/saved') ? 'active' : ''}`} onClick={() => navigate('/saved')}>
        📌 Saved searches
      </div>

      <div className="dash-nav-section" style={{ marginTop: '16px' }}>Workspace</div>
      <div className={`dash-nav-item ${isActive('/my-listings') ? 'active' : ''}`} onClick={() => navigate('/my-listings')}>
        📦 My listings 
        {sidebarStats.listings > 0 && (
          <span className="dash-nav-badge">{sidebarStats.listings}</span>
        )}
      </div>
      <div className={`dash-nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={() => navigate('/chat')}>
        💬 Messages 
        {sidebarStats.messages > 0 && (
          <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>{sidebarStats.messages}</span>
        )}
      </div>

      <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
      <div className={`dash-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
        ⚙ Settings
      </div>

      <div className="dash-user">
        <div className="dash-user-avatar">{getInitials(user?.name)}</div>
        <div className="dash-user-info">
          <div className="dash-user-name">{user?.name || 'User'}</div>
          {/* ИСПРАВЛЕНО: Безопасное приведение типов для устранения ошибки TS */}
          <div className="dash-user-company">{((user as unknown) as { role?: string })?.role || 'Carrier Pro'}</div>
        </div>
      </div>
    </aside>
  );
};