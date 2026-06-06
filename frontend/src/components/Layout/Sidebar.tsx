import React from 'react';
import type { PageType } from '../../types';

interface SidebarProps {
  onNavigate: (page: PageType) => void;
  activePage?: PageType;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activePage }) => {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">▲</div>
        Cargolane
      </div>
      <button className="dash-new-listing">+ New listing</button>
      
      <div className="dash-nav-section">Marketplace</div>
      <div 
        className={`dash-nav-item ${activePage?.startsWith('dashboard') ? 'active' : ''}`} 
        onClick={() => onNavigate('dashboard')}
      >
        <span>🔍</span> Search
      </div>
      <div 
        className={`dash-nav-item ${activePage === 'saved' ? 'active' : ''}`} 
        onClick={() => onNavigate('saved')}
      >
        <span>🔖</span> Saved searches
      </div>
      
      <div className="dash-nav-section">Workspace</div>
      <div className="dash-nav-item">
        <span>📦</span> My listings
        <span className="dash-nav-badge">7</span>
      </div>
      <div className="dash-nav-item">
        <span>💬</span> Messages
        <span className="dash-nav-badge">1</span>
      </div>
      
      <div className="dash-nav-section">Other</div>
      <div className="dash-nav-item">
        <span>⚙️</span> Settings
      </div>
      
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