import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontSize: '1rem' }}>
      <aside style={{ 
        width: '16rem', 
        background: '#fff', 
        borderRight: '1px solid #E5E7EB', 
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{
            width: '2.25rem',
            height: '2.25rem',
            background: '#3B82F6',
            color: 'white',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.125rem'
          }}>C</div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>CargoLane</span>
        </div>

        <button 
          onClick={() => navigate('/orders/create')}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          + New listing
        </button>

        <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, marginBottom: '0.5rem' }}>MARKETPLACE</div>
        <NavLink to="/orders" style={({ isActive }) => ({ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#111827' : '#374151',
          background: isActive ? '#F3F4F6' : 'transparent', marginBottom: '0.25rem' 
        })}>🔍 Search</NavLink>
        <NavLink to="/saved" style={({ isActive }) => ({ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#111827' : '#374151',
          background: isActive ? '#F3F4F6' : 'transparent', marginBottom: '0.25rem' 
        })}>📌 Saved searches</NavLink>

        <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, margin: '1.25rem 0 0.5rem' }}>WORKSPACE</div>
        <NavLink to="/my-listings" style={({ isActive }) => ({ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#111827' : '#374151',
          background: isActive ? '#F3F4F6' : 'transparent', marginBottom: '0.25rem' 
        })}>📦 My listings <span style={{ marginLeft: 'auto', background: '#E5E7EB', padding: '0 0.375rem', borderRadius: '9999px', fontSize: '0.75rem' }}>6</span></NavLink>
        <NavLink to="/chat" style={({ isActive }) => ({ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#111827' : '#374151',
          background: isActive ? '#F3F4F6' : 'transparent', marginBottom: '0.25rem' 
        })}>💬 Messages <span style={{ marginLeft: 'auto', background: '#F6F7FB', color: '#5C6470', padding: '0 0.375rem', borderRadius: '9999px', fontSize: '0.75rem' }}>1</span></NavLink>

        <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, margin: '1.25rem 0 0.5rem' }}>OTHER</div>
        <NavLink to="/settings" style={({ isActive }) => ({ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#111827' : '#374151',
          background: isActive ? '#F3F4F6' : 'transparent', marginBottom: '0.25rem' 
        })}>⚙ Settings</NavLink>
        
        <div onClick={logout} style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', 
          borderRadius: '0.5rem', cursor: 'pointer', marginTop: 'auto', color: '#374151' 
        }}>🚪 Logout</div>

        {/* User block with proper oval avatar + grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2.75rem 1fr', 
          gap: '0.75rem', 
          alignItems: 'center',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #E5E7EB'
        }}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            background: '#3B82F6',
            color: 'white',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '1rem',
            flexShrink: 0
          }}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'EM'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Elena Marek'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Nordhafen Logistics
            </div>
          </div>
        </div>
      </aside>

      <main style={{ 
        flex: 1, 
        marginLeft: '16rem', 
        padding: '1.5rem 2rem',
        background: '#F8F9FC',
        minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
