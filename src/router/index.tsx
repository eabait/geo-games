import { createBrowserRouter } from 'react-router-dom';

import { App } from '@/App';
import { capitalCitiesRoutes } from '@/modules/capital-cities/routes';
import { culturalFactsRoutes } from '@/modules/cultural-facts/routes';
import { flagGameRoutes } from '@/modules/flag-game/routes';
import { HubScreen } from '@/modules/hub/screens/HubScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HubScreen /> },
      flagGameRoutes,
      capitalCitiesRoutes,
      culturalFactsRoutes,
    ],
  },
]);
