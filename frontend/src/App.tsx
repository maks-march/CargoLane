import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Router';
import { useAuthStore } from './store/auth.store';

const App: React.FC = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
};

export default App;
