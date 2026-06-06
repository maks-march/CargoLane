import React, { useState } from 'react';
import './styles/global.css';
import type { PageType } from './types';

import { LandingPage } from './pages/Landing/LandingPage';
import { SignInPage } from './pages/Auth/SignInPage';
import { SignUpPage } from './pages/Auth/SignUpPage';
import { RecoveryPage } from './pages/Auth/RecoveryPage';
import { SearchPage } from './pages/Dashboard/SearchPage';
import { SavedPage } from './pages/Dashboard/SavedPage';
import { LoadDetailPage } from './pages/Dashboard/LoadDetailPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [currentLoadId, setCurrentLoadId] = useState<string | null>(null);

  const navigate = (page: PageType, payload?: { loadId?: string }) => {
    if (payload?.loadId) {
      setCurrentLoadId(payload.loadId);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
      {currentPage === 'signin' && <SignInPage onNavigate={navigate} />}
      {currentPage === 'signup' && <SignUpPage onNavigate={navigate} />}
      {currentPage === 'recovery' && <RecoveryPage onNavigate={navigate} />}
      
      {currentPage.startsWith('dashboard') && <SearchPage onNavigate={navigate} />}
      {currentPage === 'saved' && <SavedPage onNavigate={navigate} />}
      {currentPage === 'load-detail' && <LoadDetailPage onNavigate={navigate} loadId={currentLoadId} />}
    </>
  );
};