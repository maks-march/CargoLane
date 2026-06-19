import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.store'; 

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user); 

  const [sidebarStats, setSidebarStats] = useState({ listings: 0, messages: 0 });

  const isModerator = user?.role === 'Admin' || user?.role === 'Moderator'; 

  // ИСПРАВЛЕНО: Динамические безопасные пути в зависимости от роли
  const chatPath = isModerator ? '/admin/chat' : '/chat';
  const settingsPath = isModerator ? '/admin/settings' : '/settings';

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
    const parts = name.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
    return 'U';
  };

  const displayName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'User';
  const companyName = user?.companyName || (isModerator ? 'Moderator' : (user?.role || 'Carrier Pro'));

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-logo" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">▲</div>
        <span>Cargolane {isModerator && <span style={{ color: '#3D5AFE' }}>Mod</span>}</span>
      </div>

      {!isModerator && (
        <button className="dash-new-listing" onClick={() => navigate('/orders/create')}>
          + New listing
        </button>
      )}

      {/* МАРКЕТПЛЕЙС */}
      <div className="dash-nav-section" style={{ marginTop: isModerator ? '32px' : '0' }}>Marketplace</div>
      <div className={`dash-nav-item ${isActive('/orders', true) ? 'active' : ''}`} onClick={() => navigate('/orders')}>
        🔍 Search
      </div>
      
      {!isModerator && (
        <div className={`dash-nav-item ${isActive('/saved') ? 'active' : ''}`} onClick={() => navigate('/saved')}>
          📌 Saved searches
        </div>
      )}

      {/* МОДЕРАЦИЯ (Только для админа) */}
      {isModerator && (
        <>
          <div className="dash-nav-section" style={{ marginTop: '16px' }}>Moderation</div>
          <div className={`dash-nav-item ${isActive('/admin/reviews') ? 'active' : ''}`} onClick={() => navigate('/admin/reviews')}>
            🛡️ Review queue
          </div>
          <div className={`dash-nav-item ${isActive('/admin/approved') ? 'active' : ''}`} onClick={() => navigate('/admin/approved')}>
            ✓ Approved
          </div>
          <div className={`dash-nav-item ${isActive('/admin/rejected') ? 'active' : ''}`} onClick={() => navigate('/admin/rejected')}>
            ✕ Rejected
          </div>
        </>
      )}

      {/* ВОРКСПЕЙС */}
      {!isModerator && (
        <>
          <div className="dash-nav-section" style={{ marginTop: '16px' }}>Workspace</div>
          <div className={`dash-nav-item ${isActive('/my-listings') ? 'active' : ''}`} onClick={() => navigate('/my-listings')}>
            📦 My listings 
            {sidebarStats.listings > 0 && (
              <span className="dash-nav-badge">{sidebarStats.listings}</span>
            )}
          </div>
        </>
      )}

      {/* СООБЩЕНИЯ */}
      {!isModerator ? (
        <div className={`dash-nav-item ${isActive(chatPath) ? 'active' : ''}`} onClick={() => navigate(chatPath)}>
          💬 Messages 
          {sidebarStats.messages > 0 && (
            <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>{sidebarStats.messages}</span>
          )}
        </div>
      ) : (
        <>
          <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
          <div className={`dash-nav-item ${isActive(chatPath) ? 'active' : ''}`} onClick={() => navigate(chatPath)}>
            💬 Messages 
            {sidebarStats.messages > 0 && (
              <span className="dash-nav-badge" style={{ background: '#F6F7FB', color: '#5C6470' }}>{sidebarStats.messages}</span>
            )}
          </div>
        </>
      )}

      {/* ДРУГОЕ */}
      {!isModerator && (
        <div className="dash-nav-section" style={{ marginTop: '16px' }}>Other</div>
      )}
      
      {/* НАСТРОЙКИ */}
      <div 
        className={`dash-nav-item ${isActive(settingsPath) ? 'active' : ''}`} 
        onClick={() => navigate(settingsPath)}
      >
        ⚙ Settings
      </div>

      <div className="dash-user">
        <div className="dash-user-avatar" style={{ padding: 0, overflow: 'hidden' }}>
          {user?.avatarUrl ? (
             <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             getInitials(displayName)
          )}
        </div>
        <div className="dash-user-info" style={{ overflow: 'hidden' }}>
          <div className="dash-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div className="dash-user-company" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;