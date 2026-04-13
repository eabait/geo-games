# Architecture

## Guiding principles

- **Feature modules** — code is organized by domain, not by type. Components, hooks, state, and data for a feature live together.
- **Routes expose structure** — the URL path mirrors the module hierarchy (`/flag-game/solo/play`).
- **Screens are thin** — screens orchestrate layout and delegate to hooks + components. No business logic.
- **Stores are the source of truth** — game state lives in Zustand stores, not in component trees.
- **Shared is minimal** — only code used by 2+ modules belongs in `shared/`.

---

## Module anatomy

Every game is a module under `src/modules/<game-name>/`:

```
modules/flag-game/
  components/           # presentational components for this game
    effects/            # visual effects (confetti, flash, stars)
    ContinentPicker.tsx
    MobileMap.tsx
  screens/              # one file per route
    MenuScreen.tsx
    DifficultyScreen.tsx
    FamilySetupScreen.tsx
    PlayingScreen.tsx
    ResultsScreen.tsx
    FamilyResultsScreen.tsx
    PassPhoneScreen.tsx
  hooks/
    useGameRound.ts     # round setup, answer handling
    useSoundEngine.ts   # Web Audio API wrapper
    useExplorer.ts      # explorer-mode logic
    useFamily.ts        # family-mode logic
  store/
    gameStore.ts        # Zustand store (game state)
  data/
    flags.ts            # FLAGS array (195 countries)
    constants.ts        # DIFFICULTY, PCOLORS, PAVATARS, etc.
    worldShapes.ts      # WORLD_SHAPES polygon data
  routes.tsx            # <Route> definitions for this module
  types.ts              # shared types within this module
```

### Public API of a module

A module exposes only its routes. Other modules never import from a module's internals:

```ts
// src/modules/flag-game/routes.tsx
export const flagGameRoutes = (
  <Route path="flag-game" element={<FlagGameLayout />}>
    <Route index element={<MenuScreen />} />
    <Route path="solo" element={<DifficultyScreen mode="solo" />} />
    <Route path="solo/play" element={<PlayingScreen mode="solo" />} />
    <Route path="solo/results" element={<ResultsScreen mode="solo" />} />
    {/* ... */}
  </Route>
);
```

---

## Routing

Root router composes module routes:

```ts
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { flagGameRoutes } from '@/modules/flag-game/routes';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/flag-game" /> },
  flagGameRoutes,
  // future: capitalCitiesRoutes, mapQuizRoutes, ...
]);
```

**Navigation inside a module** uses `useNavigate` from React Router.
Game state is persisted in the Zustand store so navigating between screens doesn't lose state.

---

## State management

### Zustand (client/game state)

One store per module. The store owns all mutable game state.

```ts
// store/gameStore.ts
interface GameState {
  mode: GameMode | null;
  difficulty: DifficultyKey | null;
  round: number;
  score: number;
  currentFlag: Flag | null;
  options: Flag[];
  selected: Flag | null;
  // ...actions
  startSolo: (difficulty: DifficultyKey) => void;
  handleAnswer: (option: Flag | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(...)
```

**Rules:**
- Screens call store actions (`useGameStore(s => s.startSolo)`), never set state directly.
- Derived values (e.g. `timerPercent`, `currentPlayer`) are computed in hooks or with Zustand's `getState`, not stored as redundant state.
- Use `immer` middleware for nested state updates.

### TanStack Query (async/server state)

Use for any data that comes from a network:

```ts
// hooks/useFlags.ts
export function useFlags(continent?: string) {
  return useQuery({
    queryKey: ['flags', continent],
    queryFn: () => fetchFlags(continent),
    staleTime: Infinity, // static data
  });
}
```

For now, flag data is local (imported from `data/flags.ts`). When an API exists, swap the `queryFn` — the component interface stays the same.

---

## Data flow

```
Route change
  → Screen renders
    → reads store state via useGameStore()
    → reads async data via useQuery() hooks
    → dispatches actions on user interaction
      → store updates
        → screen re-renders
```

Screens never talk to the store's internals. They use the action functions the store exposes.

---

## Shared module

```
shared/
  components/
    Layout.tsx          # app shell (background, sound toggle)
    BackgroundStars.tsx
  hooks/
    useSoundEngine.ts   # if used by multiple games
  types.ts              # GameMode, DifficultyKey, etc.
```

Only promote code to `shared/` when a second module needs it.

---

## Adding a new game

1. Create `src/modules/<game-name>/` following the module anatomy above.
2. Define `routes.tsx` and export `<game>Routes`.
3. Register in `src/router/index.tsx`.
4. Create a Zustand store at `store/<game>Store.ts`.
5. Add screens one per route.
6. The new game is fully isolated — it can't break existing games.
