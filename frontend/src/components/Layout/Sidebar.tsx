import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Функция для проверки активной вкладки
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
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
        📦 My listings <span className="dash-nav-badge">6</span>
      </div>
      <div className={`dash-nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={() => navigate('/chat')}>
        💬 Messages <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>1</span>
      </div>

      <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
      <div className={`dash-nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
        ⚙ Settings
      </div>

      <div className="dash-user">
        <div className="dash-user-avatar">SG</div>
        <div className="dash-user-info">
          <div className="dash-user-name">Sergey G.</div>
          <div className="dash-user-company">Carrier Pro</div>
        </div>
      </div>
    </aside>
  );
};