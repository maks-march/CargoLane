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
  volume: number | '';
  amount: number | '';
}

interface FormData {
  payment: number | '';
  insurance: number | '';
  hScode: string;
  adr: number | '';
  suitableCargos: string[];
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
    suitableCargos: [],
    about: '',
    stops: [
      { id: 'start', type: 'start', city: '', address: '', datetime: '', isLoad: true },
      { id: 'end', type: 'end', city: '', address: '', datetime: '', isLoad: false }
    ],
    payloads: [
      { id: 'p1', type: 'EUR pallet', length: 1.2, width: 0.8, height: 1.8, weight: 827, volume: '', amount: 22 }
    ],
    photos: [],
    recommendedVehicle: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Map modal state
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [currentStopId, setCurrentStopId] = useState<string | null>(null);

  const isValid = formData.stops.some(s => s.address) && formData.payloads.some(p => Number(p.weight) > 0) && formData.payment !== '';

  // Open map modal for specific stop
  const openMapForStop = (stopId: string) => {
    setCurrentStopId(stopId);
    setMapModalOpen(true);
  };

  // Handle map click in modal
  const handleMapClickInModal = async (lat: number, lng: number, address: string) => {
    if (!currentStopId) return;

    const newStops = formData.stops.map(s =>
      s.id === currentStopId
        ? { ...s, address, city: address.split(',')[0].trim() }
        : s
    );
    setFormData(prev => ({ ...prev, stops: newStops }));
    setMapModalOpen(false);
    setCurrentStopId(null);
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
      type: 'General',
      length: '', width: '', height: '', weight: '', volume: '', amount: ''
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

  const toggleCargoTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      suitableCargos: prev.suitableCargos.includes(tag)
        ? prev.suitableCargos.filter(t => t !== tag)
        : [...prev.suitableCargos, tag]
    }));
  };

  // Drag & drop
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
      volume: Number(p.volume) || (Number(p.length) * Number(p.width) * Number(p.height)) || 0,
      amount: Number(p.amount) || 1,
      type: p.type || null
    }));

  const saveDraft = async () => {
    setIsSubmitting(true); setError('');
    const draft: CreateLoadDraftCommand = {
      userId: '', startDate: null,
      payment: formData.payment !== '' ? Number(formData.payment) : null,
      insurance: formData.insurance !== '' ? Number(formData.insurance) : null,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : null,
      suitableCargos: formData.suitableCargos.length ? formData.suitableCargos : null,
      about: formData.about || null
    };
    try {
      const id = await loadsService.createLoadDraft(draft);
      setDraftId(id); setSuccess(`Draft saved (ID: ${id})`);
    } catch (e: any) { setError(e.message || 'Failed to save draft'); }
    finally { setIsSubmitting(false); }
  };

  const publish = async () => {
    if (!isValid) { setError('Fill route, at least one payload with weight, and payment.'); return; }
    setIsSubmitting(true); setError('');
    const cmd: CreateLoadCommand = {
      userId: '', startDate: new Date().toISOString().split('T')[0],
      payment: Number(formData.payment) || 0,
      insurance: Number(formData.insurance) || 0,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : 0,
      suitableCargos: formData.suitableCargos.length ? formData.suitableCargos : null,
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
    <div style={{ padding: '1.5rem', maxWidth: '92rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>Workspace › My listings › New</div>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>New listing</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={saveDraft} disabled={isSubmitting} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
            Save draft
          </button>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={publish} disabled={isSubmitting || !isValid} style={{ padding: '0.5rem 1.5rem', background: isValid ? '#3B82F6' : '#9CA3AF', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: isValid ? 'pointer' : 'not-allowed' }}>
            {isSubmitting ? 'Publishing...' : 'Continue'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#D1FAE5', color: '#059669', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '16rem 1fr 24rem', gap: '1.5rem' }}>
        {/* Stepper Sidebar */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {[
            { id: 1, label: 'Type', status: 'completed' },
            { id: 2, label: 'Route', status: 'in-progress' },
            { id: 3, label: 'Cargo', status: 'pending' },
            { id: 4, label: 'Vehicle', status: 'pending' },
            { id: 5, label: 'Pricing', status: 'pending' },
            { id: 6, label: 'Review & publish', status: 'pending' }
          ].map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: idx < 5 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '9999px',
                background: step.status === 'completed' ? '#10B981' : step.status === 'in-progress' ? '#3B82F6' : '#E5E7EB',
                color: step.status !== 'pending' ? 'white' : '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600
              }}>
                {step.status === 'completed' ? '✓' : step.id}
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
                    <button 
                      onClick={() => openMapForStop(stop.id)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#E0E7FF', color: '#3730A3', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      📍 Pick on map
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input placeholder="City" value={stop.city} onChange={e => handleUpdateStop(stop.id, 'city', e.target.value)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    <input placeholder="Full address" value={stop.address} onChange={e => handleUpdateStop(stop.id, 'address', e.target.value)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <input type="datetime-local" value={stop.datetime} onChange={e => handleUpdateStop(stop.id, 'datetime', e.target.value)} style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Cargo Section - List style with per-payload cargoType */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Cargo details</div>
              <button onClick={handleAddPayload} style={{ fontSize: '0.875rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add package</button>
            </div>

            {formData.payloads.map((p, idx) => (
              <div key={p.id} style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                  {/* Cargo Type per payload - own line */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Cargo type</div>
                    <input 
                      placeholder="EUR pallet / Box / Container..." 
                      value={p.type} 
                      onChange={e => handleUpdatePayload(p.id, 'type', e.target.value)} 
                      style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Length (m)</div>
                      <input type="number" placeholder="1.2" value={p.length} onChange={e => handleUpdatePayload(p.id, 'length', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Width (m)</div>
                      <input type="number" placeholder="0.8" value={p.width} onChange={e => handleUpdatePayload(p.id, 'width', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Height (m)</div>
                      <input type="number" placeholder="1.8" value={p.height} onChange={e => handleUpdatePayload(p.id, 'height', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Weight (kg)</div>
                      <input type="number" placeholder="827" value={p.weight} onChange={e => handleUpdatePayload(p.id, 'weight', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Volume (m³)</div>
                      <input type="number" placeholder="1.73" value={p.volume} onChange={e => handleUpdatePayload(p.id, 'volume', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Quantity</div>
                      <input type="number" placeholder="22" value={p.amount} onChange={e => handleUpdatePayload(p.id, 'amount', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </div>

                  {formData.payloads.length > 1 && (
                    <button onClick={() => handleRemovePayload(p.id)} style={{ alignSelf: 'flex-start', color: '#EF4444', background: 'none', border: 'none', fontSize: '0.875rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                      Remove package
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Suitable Cargos */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.375rem' }}>Suitable cargo tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {['ADR', 'Reefer', 'Oversized', 'Hazardous', 'Fragile'].map(tag => (
                  <button key={tag} onClick={() => toggleCargoTag(tag)} style={{
                    padding: '0.375rem 0.875rem', fontSize: '0.875rem', borderRadius: '9999px',
                    background: formData.suitableCargos.includes(tag) ? '#DBEAFE' : '#F3F4F6',
                    border: '1px solid #E5E7EB', cursor: 'pointer'
                  }}>{tag}</button>
                ))}
              </div>
            </div>

            {/* HS Code / ADR / Insurance - each on own line */}
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>HS Code</div>
                <input placeholder="3402.20.90" value={formData.hScode} onChange={e => setFormData(prev => ({ ...prev, hScode: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>ADR class</div>
                <input type="number" placeholder="0-9" value={formData.adr} onChange={e => setFormData(prev => ({ ...prev, adr: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Insurance (€)</div>
                <input type="number" placeholder="60000" value={formData.insurance} onChange={e => setFormData(prev => ({ ...prev, insurance: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
              </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Additional info</div>
              <textarea placeholder="Notes..." value={formData.about} onChange={e => setFormData(prev => ({ ...prev, about: e.target.value }))} style={{ width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.9375rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', minHeight: '4rem' }} />
            </div>
          </div>

          {/* Vehicle & Pricing */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.75rem' }}>Vehicle &amp; Pricing</div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.375rem' }}>Recommended vehicle type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Tautliner trailer', 'Box truck', 'Curtainsider', 'Reefer', 'Flatbed', 'Mega trailer'].map(v => (
                  <button 
                    key={v} 
                    onClick={() => setFormData(prev => ({ ...prev, recommendedVehicle: v }))}
                    style={{
                      padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '0.5rem',
                      background: formData.recommendedVehicle === v ? '#3B82F6' : '#F3F4F6',
                      color: formData.recommendedVehicle === v ? 'white' : '#374151',
                      border: '1px solid #E5E7EB', cursor: 'pointer'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Payment (€)</div>
              <input type="number" placeholder="1720" value={formData.payment} onChange={e => setFormData(prev => ({ ...prev, payment: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ width: '100%', padding: '0.625rem 0.875rem', fontSize: '1.125rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
            </div>
          </div>

          {/* Photos */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.75rem' }}>Photos</div>
            <div 
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => document.getElementById('photo-input')?.click()}
              style={{ 
                border: `2px dashed ${isDragging ? '#3B82F6' : '#E5E7EB'}`, 
                borderRadius: '0.75rem', 
                padding: '2rem', 
                textAlign: 'center', 
                cursor: 'pointer',
                background: isDragging ? '#F0F9FF' : '#FAFAFA'
              }}
            >
              <input id="photo-input" type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <div style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
                Drag &amp; drop photos here or click to upload<br />
                <span style={{ fontSize: '0.75rem' }}>(stub — photos will be uploaded separately)</span>
              </div>
            </div>
            {formData.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {formData.photos.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '4.5rem', height: '4.5rem', background: '#F3F4F6', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removePhoto(idx)} style={{ position: 'absolute', top: '0.125rem', right: '0.125rem', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '9999px', width: '1.125rem', height: '1.125rem', fontSize: '0.75rem', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Map Panel */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '32.5rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontWeight: 600, fontSize: '0.9375rem' }}>Route preview</div>
            <div style={{ height: 'calc(100% - 2.75rem)' }}>
              <RoutingMap stops={mapStops} />
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {mapModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setMapModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '0.75rem', width: 'min(92vw, 48rem)', height: 'min(82vh, 36rem)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>Pick location on map</div>
              <button onClick={() => setMapModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ height: 'calc(100% - 3.25rem)' }}>
              <RoutingMap 
                stops={[]} 
                onMapClick={handleMapClickInModal}
                hideFloatingWidget
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLoadPage;