import React from 'react';
import type { PageType } from '../../types';

interface NavbarProps {
  onNavigate: (page: PageType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">▲</div>
          Cargolane
        </div>
        <div className="nav-links">
          <a href="#">Find cargo</a>
          <a href="#">Find transport</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
        </div>
      </div>
      <div className="nav-right">
        <div className="lang-selector">🌐 EN</div>
        <button className="nav-btn" onClick={() => onNavigate('signin')}>Sign in</button>
        <button className="btn-primary" onClick={() => onNavigate('signup')}>Get started →</button>
      </div>
    </nav>
  );
};