# Code Conventions

## TypeScript

### Strict mode

`tsconfig.json` has `"strict": true`. Always satisfied — no suppressions.

```ts
// Bad
const fn = (x: any) => x.name;

// Good
const fn = (x: Flag) => x.name;
```

### Types vs interfaces

- `interface` for object shapes that may be extended (component props, store state).
- `type` for unions, intersections, and aliases.

```ts
interface Flag {
  code: string;
  name: string;
  continent: Continent;
  hint: string;
  tier: 1 | 2 | 3;
  pos: [lat: number, lng: number];
}

type GameMode = 'solo' | 'family' | 'explorer';
type DifficultyKey = 'easy' | 'medium' | 'hard';
```

### Explicit return types on hooks

```ts
// Bad
function useGameRound() {
  return { currentFlag, options, handleAnswer };
}

// Good
function useGameRound(): GameRoundResult {
  return { currentFlag, options, handleAnswer };
}
```

### No implicit `undefined` returns

Use `null` for intentional absence, `undefined` only when a value is truly optional.

---

## React

### Component structure

One component per file. File name matches component name (PascalCase).

```
components/MobileMap.tsx   →  export function MobileMap(...)
screens/MenuScreen.tsx     →  export function MenuScreen(...)
```

### Props

Always define a named `interface` for props. Don't inline complex prop types.

```ts
interface MobileMapProps {
  options: Flag[];
  correctName: string;
  selected: Flag | null;
  onSelect: (flag: Flag) => void;
}

export function MobileMap({ options, correctName, selected, onSelect }: MobileMapProps) {
```

### No inline component definitions

Never define a component inside another component's body. It creates a new type on every render.

```tsx
// Bad — ContinentPicker defined inside FlagGame
export function FlagGame() {
  const ContinentPicker = () => <div>...</div>; // re-created every render
}

// Good — top-level file
// components/ContinentPicker.tsx
export function ContinentPicker({ selected, onChange }: ContinentPickerProps) { ... }
```

### Screens are thin

Screens read state and render. They do not contain business logic.

```tsx
// Good
export function PlayingScreen() {
  const { currentFlag, options, selected, handleAnswer } = useGameRound();
  return <QuizView flag={currentFlag} options={options} selected={selected} onAnswer={handleAnswer} />;
}

// Bad — logic in screen
export function PlayingScreen() {
  const [selected, setSelected] = useState(null);
  const handleAnswer = (opt) => {
    const correct = opt.name === currentFlag.name;
    if (correct) { /* scoring logic */ }
    setSelected(opt);
  };
}
```

### Hooks

- Prefix with `use`.
- One hook per file in `hooks/`.
- Return a typed object (not a tuple) unless there are exactly 2 values.

```ts
// Good
export function useGameRound(): GameRoundResult { ... }

// Fine for 2 values
export function useTimer(seconds: number): [timeLeft: number, reset: () => void] { ... }
```

### Effects

- Avoid `useEffect` for derived state. Compute it inline or with `useMemo`.
- `useEffect` is for synchronization with external systems (timers, audio, DOM events).
- Always return a cleanup function when registering listeners or intervals.

```ts
// Bad — effect for derived state
useEffect(() => {
  setTimerColor(timeLeft > 10 ? 'green' : 'red');
}, [timeLeft]);

// Good — derived inline
const timerColor = timeLeft > 10 ? 'green' : 'red';
```

---

## File naming

| What | Convention | Example |
|---|---|---|
| Components | PascalCase | `MobileMap.tsx` |
| Screens | PascalCase + Screen suffix | `PlayingScreen.tsx` |
| Hooks | camelCase + use prefix | `useGameRound.ts` |
| Stores | camelCase + Store suffix | `gameStore.ts` |
| Data files | camelCase | `flags.ts`, `constants.ts` |
| Types files | `types.ts` per module |  |
| Route files | `routes.tsx` per module |  |

---

## Import order

Enforced by ESLint. Maintain this order manually if linter isn't running:

```ts
// 1. React
import { useState, useCallback } from 'react';

// 2. Third-party
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// 3. Internal shared
import { Layout } from '@/shared/components/Layout';
import type { GameMode } from '@/shared/types';

// 4. Module-internal (relative)
import { useGameStore } from '../store/gameStore';
import type { Flag } from '../types';
```

Use the `@/` alias for `src/` (configured in `vite.config.ts` and `tsconfig.json`).

---

## Zustand store conventions

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// State and actions in one interface
interface GameStore {
  // State
  score: number;
  round: number;
  // Actions (verb names)
  incrementScore: (points: number) => void;
  nextRound: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    score: 0,
    round: 0,
    incrementScore: (points) => set((s) => { s.score += points; }),
    nextRound: () => set((s) => { s.round += 1; }),
    reset: () => set({ score: 0, round: 0 }),
  }))
);
```

- Actions are verbs (`startSolo`, `handleAnswer`, `reset`).
- Never expose `set` outside the store.
- Select only what you need in components: `useGameStore(s => s.score)`.

---

## Static data

Static data (flags, difficulty config, world shapes) lives in `data/` as typed constants.
Never co-locate large data arrays with component logic.

```ts
// data/flags.ts
export const FLAGS: Flag[] = [ ... ];

// data/constants.ts
export const DIFFICULTY: Record<DifficultyKey, DifficultyConfig> = { ... };
export const RPP = 5;   // rounds per player
export const SOLO_R = 10;
```

---

## Linting & formatting

### Tools

| Tool | Purpose |
|---|---|
| ESLint | Code quality + architecture enforcement |
| `@typescript-eslint` | TypeScript-specific rules |
| `eslint-plugin-react` + `react-hooks` | React rules |
| `eslint-plugin-import` | Import ordering |
| `eslint-plugin-boundaries` | Module boundary enforcement |
| Prettier | Formatting (via `eslint-plugin-prettier`) |

### Architecture enforcement (`eslint-plugin-boundaries`)

This is the most important linting layer. It prevents modules from importing each other's internals:

```js
// eslint.config.js (excerpt)
boundaries: {
  elements: [
    { type: 'shared',    pattern: 'src/shared/*' },
    { type: 'module',    pattern: 'src/modules/*' },
    { type: 'router',    pattern: 'src/router/*' },
  ],
  rules: [
    // Modules can import from shared, but not from other modules
    { from: 'module', allow: ['shared'] },
    // Router can import module routes only (routes.tsx)
    { from: 'router', allow: ['module', 'shared'] },
    // Shared cannot import from modules
    { from: 'shared', allow: ['shared'] },
  ],
}
```

A CI lint failure on a boundary violation means the architecture is being broken — fix it, don't disable the rule.

### Key ESLint rules enforced

```js
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
'react-hooks/rules-of-hooks': 'error',
'react-hooks/exhaustive-deps': 'warn',
'import/order': ['error', { groups: ['builtin','external','internal','parent','sibling'] }],
'no-restricted-syntax': // disallow component definitions inside components
```

### Pre-commit hooks

`husky` + `lint-staged` run on every commit:

```json
// package.json (lint-staged)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  }
}
```

A commit that breaks lint does not go through.

---

## Testing

### Stack

| Tool | Purpose |
|---|---|
| **Vitest** | Test runner (native Vite integration, no config overhead) |
| **React Testing Library** | Component rendering and interaction |
| **@testing-library/user-event** | Realistic user event simulation |
| **jsdom** | Browser environment in Node |

### What to test

| Target | What to test | What NOT to test |
|---|---|---|
| Store actions | State transitions for each action | Internal implementation |
| Hooks | Logic, return values, state changes | React internals |
| Pure utils | `shuffle`, `pickRandom`, scoring math | —  |
| Screens | Renders correctly, user interactions | Exact styling |
| Components | Renders given props, callbacks called | Visual appearance |

### File placement

Tests live next to the code they test:

```
hooks/useGameRound.ts
hooks/useGameRound.test.ts

store/gameStore.ts
store/gameStore.test.ts

data/constants.ts          # no test needed — static data
```

### Patterns

**Store test:**
```ts
import { useGameStore } from './gameStore';

beforeEach(() => useGameStore.getState().reset());

it('increments score on correct answer', () => {
  useGameStore.getState().startSolo('easy');
  useGameStore.getState().handleAnswer(correctFlag);
  expect(useGameStore.getState().score).toBeGreaterThan(0);
});
```

**Hook test (with renderHook):**
```ts
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

it('counts down from initial value', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useTimer(5));
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current[0]).toBe(4);
  vi.useRealTimers();
});
```

**Component test:**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('calls onSelect when a pin is clicked', async () => {
  const onSelect = vi.fn();
  render(<MobileMap options={mockOptions} correctName="Brasil" selected={null} onSelect={onSelect} />);
  await userEvent.click(screen.getByText(/brasil/i));
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Brasil' }));
});
```

### Coverage targets (enforced in CI)

```
Stores:     90%+
Hooks:      80%+
Utils:      100%
Components: 70%+  (interaction paths, not exhaustive rendering)
```
