import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadsService } from '../services/loadsService';
import { RoutingMap } from '../components/UI/RoutingMap';
import type { CreateLoadCommand, CreateLoadDraftCommand, RoutePointInputDto, PayloadInputDto } from '../api/types';

interface RouteStop {
  id: string;
  type: 'start' | 'stop' | 'end';
  city: string;
  address: string;
  datetime: string;
  isLoad: boolean;
}

interface PayloadItem {
  id: string;
  type: string;
  length: number | '';
  width: number | '';
  height: number | '';
  weight: number | '';
  amount: number | '';
}

interface FormData {
  payment: number | '';
  insurance: number | '';
  hScode: string;
  adr: number | '';
  about: string;
  stops: RouteStop[];
  payloads: PayloadItem[];
  photos: File[];
  recommendedVehicle: string;
}

const CreateLoadPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    payment: '',
    insurance: '',
    hScode: '',
    adr: '',
    about: '',
    stops: [
      { id: 'start', type: 'start', city: '', address: '', datetime: '', isLoad: true },
      { id: 'end', type: 'end', city: '', address: '', datetime: '', isLoad: false }
    ],
    payloads: [
      { id: 'p1', type: 'Pallets', length: 1.2, width: 0.8, height: 1.8, weight: 827, amount: 22 }
    ],
    photos: [],
    recommendedVehicle: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [currentStopId, setCurrentStopId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; city: string } | null>(null);

  // Auto calculation
  const totals = formData.payloads.reduce((acc, p) => {
    const amount = Number(p.amount) || 0;
    const weight = Number(p.weight) || 0;
    const length = Number(p.length) || 0;
    const width = Number(p.width) || 0;
    const height = Number(p.height) || 0;

    const itemVolume = length * width * height * amount;
    const itemFootprint = length * width * amount;
    const itemLDM = (length * width * amount) / 2.4;

    return {
      mass: acc.mass + (weight * amount),
      volume: acc.volume + itemVolume,
      footprint: acc.footprint + itemFootprint,
      ldm: acc.ldm + itemLDM
    };
  }, { mass: 0, volume: 0, footprint: 0, ldm: 0 });

  const standardTrailerLDM = 13.6;
  const ldmLeft = standardTrailerLDM - totals.ldm;

  const isValid = formData.stops.some(s => s.address) && formData.payloads.some(p => Number(p.weight) > 0) && formData.payment !== '';

  const openMapForStop = (stopId: string) => {
    setCurrentStopId(stopId);
    setSelectedLocation(null);
    setMapModalOpen(true);
  };

  const handleMapClickInModal = async (lat: number, lng: number, address: string) => {
    const city = address.split(',')[0].trim();
    setSelectedLocation({ address, city });
  };

  const confirmMapLocation = () => {
    if (!currentStopId || !selectedLocation) return;

    const newStops = formData.stops.map(s =>
      s.id === currentStopId ? { ...s, address: selectedLocation.address, city: selectedLocation.city } : s
    );
    setFormData(prev => ({ ...prev, stops: newStops }));
    setMapModalOpen(false);
    setCurrentStopId(null);
    setSelectedLocation(null);
  };

  const handleAddStop = () => {
    const newStop: RouteStop = {
      id: Date.now().toString(),
      type: 'stop',
      city: '',
      address: '',
      datetime: '',
      isLoad: false
    };
    const newStops = [...formData.stops];
    newStops.splice(newStops.length - 1, 0, newStop);
    setFormData(prev => ({ ...prev, stops: newStops }));
  };

  const handleUpdateStop = (id: string, field: keyof RouteStop, value: any) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleRemoveStop = (id: string) => {
    const stop = formData.stops.find(s => s.id === id);
    if (!stop || stop.type === 'start' || stop.type === 'end') return;
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter(s => s.id !== id)
    }));
  };

  const handleAddPayload = () => {
    const newP: PayloadItem = {
      id: Date.now().toString(),
      type: 'Pallets',
      length: '', width: '', height: '', weight: '', amount: ''
    };
    setFormData(prev => ({ ...prev, payloads: [...prev.payloads, newP] }));
  };

  const handleUpdatePayload = (id: string, field: keyof PayloadItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      payloads: prev.payloads.map(p =>
        p.id === id ? { ...p, [field]: field === 'type' ? value : (value === '' ? '' : Number(value)) } : p
      )
    }));
  };

  const handleRemovePayload = (id: string) => {
    if (formData.payloads.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      payloads: prev.payloads.filter(p => p.id !== id)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };
  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const mapStops = formData.stops.map(s => ({ address: s.address, type: s.type }));

  const buildRoutePoints = (): RoutePointInputDto[] =>
    formData.stops.filter(s => s.address.trim()).map((s, idx) => ({
      city: s.city || s.address.split(',')[0].trim(),
      address: s.address,
      arrivalTime: s.datetime ? `${s.datetime}:00` : null,
      orderIndex: idx
    }));

  const buildPayloads = (): PayloadInputDto[] =>
    formData.payloads.filter(p => Number(p.weight) > 0).map(p => ({
      length: Number(p.length) || 0,
      width: Number(p.width) || 0,
      height: Number(p.height) || 0,
      weight: Number(p.weight),
      volume: 0,
      amount: Number(p.amount) || 1,
      type: p.type || null
    }));

  const saveDraft = async () => {
    setIsSubmitting(true); setError('');
    const draft: CreateLoadDraftCommand = {
      userId: '',
      startDate: null,
      payment: formData.payment !== '' ? Number(formData.payment) : null,
      insurance: formData.insurance !== '' ? Number(formData.insurance) : null,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : null,
      suitableCargos: null,
      about: formData.about || null
    };
    try {
      const id = await loadsService.createLoadDraft(draft);
      setSuccess(`Draft saved (ID: ${id})`);
    } catch (e: any) { setError(e.message || 'Failed to save draft'); }
    finally { setIsSubmitting(false); }
  };

  const publish = async () => {
    if (!isValid) { setError('Fill route, payloads and payment.'); return; }
    setIsSubmitting(true); setError('');
    const cmd: CreateLoadCommand = {
      userId: '',
      startDate: new Date().toISOString().split('T')[0],
      payment: Number(formData.payment) || 0,
      insurance: Number(formData.insurance) || 0,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : 0,
      suitableCargos: null,
      about: formData.about || null,
      payloads: buildPayloads(),
      routePoints: buildRoutePoints()
    };
    try {
      const id = await loadsService.createLoad(cmd);
      setSuccess(`Load published! ID: ${id}`);
      setTimeout(() => navigate('/my-listings'), 1200);
    } catch (e: any) { setError(e.message || 'Publish failed'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '92rem', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>Workspace › My listings › New</div>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>New listing</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={saveDraft} disabled={isSubmitting} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', cursor: 'pointer' }}>Save draft</button>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={publish} disabled={isSubmitting || !isValid} style={{ padding: '0.5rem 1.5rem', background: isValid ? '#3B82F6' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: isValid ? 'pointer' : 'not-allowed' }}>
            {isSubmitting ? 'Publishing...' : 'Continue'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#D1FAE5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '16rem 1fr 24rem', gap: '1.5rem' }}>
        
        {/* Stepper Sidebar (без Type) */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '1.5rem' }}>
          {[
            { id: 1, label: 'Route', status: 'in-progress' },
            { id: 2, label: 'Cargo', status: 'pending' },
            { id: 3, label: 'Vehicle', status: 'pending' },
            { id: 4, label: 'Pricing', status: 'pending' },
            { id: 5, label: 'Review & publish', status: 'pending' }
          ].map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: idx < 4 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '9999px',
                background: step.status === 'in-progress' ? '#3B82F6' : '#E5E7EB',
                color: step.status !== 'pending' ? 'white' : '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600
              }}>
                {step.id}
              </div>
              <div style={{ fontSize: '0.9375rem', color: step.status === 'in-progress' ? '#111827' : '#6B7280' }}>{step.label}</div>
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Route Section */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Route details</div>
              <button onClick={handleAddStop} style={{ fontSize: '0.875rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add stop</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {formData.stops.map((stop, idx) => (
                <div key={stop.id} style={{ background: '#F9FAFB', padding: '0.875rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: stop.type === 'start' ? '#3B82F6' : stop.type === 'end' ? '#10B981' : '#6B7280', minWidth: '3.5rem' }}>
                      {stop.type === 'start' ? 'Start' : stop.type === 'end' ? 'End' : `Stop ${idx}`}
                    </div>
                    <button onClick={() => openMapForStop(stop.id)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#E0E7FF', color: '#3730A3', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>📍 Pick on map</button>
                    {stop.type === 'stop' && <button onClick={() => handleRemoveStop(stop.id)} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>Remove</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="City" value={stop.city} onChange={e => handleUpdateStop(stop.id, 'city', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    <input placeholder="Full address" value={stop.address} onChange={e => handleUpdateStop(stop.id, 'address', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <input type="datetime-local" value={stop.datetime} onChange={e => handleUpdateStop(stop.id, 'datetime', e.target.value)} style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Cargo Section */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Cargo details</div>
              <button onClick={handleAddPayload} style={{ fontSize: '0.875rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add package</button>
            </div>
            {formData.payloads.map((p) => (
              <div key={p.id} style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                  <select value={p.type} onChange={e => handleUpdatePayload(p.id, 'type', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="Pallets">Pallets</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Containers">Containers</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="ADR">ADR</option>
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    <input type="number" placeholder="L" value={p.length} onChange={e => handleUpdatePayload(p.id, 'length', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', width: '100%' }} />
                    <input type="number" placeholder="W" value={p.width} onChange={e => handleUpdatePayload(p.id, 'width', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', width: '100%' }} />
                    <input type="number" placeholder="H" value={p.height} onChange={e => handleUpdatePayload(p.id, 'height', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', width: '100%' }} />
                    <input type="number" placeholder="Kg" value={p.weight} onChange={e => handleUpdatePayload(p.id, 'weight', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', width: '100%' }} />
                    <input type="number" placeholder="Qty" value={p.amount} onChange={e => handleUpdatePayload(p.id, 'amount', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', width: '100%' }} />
                  </div>
                </div>
                {formData.payloads.length > 1 && <button onClick={() => handleRemovePayload(p.id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.875rem' }}>Remove</button>}
              </div>
            ))}

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div><div style={{fontSize:'0.75rem', color:'#6B7280'}}>HS Code</div><input value={formData.hScode} onChange={e => setFormData(p=>({...p, hScode: e.target.value}))} style={{width:'100%', padding:'0.5rem', border:'1px solid #E5E7EB', borderRadius:'0.5rem'}}/></div>
              <div><div style={{fontSize:'0.75rem', color:'#6B7280'}}>ADR</div><input type="number" value={formData.adr} onChange={e => setFormData(p=>({...p, adr: e.target.value===''?'':Number(e.target.value)}))} style={{width:'100%', padding:'0.5rem', border:'1px solid #E5E7EB', borderRadius:'0.5rem'}}/></div>
              <div><div style={{fontSize:'0.75rem', color:'#6B7280'}}>Insurance</div><input type="number" value={formData.insurance} onChange={e => setFormData(p=>({...p, insurance: e.target.value===''?'':Number(e.target.value)}))} style={{width:'100%', padding:'0.5rem', border:'1px solid #E5E7EB', borderRadius:'0.5rem'}}/></div>
            </div>
          </div>

          {/* Vehicle & Pricing */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.75rem' }}>Vehicle &amp; Pricing</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {['Tautliner', 'Box truck', 'Reefer', 'Mega', 'Flatbed'].map(v => (
                <button key={v} onClick={() => setFormData(p => ({ ...p, recommendedVehicle: v }))} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: formData.recommendedVehicle === v ? '#3B82F6' : '#F3F4F6', color: formData.recommendedVehicle === v ? 'white' : '#374151', cursor: 'pointer' }}>{v}</button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Payment (€)</div>
              <input type="number" value={formData.payment} onChange={e => setFormData(p => ({ ...p, payment: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
            </div>
          </div>

          {/* Photos */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.75rem' }}>Photos</div>
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => document.getElementById('file-in')?.click()} style={{ border: '2px dashed #E5E7EB', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#F0F9FF' : '#FAFAFA' }}>
              <input id="file-in" type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <div style={{ color: '#6B7280' }}>Click or drag photos here</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {formData.photos.map((f, i) => (
                <div key={i} style={{ position: 'relative', width: '4rem', height: '4rem' }}>
                  <img src={URL.createObjectURL(f)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                  <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Map + Auto Calc */}
        <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
          
          {/* Map */}
          <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '20rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontWeight: 600, fontSize: '0.9375rem' }}>Route preview</div>
            <div style={{ height: 'calc(100% - 2.75rem)' }}>
              <RoutingMap stops={mapStops} />
            </div>
          </div>

          {/* Auto Calculation Widget */}
          <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.5rem', color: 'white' }}>
            <div style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              Auto calculation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#9CA3AF' }}>Total mass</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{(totals.mass / 1000).toFixed(2)} <span style={{ fontSize: '1.125rem', color: '#9CA3AF' }}>t</span></div>
                  <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>{totals.mass.toLocaleString()} kg</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#9CA3AF' }}>Total volume</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{totals.volume.toFixed(2)} <span style={{ fontSize: '1.125rem', color: '#9CA3AF' }}>m³</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#9CA3AF' }}>Loading metres</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{totals.ldm.toFixed(1)} <span style={{ fontSize: '1.125rem', color: '#9CA3AF' }}>LDM</span></div>
                  <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>non-stackable</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: '#9CA3AF' }}>Floor footprint</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{totals.footprint.toFixed(2)} <span style={{ fontSize: '1.125rem', color: '#9CA3AF' }}>m²</span></div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: '#93C5FD' }}>
              <div style={{fontWeight:'bold'}}>ⓘ</div>
              <div>{totals.ldm > 13.6 ? `Exceeds capacity by ${(totals.ldm - 13.6).toFixed(1)} LDM.` : `Fits standard 13.6 LDM trailer with ${ldmLeft.toFixed(1)} LDM to spare.`}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {mapModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setMapModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '0.75rem', width: 'min(90vw, 50rem)', height: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Select location</strong>
              <button onClick={() => setMapModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1 }}><RoutingMap stops={[]} onMapClick={handleMapClickInModal} hideFloatingWidget /></div>
            <div style={{ padding: '1rem', borderTop: '1px solid #E5E7EB', textAlign: 'right' }}>
              <button onClick={confirmMapLocation} disabled={!selectedLocation} style={{ padding: '0.5rem 1.5rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Confirm location</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLoadPage;