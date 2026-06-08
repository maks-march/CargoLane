import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadsService } from '../services/loadsService';
import { RoutingMap } from '../components/UI/RoutingMap';
import type { CreateOrderCommand } from '../api/types';

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

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
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
    const hasPackages = formData.packages.some(p => Number(p.qty) > 0 && Number(p.weight) > 0);
    const hasVehicle = formData.vehicle !== '';
    const hasPrice = formData.price !== '';

    return hasType && hasRoute && hasCargoCategory && hasPackages && hasVehicle && hasPrice;
  }, [formData]);

  const stats = useMemo(() => {
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

    return { totalMass, totalVolume, floorFootprint, totalItems, ldm: (floorFootprint / 2.4).toFixed(1) };
  }, [formData.packages]);

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

    const mappedPayload: CreateOrderCommand = {
      userId: "", // Typically handled by the backend
      startDate: formData.stops[0].datetime.split('T')[0] || new Date().toISOString().split('T')[0],
      status: "Ready",
      about: `Cargo: ${formData.cargoCategory}. HS: ${formData.hsCode}. Insured: ${formData.insuredValue}.`,
      specNumber: 100,
      payment: {
        paymentType: "NoNegotiable",
        isTaxedByCard: false,
        isNotTaxedByCard: false,
        isByCash: true,
        taxedByCard: 0,
        notTaxedByCard: 0,
        byCash: Number(formData.price.replace(/\D/g, '')) || 0,
        isVisible: true,
        paymentAfterDays: 0,
        prepayment: 0,
        isPrepaymentByFuel: false
      },
      transport: {
        bodyType: [formData.vehicle],
        loadType: ["Rear"],
        unloadType: ["Rear"],
        vehicles: 1,
        temperatureFrom: formData.temperature === 'Frozen' ? -20 : (formData.temperature === '+2 to +8 °C' ? 2 : null),
        temperatureTo: formData.temperature === 'Frozen' ? -10 : (formData.temperature === '+2 to +8 °C' ? 8 : null),
        isCrewFull: false,
        adr: formData.adrClass ? 1 : 0,
        isHitch: false,
        isPneumaticVehicle: false,
        isStakes: false,
        isTir: false,
        isT1: false,
        isCmr: false,
        isMedicalBook: false
      },
      payloads: formData.packages.map(pkg => ({
        name: pkg.type || "General Cargo",
        weight: Number(pkg.weight) || 0,
        volume: (Number(pkg.length) * Number(pkg.width) * Number(pkg.height)) || 0,
        amount: Number(pkg.qty) || 1,
        wrap: "None"
      })),
      routePoints: formData.stops.map((stop) => ({
        city: stop.address.split(',')[0].trim() || "Unknown",
        address: stop.address || "Unknown",
        loadTimeStart: (stop.datetime.split('T')[1] || "08:00") + ":00",
        loadTimeEnd: (stop.datetime.split('T')[1] || "17:00") + ":00",
        date: stop.datetime.split('T')[0] || new Date().toISOString().split('T')[0],
        isLoad: stop.type === 'start'
      }))
    };

    try {
      const returnedId = await loadsService.createLoad(mappedPayload);
      setGeneratedId(returnedId);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error: any) {
      setErrorMsg(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="create-header">
        <div>
          <div className="dash-breadcrumb">
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/')}>Workspace</span> 
            <span className="dash-detail-breadcrumb-arrow"> › </span> 
            <span className="dash-detail-breadcrumb-clickable" onClick={() => navigate('/my-listings')}>My listings</span>
            <span className="dash-detail-breadcrumb-arrow"> › </span> 
            <strong style={{color: '#0E1116'}}>{isSubmitted ? generatedId : 'New'}</strong>
          </div>
          <h1 className="create-header-title">{isSubmitted ? 'Listing details' : 'New listing'}</h1>
        </div>
        
        <div className="create-header-actions">
          {!isSubmitted && <button className="btn-figma-text">Save draft</button>}
          <button className="btn-figma-secondary" onClick={() => navigate('/orders')}>{isSubmitted ? 'Close' : 'Cancel'}</button>
          {!isSubmitted && (
            <button 
              className="btn-figma-primary" 
              disabled={!isFormValid || isSubmitting} 
              onClick={handleSave}
            >
              {isSubmitting ? 'Sending...' : 'Continue ›'}
            </button>
          )}
          <div className="dash-notify">🔔</div>
        </div>
      </header>

      <div className="create-layout">
        <aside className="create-steps-sidebar">
          {[
            { n: 1, title: 'Type', sub: formData.listingType || 'In progress' },
            { n: 2, title: 'Route', sub: formData.stops[0].address ? `${formData.stops.length} stops` : 'In progress' },
            { n: 3, title: 'Cargo', sub: formData.cargoCategory || 'In progress' },
            { n: 4, title: 'Vehicle', sub: formData.vehicle || 'In progress' },
            { n: 5, title: 'Pricing', sub: formData.price ? `€ ${formData.price}` : 'In progress' },
            { n: 6, title: 'Publish', sub: isSubmitted ? 'Published' : 'Pending' }
          ].map((s) => (
            <div key={s.n} className={`create-step-item ${activeStep === s.n ? 'active' : ''} ${isSubmitted && s.n < 6 ? 'step-disabled' : ''}`}>
              <div className={`step-icon ${activeStep > s.n || (isSubmitted && s.n === 6) ? 'done' : activeStep === s.n ? 'active' : 'pending'}`}>
                {activeStep > s.n || (isSubmitted && s.n === 6) ? '✓' : s.n}
              </div>
              <div>
                <div className="step-info-title">{s.title}</div>
                <div className="step-info-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </aside>

        <div className="create-content">
          {errorMsg && (
            <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '12px', color: '#EF4444', marginBottom: '24px' }}>
              {errorMsg}
            </div>
          )}

          {isSubmitted ? (
            <div className="step-row">
              <div className="step-main-card success-submission-card">
                <div className="success-icon-large">✓</div>
                <h2>Listing Published</h2>
                <p>Your listing was successfully created and is now visible in the marketplace.</p>
                <div className="success-status-box">
                  <div>
                    <div style={{ fontSize: '12px', color: '#5C6470' }}>Listing ID</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{generatedId}</div>
                  </div>
                  <div className="status-badge pending">Active</div>
                </div>
                <div className="success-actions">
                  <button className="btn-figma-secondary" onClick={() => navigate('/orders')}>Dashboard</button>
                  <button className="btn-figma-primary" onClick={() => navigate('/my-listings')}>View my listings</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Type */}
              <div className="step-main-card" style={{ marginBottom: '24px' }}>
                <div className="step-title-row">
                  <div><h2>Listing Type</h2><p>Select what you are offering</p></div>
                  <span className="step-count">Step 1 of 5</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className={`btn-figma-secondary ${formData.listingType === 'I have cargo' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setFormData({...formData, listingType: 'I have cargo'})}>📦 I have cargo</button>
                  <button className={`btn-figma-secondary ${formData.listingType === 'I have vehicle' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setFormData({...formData, listingType: 'I have vehicle'})}>🚛 I have vehicle</button>
                </div>
              </div>

              {/* Step 2: Route */}
              <div className="step-main-card" style={{ marginBottom: '24px' }}>
                <div className="step-title-row">
                  <div><h2>Route Details</h2><p>Add loading and unloading points</p></div>
                  <span className="step-count">Step 2 of 5</span>
                </div>
                <div className="figma-grid-labels route-grid">
                  <div className="grid-label">Stop</div>
                  <div className="grid-label">Address</div>
                  <div className="grid-label">DateTime</div>
                  <div></div>
                </div>
                {formData.stops.map((stop) => (
                  <div className="grid-row route-grid" key={stop.id}>
                    <div className="stop-indicator"><div className={`stop-circle ${stop.type}`}></div>{stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}</div>
                    <input className="figma-input" placeholder="City, Country" value={stop.address} onChange={(e) => handleUpdateStop(stop.id, 'address', e.target.value)} />
                    <input className="figma-input" type="datetime-local" value={stop.datetime} onChange={(e) => handleUpdateStop(stop.id, 'datetime', e.target.value)} />
                    <button className="btn-icon-danger" onClick={() => handleRemoveOrClearStop(stop.id, stop.type)}>🗑</button>
                  </div>
                ))}
                <button className="btn-figma-text" style={{ color: '#3D5AFE' }} onClick={handleAddStop}>+ Add stop</button>
              </div>

              {/* Step 3: Cargo */}
              <div className="step-main-card" style={{ marginBottom: '24px' }}>
                <div className="step-title-row">
                  <div><h2>Cargo details</h2><p>Define cargo parameters</p></div>
                  <span className="step-count">Step 3 of 5</span>
                </div>
                <div className="chip-group">
                  {['Pallets', 'Boxes', 'Containers', 'Reefer', 'ADR', 'Other'].map(t => (
                    <button key={t} className={`chip ${formData.cargoCategory === t ? 'active' : ''}`} onClick={() => setFormData({...formData, cargoCategory: t})}>{t}</button>
                  ))}
                </div>
                <div className="figma-grid-labels cargo-grid" style={{ marginTop: '20px' }}>
                  <div className="grid-label">Type</div>
                  <div className="grid-label">L (m)</div>
                  <div className="grid-label">W (m)</div>
                  <div className="grid-label">H (m)</div>
                  <div className="grid-label">W (kg)</div>
                  <div className="grid-label">Qty</div>
                  <div></div>
                </div>
                {formData.packages.map(p => (
                  <div className="grid-row cargo-grid" key={p.id}>
                    <input className="figma-input" value={p.type} onChange={(e) => handleUpdatePackage(p.id, 'type', e.target.value)} />
                    <input className="figma-input" type="number" value={p.length} onChange={(e) => handleUpdatePackage(p.id, 'length', e.target.value)} />
                    <input className="figma-input" type="number" value={p.width} onChange={(e) => handleUpdatePackage(p.id, 'width', e.target.value)} />
                    <input className="figma-input" type="number" value={p.height} onChange={(e) => handleUpdatePackage(p.id, 'height', e.target.value)} />
                    <input className="figma-input" type="number" value={p.weight} onChange={(e) => handleUpdatePackage(p.id, 'weight', e.target.value)} />
                    <input className="figma-input" type="number" value={p.qty} onChange={(e) => handleUpdatePackage(p.id, 'qty', e.target.value)} />
                    <button className="btn-icon-danger" onClick={() => handleRemovePackage(p.id)}>🗑</button>
                  </div>
                ))}
                <button className="btn-figma-text" style={{ color: '#3D5AFE' }} onClick={handleAddPackage}>+ Add package row</button>
              </div>

              {/* Step 4: Vehicle */}
              <div className="step-main-card" style={{ marginBottom: '24px' }}>
                <div className="step-title-row"><h2>Vehicle Type</h2><span className="step-count">Step 4 of 5</span></div>
                <div className="chip-group">
                  {['Tautliner', 'Mega', 'Box truck', 'Frigo', 'Flatbed'].map(v => (
                    <button key={v} className={`chip ${formData.vehicle === v ? 'active' : ''}`} onClick={() => setFormData({...formData, vehicle: v})}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Step 5: Pricing */}
              <div className="step-main-card">
                <div className="step-title-row"><h2>Pricing</h2><span className="step-count">Step 5 of 5</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', color: '#5C6470' }}>€</span>
                  <input className="figma-input" style={{ fontSize: '20px', fontWeight: 600 }} placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <button 
                  className="btn-figma-primary" 
                  style={{ width: '100%', marginTop: '32px', padding: '16px' }} 
                  disabled={!isFormValid || isSubmitting} 
                  onClick={handleSave}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </>
          )}
        </div>

        <aside className="create-right-sidebar">
          <div className="figma-map-card">
            <div style={{ padding: '12px 16px', fontWeight: 600 }}>Map Preview</div>
            <div style={{ flex: 1, position: 'relative' }}><RoutingMap stops={formData.stops} /></div>
          </div>
          <div className="calc-widget-dark">
            <div className="calc-widget-title">Calculation</div>
            <div className="calc-row"><span>Mass</span><span>{stats.totalMass.toFixed(2)} t</span></div>
            <div className="calc-row"><span>Volume</span><span>{stats.totalVolume.toFixed(2)} m³</span></div>
            <div className="calc-row"><span>LDM</span><span>{stats.ldm}</span></div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default CreateOrderPage;
