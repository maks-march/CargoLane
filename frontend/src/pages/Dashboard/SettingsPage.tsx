import React, { useState, useEffect, useMemo, useRef } from 'react';
import apiClient from '../../api/api-client';
import useAuthStore from '../../store/auth.store';
import { userService } from '../../services/userService';

type TabType = 'profile' | 'company' | 'security';

interface ApiError {
  response?: {
    data?: {
      details?: string;
      message?: string;
      errors?: Record<string, string[]>;
    }
  }
}

export const SettingsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [userForm, setUserData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    role: 'Carrier',
    timezone: '0',
    units: 'metric', 
    companyName: '',
    companyType: 'Freight forwarder',
    regCountry: '',
    street: '',
    city: '',
    zip: '',
    region: '',
    country: ''
  });

  const [initialForm, setInitialForm] = useState(userForm);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const profile = await userService.getProfile();
        if (profile && isMounted) {
          const newData = { 
            ...userForm,
            ...profile,
            phone: profile.phone || '',
            regCountry: profile.companyCountry || '',
            street: profile.address || '',
            zip: profile.postalCode || '',
            displayName: profile.displayName || user?.displayName || user?.name || '',
            companyName: profile.companyName || user?.companyName || '',
            role: profile.role || user?.role || 'Carrier',
            timezone: profile.timezone !== undefined && profile.timezone !== null ? String(profile.timezone) : '0',
            // Бэкенд возвращает 1/0 или true/false. Проверяем всё.
            units: (profile.isMetric === 1 || profile.isMetric === true) ? 'metric' : 'imperial'
          };
          
          setUserData(newData);
          setInitialForm(newData);

          const avatar = profile.avatarPath || profile.avatarUrl;
          if (avatar) {
            setAvatarPreview(avatar);
          }
          
          updateUser({ 
            displayName: newData.displayName, 
            companyName: newData.companyName,
            avatarUrl: avatar
          });
        }
      } catch (err) {
        console.warn("Failed to fetch user profile from backend.");
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(userForm) !== JSON.stringify(initialForm);
  }, [userForm, initialForm]);

  const initials = useMemo(() => {
    const parts = userForm.displayName.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
    return 'U';
  }, [userForm.displayName]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      
      try {
        const serverUrl = await userService.uploadAvatar(file);
        setAvatarPreview(serverUrl);
        updateUser({ avatarUrl: serverUrl });
        setMessage({ type: 'success', text: 'Avatar uploaded successfully.' });
      } catch (err: unknown) {
        const error = err as ApiError;
        setAvatarPreview(null);
        setMessage({ type: 'error', text: error.response?.data?.details || error.response?.data?.message || 'Failed to upload avatar.' });
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await userService.removeAvatar();
      setAvatarPreview(null);
      updateUser({ avatarUrl: undefined });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMessage({ type: 'success', text: 'Avatar removed.' });
    } catch (err: unknown) {
      const error = err as ApiError;
      setMessage({ type: 'error', text: error.response?.data?.details || error.response?.data?.message || 'Failed to remove avatar.' });
    }
  };

  // ИСПРАВЛЕНО: Информативная валидация. Пишет конкретно, какое поле пустое.
  const validateInputs = () => {
    const requiredFields = [
      { name: 'First name', value: userForm.firstName },
      { name: 'Last name', value: userForm.lastName },
      { name: 'Display name', value: userForm.displayName },
      { name: 'Phone', value: userForm.phone }
    ];

    for (const field of requiredFields) {
      if (!field.value || field.value.trim() === '') {
        setMessage({ type: 'error', text: `Validation Error: ${field.name} is required.` });
        return false;
      }
    }

    if (userForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      setMessage({ type: 'error', text: 'Validation Error: Please enter a valid email address.' });
      return false;
    }

    return true;
  };

  const handleSaveAllData = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // ИСПРАВЛЕНО: Автоматическое добавление "+" к номеру
      let cleanPhone = userForm.phone.replace(/[^\d+]/g, '');
      if (!cleanPhone.startsWith('+') && cleanPhone.length > 0) {
        cleanPhone = '+' + cleanPhone.replace(/\+/g, '');
      }

      // ИСПРАВЛЕНО: Строгое следование контракту Swagger (Никаких null! Только строки и числа)
      const payload = {
        firstName: userForm.firstName.trim() || "",
        lastName: userForm.lastName.trim() || "",
        displayName: userForm.displayName.trim() || "",
        timezone: parseInt(userForm.timezone, 10) || 0,
        isMetric: userForm.units === 'metric' ? 1 : 0, // 1 для метрической, 0 для имперской
        phone: cleanPhone,
        companyName: userForm.companyName.trim() || "",
        companyCountry: userForm.regCountry.trim() || "",
        companyType: userForm.companyType.trim() || "",
        country: userForm.country.trim() || "",
        region: userForm.region.trim() || "",
        city: userForm.city.trim() || "",
        address: userForm.street.trim() || "",
        postalCode: userForm.zip.trim() || ""
      };

      await userService.updateProfile(payload);
      
      updateUser({ 
        displayName: payload.displayName, 
        companyName: payload.companyName 
      });
      
      setInitialForm(userForm); 
      setMessage({ type: 'success', text: 'Changes successfully saved.' });
    } catch (err: unknown) {
      const error = err as ApiError;
      const respData = error.response?.data;
      let errMsg = 'Failed to save changes. Check console for details.';
      
      if (respData?.errors && typeof respData.errors === 'object') {
         const firstKey = Object.keys(respData.errors)[0];
         errMsg = Array.isArray(respData.errors[firstKey]) ? respData.errors[firstKey][0] : respData.errors[firstKey];
      } else if (respData?.details) {
         errMsg = respData.details;
      } else if (respData?.message) {
         errMsg = respData.message;
      }
      
      setMessage({ type: 'error', text: `Server Error: ${errMsg}` });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handlePasswordUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const storedUserId = user?.id;
      if (!storedUserId) throw new Error('User ID not found');

      await apiClient.post('/api/auth/change-password', {
        userId: storedUserId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password securely updated.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as ApiError;
      setMessage({ type: 'error', text: error.response?.data?.details || error.response?.data?.message || 'Password update failed.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your account?")) {
      try {
        await apiClient.post('/api/user/deactivate');
        setMessage({ type: 'success', text: 'Account deactivated successfully.' });
      } catch (err: unknown) {
        const error = err as ApiError;
        setMessage({ type: 'error', text: error.response?.data?.details || error.response?.data?.message || 'Deactivation failed.' });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("CRITICAL: Are you sure you want to permanently delete your account? This cannot be undone.")) {
      try {
        await apiClient.delete('/api/user/me');
        localStorage.clear();
        window.location.href = '/';
      } catch (err: unknown) {
        const error = err as ApiError;
        setMessage({ type: 'error', text: error.response?.data?.details || error.response?.data?.message || 'Deletion failed.' });
      }
    }
  };

  const handleGlobalSave = () => {
    if (activeTab === 'profile' || activeTab === 'company') handleSaveAllData();
    else if (activeTab === 'security') handlePasswordUpdate();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#F6F7FB', overflowY: 'auto' }}>
        
      <header className="dash-header" style={{ borderBottom: '1px solid #E6E8EE', background: 'white', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <div className="dash-breadcrumb">
              <span style={{ color: '#A0AAB9', cursor: 'default', fontWeight: 500 }}>Other</span>
              <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px' }}>›</span>
              <strong style={{ color: '#0E1116', fontWeight: 500 }}>Settings</strong>
            </div>
            <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginTop: '4px' }}>Settings</h1>
          </div>
          {activeTab !== 'security' && (
            <button className="btn-figma-primary" onClick={handleGlobalSave} disabled={isLoading || !isDirty}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>
      </header>

      <div style={{ padding: '32px 48px', width: '100%', maxWidth: '1000px' }}>
        
        <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '32px', padding: '4px', background: 'rgba(230, 232, 238, 0.3)', borderRadius: '10px' }}>
          <button 
            onClick={() => setActiveTab('profile')} 
            style={{
              background: activeTab === 'profile' ? 'white' : 'transparent',
              border: activeTab === 'profile' ? '1px solid #E6E8EE' : '1px solid transparent',
              borderRadius: '8px', padding: '8px 18px', fontSize: '14px', fontWeight: 600,
              color: activeTab === 'profile' ? '#3D5AFE' : '#5C6470', cursor: 'pointer', outline: 'none',
              boxShadow: activeTab === 'profile' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s'
            }}
          >Profile</button>
          <button 
            onClick={() => setActiveTab('company')} 
            style={{
              background: activeTab === 'company' ? 'white' : 'transparent',
              border: activeTab === 'company' ? '1px solid #E6E8EE' : '1px solid transparent',
              borderRadius: '8px', padding: '8px 18px', fontSize: '14px', fontWeight: 600,
              color: activeTab === 'company' ? '#3D5AFE' : '#5C6470', cursor: 'pointer', outline: 'none',
              boxShadow: activeTab === 'company' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s'
            }}
          >Company & Address</button>
          <button 
            onClick={() => setActiveTab('security')} 
            style={{
              background: activeTab === 'security' ? 'white' : 'transparent',
              border: activeTab === 'security' ? '1px solid #E6E8EE' : '1px solid transparent',
              borderRadius: '8px', padding: '8px 18px', fontSize: '14px', fontWeight: 600,
              color: activeTab === 'security' ? '#3D5AFE' : '#5C6470', cursor: 'pointer', outline: 'none',
              boxShadow: activeTab === 'security' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s'
            }}
          >Security</button>
        </div>

        {message.text && (
          <div style={{ color: message.type === 'error' ? '#EF4444' : '#059669', marginBottom: '16px', fontSize: '14px', padding: '10px', background: message.type === 'error' ? '#FEF2F2' : '#ECFDF5', borderRadius: '8px', border: message.type === 'error' ? '1px solid #EF4444' : '1px solid #A7F3D0' }}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div className="detail-card" style={{ padding: '32px', marginBottom: '24px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>Your profile</h2>
                <p style={{ fontSize: '14px', color: '#5C6470' }}>This is how you appear to carriers and shippers across the network.</p>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', background: '#EEF1FF', color: '#3D5AFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>Profile photo</div>
                  <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '4px', marginBottom: '12px' }}>PNG or JPG, at least 256×256px.</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'white', border: '1px solid #E6E8EE', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#0E1116', cursor: 'pointer', outline: 'none' }}>Upload</button>
                    <button type="button" onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600, fontSize: '14px', cursor: 'pointer', outline: 'none' }}>Remove</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <div className="form-label"><label>First name</label></div>
                  <input type="text" className="figma-input" value={userForm.firstName} onChange={(e) => setUserData({...userForm, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Last name</label></div>
                  <input type="text" className="figma-input" value={userForm.lastName} onChange={(e) => setUserData({...userForm, lastName: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <div className="form-label"><label>Display name</label></div>
                  <input type="text" className="figma-input" value={userForm.displayName} onChange={(e) => setUserData({...userForm, displayName: e.target.value})} required />
                  <span style={{ fontSize: '12px', color: '#A0AAB9', marginTop: '6px', display: 'block' }}>Appears on listings, bids and chat.</span>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <div className="form-label"><label>Work email (Optional)</label></div>
                  <input type="email" className="figma-input" value={userForm.email} onChange={(e) => setUserData({...userForm, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Phone</label></div>
                  <input type="text" className="figma-input" value={userForm.phone} placeholder="e.g. +4912345678" onChange={(e) => setUserData({...userForm, phone: e.target.value})} required />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Role</label></div>
                  <input type="text" className="figma-input" value={userForm.role} disabled style={{ background: '#F6F7FB', color: '#A0AAB9', cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>

            <div className="detail-card" style={{ padding: '32px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>Region & Units</h2>
                <p style={{ fontSize: '14px', color: '#5C6470' }}>Cargolane auto-translates listings — these settings control your interface.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <div className="form-label"><label>Time zone</label></div>
                  <select className="figma-input" value={userForm.timezone} onChange={(e) => setUserData({...userForm, timezone: e.target.value})}>
                     <option value="-12">(GMT-12:00) International Date Line West</option>
                     <option value="-11">(GMT-11:00) Midway Island, Samoa</option>
                     <option value="-10">(GMT-10:00) Hawaii</option>
                     <option value="-9">(GMT-09:00) Alaska</option>
                     <option value="-8">(GMT-08:00) Pacific Time (US & Canada)</option>
                     <option value="-7">(GMT-07:00) Mountain Time (US & Canada)</option>
                     <option value="-6">(GMT-06:00) Central Time (US & Canada)</option>
                     <option value="-5">(GMT-05:00) Eastern Time (US & Canada)</option>
                     <option value="-4">(GMT-04:00) Atlantic Time (Canada)</option>
                     <option value="-3">(GMT-03:00) Buenos Aires, Georgetown</option>
                     <option value="-2">(GMT-02:00) Mid-Atlantic</option>
                     <option value="-1">(GMT-01:00) Azores, Cape Verde Is.</option>
                     <option value="0">(GMT+00:00) London, Dublin, Lisbon</option>
                     <option value="1">(GMT+01:00) Berlin, Rome, Paris</option>
                     <option value="2">(GMT+02:00) Athens, Istanbul, Minsk</option>
                     <option value="3">(GMT+03:00) Moscow, St. Petersburg</option>
                     <option value="4">(GMT+04:00) Abu Dhabi, Muscat, Baku</option>
                     <option value="5">(GMT+05:00) Ekaterinburg, Islamabad</option>
                     <option value="6">(GMT+06:00) Almaty, Dhaka, Colombo</option>
                     <option value="7">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                     <option value="8">(GMT+08:00) Beijing, Perth, Singapore</option>
                     <option value="9">(GMT+09:00) Tokyo, Seoul, Osaka</option>
                     <option value="10">(GMT+10:00) Sydney, Melbourne, Guam</option>
                     <option value="11">(GMT+11:00) Magadan, Solomon Is.</option>
                     <option value="12">(GMT+12:00) Auckland, Wellington, Fiji</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Units</label></div>
                  <select className="figma-input" value={userForm.units} onChange={(e) => setUserData({...userForm, units: e.target.value})}>
                     <option value="metric">Metric: km, t, m³</option>
                     <option value="imperial">Imperial: mi, lbs, ft³</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div>
            <div className="detail-card" style={{ padding: '32px', marginBottom: '24px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>Company details</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <div className="form-label"><label>Company name</label></div>
                  <input type="text" className="figma-input" value={userForm.companyName} onChange={(e) => setUserData({...userForm, companyName: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Company type</label></div>
                  <select className="figma-input" value={userForm.companyType} onChange={(e) => setUserData({...userForm, companyType: e.target.value})}><option>Freight forwarder</option><option>Carrier</option></select>
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Registration country</label></div>
                  <input type="text" className="figma-input" placeholder="e.g. Germany" value={userForm.regCountry} onChange={(e) => setUserData({...userForm, regCountry: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="detail-card" style={{ padding: '32px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>Address</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <div className="form-label"><label>Street & number</label></div>
                  <input type="text" className="figma-input" value={userForm.street} onChange={(e) => setUserData({...userForm, street: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>City</label></div>
                  <input type="text" className="figma-input" value={userForm.city} onChange={(e) => setUserData({...userForm, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Postal code</label></div>
                  <input 
                    type="text" 
                    className="figma-input" 
                    value={userForm.zip} 
                    onChange={(e) => setUserData({...userForm, zip: e.target.value})} 
                    placeholder="e.g. 20457"
                  />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Region / state</label></div>
                  <input type="text" className="figma-input" value={userForm.region} onChange={(e) => setUserData({...userForm, region: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-label"><label>Country</label></div>
                  <input type="text" className="figma-input" placeholder="e.g. Germany" value={userForm.country} onChange={(e) => setUserData({...userForm, country: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <div className="detail-card" style={{ padding: '32px', marginBottom: '32px', backgroundColor: 'white' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>Password</h2>
              </div>
              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div className="form-label"><label>Current password</label></div>
                  <input type="password" className="form-input" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div className="form-label"><label>New password</label></div>
                  <input type="password" className="form-input" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                </div>
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <div className="form-label"><label>Confirm new password</label></div>
                  <input type="password" className="form-input" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
                <button type="submit" className="btn-figma-primary" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>

            <div style={{ border: '1px solid #FEE2E2', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
              <div style={{ background: '#FEF2F2', padding: '12px 20px', color: '#DC2626', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid #FEE2E2' }}>Danger zone</div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FEE2E2' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>Deactivate account</div>
                  <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>Hide your listings and pause your workspace. You can reactivate anytime.</div>
                </div>
                <button type="button" onClick={handleDeactivate} style={{ background: 'white', border: '1px solid #E6E8EE', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#DC2626', cursor: 'pointer', outline: 'none' }}>Deactivate</button>
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>Delete account</div>
                  <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>Permanently remove your data. GDPR export available before deletion.</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#0E1116', cursor: 'pointer', outline: 'none' }}>Export data</button>
                  <button type="button" onClick={handleDeleteAccount} style={{ background: 'white', border: '1px solid #E6E8EE', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#DC2626', cursor: 'pointer', outline: 'none' }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;