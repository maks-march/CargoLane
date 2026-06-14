import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid #E5E7EB', background: 'white' }}>
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div className="logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '20px', color: '#111827', cursor: 'pointer' }}>
          <div className="logo-icon" style={{ width: '28px', height: '28px', background: '#3B82F6', borderRadius: '6px' }}></div>
          CargoLane
        </div>
        
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500, color: '#4B5563', marginLeft: '16px' }}>
          <Link to="/#features" style={{ transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#111827'} onMouseOut={e => e.currentTarget.style.color = '#4B5563'}>Features</Link>
          <Link to="/#solutions" style={{ transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#111827'} onMouseOut={e => e.currentTarget.style.color = '#4B5563'}>Solutions</Link>
          <Link to="/#pricing" style={{ transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#111827'} onMouseOut={e => e.currentTarget.style.color = '#4B5563'}>Pricing</Link>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn-figma-secondary" onClick={() => navigate('/login')}>Log in</button>
        <button className="btn-figma-primary" onClick={() => navigate('/register')}>Sign up</button>
      </div>
    </nav>
  );
};

export default Navbar;