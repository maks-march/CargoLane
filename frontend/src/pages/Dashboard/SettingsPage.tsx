import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PageType } from '../../api/types';
import { Sidebar } from '../../components/Layout/Sidebar';
import apiClient from '../../api/api-client';

interface SettingsPageProps {
  onNavigate: (page: PageType) => void;
}

type TabType = 'profile' | 'company' | 'security';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Состояние формы (Все поля готовы для синхронизации со Swagger и БД)
  const [userForm, setUserData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    role: 'Carrier',
    language: 'English',
    currency: 'EUR — Euro (€)',
    timezone: '(GMT+01:00) Central European — Hamburg',
    units: 'Metric: km, t, m³',
    // Company
    companyName: '',
    companyType: 'Freight forwarder',
    regCountry: 'Germany',
    street: '',
    city: '',
    zip: '',
    region: '',
    country: 'Germany'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Получение данных пользователя из БД при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = localStorage.getItem('userName') || 'Sergey G.';
        const storedRole = localStorage.getItem('role') || 'Carrier Pro';
        const nameParts = storedName.split(' ');
        
        setUserData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          displayName: storedName,
          role: storedRole,
        }));

        // Запрос к бэкенду
        const response = await apiClient.get('/api/User/me');
        if (response.data) {
          setUserData(prev => ({ ...prev, ...response.data }));
          if (response.data.avatarUrl) setAvatarPreview(response.data.avatarUrl);
        }
      } catch (error) {
        console.warn("Бэкенд пока не отдает профиль, используем локальный кэш.");
      }
    };
    fetchUserData();
  }, []);

  // Блокировка кнопки сохранения, если 4 обязательных поля не заполнены или стерты
  const isFormValid = useMemo(() => {
    return (
      userForm.firstName.trim() !== '' &&
      userForm.lastName.trim() !== '' &&
      userForm.displayName.trim() !== '' &&
      userForm.phone.trim() !== ''
    );
  }, [userForm.firstName, userForm.lastName, userForm.displayName, userForm.phone]);

  const initials = useMemo(() => {
    const parts = userForm.displayName.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
    return 'U';
  }, [userForm.displayName]);

  // Загрузка фото в кэш и отправка в БД
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        await apiClient.post('/api/User/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (error) {
        console.warn("Эндпоинт загрузки аватара не найден на сервере.");
      }
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    try {
      await apiClient.delete('/api/User/avatar');
    } catch (error) {
      console.warn("Эндпоинт удаления аватара не найден на сервере.");
    }
  };

  // Валидация перед отправкой (только буквы для имен, телефон с +)
  const validateInputs = () => {
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
    if (!nameRegex.test(userForm.firstName) || !nameRegex.test(userForm.lastName) || !nameRegex.test(userForm.displayName)) {
      setMessage({ type: 'error', text: 'First name, Last name, and Display name can contain letters only.' });
      return false;
    }
    if (userForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }
    if (!userForm.phone.startsWith('+')) {
      setMessage({ type: 'error', text: 'Phone number must start with a "+" sign.' });
      return false;
    }
    return true;
  };

  // Хелпер: Превращает пустые необязательные строки в null для безопасности БД
  const sanitizePayload = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = null;
      }
    });
    return sanitized;
  };

  // Сохранение Профиля и Региональных настроек в БД
  const handleSaveProfile = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = sanitizePayload({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        displayName: userForm.displayName,
        email: userForm.email,
        phone: userForm.phone,
        language: userForm.language,
        currency: userForm.currency,
        timezone: userForm.timezone,
        units: userForm.units
      });

      await apiClient.put('/api/User/profile', payload);
      localStorage.setItem('userName', userForm.displayName);
      setMessage({ type: 'success', text: 'Profile settings successfully updated in database!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Saved locally. Backend profile endpoint is missing.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // Сохранение данных Компании в БД
  const handleSaveCompany = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = sanitizePayload({
        companyName: userForm.companyName,
        companyType: userForm.companyType,
        regCountry: userForm.regCountry,
        street: userForm.street,
        city: userForm.city,
        zip: userForm.zip,
        region: userForm.region,
        country: userForm.country
      });

      await apiClient.put('/api/User/company', payload);
      setMessage({ type: 'success', text: 'Company information updated in database!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Saved locally. Backend company endpoint is missing.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // Обновление пароля в БД
  const handlePasswordUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await apiClient.post('/api/Auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password securely updated in database.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Password update request failed.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleGlobalSave = () => {
    if (activeTab === 'profile') handleSaveProfile();
    else if (activeTab === 'company') handleSaveCompany();
    else if (activeTab === 'security') handlePasswordUpdate();
  };

  return (
    <div className="dashboard-page active">
      <Sidebar onNavigate={onNavigate} activePage="settings" />

      {/* Родная обертка dash-main полностью устраняет пустые пропасти и зазоры */}
      <main className="dash-main" style={{ background: '#F6F7FB' }}>
        
        {/* ХЕДЕР СТРАНИЦЫ (Выровнен по левому краю проекта) */}
        <header className="dash-header" style={{ borderBottom: '1px solid #E6E8EE', background: 'white', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <div className="dash-breadcrumb">
                <span style={{ color: '#A0AAB9', cursor: 'default', fontWithout: 500 }}>Other</span>
                <span className="dash-detail-breadcrumb-arrow" style={{ margin: '0 8px' }}>›</span>
                <strong style={{ color: '#0E1116', fontWeight: 500 }}>Settings</strong>
              </div>
              <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 600, color: '#0E1116', marginTop: '4px' }}>Settings</h1>
            </div>
            <button className="btn-figma-primary" onClick={handleGlobalSave} disabled={isLoading || (!isFormValid && activeTab === 'profile')}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </header>

        {/* КОНТЕНТНАЯ ОБЛАСТЬ (Растянута по горизонтали, без лишних левых паддингов) */}
        <div style={{ padding: '32px 48px', width: '100%', maxWidth: '1000px' }}>
          
          {/* ТАБЫ (Красивые кнопки-вкладки с обводкой и тенью по фото 4) */}
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

          {/* СЕРВЕРНЫЕ УВЕДОМЛЕНИЯ */}
          {message.text && (
            <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '8px', background: message.type === 'error' ? '#FEF2F2' : '#ECFDF5', border: `1px solid ${message.type === 'error' ? '#EF4444' : '#059669'}`, color: message.type === 'error' ? '#EF4444' : '#059669', fontSize: '14px', fontWeight: 500 }}>
              {message.type === 'error' ? '⚠️ ' : '✓ '}{message.text}
            </div>
          )}

          {/* ==================== ТАБ: PROFILE ==================== */}
          {activeTab === 'profile' && (
            <div>
              {/* Карточка 1: Основные данные */}
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
                    <input type="text" className="figma-input" value={userForm.phone} placeholder="+49 40 328 114" onChange={(e) => setUserData({...userForm, phone: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Role</label></div>
                    <input type="text" className="figma-input" value={userForm.role} disabled style={{ background: '#F6F7FB', color: '#A0AAB9', cursor: 'not-allowed' }} />
                  </div>
                </div>
              </div>

              {/* Карточка 2: Локализация */}
              <div className="detail-card" style={{ padding: '32px', backgroundColor: 'white' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116', marginBottom: '4px' }}>Language & region</h2>
                  <p style={{ fontSize: '14px', color: '#5C6470' }}>Cargolane auto-translates listings — these settings control your interface.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="form-group">
                    <div className="form-label"><label>Interface language</label></div>
                    <select className="figma-input" value={userForm.language} onChange={(e) => setUserData({...userForm, language: e.target.value})}><option>English</option><option>Russian</option></select>
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Currency</label></div>
                    <select className="figma-input" value={userForm.currency} onChange={(e) => setUserData({...userForm, currency: e.target.value})}><option>EUR — Euro (€)</option><option>RUB — Ruble (₽)</option></select>
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Time zone</label></div>
                    <select className="figma-input" value={userForm.timezone} onChange={(e) => setUserData({...userForm, timezone: e.target.value})}><option>(GMT+01:00) Central European — Hamburg</option></select>
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Units</label></div>
                    <select className="figma-input" value={userForm.units} onChange={(e) => setUserData({...userForm, units: e.target.value})}><option>Metric: km, t, m³</option><option>Imperial: mi, lbs, ft³</option></select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ТАБ: COMPANY & ADDRESS ==================== */}
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
                    <select className="figma-input" value={userForm.regCountry} onChange={(e) => setUserData({...userForm, regCountry: e.target.value})}><option>Germany</option><option>Russia</option><option>Poland</option></select>
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
                    {/* Строго числовой инпут для индекс-кода */}
                    <input 
                      type="text" 
                      className="figma-input" 
                      value={userForm.zip} 
                      onChange={(e) => setUserData({...userForm, zip: e.target.value.replace(/\D/g, '')})} 
                      placeholder="20457"
                    />
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Region / state</label></div>
                    <input type="text" className="figma-input" value={userForm.region} onChange={(e) => setUserData({...userForm, region: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <div className="form-label"><label>Country</label></div>
                    <select className="figma-input" value={userForm.country} onChange={(e) => setUserData({...userForm, country: e.target.value})}>
                      <option>Germany</option>
                      <option>Russia</option>
                      <option>Poland</option>
                      <option>France</option>
                      <option>Netherlands</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ТАБ: SECURITY ==================== */}
          {activeTab === 'security' && (
            <div>
              <div className="detail-card" style={{ padding: '32px', marginBottom: '32px', backgroundColor: 'white' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0E1116' }}>Password</h2>
                </div>
                <form onSubmit={handlePasswordUpdate}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <div className="form-label"><label>Current password</label></div>
                    <input type="password" className="figma-input" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <div className="form-label"><label>New password</label></div>
                    <input type="password" className="figma-input" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '32px' }}>
                    <div className="form-label"><label>Confirm new password</label></div>
                    <input type="password" className="figma-input" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-figma-primary">Update password</button>
                </form>
              </div>

              <div style={{ border: '1px solid #FEE2E2', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                <div style={{ background: '#FEF2F2', padding: '12px 20px', color: '#DC2626', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid #FEE2E2' }}>Danger zone</div>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FEE2E2' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>Deactivate account</div>
                    <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>Hide your listings and pause your workspace. You can reactivate anytime.</div>
                  </div>
                  <button style={{ background: 'white', border: '1px solid #E6E8EE', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#DC2626', cursor: 'pointer', outline: 'none' }}>Deactivate</button>
                </div>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0E1116' }}>Delete account</div>
                    <div style={{ fontSize: '13px', color: '#5C6470', marginTop: '2px' }}>Permanently remove your data. GDPR export available before deletion.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#0E1116', cursor: 'pointer', outline: 'none' }}>Export data</button>
                    <button style={{ background: 'white', border: '1px solid #E6E8EE', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#DC2626', cursor: 'pointer', outline: 'none' }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SettingsPage;