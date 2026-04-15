import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { MenuScreen } from './screens/MenuScreen';
import { DifficultyScreen } from './screens/DifficultyScreen';
import { FamilySetupScreen } from './screens/FamilySetupScreen';
import { PassPhoneScreen } from './screens/PassPhoneScreen';
import { SoloPlayingScreen } from './screens/SoloPlayingScreen';
import { ExplorerPlayingScreen } from './screens/ExplorerPlayingScreen';
import { FamilyPlayingScreen } from './screens/FamilyPlayingScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { ExplorerResultsScreen } from './screens/ExplorerResultsScreen';
import { FamilyResultsScreen } from './screens/FamilyResultsScreen';

export const flagGameRoutes: RouteObject = {
  path: 'flag-game',
  children: [
    { index: true, element: <MenuScreen /> },
    { path: 'solo', element: <DifficultyScreen mode="solo" /> },
    { path: 'solo/play', element: <SoloPlayingScreen /> },
    { path: 'solo/results', element: <ResultsScreen /> },
    { path: 'explorer', element: <DifficultyScreen mode="explorer" /> },
    { path: 'explorer/play', element: <ExplorerPlayingScreen /> },
    { path: 'explorer/results', element: <ExplorerResultsScreen /> },
    { path: 'family', element: <FamilySetupScreen /> },
    { path: 'family/pass', element: <PassPhoneScreen /> },
    { path: 'family/play', element: <FamilyPlayingScreen /> },
    { path: 'family/results', element: <FamilyResultsScreen /> },
    { path: '*', element: <Navigate to="/flag-game" replace /> },
  ],
};
