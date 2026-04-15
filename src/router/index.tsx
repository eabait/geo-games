import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from '@/App';
import { flagGameRoutes } from '@/modules/flag-game/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <Navigate to="/flag-game" replace /> }, flagGameRoutes],
  },
]);
