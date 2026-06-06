import React, { useState, useMemo } from 'react';
import type { PageType } from '../../types';
import { Sidebar } from '../../components/Layout/Sidebar';
import { RoutingMap } from '../../components/UI/RoutingMap';
import { loadsService } from '../../services/loadsService';

interface CreateLoadPageProps {
  onNavigate: (page: PageType) => void;
}

interface RouteStop {
  id: string;
  type: 'start' | 'stop' | 'end';
  address: string;
  datetime: string; 
}

interface PackageItem {
  id: string;
  type: string;
  length: number | '';
  width: number | '';
  height: number | '';
  weight: number | '';
  qty: number | '';
}

interface LoadFormData {
  listingType: string;
  stops: RouteStop[];
  cargoCategory: string;
  packages: PackageItem[];
  stackability: string;
  temperature: string;
  insuredValue: string; 
  hsCode: string;
  adrClass: string;
  vehicle: string;
  price: string; 
}

export const CreateLoadPage: React.FC<CreateLoadPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<LoadFormData>({
    listingType: '',
    stops: [
      { id: '1', type: 'start', address: '', datetime: '' },
      { id: '2', type: 'end', address: '', datetime: '' }
    ],
    cargoCategory: '',
    packages: [
      { id: '1', type: 'EUR pallet', length: '', width: '', height: '', weight: '', qty: '' }
    ],
    stackability: 'Non-stackable',
    temperature: 'Ambient',
    insuredValue: '',
    hsCode: '',
    adrClass: '',
    vehicle: '',
    price: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>(''); 
  const [errorMsg, setErrorMsg] = useState<string>('');

  let activeStep = 1;
  if (formData.listingType) activeStep = 2;
  if (formData.stops[0].address && formData.stops[formData.stops.length - 1].address) activeStep = 3;
  if (formData.packages.some(p => Number(p.qty) > 0)) activeStep = 4;
  if (formData.vehicle) activeStep = 5;
  if (formData.price) activeStep = 6;
  if (isSubmitted) activeStep = 6;

  const isFormValid = useMemo(() => {
    const hasType = formData.listingType !== '';
    const hasRoute = formData.stops.every(s => s.address.trim() !== '' && s.datetime !== '');
    const hasCargoCategory = formData.cargoCategory !== '';
    const hasPackages = formData.packages.some(p => Number(p.qty) > 0 && Number(p.weight) > 0 && Number(p.length) > 0);
    const hasVehicle = formData.vehicle !== '';
    const hasPrice = formData.price !== '';

    return hasType && hasRoute && hasCargoCategory && hasPackages && hasVehicle && hasPrice;
  }, [formData]);

  let totalMass = 0;
  let totalVolume = 0;
  let floorFootprint = 0;
  let totalItems = 0;

  formData.packages.forEach(pkg => {
    const q = Number(pkg.qty) || 0;
    const w = Number(pkg.weight) || 0;
    const l = Number(pkg.length) || 0;
    const wid = Number(pkg.width) || 0;
    const h = Number(pkg.height) || 0;

    totalItems += q;
    totalMass += (w * q) / 1000;
    totalVolume += (l * wid * h * q);
    floorFootprint += (l * wid * q);
  });

  const ldm = (floorFootprint / 2.4).toFixed(1);

  const formatDisplayDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()} • ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleAddStop = () => {
    const newStops = [...formData.stops];
    const newStop: RouteStop = { id: Date.now().toString(), type: 'stop', address: '', datetime: '' };
    newStops.splice(newStops.length - 1, 0, newStop);
    setFormData({ ...formData, stops: newStops });
  };

  const handleUpdateStop = (id: string, field: keyof RouteStop, value: string) => {
    const newStops = formData.stops.map(s => s.id === id ? { ...s, [field]: value } : s);
    setFormData({ ...formData, stops: newStops });
  };

  const handleRemoveOrClearStop = (id: string, type: string) => {
    if (type === 'start' || type === 'end') {
      const newStops = formData.stops.map(s => s.id === id ? { ...s, address: '', datetime: '' } : s);
      setFormData({ ...formData, stops: newStops });
    } else {
      const newStops = formData.stops.filter(s => s.id !== id);
      setFormData({ ...formData, stops: newStops });
    }
  };

  const handleAddPackage = () => {
    const newPkg: PackageItem = { id: Date.now().toString(), type: 'Custom', length: '', width: '', height: '', weight: '', qty: '' };
    setFormData({ ...formData, packages: [...formData.packages, newPkg] });
  };

  const handleUpdatePackage = (id: string, field: keyof PackageItem, value: string) => {
    const newPackages = formData.packages.map(p => {
      if (p.id === id) {
        return { ...p, [field]: field === 'type' ? value : (value === '' ? '' : Number(value)) };
      }
      return p;
    });
    setFormData({ ...formData, packages: newPackages });
  };

  const handleRemovePackage = (id: string) => {
    setFormData({ ...formData, packages: formData.packages.filter(p => p.id !== id) });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    
    // Подготовка Payload для бэкенда
    const payload = {
      from: formData.stops[0].address,
      to: formData.stops[formData.stops.length - 1].address,
      extraRoute: formData.stops.length > 2 ? formData.stops[1].address : '',
      dateStart: formData.stops[0].datetime,
      dateEnd: formData.stops[formData.stops.length - 1].datetime,
      cargo: formData.cargoCategory,
      mass: totalMass.toFixed(2),
      volume: totalVolume.toFixed(2),
      vehicle: formData.vehicle,
      price: formData.price
    };

    try {
      const returnedId = await loadsService.createLoad(payload);
      // Если бэкенд не вернул ID (или отключен), генерируем фейковый для UI
      setGeneratedId(returnedId || '#L-' + Math.floor(1000 + Math.random() * 9000));
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setErrorMsg('Server connection failed. Could not create load.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="listings" />
      
      <main className="dash-main" style={{ background: '#F6F7FB' }}>
        
        <header className="create-header">
          <div>
            <div className="dash-breadcrumb">
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Workspace</span> 
              <span className="dash-detail-breadcrumb-arrow"> › </span> 
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>My listings</span>
              <span className="dash-detail-breadcrumb-arrow"> › </span> 
              <strong style={{color: '#0E1116'}}>{isSubmitted ? generatedId : 'New'}</strong>
            </div>
            <h1 className="create-header-title">{isSubmitted ? 'Listing details' : 'New listing'}</h1>
          </div>
          
          <div className="create-header-actions">
            {!isSubmitted && <button className="btn-figma-text">Save draft</button>}
            <button className="btn-figma-secondary" onClick={() => onNavigate('dashboard')}>{isSubmitted ? 'Close' : 'Cancel'}</button>
            {!isSubmitted && <button className="btn-figma-primary" disabled={!isFormValid || isSubmitting} onClick={handleSave}>{isSubmitting ? 'Sending...' : 'Continue ›'}</button>}
            <div className="dash-notify">🔔</div>
          </div>
        </header>

        <div className="create-layout">
          
          <aside className="create-steps-sidebar">
            <div className={`create-step-item ${activeStep === 1 ? 'active' : ''} ${isSubmitted ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > 1 || isSubmitted ? 'done' : activeStep === 1 ? 'active' : 'pending'}`}>
                {activeStep > 1 || isSubmitted ? '✓' : '1'}
              </div>
              <div>
                <div className="step-info-title">Type</div>
                <div className="step-info-sub">{formData.listingType || 'In progress'}</div>
              </div>
            </div>

            <div className={`create-step-item ${activeStep === 2 ? 'active' : ''} ${isSubmitted ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > 2 || isSubmitted ? 'done' : activeStep === 2 ? 'active' : 'pending'}`}>
                {activeStep > 2 || isSubmitted ? '✓' : '2'}
              </div>
              <div>
                <div className="step-info-title">Route</div>
                <div className="step-info-sub">{formData.stops[0].address ? `${formData.stops.length} stops` : 'In progress'}</div>
              </div>
            </div>

            <div className={`create-step-item ${activeStep === 3 ? 'active' : ''} ${isSubmitted ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > 3 || isSubmitted ? 'done' : activeStep === 3 ? 'active' : 'pending'}`}>
                {activeStep > 3 || isSubmitted ? '✓' : '3'}
              </div>
              <div>
                <div className="step-info-title">Cargo</div>
                <div className="step-info-sub">{formData.cargoCategory || 'In progress'}</div>
              </div>
            </div>

            <div className={`create-step-item ${activeStep === 4 ? 'active' : ''} ${isSubmitted ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > 4 || isSubmitted ? 'done' : activeStep === 4 ? 'active' : 'pending'}`}>
                {activeStep > 4 || isSubmitted ? '✓' : '4'}
              </div>
              <div>
                <div className="step-info-title">Vehicle</div>
                <div className="step-info-sub">{formData.vehicle || 'In progress'}</div>
              </div>
            </div>

            <div className={`create-step-item ${activeStep === 5 ? 'active' : ''} ${isSubmitted ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > 5 || isSubmitted ? 'done' : activeStep === 5 ? 'active' : 'pending'}`}>
                {activeStep > 5 || isSubmitted ? '✓' : '5'}
              </div>
              <div>
                <div className="step-info-title">Pricing</div>
                <div className="step-info-sub">{formData.price ? `€ ${Number(formData.price).toLocaleString('en-US')}` : 'In progress'}</div>
              </div>
            </div>

            <div className={`create-step-item ${activeStep === 6 ? 'active' : ''}`}>
              <div className={`step-icon ${isSubmitted ? 'done' : activeStep === 6 ? 'active' : 'pending'}`}>
                {isSubmitted ? '✓' : '6'}
              </div>
              <div>
                <div className="step-info-title">Review & publish</div>
                <div className="step-info-sub">{isSubmitted ? 'Sent to moderator' : 'In progress'}</div>
              </div>
            </div>
          </aside>

          <div className="create-content">
            
            {errorMsg && (
              <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '12px', color: '#EF4444', fontWeight: 500, marginBottom: '24px' }}>
                {errorMsg}
              </div>
            )}

            {isSubmitted && (
              <div className="step-row">
                <div className="step-main-card success-submission-card">
                  <div className="success-icon-large">✓</div>
                  <h2>Listing is sent to Moderator</h2>
                  <p>Thank you Elena. Your listing is successfully sent to moderation.<br/>You will be notified once it's approved and published on Marketplace.</p>
                  <div className="success-status-box">
                    <div>
                      <div style={{ fontSize: '12px', color: '#5C6470', marginBottom: '4px' }}>Listing ID</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#0E1116' }}>{generatedId}</div>
                    </div>
                    <div className="status-badge pending" style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Moderation pending</div>
                  </div>
                  <div className="success-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button className="btn-figma-secondary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
                    <button className="btn-figma-primary" onClick={() => onNavigate('dashboard')}>View my listings</button>
                  </div>
                </div>
              </div>
            )}

            <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`} style={isSubmitted ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}}>
              <div className="step-main-card">
                <div className="step-title-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116', marginBottom: '6px' }}>Type</h2>
                    <p style={{ fontSize: '14px', color: '#5C6470' }}>Choose what type of listing you want to publish</p>
                  </div>
                  <span className="step-count" style={{ fontSize: '12px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Step 1 of 6</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className={`btn-figma-secondary ${formData.listingType === 'I have cargo' ? 'active' : ''}`} style={{ flex: 1, padding: '16px' }} onClick={() => setFormData({...formData, listingType: 'I have cargo'})}>📦 I have cargo</button>
                  <button className={`btn-figma-secondary ${formData.listingType === 'I have vehicle' ? 'active' : ''}`} style={{ flex: 1, padding: '16px' }} onClick={() => setFormData({...formData, listingType: 'I have vehicle'})}>🚛 I have vehicle</button>
                </div>
              </div>
            </div>

            <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`} style={isSubmitted ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}}>
              <div className="step-main-card">
                <div className="step-title-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116', marginBottom: '6px' }}>Route details</h2>
                    <p style={{ fontSize: '14px', color: '#5C6470' }}>Choose starting point and stops of your route</p>
                  </div>
                  <span className="step-count" style={{ fontSize: '12px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Step 2 of 6</span>
                </div>
                
                <div className="figma-grid-labels route-grid" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 160px 30px', gap: '12px', borderBottom: '1px solid #E6E8EE', paddingBottom: '8px', marginBottom: '12px' }}>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Stops</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Address</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Date</div>
                  <div></div>
                </div>

                {formData.stops.map((stop, index) => {
                  const isFilled = stop.address.trim() !== '' && stop.datetime !== '';
                  return (
                    <div className="grid-row route-grid" key={stop.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 160px 30px', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <div className="stop-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#0E1116' }}>
                        <div className={`stop-circle ${stop.type}`} style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${stop.type === 'start' ? '#3D5AFE' : stop.type === 'end' ? '#00C48C' : '#5C6470'}`, background: isFilled ? (stop.type === 'start' ? '#3D5AFE' : stop.type === 'end' ? '#00C48C' : '#5C6470') : 'white' }}></div>
                        {stop.type === 'start' ? 'Start' : stop.type === 'end' ? 'End' : `Stop ${index}`}
                      </div>
                      
                      <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="e.g. Rotterdam, NL" value={stop.address} onChange={(e) => handleUpdateStop(stop.id, 'address', e.target.value)} />
                      
                      <div 
                        style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
                        onClick={(e) => {
                          const target = e.currentTarget.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                          if (target && target.showPicker) target.showPicker();
                        }}
                      >
                        <input type="text" className="figma-input" placeholder="Select date" value={formatDisplayDate(stop.datetime)} readOnly style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', pointerEvents: 'none', backgroundColor: 'white' }} />
                        <input type="datetime-local" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} value={stop.datetime} onChange={(e) => handleUpdateStop(stop.id, 'datetime', e.target.value)} />
                      </div>

                      <div>
                        <button className="btn-icon-danger" style={{ background: 'transparent', border: 'none', color: '#5C6470', fontSize: '16px', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemoveOrClearStop(stop.id, stop.type)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
                <button className="btn-figma-text" style={{ background: 'transparent', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#3D5AFE', padding: '12px 0 0 0' }} onClick={handleAddStop}>+ Add stop</button>
              </div>
            </div>

            <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`} style={isSubmitted ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}}>
              <div className="step-main-card">
                <div className="step-title-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116', marginBottom: '6px' }}>Cargo details</h2>
                    <p style={{ fontSize: '14px', color: '#5C6470' }}>Add packages by type. We'll calculate total metrics automatically.</p>
                  </div>
                  <span className="step-count" style={{ fontSize: '12px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Step 3 of 6</span>
                </div>
                
                <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>Cargo type</span>
                <div className="chip-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {['Pallets', 'Boxes', 'Containers', 'Refrigerated', 'ADR / Hazmat', 'Other'].map(type => (
                    <div key={type} className="chip" style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${formData.cargoCategory === type ? '#3D5AFE' : '#E6E8EE'}`, background: formData.cargoCategory === type ? '#EEF1FF' : 'white', color: formData.cargoCategory === type ? '#3D5AFE' : '#5C6470', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setFormData({...formData, cargoCategory: type})}>{type}</div>
                  ))}
                </div>

                <div className="figma-grid-labels cargo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 75px 75px 75px 80px 65px 30px', gap: '12px', marginTop: '24px', borderBottom: '1px solid #E6E8EE', paddingBottom: '8px', marginBottom: '12px' }}>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Type</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Length (m)</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Width (m)</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Height (m)</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Unit W(kg)</div>
                  <div className="grid-label" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Qty</div>
                  <div></div>
                </div>

                {formData.packages.map((pkg) => (
                  <div className="grid-row cargo-grid" key={pkg.id} style={{ display: 'grid', gridTemplateColumns: '1fr 75px 75px 75px 80px 65px 30px', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none', fontWeight: 500 }} value={pkg.type} onChange={(e) => handleUpdatePackage(pkg.id, 'type', e.target.value)} />
                    <input type="number" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="0.0" value={pkg.length} onChange={(e) => handleUpdatePackage(pkg.id, 'length', e.target.value)} />
                    <input type="number" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="0.0" value={pkg.width} onChange={(e) => handleUpdatePackage(pkg.id, 'width', e.target.value)} />
                    <input type="number" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="0.0" value={pkg.height} onChange={(e) => handleUpdatePackage(pkg.id, 'height', e.target.value)} />
                    <input type="number" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="0" value={pkg.weight} onChange={(e) => handleUpdatePackage(pkg.id, 'weight', e.target.value)} />
                    <input type="number" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="0" value={pkg.qty} onChange={(e) => handleUpdatePackage(pkg.id, 'qty', e.target.value)} />
                    <button className="btn-icon-danger" style={{ background: 'transparent', border: 'none', color: '#5C6470', fontSize: '16px', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemovePackage(pkg.id)}>🗑</button>
                  </div>
                ))}
                <button className="btn-figma-text" style={{ background: 'transparent', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#3D5AFE', padding: '8px 0 24px 0' }} onClick={handleAddPackage}>+ Add package row</button>

                <div style={{ display: 'flex', gap: '24px', paddingTop: '24px', borderTop: '1px solid #E6E8EE' }}>
                  <div style={{ flex: 1 }}>
                    <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>Stackability</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                      {['Non-stackable', 'Stackable ×2', 'Stackable ×3'].map(opt => (
                        <div key={opt} className="chip" style={{ padding: '10px 4px', textAlign: 'center', borderRadius: '8px', border: `1px solid ${formData.stackability === opt ? '#0E1116' : '#E6E8EE'}`, background: formData.stackability === opt ? '#0E1116' : 'white', color: formData.stackability === opt ? 'white' : '#5C6470', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center' }} onClick={() => setFormData({...formData, stackability: opt})}>{opt}</div>
                      ))}
                    </div>
                    <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>Insured value</span>
                    <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="€ 60,000" value={formData.insuredValue ? `€ ${Number(formData.insuredValue.replace(/\D/g, '')).toLocaleString('en-US')}` : ''} onChange={(e) => setFormData({...formData, insuredValue: e.target.value.replace(/\D/g, '')})} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>Temperature</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                      {['Ambient', '+2 to +8 °C', 'Frozen'].map(opt => (
                        <div key={opt} className="chip" style={{ padding: '10px 4px', textAlign: 'center', borderRadius: '8px', border: `1px solid ${formData.temperature === opt ? '#0E1116' : '#E6E8EE'}`, background: formData.temperature === opt ? '#0E1116' : 'white', color: formData.temperature === opt ? 'white' : '#5C6470', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center' }} onClick={() => setFormData({...formData, temperature: opt})}>{opt}</div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>HS code</span>
                        <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="3402.20.90" value={formData.hsCode} onChange={(e) => setFormData({...formData, hsCode: e.target.value})}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="chip-label" style={{ fontSize: '12px', color: '#5C6470', marginBottom: '8px', display: 'block' }}>ADR class</span>
                        <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', fontSize: '14px', outline: 'none' }} placeholder="Not applicable" value={formData.adrClass} onChange={(e) => setFormData({...formData, adrClass: e.target.value})}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`} style={isSubmitted ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}}>
              <div className="step-main-card">
                <div className="step-title-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116', marginBottom: '6px' }}>Vehicle type</h2>
                  <span className="step-count" style={{ fontSize: '12px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Step 4 of 6</span>
                </div>
                <p style={{ fontSize: '14px', color: '#5C6470', marginBottom: '16px' }}>Recommended options:</p>
                <div className="chip-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {['Tautliner trailer', 'Mega trailer'].map(type => (
                    <div key={type} className="chip" style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${formData.vehicle === type ? '#00C48C' : '#E6E8EE'}`, background: formData.vehicle === type ? 'rgba(0, 196, 140, 0.1)' : 'white', color: formData.vehicle === type ? '#00C48C' : '#5C6470', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setFormData({...formData, vehicle: type})}>{type}</div>
                  ))}
                </div>
                <p style={{ fontSize: '14px', color: '#5C6470', marginBottom: '16px', marginTop: '16px' }}>Other variants:</p>
                <div className="chip-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {['Box truck', 'Curtainsider', 'Container', 'Reefer'].map(type => (
                    <div key={type} className="chip" style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${formData.vehicle === type ? '#3D5AFE' : '#E6E8EE'}`, background: formData.vehicle === type ? '#EEF1FF' : 'white', color: formData.vehicle === type ? '#3D5AFE' : '#5C6470', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setFormData({...formData, vehicle: type})}>{type}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`} style={isSubmitted ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%)' } : {}}>
              <div className="step-main-card">
                <div className="step-title-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0E1116', marginBottom: '6px' }}>Pricing</h2>
                  <span className="step-count" style={{ fontSize: '12px', color: '#5C6470', textTransform: 'uppercase', fontWeight: 600 }}>Step 5 of 6</span>
                </div>
                <div className="figma-input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', color: '#5C6470' }}>€</span>
                  <input type="text" className="figma-input" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E6E8EE', borderRadius: '8px', outline: 'none', fontSize: '20px', fontWeight: 600 }} value={formData.price ? Number(formData.price.replace(/\D/g, '')).toLocaleString('en-US') : ''} placeholder="0" onChange={(e) => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} />
                </div>
              </div>
            </div>

          </div>

          <aside className="create-right-sidebar" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '100px', height: 'calc(100vh - 132px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="figma-map-card" style={{ background: 'white', border: '1px solid #E6E8EE', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flex: 1, width: '100%' }}>
                <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #E6E8EE', background: 'white' }}>Map preview</div>
                <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                  <RoutingMap stops={formData.stops} />
                </div>
            </div>

            <div className="calc-widget-dark" style={{ background: '#0E1116', borderRadius: '12px', border: '1px solid #E6E8EE', padding: '24px', color: 'white', flexShrink: 0 }}>
                <div className="calc-widget-title" style={{ fontSize: '11px', color: '#5C6470', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: 600 }}>Auto Calculation</div>
                <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}><span className="calc-label" style={{ fontSize: '13px', color: '#E6E8EE' }}>Total mass</span><div className="calc-value" style={{ textAlign: 'right' }}><div className="calc-val-main" style={{ fontSize: '20px', fontWeight: 600 }}>{totalMass.toFixed(2)} t</div><div className="calc-val-sub" style={{ fontSize: '11px', color: '#5C6470', marginTop: '4px' }}>{totalItems} units</div></div></div>
                <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}><span className="calc-label" style={{ fontSize: '13px', color: '#E6E8EE' }}>Total volume</span><div className="calc-value" style={{ textAlign: 'right' }}><div className="calc-val-main" style={{ fontSize: '20px', fontWeight: 600 }}>{totalVolume.toFixed(2)} m³</div></div></div>
                <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}><span className="calc-label" style={{ fontSize: '13px', color: '#E6E8EE' }}>Loading metres</span><div className="calc-value" style={{ textAlign: 'right' }}><div className="calc-val-main" style={{ fontSize: '20px', fontWeight: 600 }}>{ldm} LDM</div></div></div>
                <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}><span className="calc-label" style={{ fontSize: '13px', color: '#E6E8EE' }}>Floor footprint</span><div className="calc-value" style={{ textAlign: 'right' }}><div className="calc-val-main" style={{ fontSize: '20px', fontWeight: 600 }}>{floorFootprint.toFixed(2)} m²</div></div></div>
                <div className="calc-info-box" style={{ background: 'rgba(61, 90, 254, 0.15)', border: '1px solid rgba(61, 90, 254, 0.3)', borderRadius: '8px', padding: '12px', marginTop: '24px', fontSize: '12px', color: '#EEF1FF', lineHeight: 1.5 }}>ℹ Fits standard 13.6 LDM tautliner layout.</div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};