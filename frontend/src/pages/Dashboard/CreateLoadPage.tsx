import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import type { PageType } from '../../utils/types'; 
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
  const navigate = useNavigate() 

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
  const [draftId, setDraftId] = useState<string | null>(null); // Храним ID сохраненного черновика
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [draftSuccessMsg, setDraftSavedMessage] = useState<string>(''); // Сообщение об успешном сохранении драфта

  let activeStep = 1;
  if (formData.listingType) activeStep = 2;
  if (formData.stops[0].address && formData.stops[formData.stops.length - 1].address) activeStep = 3;
  if (formData.packages.some(p => Number(p.qty) > 0)) activeStep = 4;
  if (formData.vehicle) activeStep = 5;
  if (formData.price) activeStep = 6;
  if (isSubmitted) activeStep = 6;

  const isFormValid = useMemo(() => {
    const hasType = formData.listingType !== '';
    const hasRoute = formData.stops.every(s => s.address.trim() !== '');
    const hasCargoCategory = formData.cargoCategory !== '';
    const hasPackages = formData.packages.some(p => Number(p.qty) > 0);
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

  // ЛОГИКА СОХРАНЕНИЯ ЧЕРНОВИКА (ДРАФТА)
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setDraftSavedMessage('');

    try {
      const storedUserId = localStorage.getItem('userId');
      const validUserId = storedUserId || "00000000-0000-0000-0000-000000000000";

      const safePayloads = formData.packages.map(pkg => ({
        length: Number(pkg.length) || 0,
        width: Number(pkg.width) || 0,
        height: Number(pkg.height) || 0,
        weight: Number(pkg.weight) || 0,
        volume: (Number(pkg.length) * Number(pkg.width) * Number(pkg.height)) || 0,
        amount: Number(pkg.qty) || 0,
        type: pkg.type || "Draft Cargo"
      }));

      const mappedPayload = {
        userId: validUserId,
        startDate: formData.stops[0].datetime ? new Date(formData.stops[0].datetime).toISOString() : new Date().toISOString(),
        payment: Number(formData.price.replace(/\D/g, '')) || 0,
        insurance: Number(formData.insuredValue.replace(/\D/g, '')) || 0,
        hScode: formData.hsCode.trim() !== '' ? formData.hsCode : null,
        adr: formData.adrClass && formData.adrClass !== 'None' ? 1 : 0,
        suitableCargos: [formData.cargoCategory, formData.vehicle].filter(c => c && c.trim() !== ''),
        about: `DRAFT | Type: ${formData.listingType} | Stackability: ${formData.stackability}`,
        payloads: safePayloads,
        Payloads: safePayloads,
        routePoints: formData.stops.map((stop, idx) => ({
          city: stop.address.split(',')[0].trim() || "Draft City",
          address: stop.address || "Draft Address",
          arrivalTime: stop.datetime ? new Date(stop.datetime).toISOString() : null,
          orderIndex: idx
        }))
      };

      if (draftId) {
        // БЕКЕНДЕРУ: Обновление уже существующего черновика груза в БД
        await loadsService.updateLoadDraft(draftId, mappedPayload as any);
        setDraftSavedMessage(`Draft ${draftId} successfully updated!`);
      } else {
        // БЕКЕНДЕРУ: Создание нового черновика в БД
        const returnedId = await loadsService.createLoadDraft(mappedPayload as any);
        const finalId = returnedId || 'DFT-' + Math.floor(1000 + Math.random() * 9000);
        setDraftId(finalId);
        setDraftSavedMessage(`Draft saved successfully with ID: ${finalId}`);
      }
    } catch (error) {
      console.warn("Backend API for Drafts missing. Emulating local draft storage.");
      const fakeId = draftId || 'DFT-' + Math.floor(1000 + Math.random() * 9000);
      setDraftId(fakeId);
      setDraftSavedMessage(`Draft locally saved with ID: ${fakeId} (Database disconnected)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setDraftSavedMessage('');

    try {
      const storedUserId = localStorage.getItem('userId');
      const validUserId = storedUserId || "00000000-0000-0000-0000-000000000000";

      const safePayloads = formData.packages.map(pkg => ({
        length: Number(pkg.length) || 0,
        width: Number(pkg.width) || 0,
        height: Number(pkg.height) || 0,
        weight: Number(pkg.weight) || 1,
        volume: (Number(pkg.length) * Number(pkg.width) * Number(pkg.height)) || 1,
        amount: Number(pkg.qty) || 1,
        type: pkg.type || "General"
      }));

      const mappedPayload = {
        userId: validUserId,
        status: "Ready", 
        startDate: formData.stops[0].datetime ? new Date(formData.stops[0].datetime).toISOString() : new Date().toISOString(),
        payment: Number(formData.price.replace(/\D/g, '')) || 0,
        insurance: Number(formData.insuredValue.replace(/\D/g, '')) || 0,
        hScode: formData.hsCode.trim() !== '' ? formData.hsCode : null,
        adr: formData.adrClass && formData.adrClass !== 'None' ? 1 : 0,
        suitableCargos: [formData.cargoCategory, formData.vehicle].filter(c => c && c.trim() !== ''),
        about: `Type: ${formData.listingType} | Stackability: ${formData.stackability} | Temp: ${formData.temperature}`,
        payloads: safePayloads,
        Payloads: safePayloads, 
        routePoints: formData.stops.map((stop, idx) => ({
          city: stop.address.split(',')[0].trim() || "Unknown",
          address: stop.address || "Unknown",
          arrivalTime: stop.datetime ? new Date(stop.datetime).toISOString() : null,
          orderIndex: idx
        }))
      };

      const returnedId = await loadsService.createLoad(mappedPayload as any);
      setGeneratedId(returnedId || '#L-' + Math.floor(1000 + Math.random() * 9000));
      setIsSubmitted(true);
      if (draftId) {
        // Если черновик был опубликован, удаляем его из таблицы черновиков
        try { await loadsService.deleteLoadDraft(draftId); } catch {}
      }
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Full error object:", error.response);
      const serverDetails = error.response?.data?.details || error.response?.data?.title || 'Unknown backend error';
      setErrorMsg(`Server error (500). Tell backend dev to fix AutoMapper for Payloads: ${serverDetails}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#F6F7FB' }}>
      
      {/* ХЕДЕР - ЗНАЧОК УВЕДОМЛЕНИЙ ПУЛЕНЕПРОБИВАЕМО УДАЛЕН */}
      <header className="create-header" style={{ flexShrink: 0, padding: '16px 32px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="dash-breadcrumb">
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>Workspace</span> 
              <span className="dash-detail-breadcrumb-arrow"> › </span> 
              <span className="dash-detail-breadcrumb-clickable" onClick={() => onNavigate('dashboard')}>My listings</span>
              <span className="dash-detail-breadcrumb-arrow"> › </span> 
              <strong style={{color: '#0E1116'}}>{isSubmitted ? generatedId : (draftId ? `${draftId} (Draft)` : 'New')}</strong>
            </div>
            <h1 className="create-header-title">{isSubmitted ? 'Listing details' : 'New listing'}</h1>
          </div>
          
          <div className="create-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {!isSubmitted && (
              <button className="btn-figma-text" onClick={handleSaveDraft} disabled={isSubmitting} style={{ cursor: 'pointer', fontWeight: 500 }}>
                Save draft
              </button>
            )}
            <button className="btn-figma-secondary" onClick={() => onNavigate('dashboard')}>{isSubmitted ? 'Close' : 'Cancel'}</button>
            {!isSubmitted && <button className="btn-figma-primary" disabled={!isFormValid || isSubmitting} onClick={handleSave}>{isSubmitting ? 'Sending...' : 'Continue ›'}</button>}
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="create-layout">
        
        {/* СЛЕВА: ФИКСИРОВАННАЯ ПАНЕЛЬ ШАГОВ */}
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

        {/* ПО ЦЕНТРУ: КОНТЕНТ */}
        <div className="create-content">
          
          {errorMsg && (
            <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '12px', color: '#EF4444', fontWeight: 500, marginBottom: '24px' }}>
              {errorMsg}
            </div>
          )}

          {draftSuccessMsg && (
            <div style={{ padding: '16px', background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '12px', color: '#065F46', fontWeight: 500, marginBottom: '24px' }}>
              ✓ {draftSuccessMsg}
            </div>
          )}

          {isSubmitted && (
            <div className="step-row">
              <div className="step-main-card success-submission-card">
                <div className="success-icon-large">✓</div>
                <h2>Listing is sent to Moderator</h2>
                <p>Thank you. Your listing is successfully sent to moderation.<br/>You will be notified once it's approved and published on Marketplace.</p>
                <div className="success-status-box">
                  <div>
                    <div style={{ fontSize: '12px', color: '#5C6470', marginBottom: '4px' }}>Listing ID</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#0E1116' }}>{generatedId}</div>
                  </div>
                  <div className="status-badge pending">Moderation pending</div>
                </div>
                <div className="success-actions">
                  <button className="btn-figma-secondary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
                  <button className="btn-figma-primary" onClick={() => onNavigate('dashboard')}>View my listings</button>
                </div>
              </div>
            </div>
          )}

          <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`}>
            <div className="step-main-card">
              <div className="step-title-row">
                <div>
                  <h2>Type</h2>
                  <p>Choose what type of listing you want to publish</p>
                </div>
                <span className="step-count">Step 1 of 6</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className={`btn-figma-secondary ${formData.listingType === 'I have cargo' ? 'active' : ''}`} style={{ flex: '1 1 150px', padding: '16px' }} onClick={() => setFormData({...formData, listingType: 'I have cargo'})}>📦 I have cargo</button>
                <button className={`btn-figma-secondary ${formData.listingType === 'I have vehicle' ? 'active' : ''}`} style={{ flex: '1 1 150px', padding: '16px' }} onClick={() => setFormData({...formData, listingType: 'I have vehicle'})}>🚛 I have vehicle</button>
              </div>
            </div>
          </div>

          <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`}>
            <div className="step-main-card">
              <div className="step-title-row">
                <div>
                  <h2>Route details</h2>
                  <p>Choose starting point and stops of your route</p>
                </div>
                <span className="step-count">Step 2 of 6</span>
              </div>
              
              <div className="figma-grid-labels route-grid">
                <div className="grid-label">Stops</div>
                <div className="grid-label">Address</div>
                <div className="grid-label">Date</div>
                <div></div>
              </div>

              {formData.stops.map((stop, index) => {
                const isFilled = stop.address.trim() !== '' && stop.datetime !== '';
                return (
                  <div className="grid-row route-grid" key={stop.id}>
                    <div className="stop-indicator">
                      <div className={`stop-circle ${stop.type} ${isFilled ? 'filled' : ''}`}></div>
                      {stop.type === 'start' ? 'Start' : stop.type === 'end' ? 'End' : `Stop ${index}`}
                    </div>
                    
                    <input type="text" className="figma-input" placeholder="e.g. Rotterdam, NL" value={stop.address} onChange={(e) => handleUpdateStop(stop.id, 'address', e.target.value)} />
                    
                    <div 
                      style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
                      onClick={(e) => {
                        const target = e.currentTarget.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                        if (target && target.showPicker) target.showPicker();
                      }}
                    >
                      <input type="text" className="figma-input" placeholder="Select date" value={formatDisplayDate(stop.datetime)} readOnly style={{ pointerEvents: 'none', backgroundColor: 'white' }} />
                      <input type="datetime-local" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} value={stop.datetime} onChange={(e) => handleUpdateStop(stop.id, 'datetime', e.target.value)} />
                    </div>

                    <div>
                      <button className="btn-icon-danger" onClick={() => handleRemoveOrClearStop(stop.id, stop.type)}>🗑</button>
                    </div>
                  </div>
                );
              })}
              <button className="btn-figma-text" style={{ color: '#3D5AFE', padding: '12px 0 0 0' }} onClick={handleAddStop}>+ Add stop</button>
            </div>
          </div>

          <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`}>
            <div className="step-main-card">
              <div className="step-title-row">
                <div>
                  <h2>Cargo details</h2>
                  <p>Add packages by type. We'll calculate total metrics automatically.</p>
                </div>
                <span className="step-count">Step 3 of 6</span>
              </div>
              
              <span className="chip-label">Cargo type</span>
              <div className="chip-group">
                {['Pallets', 'Boxes', 'Containers', 'Refrigerated', 'ADR / Hazmat', 'Other'].map(type => (
                  <div key={type} className={`chip ${formData.cargoCategory === type ? 'active' : ''}`} onClick={() => setFormData({...formData, cargoCategory: type})}>{type}</div>
                ))}
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <div className="figma-grid-labels cargo-grid" style={{marginTop: '24px', minWidth: '600px'}}>
                  <div className="grid-label">Type</div>
                  <div className="grid-label">Length (m)</div>
                  <div className="grid-label">Width (m)</div>
                  <div className="grid-label">Height (m)</div>
                  <div className="grid-label">Unit W(kg)</div>
                  <div className="grid-label">Qty</div>
                  <div></div>
                </div>

                {formData.packages.map((pkg) => (
                  <div className="grid-row cargo-grid" key={pkg.id} style={{ minWidth: '600px' }}>
                    <input type="text" className="figma-input" style={{ fontWeight: 500, border: 'none', padding: 0 }} value={pkg.type} onChange={(e) => handleUpdatePackage(pkg.id, 'type', e.target.value)} />
                    <input type="number" className="figma-input" placeholder="0.0" value={pkg.length} onChange={(e) => handleUpdatePackage(pkg.id, 'length', e.target.value)} />
                    <input type="number" className="figma-input" placeholder="0.0" value={pkg.width} onChange={(e) => handleUpdatePackage(pkg.id, 'width', e.target.value)} />
                    <input type="number" className="figma-input" placeholder="0.0" value={pkg.height} onChange={(e) => handleUpdatePackage(pkg.id, 'height', e.target.value)} />
                    <input type="number" className="figma-input" placeholder="0" value={pkg.weight} onChange={(e) => handleUpdatePackage(pkg.id, 'weight', e.target.value)} />
                    <input type="number" className="figma-input" placeholder="0" value={pkg.qty} onChange={(e) => handleUpdatePackage(pkg.id, 'qty', e.target.value)} />
                    <button className="btn-icon-danger" onClick={() => handleRemovePackage(pkg.id)}>🗑</button>
                  </div>
                ))}
              </div>
              <button className="btn-figma-text" style={{ color: '#3D5AFE', padding: '8px 0 24px 0' }} onClick={handleAddPackage}>+ Add package row</button>

              <div style={{ display: 'flex', gap: '24px', paddingTop: '24px', borderTop: '1px solid #E6E8EE', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 250px', minWidth: 0 }}>
                  <span className="chip-label">Stackability</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                    {['Non-stackable', 'Stackable ×2', 'Stackable ×3'].map(opt => (
                      <div key={opt} className={`chip ${formData.stackability === opt ? 'active dark' : ''}`} style={{ justifyContent: 'center', padding: '10px 4px', textAlign: 'center' }} onClick={() => setFormData({...formData, stackability: opt})}>{opt}</div>
                    ))}
                  </div>
                  <span className="chip-label">Insured value</span>
                  <input type="text" className="figma-input" placeholder="€ 60,000" value={formData.insuredValue ? `€ ${Number(formData.insuredValue.replace(/\D/g, '')).toLocaleString('en-US')}` : ''} onChange={(e) => setFormData({...formData, insuredValue: e.target.value.replace(/\D/g, '')})} />
                </div>
                
                <div style={{ flex: '1 1 250px', minWidth: 0 }}>
                  <span className="chip-label">Temperature</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                    {['Ambient', '+2 to +8 °C', 'Frozen'].map(opt => (
                      <div key={opt} className={`chip ${formData.temperature === opt ? 'active dark' : ''}`} style={{ justifyContent: 'center', padding: '10px 4px', textAlign: 'center' }} onClick={() => setFormData({...formData, temperature: opt})}>{opt}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 100px' }}><span className="chip-label">HS code</span><input type="text" className="figma-input" placeholder="3402.20.90" value={formData.hsCode} onChange={(e) => setFormData({...formData, hsCode: e.target.value})}/></div>
                    <div style={{ flex: '1 1 100px' }}><span className="chip-label">ADR class</span><input type="text" className="figma-input" placeholder="Not applicable" value={formData.adrClass} onChange={(e) => setFormData({...formData, adrClass: e.target.value})}/></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`}>
            <div className="step-main-card">
              <div className="step-title-row"><h2>Vehicle type</h2><span className="step-count">Step 4 of 6</span></div>
              <p style={{ fontSize: '14px', color: '#5C6470', marginBottom: '16px' }}>Recommended options:</p>
              <div className="chip-group">
                {['Tautliner trailer', 'Mega trailer'].map(type => (
                  <div key={type} className={`chip ${formData.vehicle === type ? 'active success' : ''}`} onClick={() => setFormData({...formData, vehicle: type})}>{type}</div>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#5C6470', marginBottom: '16px', marginTop: '16px' }}>Other variants:</p>
              <div className="chip-group">
                {['Box truck', 'Curtainsider', 'Container', 'Reefer'].map(type => (
                  <div key={type} className={`chip ${formData.vehicle === type ? 'active' : ''}`} onClick={() => setFormData({...formData, vehicle: type})}>{type}</div>
                ))}
              </div>
            </div>
          </div>

          <div className={`step-row ${isSubmitted ? 'step-disabled' : ''}`}>
            <div className="step-main-card">
              <div className="step-title-row"><h2>Pricing</h2><span className="step-count">Step 5 of 6</span></div>
              <div className="figma-input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px', color: '#5C6470' }}>€</span>
                <input type="text" className="figma-input" style={{ fontSize: '20px', fontWeight: 600 }} value={formData.price ? Number(formData.price.replace(/\D/g, '')).toLocaleString('en-US') : ''} placeholder="0" onChange={(e) => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} />
              </div>
            </div>
          </div>

          {!isSubmitted && (
            <div className="step-row">
              <div className="step-main-card">
                <div className="step-title-row">
                  <div>
                    <h2>Review results</h2>
                    <p>Button will activate only after fully completing steps 1 to 5.</p>
                  </div>
                  <span className="step-count">Step 6 of 6</span>
                </div>
                <button className="btn-figma-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }} disabled={!isFormValid || isSubmitting} onClick={handleSave}>
                  {isSubmitting ? 'Sending...' : 'Send to Moderation'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* СПРАВА: КОЛОНКА С КАРТОЙ */}
        <aside className="create-right-sidebar">
          <div className="figma-map-card">
              <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #E6E8EE', background: 'white' }}>Map preview</div>
              <div style={{ flex: 1, width: '100%', position: 'relative', minHeight: '300px' }}>
                <RoutingMap stops={formData.stops} />
              </div>
          </div>

          <div className="calc-widget-dark">
              <div className="calc-widget-title">Auto Calculation</div>
              <div className="calc-row"><span className="calc-label">Total mass</span><div className="calc-value"><div className="calc-val-main">{totalMass.toFixed(2)} t</div><div className="calc-val-sub">{totalItems} units</div></div></div>
              <div className="calc-row"><span className="calc-label">Total volume</span><div className="calc-value"><div className="calc-val-main">{totalVolume.toFixed(2)} m³</div></div></div>
              <div className="calc-row"><span className="calc-label">Loading metres</span><div className="calc-value"><div className="calc-val-main">{ldm} LDM</div></div></div>
              <div className="calc-row"><span className="calc-label">Floor footprint</span><div className="calc-value"><div className="calc-val-main">{floorFootprint.toFixed(2)} m²</div></div></div>
              <div className="calc-info-box">ℹ Fits standard 13.6 LDM tautliner layout.</div>
          </div>
        </aside>

      </div>

      {/* ФИНАЛЬНЫЕ ПУЛЕНЕПРОБИВАЕМЫЕ СТИЛИ И ГЕОМЕТРИЯ */}
      <style>{`
        ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; }
        
        * { 
          scrollbar-width: none; 
          -ms-overflow-style: none; 
          box-sizing: border-box !important; 
        }

        .create-layout {
          align-items: flex-start !important; 
          width: 100% !important;
          max-width: 100vw !important;
        }
        
        .create-steps-sidebar, 
        .create-content, 
        .create-right-sidebar {
          margin-top: 0 !important; 
          min-width: 0 !important; 
        }

        /* КРИТИЧЕСКИЙ ФИКС АДАПТИВА ДЛЯ БЛОКА ШАГОВ (ФОТО 1 И 2) */
        @media (max-width: 1440px) {
          .create-layout {
            flex-direction: column !important;
            padding: 24px 32px !important; 
          }
          
          /* Исправляем разметку контейнера шагов при переходе в горизонтальный ряд */
          .create-steps-sidebar {
            width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            border-bottom: 1px solid #E6E8EE !important;
            padding: 4px 0 16px 0 !important;
            margin-bottom: 24px !important;
            gap: 16px !important;
            white-space: nowrap !important;
          }
          
          /* Фикс закругления, границ и центрирования каждого шага (Убирает "кривые" грани заливки) */
          .create-step-item {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            min-width: 170px !important;
            height: 48px !important;
            margin-bottom: 0 !important;
            padding: 6px 12px !important;
            border-radius: 8px !important;
            gap: 10px !important;
          }

          /* Идеально ровный круг для бейджа цифры/галочки */
          .step-icon {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 50% !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
          }
          
          .create-content {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .create-right-sidebar {
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 24px !important; 
          }
          
          .step-main-card {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateLoadPage;