import type { RouteObject } from 'react-router-dom';

import { CapitalMenuScreen } from './screens/MenuScreen';
import { CapitalDifficultyScreen } from './screens/DifficultyScreen';
import { CapitalPlayingScreen } from './screens/CapitalPlayingScreen';
import { CapitalResultsScreen } from './screens/CapitalResultsScreen';

export const capitalCitiesRoutes: RouteObject = {
  path: 'capital-cities',
  children: [
    { index: true, element: <CapitalMenuScreen /> },
    { path: 'solo', element: <CapitalDifficultyScreen /> },
    { path: 'solo/play', element: <CapitalPlayingScreen /> },
    { path: 'solo/results', element: <CapitalResultsScreen /> },
  ],
};
