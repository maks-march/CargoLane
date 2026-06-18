import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';


const formatCount = (num: number): string => {
  if (num === 0) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return Math.floor(num / 1000) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
  return (num / 1000000000000).toFixed(1).replace('.0', '') + 'T';
};

const formatMoney = (num: number): string => {
  if (num === 0) return '€0';
  if (num < 1000) return '€' + num.toString();
  if (num < 1000000) return '€' + Math.floor(num / 1000) + 'K';
  if (num < 1000000000) return '€' + (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num < 1000000000000) return '€' + (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
  return '€' + (num / 1000000000000).toFixed(1).replace('.0', '') + 'T';
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Стейт для карты
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [routeStops, setRouteStops] = useState<any[]>([]);
  
  // Стейт статистики
  const [stats, setStats] = useState({ loads: '0', carriers: '0', fee: '€0', support: '24/7' });

  // ИСПРАВЛЕНО: Подгружаем реальный свежий маршрут из БД для превью на карте
  useEffect(() => {
    const fetchLatestRoute = async () => {
      try {
        const data = await loadsService.getAllLoads();
        if (data && data.length > 0) {
          const latestLoad = data[0]; // Берем самый свежий груз
          if (latestLoad.from && latestLoad.to) {
            setRouteStops([
              { address: latestLoad.from.split(',')[0], type: 'start' },
              { address: latestLoad.to.split(',')[0], type: 'end' }
            ]);
          }
        }
      } catch {
        console.warn('Backend is down or empty. Map will start empty.');
      }
    };
    fetchLatestRoute();
  }, []);

  // Логика получения статистики с кэшем на 1 час
  useEffect(() => {
    const fetchStats = async () => {
      const cacheKey = 'cargo_stats_cache';
      const cacheTimeKey = 'cargo_stats_time';
      const now = new Date().getTime();

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && now - parseInt(cachedTime) < 3600000) {
        setStats(JSON.parse(cachedData));
        return;
      }

      try {
        const loads = await loadsService.getAllLoads();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalGMV = 0; 

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const monthlyLoads = loads.filter((load: any) => {
          if (!load.dateStart) return false;
          const loadDate = new Date(load.dateStart);
          const isThisMonth = loadDate.getMonth() === currentMonth && loadDate.getFullYear() === currentYear;
          
          if (isThisMonth && load.price) {
            totalGMV += Number(load.price);
          }
          
          return isThisMonth;
        });

        const newStats = { 
            loads: formatCount(monthlyLoads.length), 
            carriers: '0', 
            fee: formatMoney(totalGMV), 
            support: '24/7' 
        };
        
        setStats(newStats);
        localStorage.setItem(cacheKey, JSON.stringify(newStats));
        localStorage.setItem(cacheTimeKey, now.toString());
      } catch (e) {
        console.warn('Backend unavailable');
      }
    };
    fetchStats();
  }, []);

  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');

  const handleApplyRoute = () => {
    const newStops = [];
    if (fromAddress.trim()) newStops.push({ address: fromAddress, type: 'start' });
    if (toAddress.trim()) newStops.push({ address: toAddress, type: 'end' });
    setRouteStops(newStops);
  };

  const isFormValid = fromAddress.trim() !== '' && toAddress.trim() !== '';

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 1. NAVBAR */}
      <nav className="navbar" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 2.5%', 
          width: '100%', 
          boxSizing: 'border-box',
          background: '#FAFAFA'
      }}>
        <div className="nav-left">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">▲</div>
            Cargolane
          </div>
        </div>
        <div className="nav-right" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="nav-btn" onClick={() => navigate('/login')} style={{ background: 'transparent' }}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Get started →</button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="hero" style={{ 
          maxWidth: '2000px', 
          margin: '0 auto', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '250px', 
          padding: '64px 2.5%',
          width: '100%',
          boxSizing: 'border-box'
      }}>
        <div className="hero-left" style={{ flex: '1 1 600px', maxWidth: '700px' }}>
          <h1 style={{fontWeight: '400',fontSize: '67px',  lineHeight: 1.15, marginBottom: '24px' }}>
            The freight exchange <span className="highlight">built for Europe.</span>
          </h1>
          <p className="hero-desc" style={{ fontSize: '23px', lineHeight: 1.6, marginBottom: '32px' }}>
            Match cargo to capacity in seconds. Plan multi-stop routes, calculate volumes automatically, and trade with verified carriers — all GDPR-compliant, in 14 languages.
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
            <button className="btn-primary btn-large" onClick={() => navigate('/register')} style={{ fontWeight:'400', fontSize: '21px', padding: '16px 32px' }}>
              Post a load free →
            </button>
          </div>
        </div>
        
        <div className="hero-right" style={{ 
            flex: '1 1 450px', 
            width: '100%', 
            height: '600px', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            position: 'relative' 
        }}>
          <RoutingMap stops={routeStops} hideFloatingWidget={true} />
          
          <div className="search-card" style={{ position: 'absolute', top: '15px', left: '15px', right: 'auto', width: '320px', padding: '24px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(14, 17, 22, 0.12)', background: 'white', zIndex: 1000 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 20px 0' }}>Quick search</h3>
            <form onSubmit={(e) => { e.preventDefault(); navigate('/login'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              <div style={{ position: 'absolute', left: '21px', top: '30px', width: '2px', height: '36px', background: '#E6E8EE', zIndex: 1 }}></div>

              <div className="input-field" style={{ position: 'relative', zIndex: 2, background: 'white', padding: '12px 16px', border: '1px solid #E6E8EE', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <div className="dot" style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, transition: 'background 0.2s', background: fromAddress ? '#3D5AFE' : 'white', border: fromAddress ? 'none' : '2px solid #3D5AFE' }}></div>
                <input type="text" placeholder="Origin city" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} onBlur={handleApplyRoute} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', marginLeft: '12px', background: 'transparent' }} />
              </div>

              <div className="input-field" style={{ position: 'relative', zIndex: 2, background: 'white', padding: '12px 16px', border: '1px solid #E6E8EE', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <div className="dot green" style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, transition: 'background 0.2s', background: toAddress ? '#00C48C' : 'white', border: toAddress ? 'none' : '2px solid #00C48C' }}></div>
                <input type="text" placeholder="Destination city" value={toAddress} onChange={(e) => setToAddress(e.target.value)} onBlur={handleApplyRoute} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', marginLeft: '12px', background: 'transparent' }} />
              </div>

              <button type="submit" className="search-btn" disabled={!isFormValid} style={{ marginTop: '8px', padding: '14px', fontSize: '15px', fontWeight: '400',borderRadius: '8px', background: '#3D5AFE', color: 'white', border: 'none', opacity: !isFormValid ? 0.6 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="stats-section" style={{ borderTop: '1px solid #E6E8EE', borderBottom: '1px solid #E6E8EE', background: '#FAFAFA', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', padding: '64px 48px', maxWidth: '1750px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 400, color: '#0E1116' }}>{stats.loads}</div>
            <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Loads matched monthly</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 400, color: '#0E1116' }}>{stats.carriers}</div>
            <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Verified EU carriers</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 400, color: '#0E1116' }}>{stats.fee}</div>
            <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Subscription fee</div>
          </div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: 400, color: '#0E1116' }}>{stats.support}</div>
            <div style={{ color: '#5C6470', fontSize: '16px', marginTop: '8px' }}>Multilingual support</div>
          </div>
        </div>
      </section>

      <div style={{ flex: 1, background: 'white' }}></div>

      {/* 4. FOOTER */}
      <footer className="footer" style={{ borderTop: '1px solid #E6E8EE', width: '100%', boxSizing: 'border-box', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px', padding: '16px 2.5%', width: '100%', boxSizing: 'border-box' }}>
          <div className="footer-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0E1116' }}>
              <div className="logo-icon" style={{ color: '#3D5AFE' }}>▲</div>
              Cargolane
            </div>
            <span className="footer-copy" style={{ color: '#5C6470', fontSize: '14px' }}>© 2026 Cargolane EU. All rights reserved.</span>
          </div>
          <div className="footer-right" style={{ display: 'flex', gap: '24px', color: '#5C6470', fontSize: '14px' }}>
            <a href="#terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</a>
            <a href="#privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</a>
            <a href="#status" style={{ textDecoration: 'none', color: 'inherit' }}>System Status</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;