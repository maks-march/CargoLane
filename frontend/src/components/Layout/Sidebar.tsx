import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Локальный стейт для динамических счетчиков (ждем БД)
  const [sidebarStats, setSidebarStats] = useState({ listings: 0, messages: 0 });

  useEffect(() => {
    // Сайдбар сам делает запрос в БД, чтобы цифры были актуальны на любой странице
    const fetchUserStats = async () => {
      try {
        // TODO ДЛЯ БЕКЕНДЕРА: Вставить реальные API вызовы
        // Пример: const dbListings = await loadsService.getMyLoadsCount();
        const dbListings = 0; // Заглушка, ждем БД
        const dbMessages = 0; // Заглушка, ждем БД
        
        setSidebarStats({ listings: dbListings, messages: dbMessages });
      } catch (error) {
        console.error("Failed to load sidebar stats");
      }
    };
    fetchUserStats();
  }, []);

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
        📦 My listings 
        {/* Условие: показываем кружок только если грузов больше 0 */}
        {sidebarStats.listings > 0 && (
          <span className="dash-nav-badge">{sidebarStats.listings}</span>
        )}
      </div>
      <div className={`dash-nav-item ${isActive('/chat') ? 'active' : ''}`} onClick={() => navigate('/chat')}>
        💬 Messages 
        {/* Условие: показываем кружок только если сообщений больше 0 */}
        {sidebarStats.messages > 0 && (
          <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>{sidebarStats.messages}</span>
        )}
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