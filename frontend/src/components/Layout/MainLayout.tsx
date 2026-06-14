import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="dashboard-page active">
      <Sidebar />
      <main className="dash-main">
        {/* Outlet — сюда роутер будет подставлять страницы (Search, MyListings и т.д.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;