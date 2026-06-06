import React from 'react';
import type { PageType } from '../../types';

interface FooterProps {
  onNavigate: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">▲</div>
          Cargolane
        </div>
        <span className="footer-copy">© 2026 Cargolane</span>
      </div>
      <a href="#" className="footer-right">Status</a>
    </footer>
  );
};