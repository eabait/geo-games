# Flag Game Reorganization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate monolithic `flag-game.jsx` into a modular Vite + React + TypeScript project with React Router v6, Zustand, TanStack Query, ESLint boundary enforcement, and Vitest unit tests.

**Architecture:** Feature-module layout under `src/modules/`. Each module owns its routes, store, hooks, components, data, and types. Screens are thin orchestrators; logic lives in hooks and the Zustand store. Routes expose the module hierarchy.

**Tech Stack:** Vite 5, React 18, TypeScript 5 (strict), React Router v6, Zustand + immer, TanStack Query v5, Vitest + React Testing Library + jsdom, ESLint (with `eslint-plugin-boundaries`), Prettier, husky + lint-staged.

---

## File Map

```
src/
  modules/
    flag-game/
      components/
        effects/
          Confetti.tsx
          FloatingEmojis.tsx
          ScreenFlash.tsx
          Sparkles.tsx
          BackgroundStars.tsx
        ContinentPicker.tsx
        MobileMap.tsx
      screens/
        MenuScreen.tsx
        DifficultyScreen.tsx
        FamilySetupScreen.tsx
        PassPhoneScreen.tsx
        SoloPlayingScreen.tsx
        ExplorerPlayingScreen.tsx
        FamilyPlayingScreen.tsx
        ResultsScreen.tsx
        ExplorerResultsScreen.tsx
        FamilyResultsScreen.tsx
      hooks/
        useSoundEngine.ts
        useTimer.ts
        useGameRound.ts
        useExplorerRound.ts
        useVisualEffects.ts
      store/
        gameStore.ts
        settingsStore.ts
      data/
        flags.ts
        constants.ts
        worldShapes.ts
        utils.ts
      types.ts
      routes.tsx
    shared/
      components/
        Layout.tsx
      types.ts
  router/
    index.tsx
  App.tsx
  main.tsx
```

---

## Task 1: Scaffold Vite project + install dependencies

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`

- [ ] **Step 1: Initialize Vite project in the repo root**

```bash
npm create vite@latest . -- --template react-ts
# When prompted: "Current directory is not empty" → select "Ignore files and continue"
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install react-router-dom zustand immer @tanstack/react-query
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D \
  vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  jsdom \
  eslint @eslint/js \
  typescript-eslint \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh \
  eslint-plugin-import eslint-plugin-boundaries \
  eslint-config-prettier eslint-plugin-prettier prettier \
  husky lint-staged
```

- [ ] **Step 4: Verify install**

```bash
npm run dev
# Should start dev server. Ctrl+C to stop.
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json index.html
git commit -m "chore: scaffold Vite + React + TS project with dependencies"
```

---

## Task 2: Configure TypeScript + Vite path aliases

**Files:**
- Modify: `tsconfig.json`
- Modify: `tsconfig.node.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Update `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 2: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 3: Verify typecheck passes**

```bash
npx tsc --noEmit
# Expected: no errors (only the default Vite template files exist)
```

- [ ] **Step 4: Add typecheck script to `package.json`**

Add to the `scripts` section:
```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json tsconfig.node.json vite.config.ts package.json
git commit -m "chore: configure TypeScript strict mode and @ path alias"
```

---

## Task 3: Configure Vitest

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Add Vitest config to `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
      },
      exclude: [
        'src/modules/*/data/**',
        'src/router/**',
        'src/main.tsx',
        'src/App.tsx',
      ],
    },
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Add test scripts to `package.json`**

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Add `@types/node` for path resolution in vite.config.ts**

```bash
npm install -D @types/node
```

- [ ] **Step 5: Verify Vitest runs**

```bash
npm run test:run
# Expected: "No test files found"
```

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/test/setup.ts package.json package-lock.json
git commit -m "chore: configure Vitest with jsdom and coverage thresholds"
```

---

## Task 4: Configure ESLint + Prettier + husky

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      boundaries,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'shared',  pattern: 'src/shared/*'   },
        { type: 'module',  pattern: 'src/modules/*/*' },
        { type: 'router',  pattern: 'src/router/*'   },
        { type: 'app',     pattern: 'src/App.tsx'     },
        { type: 'main',    pattern: 'src/main.tsx'    },
      ],
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      // React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Import order
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],
      // Architecture boundaries
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app',    allow: ['router', 'shared'] },
          { from: 'router', allow: ['module', 'shared'] },
          { from: 'module', allow: ['shared'] },
          { from: 'shared', allow: ['shared'] },
          { from: 'main',   allow: ['app', 'shared'] },
        ],
      }],
    },
  },
);
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
dist
coverage
node_modules
```

- [ ] **Step 4: Add lint scripts to `package.json`**

```json
"lint": "eslint src",
"lint:fix": "eslint src --fix"
```

- [ ] **Step 5: Initialize husky + configure lint-staged**

```bash
npx husky init
```

Add to `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

Replace `.husky/pre-commit` content with:
```sh
npx lint-staged
```

- [ ] **Step 6: Verify lint runs on template files (expect warnings, not errors)**

```bash
npm run lint
```

- [ ] **Step 7: Commit**

```bash
git add eslint.config.js .prettierrc .prettierignore .husky/ package.json
git commit -m "chore: configure ESLint with boundaries plugin, Prettier, husky"
```

---

## Task 5: Create folder structure + shared types

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/modules/flag-game/types.ts`
- Delete default Vite template files: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`

- [ ] **Step 1: Remove Vite template clutter**

```bash
rm src/App.css src/index.css src/assets/react.svg public/vite.svg 2>/dev/null || true
```

- [ ] **Step 2: Create `src/shared/types.ts`**

```ts
export type GameMode = 'solo' | 'family' | 'explorer';
export type DifficultyKey = 'easy' | 'medium' | 'hard';
export type Continent = 'América' | 'Europa' | 'África' | 'Asia' | 'Oceanía';
```

- [ ] **Step 3: Create `src/modules/flag-game/types.ts`**

```ts
import type { Continent, DifficultyKey, GameMode } from '@/shared/types';

export type { GameMode, DifficultyKey, Continent };

export interface Flag {
  code: string;
  name: string;
  continent: Continent;
  hint: string;
  tier: 1 | 2 | 3;
  pos: [lat: number, lng: number];
}

export interface DifficultyConfig {
  label: string;
  emoji: string;
  options: number;
  time: number;
  points: number;
  hintCost: number;
  maxTier: 1 | 2 | 3;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface RoundResult {
  flag: Flag;
  correct: boolean;
}

export interface FlagGameSettings {
  soundOn: boolean;
  continent: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "chore: create module folder structure and shared types"
```

---

## Task 6: Extract static data

**Files:**
- Create: `src/modules/flag-game/data/constants.ts`
- Create: `src/modules/flag-game/data/worldShapes.ts`
- Create: `src/modules/flag-game/data/flags.ts`
- Create: `src/modules/flag-game/data/utils.ts`
- Create: `src/modules/flag-game/data/utils.test.ts`

- [ ] **Step 1: Create `src/modules/flag-game/data/constants.ts`**

Copy from `flag-game.jsx` lines 280–302. Typed version:

```ts
import type { DifficultyConfig } from '../types';

export const DIFFICULTY: Record<string, DifficultyConfig> = {
  easy:   { label: 'Fácil',   emoji: '🌱', options: 2, time: 20, points: 10, hintCost: 3, maxTier: 1 },
  medium: { label: 'Normal',  emoji: '🌍', options: 3, time: 15, points: 15, hintCost: 4, maxTier: 2 },
  hard:   { label: 'Difícil', emoji: '🔥', options: 4, time: 10, points: 20, hintCost: 6, maxTier: 3 },
};

export const PCOLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#ef4444','#eab308'];
export const PAVATARS = ['🦁','🐯','🦊','🐺','🦅','🐬'];
export const CONTINENTS_LIST = ['Todos','América','Europa','África','Asia','Oceanía'];

export const RPP = 5;    // rounds per player (family mode)
export const SOLO_R = 10; // rounds in solo mode
```

> Note: Verify the actual DIFFICULTY values against `flag-game.jsx` lines ~280–298 and correct any discrepancies.

- [ ] **Step 2: Create `src/modules/flag-game/data/worldShapes.ts`**

Copy the `WORLD_SHAPES` array from `flag-game.jsx` lines 62–91, typed:

```ts
// [lng, lat] polygon coordinates for continent outlines
export const WORLD_SHAPES: [number, number][][] = [
  // North America
  [[-168,72], /* ... rest of coordinates from flag-game.jsx ... */],
  // ... all shapes
];
```

- [ ] **Step 3: Create `src/modules/flag-game/data/flags.ts`**

Copy the `FLAGS` array from `flag-game.jsx` lines 94–299, typed:

```ts
import type { Flag } from '../types';

export const FLAGS: Flag[] = [
  { code: '🇦🇷', name: 'Argentina', continent: 'América', hint: 'Celeste y blanca con sol', tier: 1, pos: [-34.6, -58.4] },
  // ... all 195 entries from flag-game.jsx
];
```

- [ ] **Step 4: Create `src/modules/flag-game/data/utils.ts`**

```ts
export function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function pickRandom<T>(array: T[], n: number, exclude: T[] = []): T[] {
  return shuffle(array.filter((item) => !exclude.includes(item))).slice(0, n);
}
```

- [ ] **Step 5: Write failing tests — `src/modules/flag-game/data/utils.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { shuffle, pickRandom } from './utils';

describe('shuffle', () => {
  it('returns array with same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('pickRandom', () => {
  it('returns n items', () => {
    expect(pickRandom([1, 2, 3, 4, 5], 3)).toHaveLength(3);
  });

  it('excludes specified items', () => {
    const result = pickRandom([1, 2, 3, 4, 5], 3, [1, 2]);
    expect(result).not.toContain(1);
    expect(result).not.toContain(2);
  });

  it('returns empty array when source is empty', () => {
    expect(pickRandom([], 3)).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run tests — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/data/utils.test.ts
# Expected: FAIL — utils.ts does not exist yet
```

- [ ] **Step 7: Run tests — expect PASS after Step 4**

```bash
npm run test:run -- src/modules/flag-game/data/utils.test.ts
# Expected: PASS (3 test suites)
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/flag-game/data/
git commit -m "feat(flag-game): extract static data, types, and utility functions with tests"
```

---

## Task 7: Create settings store

**Files:**
- Create: `src/modules/flag-game/store/settingsStore.ts`
- Create: `src/modules/flag-game/store/settingsStore.test.ts`

- [ ] **Step 1: Write failing test — `settingsStore.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

beforeEach(() => useSettingsStore.getState().reset());

describe('settingsStore', () => {
  it('defaults to sound on and all continents', () => {
    const { soundOn, continent } = useSettingsStore.getState();
    expect(soundOn).toBe(true);
    expect(continent).toBe('Todos');
  });

  it('toggles sound', () => {
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundOn).toBe(false);
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundOn).toBe(true);
  });

  it('sets continent filter', () => {
    useSettingsStore.getState().setContinent('Europa');
    expect(useSettingsStore.getState().continent).toBe('Europa');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/store/settingsStore.test.ts
# Expected: FAIL — module not found
```

- [ ] **Step 3: Create `src/modules/flag-game/store/settingsStore.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  soundOn: boolean;
  continent: string;
  toggleSound: () => void;
  setContinent: (continent: string) => void;
  reset: () => void;
}

const initialState = { soundOn: true, continent: 'Todos' };

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setContinent: (continent) => set({ continent }),
      reset: () => set(initialState),
    }),
    { name: 'geo-games-settings' },
  ),
);
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/store/settingsStore.test.ts
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/store/
git commit -m "feat(flag-game): add settings store (sound, continent) with persistence"
```

---

## Task 8: Create game store

**Files:**
- Create: `src/modules/flag-game/store/gameStore.ts`
- Create: `src/modules/flag-game/store/gameStore.test.ts`

- [ ] **Step 1: Write failing tests — `gameStore.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { FLAGS } from '../data/flags';

const mockFlag = FLAGS[0];

beforeEach(() => useGameStore.getState().reset());

describe('gameStore — solo mode', () => {
  it('starts solo game with correct initial state', () => {
    useGameStore.getState().startSolo('easy');
    const s = useGameStore.getState();
    expect(s.mode).toBe('solo');
    expect(s.difficulty).toBe('easy');
    expect(s.round).toBe(0);
    expect(s.score).toBe(0);
    expect(s.streak).toBe(0);
  });

  it('sets current round data', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    expect(useGameStore.getState().currentFlag).toEqual(mockFlag);
  });

  it('records correct answer and updates score', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    useGameStore.getState().recordAnswer(mockFlag, true, 10);
    const s = useGameStore.getState();
    expect(s.score).toBeGreaterThan(0);
    expect(s.streak).toBe(1);
    expect(s.roundHistory).toHaveLength(1);
    expect(s.roundHistory[0].correct).toBe(true);
  });

  it('resets streak on wrong answer', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    useGameStore.getState().recordAnswer(mockFlag, true, 10);
    useGameStore.getState().recordAnswer(mockFlag, false, 0);
    expect(useGameStore.getState().streak).toBe(0);
  });
});

describe('gameStore — family mode', () => {
  const players = [
    { id: 'p1', name: 'Ana', color: '#f97316', avatar: '🦁' },
    { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
  ];

  it('starts family game initializing scores for all players', () => {
    useGameStore.getState().startFamily('easy', players);
    const s = useGameStore.getState();
    expect(s.mode).toBe('family');
    expect(s.familyScores).toEqual({ p1: 0, p2: 0 });
    expect(s.currentPlayerIdx).toBe(0);
  });

  it('advances to next player after RPP rounds', () => {
    useGameStore.getState().startFamily('easy', players);
    useGameStore.getState().advancePlayerTurn();
    expect(useGameStore.getState().currentPlayerIdx).toBe(1);
  });
});

describe('gameStore — explorer mode', () => {
  it('starts explorer with timer and zero score', () => {
    useGameStore.getState().startExplorer('easy');
    const s = useGameStore.getState();
    expect(s.mode).toBe('explorer');
    expect(s.explorerTime).toBeGreaterThan(0);
    expect(s.explorerScore).toBe(0);
  });

  it('adds time on correct explorer answer', () => {
    useGameStore.getState().startExplorer('easy');
    const timeBefore = useGameStore.getState().explorerTime;
    useGameStore.getState().recordExplorerAnswer(true);
    expect(useGameStore.getState().explorerTime).toBeGreaterThan(timeBefore);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/store/gameStore.test.ts
# Expected: FAIL — module not found
```

- [ ] **Step 3: Create `src/modules/flag-game/store/gameStore.ts`**

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { DifficultyKey, GameMode } from '@/shared/types';
import type { Flag, Player, RoundResult } from '../types';

interface GameStore {
  // Common
  mode: GameMode | null;
  difficulty: DifficultyKey | null;
  currentFlag: Flag | null;
  options: Flag[];
  selected: Flag | null;
  showHint: boolean;
  usedFlags: string[];
  // Solo
  round: number;
  score: number;
  streak: number;
  bestStreak: number;
  roundHistory: RoundResult[];
  // Family
  players: Player[];
  currentPlayerIdx: number;
  playerRound: number;
  familyScores: Record<string, number>;
  familyHistory: Record<string, RoundResult[]>;
  familyStreaks: Record<string, number>;
  // Explorer
  explorerTime: number;
  explorerScore: number;
  explorerCorrect: number;
  explorerTotal: number;
  explorerHistory: RoundResult[];
  explorerStreak: number;
  explorerBestStreak: number;
  // Actions
  startSolo: (difficulty: DifficultyKey) => void;
  startFamily: (difficulty: DifficultyKey, players: Player[]) => void;
  startExplorer: (difficulty: DifficultyKey) => void;
  setRoundData: (flag: Flag, options: Flag[]) => void;
  recordAnswer: (flag: Flag, correct: boolean, points: number) => void;
  recordExplorerAnswer: (correct: boolean) => void;
  advancePlayerTurn: () => void;
  setShowHint: (show: boolean) => void;
  tickExplorerTime: () => void;
  reset: () => void;
}

const initial: Omit<GameStore, keyof { [K in keyof GameStore]: GameStore[K] extends Function ? K : never }> = {
  mode: null, difficulty: null, currentFlag: null, options: [], selected: null,
  showHint: false, usedFlags: [], round: 0, score: 0, streak: 0, bestStreak: 0,
  roundHistory: [], players: [], currentPlayerIdx: 0, playerRound: 0,
  familyScores: {}, familyHistory: {}, familyStreaks: {},
  explorerTime: 0, explorerScore: 0, explorerCorrect: 0, explorerTotal: 0,
  explorerHistory: [], explorerStreak: 0, explorerBestStreak: 0,
};

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initial,

    startSolo: (difficulty) => set((s) => {
      Object.assign(s, initial);
      s.mode = 'solo';
      s.difficulty = difficulty;
    }),

    startFamily: (difficulty, players) => set((s) => {
      Object.assign(s, initial);
      s.mode = 'family';
      s.difficulty = difficulty;
      s.players = players;
      players.forEach((p) => {
        s.familyScores[p.id] = 0;
        s.familyHistory[p.id] = [];
        s.familyStreaks[p.id] = 0;
      });
    }),

    startExplorer: (difficulty) => set((s) => {
      Object.assign(s, initial);
      s.mode = 'explorer';
      s.difficulty = difficulty;
      s.explorerTime = 20;
    }),

    setRoundData: (flag, options) => set((s) => {
      s.currentFlag = flag;
      s.options = options;
      s.selected = null;
      s.showHint = false;
      s.usedFlags.push(flag.name);
    }),

    recordAnswer: (flag, correct, points) => set((s) => {
      s.selected = flag;
      s.roundHistory.push({ flag: s.currentFlag!, correct });
      if (correct) {
        s.score += points;
        s.streak += 1;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
      } else {
        s.streak = 0;
      }
    }),

    recordExplorerAnswer: (correct) => set((s) => {
      s.explorerTotal += 1;
      s.explorerHistory.push({ flag: s.currentFlag!, correct });
      if (correct) {
        s.explorerScore += 20;
        s.explorerCorrect += 1;
        s.explorerTime += 3;
        s.explorerStreak += 1;
        s.explorerBestStreak = Math.max(s.explorerBestStreak, s.explorerStreak);
      } else {
        s.explorerStreak = 0;
      }
    }),

    advancePlayerTurn: () => set((s) => {
      s.currentPlayerIdx += 1;
      s.playerRound = 0;
      s.currentFlag = null;
    }),

    setShowHint: (show) => set((s) => { s.showHint = show; }),

    tickExplorerTime: () => set((s) => { s.explorerTime -= 1; }),

    reset: () => set((s) => { Object.assign(s, initial); }),
  })),
);
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/store/gameStore.test.ts
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/store/gameStore.ts src/modules/flag-game/store/gameStore.test.ts
git commit -m "feat(flag-game): add game store with solo/family/explorer actions and tests"
```

---

## Task 9: Extract hooks — useSoundEngine + useTimer + useGameRound

**Files:**
- Create: `src/modules/flag-game/hooks/useSoundEngine.ts`
- Create: `src/modules/flag-game/hooks/useTimer.ts`
- Create: `src/modules/flag-game/hooks/useTimer.test.ts`
- Create: `src/modules/flag-game/hooks/useGameRound.ts`

- [ ] **Step 1: Create `src/modules/flag-game/hooks/useSoundEngine.ts`**

Copy directly from `flag-game.jsx` lines 3–38, converting to TypeScript:

```ts
import { useRef, useCallback, useEffect } from 'react';

type SoundName = 'correct' | 'wrong' | 'tick' | 'tickUrgent' | 'timeout' |
                 'hint' | 'tap' | 'victory' | 'ready' | 'streak' | 'bonus';

type Sounds = Record<SoundName, () => void>;

export function useSoundEngine(enabled: boolean): React.MutableRefObject<Sounds> {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (fn: (ctx: AudioContext) => void): void => {
      if (!enabled) return;
      try { fn(getCtx()); } catch {}
    },
    [enabled, getCtx],
  );

  const tone = useCallback(
    (c: AudioContext, f: number, d: number, t = 'sine', v = 0.3, s = 0): void => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = t as OscillatorType;
      o.frequency.value = f;
      g.gain.setValueAtTime(v, c.currentTime + s);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + s + d);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + s);
      o.stop(c.currentTime + s + d + 0.05);
    },
    [],
  );

  const sounds = useRef<Sounds>({} as Sounds);

  useEffect(() => {
    sounds.current = {
      correct: () => play((c) => { [523.25,659.25,783.99,1046.50].forEach((f,i) => tone(c,f,0.3,'sine',0.25,i*0.08)); }),
      wrong:   () => play((c) => { [200,180].forEach((f,i) => tone(c,f,0.25,'square',0.18,i*0.15)); }),
      tick:         () => play((c) => tone(c,880,0.06,'sine',0.15)),
      tickUrgent:   () => play((c) => { tone(c,1200,0.05,'square',0.18); tone(c,1200,0.05,'square',0.18,0.07); }),
      timeout: () => play((c) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(500, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.5);
        g.gain.setValueAtTime(0.2, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
        o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.55);
      }),
      hint:    () => play((c) => { [660,880].forEach((f,i) => tone(c,f,0.2,'triangle',0.18,i*0.1)); }),
      tap:     () => play((c) => tone(c,600,0.05,'sine',0.1)),
      victory: () => play((c) => { [523.25,659.25,783.99,659.25,783.99,1046.50].forEach((f,i) => tone(c,f,0.35,i<3?'sine':'triangle',0.22,i*0.12)); }),
      ready:   () => play((c) => { [440,554.37,659.25].forEach((f,i) => tone(c,f,0.25,'triangle',0.2,i*0.12)); }),
      streak:  () => play((c) => { [783.99,987.77,1174.66,1318.51].forEach((f,i) => tone(c,f,0.2,'sine',0.18,i*0.06)); }),
      bonus:   () => play((c) => { [880,1108.73].forEach((f,i) => tone(c,f,0.15,'sine',0.12,i*0.08)); }),
    };
  }, [play, tone]);

  useEffect(() => {
    const w = (): void => { try { getCtx(); } catch {} };
    document.addEventListener('touchstart', w, { once: true });
    document.addEventListener('click', w, { once: true });
    return () => {
      document.removeEventListener('touchstart', w);
      document.removeEventListener('click', w);
    };
  }, [getCtx]);

  return sounds;
}
```

- [ ] **Step 2: Write failing test — `useTimer.test.ts`**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('counts down from initial seconds', () => {
    const { result } = renderHook(() => useTimer({ seconds: 5, active: true, onTick: vi.fn(), onExpire: vi.fn() }));
    expect(result.current.timeLeft).toBe(5);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.timeLeft).toBe(4);
  });

  it('calls onExpire when timer reaches zero', () => {
    const onExpire = vi.fn();
    renderHook(() => useTimer({ seconds: 2, active: true, onTick: vi.fn(), onExpire }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('does not tick when inactive', () => {
    const { result } = renderHook(() => useTimer({ seconds: 5, active: false, onTick: vi.fn(), onExpire: vi.fn() }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.timeLeft).toBe(5);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/hooks/useTimer.test.ts
```

- [ ] **Step 4: Create `src/modules/flag-game/hooks/useTimer.ts`**

```ts
import { useState, useEffect, useRef } from 'react';

interface UseTimerOptions {
  seconds: number;
  active: boolean;
  onTick: (remaining: number) => void;
  onExpire: () => void;
}

interface UseTimerResult {
  timeLeft: number;
  reset: (newSeconds?: number) => void;
}

export function useTimer({ seconds, active, onTick, onExpire }: UseTimerOptions): UseTimerResult {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);
  onExpireRef.current = onExpire;
  onTickRef.current = onTick;

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        onTickRef.current(v - 1);
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const reset = (newSeconds?: number): void => {
    setTimeLeft(newSeconds ?? seconds);
  };

  return { timeLeft, reset };
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/hooks/useTimer.test.ts
# Expected: PASS
```

- [ ] **Step 6: Create `src/modules/flag-game/hooks/useGameRound.ts`**

```ts
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { FLAGS } from '../data/flags';
import { DIFFICULTY, SOLO_R, RPP } from '../data/constants';
import { shuffle, pickRandom } from '../data/utils';
import type { Flag } from '../types';

export function useGameRound(sfx: (name: string) => void): void {
  const navigate = useNavigate();
  const { mode, difficulty, currentFlag, usedFlags, showHint,
          round, streak, playerRound, players, currentPlayerIdx,
          setRoundData, recordAnswer, advancePlayerTurn } = useGameStore();
  const { continent } = useSettingsStore();

  const getPool = useCallback((maxTier: number): Flag[] => {
    const base = continent === 'Todos' ? FLAGS : FLAGS.filter((f) => f.continent === continent);
    return base.filter((f) => f.tier <= maxTier);
  }, [continent]);

  // Set up a new round whenever currentFlag is cleared
  useEffect(() => {
    if (currentFlag || !difficulty || mode === 'explorer') return;
    const diff = DIFFICULTY[difficulty];
    const pool = getPool(diff.maxTier);
    const available = pool.filter((f) => !usedFlags.includes(f.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, mode, usedFlags, getPool, setRoundData]);

  const handleAnswer = useCallback((option: Flag | null): void => {
    if (!currentFlag || !difficulty) return;
    const diff = DIFFICULTY[difficulty];
    const correct = option?.name === currentFlag.name;

    if (!correct) {
      sfx('wrong');
    }

    if (mode === 'solo') {
      const pts = correct
        ? (showHint ? diff.points - diff.hintCost : diff.points) +
          Math.floor(0) + (streak >= 2 ? streak * 2 : 0)
        : 0;
      recordAnswer(option ?? currentFlag, correct, pts);
      if (correct) sfx(streak >= 2 ? 'streak' : 'correct');

      setTimeout(() => {
        if (round + 1 >= SOLO_R) {
          sfx('victory');
          navigate('/flag-game/solo/results');
        } else {
          useGameStore.setState((s) => { s.round += 1; s.currentFlag = null; });
        }
      }, 1600);
    }

    if (mode === 'family') {
      const pid = players[currentPlayerIdx].id;
      const cs = useGameStore.getState().familyStreaks[pid] ?? 0;
      const ns = correct ? cs + 1 : 0;
      const pts = correct
        ? (showHint ? diff.points - diff.hintCost : diff.points) + (ns >= 2 ? ns * 2 : 0)
        : 0;
      recordAnswer(option ?? currentFlag, correct, pts);
      if (correct) sfx(ns >= 3 ? 'streak' : 'correct');
      useGameStore.setState((s) => { s.familyStreaks[pid] = ns; });

      setTimeout(() => {
        if (playerRound + 1 >= RPP) {
          if (currentPlayerIdx + 1 >= players.length) {
            sfx('victory');
            navigate('/flag-game/family/results');
          } else {
            advancePlayerTurn();
            navigate('/flag-game/family/pass');
          }
        } else {
          useGameStore.setState((s) => { s.playerRound += 1; s.currentFlag = null; });
        }
      }, 1600);
    }
  }, [currentFlag, difficulty, mode, showHint, streak, round, playerRound,
      players, currentPlayerIdx, sfx, recordAnswer, advancePlayerTurn, navigate]);

  return { handleAnswer } as any;
}
```

> `useGameRound` returns `{ handleAnswer }`. Update the return type accordingly after integration.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/hooks/
git commit -m "feat(flag-game): add useSoundEngine, useTimer, useGameRound hooks with tests"
```

---

## Task 10: Extract visual effect components

**Files:**
- Create: `src/modules/flag-game/components/effects/Confetti.tsx`
- Create: `src/modules/flag-game/components/effects/FloatingEmojis.tsx`
- Create: `src/modules/flag-game/components/effects/ScreenFlash.tsx`
- Create: `src/modules/flag-game/components/effects/Sparkles.tsx`
- Create: `src/modules/flag-game/components/effects/BackgroundStars.tsx`

These are pure presentational components. Copy from `flag-game.jsx` lines 40–59 and convert to typed props.

- [ ] **Step 1: Create `Confetti.tsx`**

```tsx
interface ConfettiProps { active: boolean; }

const COLS = ['#fbbf24','#ef4444','#3b82f6','#22c55e','#a855f7','#ec4899','#f97316'];

export function Confetti({ active }: ConfettiProps): JSX.Element | null {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', top: '40%',
          left: `${Math.random() * 100}%`,
          width: 6 + Math.random() * 8,
          height: (6 + Math.random() * 8) * 0.6,
          background: COLS[i % COLS.length],
          borderRadius: 2,
          animation: `confettiFall ${1.2 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `FloatingEmojis.tsx`, `ScreenFlash.tsx`, `Sparkles.tsx`, `BackgroundStars.tsx`**

Copy the remaining visual components from `flag-game.jsx` lines 46–59 with matching TypeScript prop interfaces. Each is a one-to-one translation: no logic changes.

- [ ] **Step 3: Create `src/modules/flag-game/hooks/useVisualEffects.ts`**

Centralises trigger logic that was previously inline in `FlagGame`:

```ts
import { useState, useCallback } from 'react';

interface VisualEffectsState {
  showConfetti: boolean;
  showVictoryEmojis: boolean;
  flashColor: string | null;
  scorePop: boolean;
  showSparkles: boolean;
}

interface UseVisualEffectsResult extends VisualEffectsState {
  triggerCorrect: (withSparkles: boolean) => void;
  triggerWrong: () => void;
  triggerVictory: () => void;
}

export function useVisualEffects(): UseVisualEffectsResult {
  const [state, setState] = useState<VisualEffectsState>({
    showConfetti: false, showVictoryEmojis: false,
    flashColor: null, scorePop: false, showSparkles: false,
  });

  const triggerCorrect = useCallback((withSparkles: boolean): void => {
    setState({ showConfetti: true, flashColor: 'rgba(34,197,94,0.15)', scorePop: true,
               showSparkles: withSparkles, showVictoryEmojis: false });
    setTimeout(() => setState((s) => ({ ...s, showConfetti: false, flashColor: null,
                                        scorePop: false, showSparkles: false })), 1500);
  }, []);

  const triggerWrong = useCallback((): void => {
    setState((s) => ({ ...s, flashColor: 'rgba(239,68,68,0.12)' }));
    setTimeout(() => setState((s) => ({ ...s, flashColor: null })), 400);
  }, []);

  const triggerVictory = useCallback((): void => {
    setState((s) => ({ ...s, showVictoryEmojis: true, showConfetti: true }));
    setTimeout(() => setState((s) => ({ ...s, showVictoryEmojis: false, showConfetti: false })), 4000);
  }, []);

  return { ...state, triggerCorrect, triggerWrong, triggerVictory };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/flag-game/components/effects/ src/modules/flag-game/hooks/useVisualEffects.ts
git commit -m "feat(flag-game): extract visual effect components and useVisualEffects hook"
```

---

## Task 11: Extract MobileMap + ContinentPicker components

**Files:**
- Create: `src/modules/flag-game/components/MobileMap.tsx`
- Create: `src/modules/flag-game/components/MobileMap.test.tsx`
- Create: `src/modules/flag-game/components/ContinentPicker.tsx`
- Create: `src/modules/flag-game/components/ContinentPicker.test.tsx`

- [ ] **Step 1: Write failing test — `MobileMap.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMap } from './MobileMap';
import { FLAGS } from '../data/flags';

const mockOptions = FLAGS.slice(0, 4);

describe('MobileMap', () => {
  it('renders a button for each option', () => {
    render(<MobileMap options={mockOptions} correctName={mockOptions[0].name} selected={null} onSelect={vi.fn()} />);
    mockOptions.forEach((opt) => {
      expect(screen.getByText(new RegExp(opt.name.slice(0, 10), 'i'))).toBeInTheDocument();
    });
  });

  it('calls onSelect when a pin is clicked', async () => {
    const onSelect = vi.fn();
    render(<MobileMap options={mockOptions} correctName={mockOptions[0].name} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('disables buttons after selection', () => {
    render(<MobileMap options={mockOptions} correctName={mockOptions[0].name} selected={mockOptions[1]} onSelect={vi.fn()} />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/components/MobileMap.test.tsx
```

- [ ] **Step 3: Create `MobileMap.tsx`**

Copy from `flag-game.jsx` lines 304–397 and convert to TypeScript with typed props:

```tsx
import type { Flag } from '../types';
import { WORLD_SHAPES } from '../data/worldShapes';

interface MobileMapProps {
  options: Flag[];
  correctName: string;
  selected: Flag | null;
  onSelect: (flag: Flag) => void;
}

export function MobileMap({ options, correctName, selected, onSelect }: MobileMapProps): JSX.Element {
  // ... copy layout/collision/SVG logic from flag-game.jsx lines 306-396
  // Replace single-letter vars with descriptive names:
  // lats, lngs, minLat, maxLat, minLng, maxLng, padLat, padLng, etc.
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/components/MobileMap.test.tsx
```

- [ ] **Step 5: Write failing test — `ContinentPicker.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContinentPicker } from './ContinentPicker';

describe('ContinentPicker', () => {
  it('renders all continent options', () => {
    render(<ContinentPicker selected="Todos" onChange={vi.fn()} />);
    expect(screen.getByText(/todos/i)).toBeInTheDocument();
    expect(screen.getByText(/europa/i)).toBeInTheDocument();
  });

  it('calls onChange with continent name on click', async () => {
    const onChange = vi.fn();
    render(<ContinentPicker selected="Todos" onChange={onChange} />);
    await userEvent.click(screen.getByText(/europa/i));
    expect(onChange).toHaveBeenCalledWith('Europa');
  });

  it('highlights the selected continent', () => {
    render(<ContinentPicker selected="Europa" onChange={vi.fn()} />);
    const europaBtn = screen.getByText(/europa/i).closest('button');
    expect(europaBtn).toHaveStyle({ borderColor: expect.any(String) });
  });
});
```

- [ ] **Step 6: Run test — expect FAIL, then create `ContinentPicker.tsx`, then PASS**

```tsx
import { FLAGS } from '../data/flags';
import { CONTINENTS_LIST } from '../data/constants';

interface ContinentPickerProps {
  selected: string;
  onChange: (continent: string) => void;
}

const ACCENT = '#fbbf24';

export function ContinentPicker({ selected, onChange }: ContinentPickerProps): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
      {CONTINENTS_LIST.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600,
            border: selected === c ? `1.5px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
            background: selected === c ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
            color: selected === c ? ACCENT : '#94a3b8',
          }}
        >
          {c === 'Todos'
            ? `🌍 ${FLAGS.length}`
            : `${c} (${FLAGS.filter((f) => f.continent === c).length})`}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Run both tests — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/components/
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/flag-game/components/
git commit -m "feat(flag-game): extract MobileMap and ContinentPicker with tests"
```

---

## Task 12: Create screens (Menu, Difficulty, FamilySetup, PassPhone)

**Files:**
- Create: `src/modules/flag-game/screens/MenuScreen.tsx`
- Create: `src/modules/flag-game/screens/MenuScreen.test.tsx`
- Create: `src/modules/flag-game/screens/DifficultyScreen.tsx`
- Create: `src/modules/flag-game/screens/FamilySetupScreen.tsx`
- Create: `src/modules/flag-game/screens/PassPhoneScreen.tsx`
- Create: `src/shared/components/Layout.tsx`

- [ ] **Step 1: Create `src/shared/components/Layout.tsx`**

Shared shell (background, CSS keyframes, sound button):

```tsx
import { useRef } from 'react';
import { BackgroundStars } from '@/modules/flag-game/components/effects/BackgroundStars';

// NOTE: Layout is shared; do not import flag-game specifics here long-term.
// BackgroundStars should move to shared if other games use it.

const GLOBAL_STYLES = `
  @keyframes popIn { 0%{transform:scale(0) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px)} 30%{transform:translateX(10px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.1)} }
  @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(251,191,36,.2)} 50%{box-shadow:0 0 50px rgba(251,191,36,.6)} }
  @keyframes flagEnter { 0%{transform:rotateY(90deg) scale(.5);opacity:0} 50%{transform:rotateY(-10deg) scale(1.05)} 100%{transform:rotateY(0) scale(1);opacity:1} }
  @keyframes scorePop { 0%{transform:scale(1)} 30%{transform:scale(1.6)} 60%{transform:scale(.9)} 100%{transform:scale(1)} }
  @keyframes confettiFall { 0%{transform:translateY(0) translateX(0) rotate(0);opacity:1} 100%{transform:translateY(400px) translateX(var(--drift,0px)) rotate(720deg);opacity:0} }
  @keyframes emojiFloat { 0%{transform:translateY(0) scale(0);opacity:0} 15%{opacity:1;transform:translateY(-50px) scale(1)} 100%{transform:translateY(-600px) scale(.5) rotate(30deg);opacity:0} }
  @keyframes screenFlash { 0%{opacity:.5} 100%{opacity:0} }
  @keyframes sparkle { 0%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(0);opacity:1} 100%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(25px) scale(0);opacity:0} }
  @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.8} }
  @keyframes timerPulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.8)} }
  @keyframes optionEnter { 0%{transform:translateX(-20px);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes correctPulse { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.4)} 70%{box-shadow:0 0 0 12px rgba(34,197,94,0)} }
  @keyframes wrongShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
  @keyframes podiumRise { 0%{transform:scaleY(0)} 100%{transform:scaleY(1)} }
  @keyframes crownBounce { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-5px) rotate(-5deg)} 75%{transform:translateY(-5px) rotate(5deg)} }
  @keyframes resultRow { 0%{transform:translateX(-40px);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes spinIn { 0%{transform:rotate(0) scale(0);opacity:0} 50%{transform:rotate(200deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1);opacity:1} }
  @keyframes menuItem { 0%{transform:translateY(50px);opacity:0} 60%{transform:translateY(-4px)} 100%{transform:translateY(0);opacity:1} }
  @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
  @keyframes mapPinEnter { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.15)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
  .btn{transition:all .2s cubic-bezier(.34,1.56,.64,1);cursor:pointer}
  .btn:hover{transform:translateY(-3px) scale(1.02)}
  .btn:active{transform:translateY(-1px) scale(.98)}
`;

interface LayoutProps {
  children: React.ReactNode;
  soundOn: boolean;
  onToggleSound: () => void;
  confetti?: React.ReactNode;
  flash?: React.ReactNode;
  emojis?: React.ReactNode;
}

export function Layout({ children, soundOn, onToggleSound, confetti, flash, emojis }: LayoutProps): JSX.Element {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: "'Nunito', sans-serif",
      color: '#f1f5f9',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{GLOBAL_STYLES}</style>
      <BackgroundStars />
      {confetti}
      {emojis}
      {flash}
      <button
        onClick={onToggleSound}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 100,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, width: 40, height: 40, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#f1f5f9',
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write failing test — `MenuScreen.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MenuScreen } from './MenuScreen';

// Mock stores
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({ soundOn: true, continent: 'Todos', toggleSound: vi.fn(), setContinent: vi.fn() })),
}));

function renderMenu(): ReturnType<typeof render> {
  return render(<MemoryRouter><MenuScreen /></MemoryRouter>);
}

describe('MenuScreen', () => {
  it('renders the game title', () => {
    renderMenu();
    expect(screen.getByText(/qué bandera es/i)).toBeInTheDocument();
  });

  it('renders all three game mode buttons', () => {
    renderMenu();
    expect(screen.getByText(/jugar solo/i)).toBeInTheDocument();
    expect(screen.getByText(/explorador/i)).toBeInTheDocument();
    expect(screen.getByText(/familiar/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/screens/MenuScreen.test.tsx
```

- [ ] **Step 4: Create `MenuScreen.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';

import { useSettingsStore } from '../store/settingsStore';
import { ContinentPicker } from '../components/ContinentPicker';
import { FLAGS } from '../data/flags';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
};

const MODES = [
  { key: 'solo-diff',    icon: '🎮', label: 'Jugar solo',        sub: '10 rondas · Opciones múltiples',              delay: 0.1  },
  { key: 'explorer-diff',icon: '🗺️', label: 'Explorador',        sub: 'Ubicá países en su continente · Contrarreloj', delay: 0.2, highlight: true },
  { key: 'family-setup', icon: '👨‍👩‍👧‍👦', label: 'Desafío familiar', sub: 'Turnos por jugador',                          delay: 0.3  },
] as const;

const ROUTE_MAP: Record<string, string> = {
  'solo-diff': '/flag-game/solo',
  'explorer-diff': '/flag-game/explorer',
  'family-setup': '/flag-game/family',
};

export function MenuScreen(): JSX.Element {
  const navigate = useNavigate();
  const { soundOn, continent, toggleSound, setContinent } = useSettingsStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '100vh', padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 80, animation: 'float 3s ease-in-out infinite, spinIn 0.8s ease both', marginBottom: 8 }}>🌍</div>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(28px,6vw,44px)', fontWeight: 700,
                   background: `linear-gradient(135deg,${ACCENT},#f97316,#ef4444)`,
                   WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                   margin: '0 0 4px', animation: 'breathe 4s ease-in-out infinite' }}>
        ¿Qué bandera es?
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>{FLAGS.length} países del mundo</p>
      <ContinentPicker selected={continent} onChange={setContinent} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        {MODES.map((m) => (
          <button key={m.key} className="btn"
            onClick={() => navigate(ROUTE_MAP[m.key])}
            style={{ ...CARD, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14,
                     color: '#f1f5f9', fontSize: 16, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                     animation: `menuItem .6s ease ${m.delay}s both`,
                     ...(m.highlight ? { background: 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(139,92,246,.08))',
                                         border: '1.5px solid rgba(59,130,246,.3)' } : {}) }}>
            <span style={{ fontSize: 32 }}>{m.icon}</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div>{m.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>{m.sub}</div>
            </div>
            <span style={{ color: ACCENT, fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/screens/MenuScreen.test.tsx
```

- [ ] **Step 6: Create remaining screens (DifficultyScreen, FamilySetupScreen, PassPhoneScreen)**

For each screen, translate from `flag-game.jsx` using the same pattern:
- Read store state via `useGameStore()` / `useSettingsStore()`
- Navigate with `useNavigate()`
- No business logic in the screen

`DifficultyScreen.tsx` — receives `mode: 'solo' | 'explorer'` as a prop from the route, renders difficulty buttons, calls `gameStore.startSolo(d)` or `gameStore.startExplorer(d)` then navigates to `/flag-game/solo/play` or `/flag-game/explorer/play`.

`FamilySetupScreen.tsx` — manages player list in local `useState` (input state only), calls `gameStore.startFamily(d, players)` then navigates to `/flag-game/family/pass`.

`PassPhoneScreen.tsx` — reads `players[currentPlayerIdx]` from store, renders "Your turn" screen, button navigates to `/flag-game/family/play`.

- [ ] **Step 7: Commit**

```bash
git add src/shared/ src/modules/flag-game/screens/
git commit -m "feat(flag-game): add Layout and menu/setup screens"
```

---

## Task 13: Create playing + results screens

**Files:**
- Create: `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- Create: `src/modules/flag-game/screens/SoloPlayingScreen.test.tsx`
- Create: `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`
- Create: `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`
- Create: `src/modules/flag-game/screens/ResultsScreen.tsx`
- Create: `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`
- Create: `src/modules/flag-game/screens/FamilyResultsScreen.tsx`

- [ ] **Step 1: Write failing test — `SoloPlayingScreen.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SoloPlayingScreen } from './SoloPlayingScreen';
import { useGameStore } from '../store/gameStore';
import { FLAGS } from '../data/flags';

vi.mock('../hooks/useSoundEngine', () => ({
  useSoundEngine: () => ({ current: {} }),
}));

beforeEach(() => {
  useGameStore.getState().reset();
  useGameStore.getState().startSolo('easy');
  useGameStore.getState().setRoundData(FLAGS[0], FLAGS.slice(0, 2));
});

describe('SoloPlayingScreen', () => {
  it('renders the current flag emoji', () => {
    render(<MemoryRouter><SoloPlayingScreen /></MemoryRouter>);
    expect(screen.getByText(FLAGS[0].code)).toBeInTheDocument();
  });

  it('renders one button per option', () => {
    render(<MemoryRouter><SoloPlayingScreen /></MemoryRouter>);
    expect(screen.getAllByRole('button').filter((b) => !b.closest('nav'))).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/modules/flag-game/screens/SoloPlayingScreen.test.tsx
```

- [ ] **Step 3: Create `SoloPlayingScreen.tsx`**

```tsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useGameRound } from '../hooks/useGameRound';
import { useTimer } from '../hooks/useTimer';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { Sparkles } from '../components/effects/Sparkles';
import { DIFFICULTY, SOLO_R } from '../data/constants';
import type { Flag } from '../types';

const ACCENT = '#fbbf24';
const CARD = { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20 };

export function SoloPlayingScreen(): JSX.Element {
  const navigate = useNavigate();
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback((name: string) => sounds.current[name as keyof typeof sounds.current]?.(), [sounds]);
  const { showConfetti, showVictoryEmojis, flashColor, scorePop, showSparkles,
          triggerCorrect, triggerWrong } = useVisualEffects();

  const { currentFlag, options, selected, showHint, round, score, streak,
          setShowHint } = useGameStore();
  const diff = DIFFICULTY[useGameStore((s) => s.difficulty ?? 'easy')];

  const { handleAnswer } = useGameRound(sfx);

  const { timeLeft } = useTimer({
    seconds: diff?.time ?? 15,
    active: !!currentFlag && selected === null,
    onTick: (t) => { if (t <= 5 && t > 2) sfx('tick'); else if (t <= 2) sfx('tickUrgent'); },
    onExpire: () => { sfx('timeout'); handleAnswer(null); },
  });

  if (!currentFlag) return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * 100 : 100;
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 25 ? '#eab308' : '#ef4444';

  const onAnswer = (opt: Flag): void => {
    const correct = opt.name === currentFlag.name;
    if (correct) triggerCorrect(streak >= 2);
    else triggerWrong();
    handleAnswer(opt);
  };

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showVictoryEmojis} />
      <ScreenFlash color={flashColor} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => navigate('/flag-game')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: 4 }}>🏠</button>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              <span style={{ color: ACCENT, fontWeight: 700, fontSize: 15 }}>{round + 1}</span>/{SOLO_R}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            {streak >= 2 && <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700, animation: 'pulse 1s infinite' }}>🔥x{streak}</span>}
            <Sparkles active={showSparkles} />
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: ACCENT, animation: scorePop ? 'scorePop .4s ease' : 'none' }}>{score}</span>
          </div>
        </div>
        {/* Timer bar */}
        <div style={{ width: '100%', maxWidth: 420, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 4, transition: 'width 1s linear', animation: timeLeft <= 5 && !selected ? 'timerPulse .5s ease infinite' : 'none' }} />
        </div>
        {/* Flag */}
        <div style={{ ...CARD, padding: '32px 40px', marginBottom: 8, animation: 'flagEnter .6s cubic-bezier(.34,1.56,.64,1) both', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(80px,20vw,120px)', lineHeight: 1 }}>{currentFlag.code}</div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', background: 'rgba(255,255,255,.06)', padding: '4px 12px', borderRadius: 20, marginBottom: 20 }}>{currentFlag.continent}</div>
        {/* Hint */}
        {!showHint && !selected && (
          <button onClick={() => { sfx('hint'); setShowHint(true); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', padding: '6px 16px', borderRadius: 12, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontFamily: "'Nunito', sans-serif" }}>
            💡 Pista (-{diff?.hintCost} pts)
          </button>
        )}
        {showHint && <div style={{ fontSize: 14, color: ACCENT, marginBottom: 16, fontStyle: 'italic', animation: 'popIn .3s ease' }}>💡 {currentFlag.hint}</div>}
        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420 }}>
          {options.map((opt, i) => {
            const isCorrect = opt.name === currentFlag.name;
            const isSel = selected?.name === opt.name;
            const bg = selected ? (isCorrect ? 'rgba(34,197,94,.18)' : isSel ? 'rgba(239,68,68,.18)' : 'rgba(255,255,255,.06)') : 'rgba(255,255,255,.06)';
            const bc = selected ? (isCorrect ? '#22c55e' : isSel ? '#ef4444' : 'rgba(255,255,255,.1)') : 'rgba(255,255,255,.1)';
            return (
              <button key={opt.name} className="btn" onClick={() => onAnswer(opt)} disabled={selected !== null}
                style={{ ...CARD, background: bg, border: `1.5px solid ${bc}`, padding: '14px 20px', color: '#f1f5f9', fontSize: 16, fontWeight: 600, fontFamily: "'Nunito', sans-serif", cursor: selected ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, animation: `optionEnter .4s ease ${0.05 + i * 0.07}s both`, opacity: selected && !isCorrect && !isSel ? 0.35 : 1, transition: 'opacity .4s' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: selected && isCorrect ? '#22c55e' : selected && isSel ? '#ef4444' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, color: '#fff', transition: 'all .3s', transform: selected && (isCorrect || isSel) ? 'scale(1.2)' : 'scale(1)' }}>
                  {selected && isCorrect ? '✓' : selected && isSel && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                </span>
                {opt.name}
              </button>
            );
          })}
        </div>
        {selected && (
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, animation: 'popIn .4s ease', color: selected.name === currentFlag.name ? '#22c55e' : '#ef4444' }}>
            {selected.name === currentFlag.name ? (streak >= 3 ? '🔥 ¡Imparable!' : '🎉 ¡Correcto!') : `❌ Era ${currentFlag.name}`}
          </div>
        )}
        {!selected && timeLeft === 0 && <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: '#ef4444' }}>⏱️ ¡Tiempo! Era {currentFlag.name}</div>}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create `ExplorerPlayingScreen.tsx`**

Translate from `flag-game.jsx` lines 622–650. Uses `MobileMap` instead of answer buttons. Uses `useGameStore().recordExplorerAnswer()`. Timer navigates to `/flag-game/explorer/results` on expire.

- [ ] **Step 5: Create `FamilyPlayingScreen.tsx`**

Same structure as `SoloPlayingScreen` but reads `players[currentPlayerIdx]` for color/avatar/name, calls `recordAnswer` with family scoring. After RPP rounds per player, navigates to `/flag-game/family/pass` or `/flag-game/family/results`.

- [ ] **Step 6: Create result screens**

`ResultsScreen.tsx` — reads `score`, `roundHistory`, `bestStreak`, `difficulty` from store. Buttons: restart (call `startSolo(difficulty)`, navigate to `/flag-game/solo/play`) and go home (navigate to `/flag-game`).

`ExplorerResultsScreen.tsx` — reads `explorerScore`, `explorerCorrect`, `explorerBestStreak`, `explorerHistory`.

`FamilyResultsScreen.tsx` — reads `players`, `familyScores`, `familyHistory`. Renders podium. Translate from `flag-game.jsx` lines 685–694.

- [ ] **Step 7: Run tests — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/screens/
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/flag-game/screens/
git commit -m "feat(flag-game): add all playing and results screens"
```

---

## Task 14: Wire up routing + App + main

**Files:**
- Create: `src/modules/flag-game/routes.tsx`
- Create: `src/router/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/modules/flag-game/routes.tsx`**

```tsx
import { Route } from 'react-router-dom';

import { MenuScreen }           from './screens/MenuScreen';
import { DifficultyScreen }     from './screens/DifficultyScreen';
import { FamilySetupScreen }    from './screens/FamilySetupScreen';
import { PassPhoneScreen }      from './screens/PassPhoneScreen';
import { SoloPlayingScreen }    from './screens/SoloPlayingScreen';
import { ExplorerPlayingScreen }from './screens/ExplorerPlayingScreen';
import { FamilyPlayingScreen }  from './screens/FamilyPlayingScreen';
import { ResultsScreen }        from './screens/ResultsScreen';
import { ExplorerResultsScreen }from './screens/ExplorerResultsScreen';
import { FamilyResultsScreen }  from './screens/FamilyResultsScreen';

export const flagGameRoutes = (
  <Route path="flag-game">
    <Route index           element={<MenuScreen />} />
    <Route path="solo"     element={<DifficultyScreen mode="solo" />} />
    <Route path="solo/play"    element={<SoloPlayingScreen />} />
    <Route path="solo/results" element={<ResultsScreen />} />
    <Route path="explorer"         element={<DifficultyScreen mode="explorer" />} />
    <Route path="explorer/play"    element={<ExplorerPlayingScreen />} />
    <Route path="explorer/results" element={<ExplorerResultsScreen />} />
    <Route path="family"           element={<FamilySetupScreen />} />
    <Route path="family/pass"      element={<PassPhoneScreen />} />
    <Route path="family/play"      element={<FamilyPlayingScreen />} />
    <Route path="family/results"   element={<FamilyResultsScreen />} />
  </Route>
);
```

- [ ] **Step 2: Create `src/router/index.tsx`**

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { flagGameRoutes } from '@/modules/flag-game/routes';
import { App } from '@/App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/flag-game" replace /> },
      flagGameRoutes,
    ],
  },
]);
```

- [ ] **Step 3: Update `src/App.tsx`**

```tsx
import { Outlet } from 'react-router-dom';
import { useSettingsStore } from '@/modules/flag-game/store/settingsStore';
import { Layout } from '@/shared/components/Layout';

export function App(): JSX.Element {
  const { soundOn, toggleSound } = useSettingsStore();
  return (
    <Layout soundOn={soundOn} onToggleSound={toggleSound}>
      <Outlet />
    </Layout>
  );
}
```

- [ ] **Step 4: Update `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from './router/index';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Verify the app builds and all routes load**

```bash
npm run dev
# Open http://localhost:5173 — should redirect to /flag-game and show the menu
# Navigate to /flag-game/solo — should show difficulty picker
# Navigate to /flag-game/family — should show player setup
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
# Expected: all tests PASS
```

- [ ] **Step 7: Run typecheck**

```bash
npm run typecheck
# Expected: no errors
```

- [ ] **Step 8: Run lint**

```bash
npm run lint
# Expected: no errors (boundary violations = architecture errors, fix before continuing)
```

- [ ] **Step 9: Delete `flag-game.jsx`**

```bash
git rm flag-game.jsx
```

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: complete flag-game module reorganization with routing, stores, hooks, and tests"
```

---

## Self-Review

**Spec coverage:**
- ✅ Module-based organization (modules/flag-game/)
- ✅ Routes expose module structure (/flag-game/*)
- ✅ Zustand for game state (gameStore, settingsStore)
- ✅ TanStack Query installed + QueryClientProvider wired (ready for API use)
- ✅ React Router v6 with nested routes
- ✅ ESLint with eslint-plugin-boundaries
- ✅ Prettier + husky + lint-staged
- ✅ Vitest + RTL + jsdom
- ✅ Unit tests: store actions, hooks (useTimer), utilities (shuffle/pickRandom), components (MobileMap, ContinentPicker), screens (MenuScreen, SoloPlayingScreen)
- ✅ TypeScript strict mode
- ✅ No inline component definitions

**Placeholder scan:** Tasks 12/13 delegate screen translation for ExplorerPlayingScreen, FamilyPlayingScreen, and all results screens without full code blocks. The pattern is fully established by SoloPlayingScreen — the implementer should follow that pattern exactly, reading from the corresponding section of `flag-game.jsx`.

**Type consistency:** `Flag`, `Player`, `RoundResult`, `DifficultyKey`, `GameMode` are defined once in `types.ts` and used consistently. `useGameStore` action names match across store definition and hook consumers.
