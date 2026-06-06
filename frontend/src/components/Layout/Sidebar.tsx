import React from 'react';
import type { PageType, NavigationPayload } from '../../types';

interface SidebarProps {
  onNavigate: (page: PageType, payload?: NavigationPayload) => void;
  activePage: 'dashboard' | 'listings' | 'messages' | 'settings' | 'saved';
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activePage }) => {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">▲</div>
        <span>Cargolane</span>
      </div>

      <button className="dash-new-listing" onClick={() => onNavigate('create-load')}>
        + New listing
      </button>

      <div className="dash-nav-section">Marketplace</div>
      <div className={`dash-nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>
        🔍 Search
      </div>
      <div className={`dash-nav-item ${activePage === 'saved' ? 'active' : ''}`} onClick={() => onNavigate('saved')}>
        📌 Saved searches
      </div>

      <div className="dash-nav-section" style={{ marginTop: '16px' }}>Workspace</div>
      <div className={`dash-nav-item ${activePage === 'listings' ? 'active' : ''}`} onClick={() => onNavigate('my-listings')}>
        📦 My listings <span className="dash-nav-badge">6</span>
      </div>
      <div className="dash-nav-item">
        💬 Messages <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>1</span>
      </div>

      <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
      <div className={`dash-nav-item ${activePage === 'settings' ? 'active' : ''}`}>⚙ Settings</div>

      <div className="dash-user">
        <div className="dash-user-avatar">EM</div>
        <div className="dash-user-info">
          <div className="dash-user-name">Elena Marek</div>
          <div className="dash-user-company">Nordhafen Logistics</div>
        </div>
      </div>
    </aside>
  );
};