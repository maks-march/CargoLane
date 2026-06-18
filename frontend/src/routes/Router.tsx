import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/Layout/MainLayout';

// --- LANDING ---
import LandingPage from '../pages/Landing/LandingPage';

// --- AUTH ---
import SignInPage from '../pages/Auth/SignInPage';
import SignUpPage from '../pages/Auth/SignUpPage';
import RecoveryPage from '../pages/Auth/RecoveryPage';
import ConfirmEmailPage from '../pages/Auth/ConfirmEmailPage';
import AdminSignInPage from '../pages/Auth/AdminSignInPage';

// --- DASHBOARD ---
import SearchPage from '../pages/Dashboard/SearchPage';
import MyListingsPage from '../pages/Dashboard/MyListingsPage';
import CreateLoadPage from '../pages/Dashboard/CreateLoadPage';
import LoadDetailPage from '../pages/Dashboard/LoadDetailPage';
import SavedPage from '../pages/Dashboard/SavedPage';
import { SettingsPage } from '../pages/Dashboard/SettingsPage';
import MessagesPage from '../pages/Dashboard/MessagesPage';

// --- ADMIN / MODERATION ---
import { ReviewQueuePage } from '../pages/Admin/ReviewQueuePage';
import { ApprovedQueuePage } from '../pages/Admin/ApprovedQueuePage';
import { RejectedQueuePage } from '../pages/Admin/RejectedQueuePage';
import { AdminLoadDetailPage } from '../pages/Admin/AdminLoadDetailPage'; // <--- НОВЫЙ ИМПОРТ

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/admin/login',
    element: <AdminSignInPage />,
  },
  {
    path: '/register',
    element: <SignUpPage />,
  },
  {
    path: '/recovery',
    element: <RecoveryPage />,
  },
  {
    path: '/confirm-email',
    element: <ConfirmEmailPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/orders',
            element: <SearchPage />,
          },
          {
            path: '/orders/:id',
            element: <LoadDetailPage />,
          },
          {
            path: '/orders/create',
            element: <CreateLoadPage />,
          },
          {
            path: '/my-listings',
            element: <MyListingsPage />,
          },
          {
            path: '/saved',
            element: <SavedPage />,
          },
          // --- РОУТЫ АДМИНКИ ---
          {
            path: '/admin/reviews',
            element: <ReviewQueuePage />,
          },
          {
            path: '/admin/approved',
            element: <ApprovedQueuePage />,
          },
          {
            path: '/admin/rejected',
            element: <RejectedQueuePage />,
          },
          {
            path: '/admin/orders/:id', // <--- НОВЫЙ ЗАЩИЩЕННЫЙ ПУТЬ
            element: <AdminLoadDetailPage />,
          },
          // ---------------------
          {
            path: '/chat',
            element: <MessagesPage />,
          },
          {
            path: '/profile',
            element: <div style={{ padding: '48px' }}>Profile Page (in progress)</div>,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);