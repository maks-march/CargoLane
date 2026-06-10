import React, { useState, useMemo } from 'react';
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

interface LoadFormData {
  startDate: string;
  payment: number | '';
  insurance: number | '';
  hScode: string;
  adr: number | '';
  suitableCargos: string[];
  about: string;
  stops: RouteStop[];
  payloads: PayloadItem[];
}

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoadFormData>({
    startDate: new Date().toISOString().split('T')[0],
    payment: '',
    insurance: '',
    hScode: '',
    adr: '',
    suitableCargos: [],
    about: '',
    stops: [
      { id: '1', type: 'start', city: '', address: '', datetime: '', isLoad: true },
      { id: '2', type: 'end', city: '', address: '', datetime: '', isLoad: false }
    ],
    payloads: [
      { id: '1', type: 'General', length: '', width: '', height: '', weight: '', volume: '', amount: '' }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const hasRoute = formData.stops.every(s => s.address.trim() !== '' && s.datetime !== '');
    const hasPayloads = formData.payloads.some(p => Number(p.weight) > 0 && Number(p.amount) > 0);
    const hasPayment = formData.payment !== '';
    return hasRoute && hasPayloads && hasPayment;
  }, [formData]);

  const handleAddStop = () => {
    const newStops = [...formData.stops];
    const newStop: RouteStop = { 
      id: Date.now().toString(), 
      type: 'stop', 
      city: '', 
      address: '', 
      datetime: '', 
      isLoad: false 
    };
    newStops.splice(newStops.length - 1, 0, newStop);
    setFormData({ ...formData, stops: newStops });
  };

  const handleUpdateStop = (id: string, field: keyof RouteStop, value: any) => {
    const newStops = formData.stops.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, stops: newStops });
  };

  const handleRemoveStop = (id: string) => {
    const stop = formData.stops.find(s => s.id === id);
    if (stop && (stop.type === 'start' || stop.type === 'end')) {
      // Clear instead of remove
      const newStops = formData.stops.map(s => 
        s.id === id ? { ...s, city: '', address: '', datetime: '' } : s
      );
      setFormData({ ...formData, stops: newStops });
    } else {
      const newStops = formData.stops.filter(s => s.id !== id);
      setFormData({ ...formData, stops: newStops });
    }
  };

  const handleAddPayload = () => {
    const newPayload: PayloadItem = { 
      id: Date.now().toString(), 
      type: 'General', 
      length: '', width: '', height: '', weight: '', volume: '', amount: '' 
    };
    setFormData({ ...formData, payloads: [...formData.payloads, newPayload] });
  };

  const handleUpdatePayload = (id: string, field: keyof PayloadItem, value: any) => {
    const newPayloads = formData.payloads.map(p => {
      if (p.id === id) {
        const numValue = field !== 'type' ? (value === '' ? '' : Number(value)) : value;
        return { ...p, [field]: numValue };
      }
      return p;
    });
    setFormData({ ...formData, payloads: newPayloads });
  };

  const handleRemovePayload = (id: string) => {
    if (formData.payloads.length > 1) {
      setFormData({ 
        ...formData, 
        payloads: formData.payloads.filter(p => p.id !== id) 
      });
    }
  };

  const handleAddCargoTag = (tag: string) => {
    if (!formData.suitableCargos.includes(tag)) {
      setFormData({ 
        ...formData, 
        suitableCargos: [...formData.suitableCargos, tag] 
      });
    }
  };

  const handleRemoveCargoTag = (tag: string) => {
    setFormData({ 
      ...formData, 
      suitableCargos: formData.suitableCargos.filter(t => t !== tag) 
    });
  };

  const mapStopsToRoutePoints = (): RoutePointInputDto[] => {
    return formData.stops
      .filter(s => s.address.trim() !== '')
      .map((stop, index) => ({
        city: stop.city || stop.address.split(',')[0].trim() || 'Unknown',
        address: stop.address,
        arrivalTime: stop.datetime ? `${stop.datetime}T00:00:00` : null,
        orderIndex: index
      }));
  };

  const mapPayloadsToInput = (): PayloadInputDto[] => {
    return formData.payloads
      .filter(p => Number(p.weight) > 0)
      .map(p => ({
        length: Number(p.length) || 0,
        width: Number(p.width) || 0,
        height: Number(p.height) || 0,
        weight: Number(p.weight) || 0,
        volume: Number(p.volume) || (Number(p.length) * Number(p.width) * Number(p.height)) || 0,
        amount: Number(p.amount) || 1,
        type: p.type || null
      }));
  };

  const saveDraft = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const draftData: CreateLoadDraftCommand = {
      userId: '', // handled by auth
      startDate: formData.startDate || null,
      payment: formData.payment !== '' ? Number(formData.payment) : null,
      insurance: formData.insurance !== '' ? Number(formData.insurance) : null,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : null,
      suitableCargos: formData.suitableCargos.length > 0 ? formData.suitableCargos : null,
      about: formData.about || null
    };

    try {
      const id = await loadsService.createLoadDraft(draftData);
      setDraftId(id);
      setSuccessMsg(`Draft saved! ID: ${id}. You can continue editing or publish.`);
    } catch (error: any) {
      setErrorMsg(`Failed to save draft: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishLoad = async () => {
    if (!isFormValid) {
      setErrorMsg('Please fill required fields: route points, at least one payload with weight, payment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const loadData: CreateLoadCommand = {
      userId: '',
      startDate: formData.startDate,
      payment: Number(formData.payment) || 0,
      insurance: Number(formData.insurance) || 0,
      hScode: formData.hScode || null,
      adr: formData.adr !== '' ? Number(formData.adr) : 0,
      suitableCargos: formData.suitableCargos.length > 0 ? formData.suitableCargos : null,
      about: formData.about || null,
      payloads: mapPayloadsToInput(),
      routePoints: mapStopsToRoutePoints()
    };

    try {
      const returnedId = await loadsService.createLoad(loadData);
      setSuccessMsg(`Load published successfully! ID: ${returnedId}`);
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (error: any) {
      setErrorMsg(`Failed to publish: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare stops for map
  const mapStopsForRouting = formData.stops.map(s => ({
    address: s.address,
    type: s.type
  }));

  return (
    <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Create Load</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={saveDraft} 
            disabled={isSubmitting}
            style={{ 
              padding: '8px 16px', 
              background: '#6B7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button 
            onClick={publishLoad} 
            disabled={isSubmitting || !isFormValid}
            style={{ 
              padding: '8px 16px', 
              background: isFormValid ? '#3D5AFE' : '#9CA3AF', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: (isSubmitting || !isFormValid) ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Load'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ background: '#D1FAE5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {successMsg}
          {draftId && <div>Draft ID: {draftId} (use this to continue later)</div>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
        {/* Form Section - Dense Layout */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Route Points - Compact */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Route Points</h3>
              <button 
                onClick={handleAddStop}
                style={{ padding: '4px 12px', fontSize: '13px', background: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                + Add Stop
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.stops.map((stop, index) => (
                <div key={stop.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px 1fr 1fr 140px 80px 40px', 
                  gap: '8px', 
                  alignItems: 'center',
                  background: '#F9FAFB',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                    {stop.type.toUpperCase()}
                  </div>
                  <input 
                    placeholder="City" 
                    value={stop.city} 
                    onChange={(e) => handleUpdateStop(stop.id, 'city', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <input 
                    placeholder="Full address" 
                    value={stop.address} 
                    onChange={(e) => handleUpdateStop(stop.id, 'address', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <input 
                    type="datetime-local" 
                    value={stop.datetime} 
                    onChange={(e) => handleUpdateStop(stop.id, 'datetime', e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <select 
                    value={stop.isLoad ? 'load' : 'unload'} 
                    onChange={(e) => handleUpdateStop(stop.id, 'isLoad', e.target.value === 'load')}
                    style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  >
                    <option value="load">Load</option>
                    <option value="unload">Unload</option>
                  </select>
                  <button 
                    onClick={() => handleRemoveStop(stop.id)}
                    style={{ padding: '4px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payloads - Dense Grid */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Payloads</h3>
              <button 
                onClick={handleAddPayload}
                style={{ padding: '4px 12px', fontSize: '13px', background: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                + Add Payload
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {formData.payloads.map((payload) => (
                <div key={payload.id} style={{ 
                  background: '#F9FAFB', 
                  padding: '12px', 
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px'
                }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input 
                      placeholder="Type (e.g. Pallet)" 
                      value={payload.type} 
                      onChange={(e) => handleUpdatePayload(payload.id, 'type', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                    />
                  </div>
                  <input type="number" placeholder="L (m)" value={payload.length} onChange={(e) => handleUpdatePayload(payload.id, 'length', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  <input type="number" placeholder="W (m)" value={payload.width} onChange={(e) => handleUpdatePayload(payload.id, 'width', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  <input type="number" placeholder="H (m)" value={payload.height} onChange={(e) => handleUpdatePayload(payload.id, 'height', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  <input type="number" placeholder="Weight (kg)" value={payload.weight} onChange={(e) => handleUpdatePayload(payload.id, 'weight', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  <input type="number" placeholder="Volume (m³)" value={payload.volume} onChange={(e) => handleUpdatePayload(payload.id, 'volume', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  <input type="number" placeholder="Amount" value={payload.amount} onChange={(e) => handleUpdatePayload(payload.id, 'amount', e.target.value)} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                  {formData.payloads.length > 1 && (
                    <button onClick={() => handleRemovePayload(payload.id)} style={{ gridColumn: '1 / -1', padding: '4px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Other Fields - Dense */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Start Date</label>
              <input 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Payment (€)</label>
              <input 
                type="number" 
                placeholder="Payment amount" 
                value={formData.payment} 
                onChange={(e) => setFormData({ ...formData, payment: e.target.value === '' ? '' : Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Insurance (€)</label>
              <input 
                type="number" 
                placeholder="Insurance" 
                value={formData.insurance} 
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value === '' ? '' : Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>HS Code</label>
              <input 
                placeholder="HS Code" 
                value={formData.hScode} 
                onChange={(e) => setFormData({ ...formData, hScode: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>ADR Class</label>
              <input 
                type="number" 
                placeholder="0-9" 
                value={formData.adr} 
                onChange={(e) => setFormData({ ...formData, adr: e.target.value === '' ? '' : Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Suitable Cargos</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                {formData.suitableCargos.map(tag => (
                  <span key={tag} style={{ background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {tag} <button onClick={() => handleRemoveCargoTag(tag)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['ADR', 'Reefer', 'Oversized', 'Hazardous', 'Fragile'].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => handleAddCargoTag(tag)}
                    style={{ padding: '2px 8px', fontSize: '12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* About - Full width */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Additional Info</label>
            <textarea 
              placeholder="Additional details about the load..." 
              value={formData.about} 
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #E5E7EB', borderRadius: '6px', minHeight: '60px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Side Map */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Route Preview</h3>
          <div style={{ height: '420px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <RoutingMap 
              stops={mapStopsForRouting} 
              hideFloatingWidget={false}
            />
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280' }}>
            Enter addresses above to see the route on the map. The map will auto-update as you type.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
