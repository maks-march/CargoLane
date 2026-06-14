import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#111827', color: 'white', padding: '64px 48px 32px', marginTop: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', maxWidth: '1440px', margin: '0 auto 48px' }}>
        <div style={{ maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
            <div className="logo-icon" style={{ width: '28px', height: '28px', background: '#3B82F6', borderRadius: '6px' }}></div>
            CargoLane
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6' }}>
            The modern logistics platform connecting shippers and carriers with real-time tracking and automated documentation.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '80px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: '#F9FAFB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9CA3AF', padding: 0, listStyle: 'none' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>For Shippers</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>For Carriers</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>Integrations</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>Pricing</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px', color: '#F9FAFB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#9CA3AF', padding: 0, listStyle: 'none' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>About Us</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>Careers</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>Blog</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}>Contact</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: '1440px', margin: '0 auto', borderTop: '1px solid #374151', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#6B7280' }}>
        <div>© 2026 CargoLane. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#D1D5DB'} onMouseOut={e => e.currentTarget.style.color = '#6B7280'}>Privacy Policy</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#D1D5DB'} onMouseOut={e => e.currentTarget.style.color = '#6B7280'}>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;