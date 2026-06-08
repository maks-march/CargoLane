import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MainLayout from '../components/Layout/MainLayout';
import SearchPage from '../pages/SearchPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import MyListingsPage from '../pages/MyListingsPage';
import ConfirmEmailPage from '../pages/ConfirmEmailPage';
import CreateOrderPage from '../pages/CreateOrderPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
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
            path: '/',
            element: <Navigate to="/orders" replace />,
          },
          {
            path: '/orders',
            element: <SearchPage />,
          },
          {
            path: '/orders/:id',
            element: <OrderDetailPage />,
          },
          {
            path: '/orders/create',
            element: <CreateOrderPage />,
          },
          {
            path: '/my-listings',
            element: <MyListingsPage />,
          },
          {
            path: '/saved',
            element: <div>Saved Searches</div>,
          },
          {
            path: '/chat',
            element: <div>Chat Page</div>,
          },
          {
            path: '/profile',
            element: <div>Profile Page</div>,
          },
          {
            path: '/settings',
            element: <div>Settings Page</div>,
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
