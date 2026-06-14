import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      
      <header className="dash-header">
        <div className="dash-breadcrumb">
          Marketplace <span style={{ color: '#ccc' }}>›</span> <strong>Saved searches</strong>
        </div>
        <div className="dash-header-right">
          <input type="text" className="dash-search" placeholder="🔍 Search lanes, cargo, ID..." />
          <button className="dash-post-btn" onClick={() => navigate('/orders/create')}>+ Post load</button>
          <div className="dash-notify">🔔</div>
        </div>
      </header>
      
      {/* Добавил flex: 1 и overflowY: 'auto', чтобы контент растягивался и скроллился внутри нового каркаса */}
      <div className="saved-searches-content" style={{ flex: 1, overflowY: 'auto' }}>
        <h2 className="saved-searches-title">Saved load board</h2>
        
        <div className="saved-search-card" onClick={() => navigate('/orders')}>
          <div className="saved-search-icon">🔍</div>
          <div className="saved-search-info">
            <div className="saved-search-name">Hamburg → Warsaw · Tautliner</div>
            <div className="saved-search-filters">From: Hamburg, DE · To: Warsaw, PL · Vehicle: Tautliner</div>
          </div>
          <div className="saved-search-count">3,184 loads</div>
        </div>
        
        <div className="saved-search-card" onClick={() => navigate('/orders')}>
          <div className="saved-search-icon">🔍</div>
          <div className="saved-search-info">
            <div className="saved-search-name">Rotterdam → Berlin · All vehicles</div>
            <div className="saved-search-filters">From: Rotterdam, NL · To: Berlin, DE · Cargo: Any</div>
          </div>
          <div className="saved-search-count">1,892 loads</div>
        </div>
        
        <div className="saved-search-card" onClick={() => navigate('/orders')}>
          <div className="saved-search-icon">🔍</div>
          <div className="saved-search-info">
            <div className="saved-search-name">Milan → Munich · Refrigerated</div>
            <div className="saved-search-filters">From: Milan, IT · To: Munich, DE · Cargo: Refrigerated</div>
          </div>
          <div className="saved-search-count">756 loads</div>
        </div>
      </div>

    </div>
  );
};

export default SavedPage;