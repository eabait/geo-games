import type { RouteObject } from 'react-router-dom';

import { FactsMenuScreen } from './screens/MenuScreen';
import { FactsDifficultyScreen } from './screens/DifficultyScreen';
import { FactsPlayingScreen } from './screens/FactsPlayingScreen';
import { FactsResultsScreen } from './screens/FactsResultsScreen';

export const culturalFactsRoutes: RouteObject = {
  path: 'cultural-facts',
  children: [
    { index: true, element: <FactsMenuScreen /> },
    { path: 'solo', element: <FactsDifficultyScreen /> },
    { path: 'solo/play', element: <FactsPlayingScreen /> },
    { path: 'solo/results', element: <FactsResultsScreen /> },
  ],
};
