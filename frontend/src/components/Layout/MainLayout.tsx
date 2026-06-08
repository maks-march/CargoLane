import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page active">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">C</div>
          <span>CargoLane</span>
        </div>

        <button className="dash-new-listing" onClick={() => navigate('/orders/create')}>
          + New listing
        </button>

        <div className="dash-nav-section">Marketplace</div>
        <NavLink to="/orders" className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}>
          🔍 Search
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}>
          📌 Saved searches
        </NavLink>

        <div className="dash-nav-section" style={{ marginTop: '16px' }}>Workspace</div>
        <NavLink to="/my-listings" className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}>
          📦 My listings <span className="dash-nav-badge">6</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}>
          💬 Messages <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>1</span>
        </NavLink>

        <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
        <NavLink to="/settings" className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}>
          ⚙ Settings
        </NavLink>
        <div className="dash-nav-item" onClick={logout} style={{ marginTop: 'auto', cursor: 'pointer' }}>
          🚪 Logout
        </div>

        <div className="dash-user">
          <div className="dash-user-avatar">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : user?.id.substring(0, 2).toUpperCase() || '??'}
          </div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.name || 'User'}</div>
            <div className="dash-user-company">Company Name</div>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
