# GeoMundo Multigame Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the flag quiz app into a unified geography platform (GeoMundo) with a hub screen, local player profiles, a shared quiz engine, and two new games: Capital Cities and Cultural Facts.

**Architecture:** A generic `useQuizSession<T>` hook (local `useReducer` state, no Zustand) and `QuizLayout` component live in `shared/quiz-engine/`. New games consume both. The flag game's `SoloPlayingScreen` migrates to `QuizLayout`; its state hooks are untouched. A `profileStore` (Zustand + `localStorage` persist) tracks per-player scores across games. A new `HubScreen` at `/` replaces the old root redirect.

**Tech Stack:** React 19, TypeScript, Zustand 5 (`persist` middleware), React Router 7, Vitest + Testing Library, CSS Modules.

---

## File Map

**New files:**
- `src/shared/quiz-engine/types.ts`
- `src/shared/quiz-engine/useQuizSession.ts`
- `src/shared/quiz-engine/useQuizSession.test.ts`
- `src/shared/quiz-engine/useQuizTimer.ts`
- `src/shared/quiz-engine/QuizLayout.tsx`
- `src/shared/quiz-engine/QuizLayout.module.css`
- `src/shared/store/profileStore.ts`
- `src/shared/store/profileStore.test.ts`
- `src/screens/HubScreen.tsx`
- `src/screens/HubScreen.module.css`
- `src/modules/capital-cities/types.ts`
- `src/modules/capital-cities/routes.tsx`
- `src/modules/capital-cities/data/capitals.ts`
- `src/modules/capital-cities/hooks/useCapitalQuiz.ts`
- `src/modules/capital-cities/hooks/useCapitalQuiz.test.ts`
- `src/modules/capital-cities/screens/MenuScreen.tsx`
- `src/modules/capital-cities/screens/MenuScreen.module.css`
- `src/modules/capital-cities/screens/DifficultyScreen.tsx`
- `src/modules/capital-cities/screens/CapitalPlayingScreen.tsx`
- `src/modules/capital-cities/screens/CapitalPlayingScreen.module.css`
- `src/modules/capital-cities/screens/CapitalResultsScreen.tsx`
- `src/modules/capital-cities/screens/CapitalResultsScreen.module.css`
- `src/modules/cultural-facts/types.ts`
- `src/modules/cultural-facts/routes.tsx`
- `src/modules/cultural-facts/data/facts.ts`
- `src/modules/cultural-facts/hooks/useCulturalFactsQuiz.ts`
- `src/modules/cultural-facts/hooks/useCulturalFactsQuiz.test.ts`
- `src/modules/cultural-facts/screens/MenuScreen.tsx`
- `src/modules/cultural-facts/screens/MenuScreen.module.css`
- `src/modules/cultural-facts/screens/DifficultyScreen.tsx`
- `src/modules/cultural-facts/screens/FactsPlayingScreen.tsx`
- `src/modules/cultural-facts/screens/FactsPlayingScreen.module.css`
- `src/modules/cultural-facts/screens/FactsResultsScreen.tsx`
- `src/modules/cultural-facts/screens/FactsResultsScreen.module.css`

**Modified files:**
- `src/modules/flag-game/types.ts` — add `capital: string` to `Flag`
- `src/modules/flag-game/data/flags.ts` — add `capital` to every entry
- `src/modules/flag-game/screens/SoloPlayingScreen.tsx` — use `QuizLayout`
- `src/router/index.tsx` — add hub screen + new module routes

---

## Task 1: Shared Quiz Engine — Types and `useQuizSession`

**Files:**
- Create: `src/shared/quiz-engine/types.ts`
- Create: `src/shared/quiz-engine/useQuizSession.ts`
- Create: `src/shared/quiz-engine/useQuizSession.test.ts`

- [ ] **Step 1.1 — Write the types file**

```ts
// src/shared/quiz-engine/types.ts

export interface QuizConfig<T> {
  items: T[];
  toId: (item: T) => string;
  generateOptions: (correct: T, pool: T[]) => T[];
  roundCount?: number;       // default 10
  pointsPerCorrect?: number; // default 10
}

export interface QuizState<T> {
  round: number;
  score: number;
  current: T | null;
  options: T[];
  selectedId: string | null;
  correctId: string | null;
  answered: boolean;
  isCorrect: boolean;
  isFinished: boolean;
}

export interface QuizActions {
  handleAnswer: (id: string) => void;
  handleTimeout: () => void;
  nextRound: () => void;
}
```

- [ ] **Step 1.2 — Write the failing tests first**

```ts
// src/shared/quiz-engine/useQuizSession.test.ts
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQuizSession } from './useQuizSession';

const ITEMS = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
  { id: 'd', name: 'Delta' },
  { id: 'e', name: 'Epsilon' },
];

const config = {
  items: ITEMS,
  toId: (item: { id: string }) => item.id,
  generateOptions: (correct: { id: string }, pool: { id: string }[]) => {
    const others = pool.filter((i) => i.id !== correct.id).slice(0, 3);
    return [correct, ...others];
  },
  roundCount: 3,
  pointsPerCorrect: 10,
};

describe('useQuizSession — initial state', () => {
  it('starts at round 0 with a current item and 4 options', () => {
    const { result } = renderHook(() => useQuizSession(config));
    expect(result.current.round).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.answered).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });
});

describe('useQuizSession — correct answer', () => {
  it('awards points and marks answered=true when the correct id is submitted', () => {
    const { result } = renderHook(() => useQuizSession(config));
    const correctId = result.current.correctId!;

    act(() => { result.current.handleAnswer(correctId); });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.score).toBe(10);
    expect(result.current.selectedId).toBe(correctId);
  });
});

describe('useQuizSession — wrong answer', () => {
  it('awards no points when a wrong id is submitted', () => {
    const { result } = renderHook(() => useQuizSession(config));
    const wrongId = result.current.options.find(
      (o) => config.toId(o) !== result.current.correctId
    )!;

    act(() => { result.current.handleAnswer(config.toId(wrongId)); });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });
});

describe('useQuizSession — timeout', () => {
  it('counts as wrong and sets answered=true on handleTimeout', () => {
    const { result } = renderHook(() => useQuizSession(config));

    act(() => { result.current.handleTimeout(); });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });
});

describe('useQuizSession — round progression', () => {
  it('advances to round 1 after nextRound', () => {
    const { result } = renderHook(() => useQuizSession(config));
    act(() => { result.current.handleAnswer(result.current.correctId!); });
    act(() => { result.current.nextRound(); });
    expect(result.current.round).toBe(1);
    expect(result.current.answered).toBe(false);
  });

  it('sets isFinished after the last round', () => {
    const { result } = renderHook(() => useQuizSession(config));
    for (let i = 0; i < 3; i++) {
      act(() => { result.current.handleAnswer(result.current.correctId!); });
      act(() => { result.current.nextRound(); });
    }
    expect(result.current.isFinished).toBe(true);
  });
});
```

- [ ] **Step 1.3 — Run tests to confirm they fail**

```bash
npm run test:run -- src/shared/quiz-engine/useQuizSession.test.ts
```

Expected: all tests fail with "Cannot find module './useQuizSession'".

- [ ] **Step 1.4 — Implement `useQuizSession`**

```ts
// src/shared/quiz-engine/useQuizSession.ts
import { useReducer, useMemo } from 'react';
import type { QuizConfig, QuizState, QuizActions } from './types';

type Action<T> =
  | { type: 'ANSWER'; id: string }
  | { type: 'TIMEOUT' }
  | { type: 'NEXT'; next: T; options: T[] };

function buildInitialState<T>(config: QuizConfig<T>): QuizState<T> & { pool: T[] } {
  const pool = [...config.items];
  const current = pool[Math.floor(Math.random() * pool.length)];
  const options = config.generateOptions(current, pool);
  return {
    round: 0,
    score: 0,
    current,
    options,
    selectedId: null,
    correctId: config.toId(current),
    answered: false,
    isCorrect: false,
    isFinished: false,
    pool,
  };
}

function reducer<T>(
  state: QuizState<T> & { pool: T[]; config: QuizConfig<T> },
  action: Action<T>,
): QuizState<T> & { pool: T[]; config: QuizConfig<T> } {
  const { config } = state;
  const roundCount = config.roundCount ?? 10;
  const points = config.pointsPerCorrect ?? 10;

  switch (action.type) {
    case 'ANSWER': {
      if (state.answered) return state;
      const isCorrect = action.id === state.correctId;
      return {
        ...state,
        selectedId: action.id,
        answered: true,
        isCorrect,
        score: state.score + (isCorrect ? points : 0),
      };
    }
    case 'TIMEOUT': {
      if (state.answered) return state;
      return { ...state, answered: true, isCorrect: false, selectedId: null };
    }
    case 'NEXT': {
      const nextRound = state.round + 1;
      return {
        ...state,
        round: nextRound,
        current: action.next,
        options: action.options,
        selectedId: null,
        correctId: config.toId(action.next),
        answered: false,
        isCorrect: false,
        isFinished: nextRound >= roundCount,
      };
    }
  }
}

export function useQuizSession<T>(
  config: QuizConfig<T>,
): QuizState<T> & QuizActions & { pool: T[] } {
  const initialState = useMemo(
    () => ({ ...buildInitialState(config), config }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [state, dispatch] = useReducer(reducer<T>, initialState);

  const handleAnswer = (id: string) => dispatch({ type: 'ANSWER', id });

  const handleTimeout = () => dispatch({ type: 'TIMEOUT' });

  const nextRound = () => {
    const remaining = state.pool.filter(
      (item) => config.toId(item) !== (state.current ? config.toId(state.current) : ''),
    );
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    const options = config.generateOptions(next, state.pool);
    dispatch({ type: 'NEXT', next, options });
  };

  return { ...state, handleAnswer, handleTimeout, nextRound };
}
```

- [ ] **Step 1.5 — Run tests to confirm they pass**

```bash
npm run test:run -- src/shared/quiz-engine/useQuizSession.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 1.6 — Commit**

```bash
git add src/shared/quiz-engine/types.ts src/shared/quiz-engine/useQuizSession.ts src/shared/quiz-engine/useQuizSession.test.ts
git commit -m "feat: add shared quiz engine types and useQuizSession hook"
```

---

## Task 2: `QuizLayout` Component and `useQuizTimer`

**Files:**
- Create: `src/shared/quiz-engine/useQuizTimer.ts`
- Create: `src/shared/quiz-engine/QuizLayout.tsx`
- Create: `src/shared/quiz-engine/QuizLayout.module.css`

- [ ] **Step 2.1 — Implement `useQuizTimer`**

This hook counts down from `seconds`, resets when `resetKey` changes, and calls `onTimeout` when it reaches zero. It does NOT reset when `answered` changes — the screen stays visible after answering.

```ts
// src/shared/quiz-engine/useQuizTimer.ts
import { useEffect, useRef, useState } from 'react';

interface UseQuizTimerOptions {
  seconds: number;
  resetKey: unknown;   // change this value to restart the timer (e.g. current item id)
  paused: boolean;     // pass `answered` to pause after selection
  onTimeout: () => void;
}

export function useQuizTimer({ seconds, resetKey, paused, onTimeout }: UseQuizTimerOptions): number {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    setTimeLeft(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (paused || timeLeft <= 0) {
      if (timeLeft <= 0) onTimeoutRef.current();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [paused, timeLeft]);

  return timeLeft;
}
```

- [ ] **Step 2.2 — Implement `QuizLayout`**

```tsx
// src/shared/quiz-engine/QuizLayout.tsx
import React from 'react';
import {
  OPTION_ANIM_BASE_DELAY,
  OPTION_ANIM_STEP_DELAY,
  CHAR_CODE_A,
} from '@/modules/flag-game/data/constants';
import styles from './QuizLayout.module.css';

export interface QuizOption {
  id: string;
  label: string;
}

interface QuizLayoutProps {
  questionSlot: React.ReactNode;
  options: QuizOption[];
  selectedId: string | null;
  correctId: string;
  onAnswer: (id: string) => void;
  timerPct: number;
  timerColor: string;
  timerUrgent: boolean;
  feedbackText: string | null;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

type OptionState = 'correct' | 'wrong' | 'dimmed' | 'default';

function getOptionState(id: string, selectedId: string | null, correctId: string): OptionState {
  if (!selectedId) return 'default';
  if (id === correctId) return 'correct';
  if (id === selectedId) return 'wrong';
  return 'dimmed';
}

export function QuizLayout({
  questionSlot,
  options,
  selectedId,
  correctId,
  onAnswer,
  timerPct,
  timerColor,
  timerUrgent,
  feedbackText,
  headerLeft,
  headerRight,
}: QuizLayoutProps): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <nav className={styles.header}>
        <div className={styles.headerLeft}>{headerLeft}</div>
        <div className={styles.headerRight}>{headerRight}</div>
      </nav>
      <div className={styles.timerTrack}>
        <div
          className={[styles.timerFill, timerUrgent ? styles.timerUrgent : '']
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--timer-width': `${timerPct}%`,
              '--timer-color': timerColor,
            } as React.CSSProperties
          }
        />
      </div>
      <div className={styles.questionArea}>{questionSlot}</div>
      <div className={styles.answerSection}>
        {options.map((opt, index) => {
          const state = getOptionState(opt.id, selectedId, correctId);
          return (
            <button
              key={opt.id}
              className={[styles.optionButton, styles[state]].filter(Boolean).join(' ')}
              disabled={selectedId !== null}
              onClick={() => onAnswer(opt.id)}
              style={
                {
                  '--item-delay': `${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s`,
                } as React.CSSProperties
              }
              type="button"
            >
              <span className={styles.badge}>
                {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : String.fromCharCode(CHAR_CODE_A + index)}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {feedbackText && (
        <div
          className={[
            styles.feedbackPanel,
            selectedId === correctId ? styles.feedbackCorrect : styles.feedbackWrong,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {feedbackText}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2.3 — Write the CSS**

```css
/* src/shared/quiz-engine/QuizLayout.module.css */
.screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 0 1rem 2rem;
  gap: 0.75rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0 0.25rem;
}

.headerLeft,
.headerRight {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timerTrack {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.timerFill {
  height: 100%;
  width: var(--timer-width, 100%);
  background: var(--timer-color, #22c55e);
  border-radius: 3px;
  transition: width 1s linear, background 0.3s;
}

.timerUrgent {
  animation: timerPulse 0.5s ease-in-out infinite alternate;
}

@keyframes timerPulse {
  from { opacity: 1; }
  to   { opacity: 0.5; }
}

.questionArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
}

.answerSection {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.optionButton {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  animation: slideIn 0.3s both;
  animation-delay: var(--item-delay, 0s);
  transition: border-color 0.2s, background 0.2s;
}

.optionButton:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.3);
}

.optionButton:disabled {
  cursor: default;
}

.correct {
  background: rgba(34, 197, 94, 0.25) !important;
  border-color: #22c55e !important;
}

.wrong {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: #ef4444 !important;
}

.dimmed {
  opacity: 0.35;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.feedbackPanel {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 700;
  font-size: 1.05rem;
}

.feedbackCorrect {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
}

.feedbackWrong {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2.4 — Run the full test suite to confirm no regressions**

```bash
npm run test:run
```

Expected: all existing tests pass.

- [ ] **Step 2.5 — Commit**

```bash
git add src/shared/quiz-engine/useQuizTimer.ts src/shared/quiz-engine/QuizLayout.tsx src/shared/quiz-engine/QuizLayout.module.css
git commit -m "feat: add QuizLayout component and useQuizTimer hook"
```

---

## Task 3: Migrate Flag Game `SoloPlayingScreen` to `QuizLayout`

**Files:**
- Modify: `src/modules/flag-game/screens/SoloPlayingScreen.tsx`

`useSoloPlayingState` is not changed. The screen adapts its output to the `QuizLayout` interface.

- [ ] **Step 3.1 — Run existing solo playing screen tests to establish baseline**

```bash
npm run test:run -- src/modules/flag-game/screens/SoloPlayingScreen.test.tsx
```

Note: if no dedicated test exists, skip to Step 3.2.

- [ ] **Step 3.2 — Replace `SoloPlayingScreen.tsx`**

```tsx
// src/modules/flag-game/screens/SoloPlayingScreen.tsx
import React from 'react';

import { PlayingEffects } from '../components/game/PlayingEffects';
import { Sparkles } from '../components/effects/Sparkles';
import { STREAK_BONUS_THRESHOLD, TIMER_PCT_FULL, SOLO_R } from '../data/constants';
import { useSoloPlayingState } from '../hooks/useSoloPlayingState';
import { QuizLayout } from '@/shared/quiz-engine/QuizLayout';

import styles from './SoloPlayingScreen.module.css';

export function SoloPlayingScreen(): React.JSX.Element {
  const state = useSoloPlayingState();

  if (!state.currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  const options = state.options.map((f) => ({ id: f.name, label: f.name }));
  const correctId = state.currentFlag.name;
  const selectedId = state.selected?.name ?? null;

  return (
    <>
      <PlayingEffects {...state.visualEffects} />
      <QuizLayout
        questionSlot={
          <div className={styles.flagCard}>
            <div className={styles.flagEmoji}>{state.currentFlag.code}</div>
            <div className={styles.continentPill}>{state.currentFlag.continent}</div>
            {state.showHint && (
              <p className={styles.hintText}>💡 {state.currentFlag.hint}</p>
            )}
            {!state.showHint && !state.selected && (
              <button className={styles.hintButton} onClick={state.onRevealHint} type="button">
                {state.hintLabel}
              </button>
            )}
          </div>
        }
        options={options}
        selectedId={selectedId}
        correctId={correctId}
        onAnswer={(id) => {
          const flag = state.options.find((f) => f.name === id) ?? null;
          state.onAnswer(flag!);
        }}
        timerPct={state.timerPct}   // already 0-100, pass directly
        timerColor={state.timerColor}
        timerUrgent={state.timerUrgent}
        feedbackText={state.feedbackText}
        headerLeft={
          <>
            <button
              className={styles.homeButton}
              onClick={() => state.navigate('/flag-game')}
              type="button"
            >
              🏠
            </button>
            <span className={styles.roundMeta}>{state.roundLabel}</span>
          </>
        }
        headerRight={
          <>
            {state.streak >= STREAK_BONUS_THRESHOLD && (
              <span className={styles.streakBadge}>🔥x{state.streak}</span>
            )}
            <Sparkles active={state.sparklesActive} />
            <span
              className={[styles.scoreValue, state.scorePop ? styles.scorePop : '']
                .filter(Boolean)
                .join(' ')}
            >
              {state.score}
            </span>
          </>
        }
      />
    </>
  );
}
```

Keep the existing `SoloPlayingScreen.module.css` — the class names it defines (`.loadingState`, `.flagCard`, `.flagEmoji`, `.continentPill`, `.hintText`, `.hintButton`, `.homeButton`, `.roundMeta`, `.streakBadge`, `.scoreValue`, `.scorePop`) are still used via `styles.*` above.

- [ ] **Step 3.3 — Start dev server and manually verify the solo mode still works**

```bash
npm run dev
```

Navigate to `/flag-game/solo` → pick difficulty → confirm: timer bar, flag emoji, 4 options, correct/wrong colors, score update, navigation to results all work.

- [ ] **Step 3.4 — Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 3.5 — Commit**

```bash
git add src/modules/flag-game/screens/SoloPlayingScreen.tsx
git commit -m "refactor: migrate SoloPlayingScreen to shared QuizLayout"
```

---

## Task 4: Player Profile Store

**Files:**
- Create: `src/shared/store/profileStore.ts`
- Create: `src/shared/store/profileStore.test.ts`

- [ ] **Step 4.1 — Write failing tests**

```ts
// src/shared/store/profileStore.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useProfileStore } from './profileStore';

beforeEach(() => {
  useProfileStore.setState({
    profiles: [],
    activeProfileId: null,
  });
});

describe('profileStore — addProfile', () => {
  it('adds a profile and sets it as active', () => {
    useProfileStore.getState().addProfile('Ana', '🦊');
    const state = useProfileStore.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0].name).toBe('Ana');
    expect(state.profiles[0].avatar).toBe('🦊');
    expect(state.activeProfileId).toBe(state.profiles[0].id);
  });

  it('does not exceed 5 profiles', () => {
    for (let i = 0; i < 6; i++) {
      useProfileStore.getState().addProfile(`Player ${i}`, '🐸');
    }
    expect(useProfileStore.getState().profiles).toHaveLength(5);
  });
});

describe('profileStore — setActiveProfile', () => {
  it('switches the active profile', () => {
    useProfileStore.getState().addProfile('Ana', '🦊');
    useProfileStore.getState().addProfile('Bob', '🐧');
    const [, bob] = useProfileStore.getState().profiles;
    useProfileStore.getState().setActiveProfile(bob.id);
    expect(useProfileStore.getState().activeProfileId).toBe(bob.id);
  });
});

describe('profileStore — recordScore', () => {
  it('records a new best score', () => {
    useProfileStore.getState().addProfile('Ana', '🦊');
    useProfileStore.getState().recordScore('flag-game', 150);
    const profile = useProfileStore.getState().profiles[0];
    expect(profile.scores['flag-game'].gamesPlayed).toBe(1);
    expect(profile.scores['flag-game'].bestScore).toBe(150);
    expect(profile.scores['flag-game'].totalScore).toBe(150);
  });

  it('does not update bestScore when score is lower', () => {
    useProfileStore.getState().addProfile('Ana', '🦊');
    useProfileStore.getState().recordScore('flag-game', 150);
    useProfileStore.getState().recordScore('flag-game', 80);
    const profile = useProfileStore.getState().profiles[0];
    expect(profile.scores['flag-game'].bestScore).toBe(150);
    expect(profile.scores['flag-game'].gamesPlayed).toBe(2);
  });

  it('does nothing when no active profile', () => {
    // no profile added, activeProfileId is null
    expect(() => useProfileStore.getState().recordScore('flag-game', 100)).not.toThrow();
  });
});
```

- [ ] **Step 4.2 — Run to confirm they fail**

```bash
npm run test:run -- src/shared/store/profileStore.test.ts
```

Expected: fail with "Cannot find module './profileStore'".

- [ ] **Step 4.3 — Implement `profileStore`**

```ts
// src/shared/store/profileStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GameScore {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  scores: Record<string, GameScore>;
}

interface ProfileStore {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  addProfile: (name: string, avatar: string) => void;
  setActiveProfile: (id: string) => void;
  recordScore: (gameKey: string, score: number) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    immer((set, get) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (name, avatar) =>
        set((state) => {
          if (state.profiles.length >= 5) return;
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          state.profiles.push({ id, name, avatar, scores: {} });
          state.activeProfileId = id;
        }),

      setActiveProfile: (id) =>
        set((state) => {
          state.activeProfileId = id;
        }),

      recordScore: (gameKey, score) =>
        set((state) => {
          const profile = state.profiles.find((p) => p.id === get().activeProfileId);
          if (!profile) return;
          const existing = profile.scores[gameKey] ?? { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
          profile.scores[gameKey] = {
            gamesPlayed: existing.gamesPlayed + 1,
            totalScore: existing.totalScore + score,
            bestScore: Math.max(existing.bestScore, score),
          };
        }),
    })),
    { name: 'geo-games-profiles' },
  ),
);
```

- [ ] **Step 4.4 — Run tests to confirm they pass**

```bash
npm run test:run -- src/shared/store/profileStore.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4.5 — Commit**

```bash
git add src/shared/store/profileStore.ts src/shared/store/profileStore.test.ts
git commit -m "feat: add player profile store with localStorage persistence"
```

---

## Task 5: Hub Screen and Router Update

**Files:**
- Create: `src/screens/HubScreen.tsx`
- Create: `src/screens/HubScreen.module.css`
- Modify: `src/router/index.tsx`

- [ ] **Step 5.1 — Implement `HubScreen`**

```tsx
// src/screens/HubScreen.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore, type PlayerProfile } from '@/shared/store/profileStore';
import styles from './HubScreen.module.css';

const GAMES = [
  {
    key: 'flag-game',
    icon: '🏳️',
    title: '¿Qué bandera es?',
    route: '/flag-game',
    description: '195 países del mundo',
  },
  {
    key: 'capital-cities',
    icon: '🏛️',
    title: '¿Cuál es la capital?',
    route: '/capital-cities',
    description: 'Capitales del mundo',
  },
  {
    key: 'cultural-facts',
    icon: '🌍',
    title: '¿Cuánto sabés del mundo?',
    route: '/cultural-facts',
    description: 'Tradiciones y culturas',
  },
] as const;

const AVATARS = ['🦊', '🐸', '🦁', '🐯', '🦉', '🐧', '🚀', '🌟', '🌈', '🐬', '🦄', '🐻'];

function ProfileCreator({ onDone }: { onDone: () => void }): React.JSX.Element {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const { addProfile } = useProfileStore();

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!name.trim()) return;
    addProfile(name.trim(), avatar);
    onDone();
  }

  return (
    <div className={styles.creatorOverlay}>
      <div className={styles.creatorCard}>
        <h2 className={styles.creatorTitle}>¿Cómo te llamás?</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            className={styles.nameInput}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            type="text"
            value={name}
          />
          <p className={styles.avatarLabel}>Elegí tu avatar</p>
          <div className={styles.avatarGrid}>
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                className={[styles.avatarOption, avatar === emoji ? styles.avatarSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setAvatar(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            className={['btn', styles.doneButton].join(' ')}
            disabled={!name.trim()}
            type="submit"
          >
            ¡Listo!
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileBar({ profiles, activeProfileId, onSwitch }: {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  onSwitch: () => void;
}): React.JSX.Element {
  const active = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className={styles.profileBar}>
      {active ? (
        <>
          <span className={styles.activeAvatar}>{active.avatar}</span>
          <span className={styles.activeName}>{active.name}</span>
          <button className={styles.switchButton} onClick={onSwitch} type="button">
            Cambiar
          </button>
        </>
      ) : (
        <button className={styles.switchButton} onClick={onSwitch} type="button">
          + Agregar jugador
        </button>
      )}
    </div>
  );
}

function ProfileSwitcher({ profiles, onSelect, onAdd }: {
  profiles: PlayerProfile[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}): React.JSX.Element {
  return (
    <div className={styles.switcherOverlay}>
      <div className={styles.switcherCard}>
        <h2 className={styles.switcherTitle}>¿Quién juega?</h2>
        <div className={styles.profileList}>
          {profiles.map((p) => (
            <button
              key={p.id}
              className={styles.profileItem}
              onClick={() => onSelect(p.id)}
              type="button"
            >
              <span className={styles.profileAvatar}>{p.avatar}</span>
              <span className={styles.profileName}>{p.name}</span>
            </button>
          ))}
        </div>
        {profiles.length < 5 && (
          <button className={styles.addProfile} onClick={onAdd} type="button">
            + Nuevo jugador
          </button>
        )}
      </div>
    </div>
  );
}

function getBestScore(profile: PlayerProfile | undefined, gameKey: string): string {
  if (!profile) return '¡Aún no jugaste!';
  const score = profile.scores[gameKey];
  if (!score) return '¡Aún no jugaste!';
  return `Mejor: ${score.bestScore} pts`;
}

export function HubScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { profiles, activeProfileId, setActiveProfile, addProfile } = useProfileStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showCreator, setShowCreator] = useState(profiles.length === 0);
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  if (showCreator) {
    return (
      <ProfileCreator
        onDone={() => setShowCreator(false)}
      />
    );
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>🌍 GeoMundo</h1>
      <ProfileBar
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={() => setShowSwitcher(true)}
      />
      <div className={styles.gameList}>
        {GAMES.map((game) => (
          <div key={game.key} className={styles.gameCard}>
            <span className={styles.gameIcon}>{game.icon}</span>
            <div className={styles.gameInfo}>
              <p className={styles.gameTitle}>{game.title}</p>
              <p className={styles.gameDesc}>{game.description}</p>
              <p className={styles.gameBest}>{getBestScore(activeProfile, game.key)}</p>
            </div>
            <button
              className={['btn', styles.playButton].join(' ')}
              onClick={() => navigate(game.route)}
              type="button"
            >
              Jugar
            </button>
          </div>
        ))}
      </div>
      {showSwitcher && (
        <ProfileSwitcher
          profiles={profiles}
          onSelect={(id) => {
            setActiveProfile(id);
            setShowSwitcher(false);
          }}
          onAdd={() => {
            setShowSwitcher(false);
            setShowCreator(true);
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5.2 — Write the CSS**

```css
/* src/screens/HubScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 1.5rem 1rem 2rem;
  gap: 1rem;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
}

.profileBar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}

.activeAvatar { font-size: 1.4rem; }
.activeName { font-weight: 700; flex: 1; }
.switchButton {
  background: rgba(255,255,255,0.12);
  border: none;
  border-radius: 8px;
  color: #fff;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.gameList {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 0.5rem;
}

.gameCard {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.1);
}

.gameIcon { font-size: 2rem; flex-shrink: 0; }

.gameInfo { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.gameTitle { margin: 0; font-size: 0.95rem; font-weight: 700; }
.gameDesc  { margin: 0; font-size: 0.78rem; opacity: 0.6; }
.gameBest  { margin: 0; font-size: 0.78rem; color: #facc15; font-weight: 600; }

.playButton {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 10px;
  flex-shrink: 0;
}

/* Profile creator overlay */
.creatorOverlay, .switcherOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.creatorCard, .switcherCard {
  background: #1e1b4b;
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.creatorTitle, .switcherTitle {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
}

.nameInput {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}

.nameInput::placeholder { opacity: 0.4; }

.avatarLabel { margin: 0; font-size: 0.85rem; opacity: 0.7; text-align: center; }

.avatarGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.4rem;
}

.avatarOption {
  font-size: 1.6rem;
  background: rgba(255,255,255,0.07);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  padding: 0.25rem;
  aspect-ratio: 1;
}

.avatarSelected {
  border-color: #818cf8;
  background: rgba(129, 140, 248, 0.2);
}

.doneButton {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
}

.profileList { display: flex; flex-direction: column; gap: 0.5rem; }

.profileItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.07);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.profileAvatar { font-size: 1.5rem; }
.profileName { font-size: 1rem; font-weight: 600; }

.addProfile {
  background: none;
  border: 1.5px dashed rgba(255,255,255,0.3);
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  padding: 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
}
```

- [ ] **Step 5.3 — Update the router**

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';

import { App } from '@/App';
import { HubScreen } from '@/screens/HubScreen';
import { flagGameRoutes } from '@/modules/flag-game/routes';
// capital-cities and cultural-facts routes will be imported in Tasks 7 and 8

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HubScreen /> },
      flagGameRoutes,
    ],
  },
]);
```

- [ ] **Step 5.4 — Start dev server and verify the hub**

```bash
npm run dev
```

Navigate to `/`:
- First visit: profile creator appears (name input + avatar grid + "¡Listo!" button)
- After creating profile: hub shows title, profile bar, 3 game cards
- "Cambiar" opens profile switcher
- "Jugar" on the flag game card navigates to `/flag-game`

- [ ] **Step 5.5 — Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 5.6 — Commit**

```bash
git add src/screens/HubScreen.tsx src/screens/HubScreen.module.css src/router/index.tsx
git commit -m "feat: add hub screen and player profile UI"
```

---

## Task 6: Add `capital` to Flag Data

**Files:**
- Modify: `src/modules/flag-game/types.ts`
- Modify: `src/modules/flag-game/data/flags.ts`

- [ ] **Step 6.1 — Add `capital` to the `Flag` type**

In `src/modules/flag-game/types.ts`, add `capital: string` to the `Flag` interface:

```ts
export interface Flag {
  code: string;
  name: string;
  continent: Continent;
  hint: string;
  tier: Tier;
  pos: [lat: number, lng: number];
  capital: string;  // ← add this line
}
```

- [ ] **Step 6.2 — Run typecheck to see every Flag entry that needs a capital**

```bash
npm run typecheck
```

This will list every entry in `flags.ts` that is missing `capital`. Use these errors to guide filling in the data.

- [ ] **Step 6.3 — Add `capital` to every entry in `flags.ts`**

Add `capital: 'CityName'` to each of the 195 Flag objects in `src/modules/flag-game/data/flags.ts`. Use the following as a reference for tier-1 (Easy), tier-2 (Medium), and tier-3 (Hard) countries.

**Tier-1 entries (the 40 required for Easy difficulty — fill these first):**

| Country | Capital |
|---------|---------|
| Argentina | Buenos Aires |
| Bolivia | Sucre |
| Brasil | Brasilia |
| Canadá | Ottawa |
| Chile | Santiago |
| China | Pekín |
| Colombia | Bogotá |
| Cuba | La Habana |
| Egipto | El Cairo |
| España | Madrid |
| Estados Unidos | Washington D.C. |
| Francia | París |
| Alemania | Berlín |
| Grecia | Atenas |
| India | Nueva Delhi |
| Italia | Roma |
| Japón | Tokio |
| México | Ciudad de México |
| Países Bajos | Ámsterdam |
| Noruega | Oslo |
| Perú | Lima |
| Polonia | Varsovia |
| Portugal | Lisboa |
| Reino Unido | Londres |
| Rusia | Moscú |
| Arabia Saudita | Riad |
| Suecia | Estocolmo |
| Suiza | Berna |
| Turquía | Ankara |
| Australia | Canberra |
| Austria | Viena |
| Bélgica | Bruselas |
| Brasil | Brasilia |
| Corea del Sur | Seúl |
| Dinamarca | Copenhague |
| Finlandia | Helsinki |
| Indonesia | Yakarta |
| Irlanda | Dublín |
| Israel | Jerusalén |
| Nigeria | Abuya |
| Sudáfrica | Pretoria |
| Venezuela | Caracas |

Fill remaining tier-2 and tier-3 entries using a reliable reference (Wikipedia's list of capitals). Every entry must have a non-empty string.

- [ ] **Step 6.4 — Run typecheck to confirm zero errors**

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 6.5 — Run the full test suite**

```bash
npm run test:run
```

Expected: all tests pass (no flag-game tests should be affected since they mock data).

- [ ] **Step 6.6 — Commit**

```bash
git add src/modules/flag-game/types.ts src/modules/flag-game/data/flags.ts
git commit -m "feat: add capital city field to all 195 flag entries"
```

---

## Task 7: Capital Cities Module

**Files:**
- Create: `src/modules/capital-cities/types.ts`
- Create: `src/modules/capital-cities/data/capitals.ts`
- Create: `src/modules/capital-cities/hooks/useCapitalQuiz.ts`
- Create: `src/modules/capital-cities/hooks/useCapitalQuiz.test.ts`
- Create: `src/modules/capital-cities/screens/MenuScreen.tsx`
- Create: `src/modules/capital-cities/screens/MenuScreen.module.css`
- Create: `src/modules/capital-cities/screens/DifficultyScreen.tsx`
- Create: `src/modules/capital-cities/screens/CapitalPlayingScreen.tsx`
- Create: `src/modules/capital-cities/screens/CapitalPlayingScreen.module.css`
- Create: `src/modules/capital-cities/screens/CapitalResultsScreen.tsx`
- Create: `src/modules/capital-cities/screens/CapitalResultsScreen.module.css`
- Create: `src/modules/capital-cities/routes.tsx`
- Modify: `src/router/index.tsx`

- [ ] **Step 7.1 — Write the types**

```ts
// src/modules/capital-cities/types.ts
import type { DifficultyKey } from '@/shared/types';

export type { DifficultyKey };

export interface CapitalItem {
  id: string;       // flag.name
  flagCode: string;
  countryName: string;
  capital: string;
  continent: string;
  tier: number;
}
```

- [ ] **Step 7.2 — Write the data helper**

```ts
// src/modules/capital-cities/data/capitals.ts
import { FLAGS } from '@/modules/flag-game/data/flags';
import type { CapitalItem, DifficultyKey } from '../types';

const ALL_ITEMS: CapitalItem[] = FLAGS.map((f) => ({
  id: f.name,
  flagCode: f.code,
  countryName: f.name,
  capital: f.capital,
  continent: f.continent,
  tier: f.tier,
}));

const TIER_LIMITS: Record<DifficultyKey, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export function getCapitalItems(difficulty: DifficultyKey): CapitalItem[] {
  return ALL_ITEMS.filter((item) => item.tier <= TIER_LIMITS[difficulty]);
}

export function generateCapitalOptions(correct: CapitalItem, pool: CapitalItem[]): CapitalItem[] {
  const sameContinentWrong = pool.filter(
    (item) => item.id !== correct.id && item.continent === correct.continent,
  );
  const otherWrong = pool.filter(
    (item) => item.id !== correct.id && item.continent !== correct.continent,
  );

  const distractors = [...sameContinentWrong, ...otherWrong].slice(0, 3);
  const all = [correct, ...distractors];
  // shuffle
  return all.sort(() => Math.random() - 0.5);
}
```

- [ ] **Step 7.3 — Write failing hook tests**

```ts
// src/modules/capital-cities/hooks/useCapitalQuiz.test.ts
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCapitalQuiz } from './useCapitalQuiz';

describe('useCapitalQuiz', () => {
  it('starts with a current item and 4 options on easy difficulty', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'));
    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.score).toBe(0);
    expect(result.current.isFinished).toBe(false);
  });

  it('awards points for a correct answer', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'));
    act(() => { result.current.handleAnswer(result.current.correctId!); });
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.isCorrect).toBe(true);
  });

  it('exposes timeLeft as a number', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'));
    expect(typeof result.current.timeLeft).toBe('number');
    expect(result.current.timeLeft).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 7.4 — Run to confirm they fail**

```bash
npm run test:run -- src/modules/capital-cities/hooks/useCapitalQuiz.test.ts
```

Expected: fail.

- [ ] **Step 7.5 — Implement `useCapitalQuiz`**

```ts
// src/modules/capital-cities/hooks/useCapitalQuiz.ts
import { useNavigate } from 'react-router-dom';
import { useQuizSession } from '@/shared/quiz-engine/useQuizSession';
import { useQuizTimer } from '@/shared/quiz-engine/useQuizTimer';
import { getCapitalItems, generateCapitalOptions } from '../data/capitals';
import type { CapitalItem, DifficultyKey } from '../types';

const SECONDS_PER_ROUND: Record<DifficultyKey, number> = {
  easy: 20,
  medium: 15,
  hard: 10,
};

const POINTS_PER_CORRECT: Record<DifficultyKey, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export function useCapitalQuiz(difficulty: DifficultyKey) {
  const navigate = useNavigate();
  const session = useQuizSession<CapitalItem>({
    items: getCapitalItems(difficulty),
    toId: (item) => item.id,
    generateOptions: generateCapitalOptions,
    roundCount: 10,
    pointsPerCorrect: POINTS_PER_CORRECT[difficulty],
  });

  const seconds = SECONDS_PER_ROUND[difficulty];

  const timeLeft = useQuizTimer({
    seconds,
    resetKey: session.current?.id,
    paused: session.answered,
    onTimeout: session.handleTimeout,
  });

  function handleAnswerAndAdvance(id: string): void {
    session.handleAnswer(id);
    setTimeout(() => {
      const nextRound = session.round + 1;
      if (nextRound >= 10) {
        const finalScore = session.score + (id === session.correctId ? POINTS_PER_CORRECT[difficulty] : 0);
        sessionStorage.setItem('capital-final-score', String(finalScore));
        navigate('/capital-cities/solo/results');
      } else {
        session.nextRound();
      }
    }, 1600);
  }

  return { ...session, timeLeft, handleAnswer: handleAnswerAndAdvance, navigate };
}
```

- [ ] **Step 7.6 — Run hook tests to confirm they pass**

```bash
npm run test:run -- src/modules/capital-cities/hooks/useCapitalQuiz.test.ts
```

Expected: all 3 tests pass.

- [ ] **Step 7.7 — Implement the screens**

```tsx
// src/modules/capital-cities/screens/MenuScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MenuScreen.module.css';

export function CapitalMenuScreen(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🏛️</div>
      <h1 className={styles.title}>¿Cuál es la capital?</h1>
      <p className={styles.subtitle}>Capitales del mundo</p>
      <div className={styles.actions}>
        <button className={['btn', styles.playButton].join(' ')}
          onClick={() => navigate('/capital-cities/solo')} type="button">
          🎮 Jugar solo
        </button>
        <button className={styles.backButton}
          onClick={() => navigate('/')} type="button">
          ← Inicio
        </button>
      </div>
    </div>
  );
}
```

```css
/* src/modules/capital-cities/screens/MenuScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem 1rem;
  gap: 1rem;
  text-align: center;
}
.hero { font-size: 5rem; }
.title { font-size: 1.8rem; font-weight: 900; margin: 0; }
.subtitle { opacity: 0.65; margin: 0; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 280px; margin-top: 1rem; }
.playButton { padding: 0.9rem; font-size: 1.05rem; width: 100%; }
.backButton { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem; }
```

```tsx
// src/modules/capital-cities/screens/DifficultyScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DifficultyButton } from '@/modules/flag-game/components/DifficultyButton';
import { DIFFICULTY } from '@/modules/flag-game/data/constants';
import type { DifficultyKey } from '../types';

export function CapitalDifficultyScreen(): React.JSX.Element {
  const navigate = useNavigate();

  function handleSelect(key: DifficultyKey): void {
    sessionStorage.setItem('capital-difficulty', key);
    navigate('/capital-cities/solo/play');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100dvh', gap: '1rem', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '3rem' }}>🏛️</div>
      <h2 style={{ margin: 0, fontWeight: 900 }}>Elegí la dificultad</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '280px' }}>
        {(Object.keys(DIFFICULTY) as DifficultyKey[]).map((key, i) => (
          <DifficultyButton
            key={key}
            difficulty={key}
            label={DIFFICULTY[key].label}
            emoji={DIFFICULTY[key].emoji}
            delay={i * 0.1}
            onClick={() => handleSelect(key)}
          />
        ))}
      </div>
      <button onClick={() => navigate('/capital-cities')}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
        type="button">
        ← Volver
      </button>
    </div>
  );
}
```

```tsx
// src/modules/capital-cities/screens/CapitalPlayingScreen.tsx
import React from 'react';
import { QuizLayout } from '@/shared/quiz-engine/QuizLayout';
import { useCapitalQuiz } from '../hooks/useCapitalQuiz';
import type { DifficultyKey } from '../types';
import { TIMER_PCT_FULL } from '@/modules/flag-game/data/constants';
import styles from './CapitalPlayingScreen.module.css';

function getTimerColor(pct: number): string {
  if (pct > 50) return '#22c55e';
  if (pct > 25) return '#eab308';
  return '#ef4444';
}

function getFeedbackText(answered: boolean, isCorrect: boolean, correctCapital: string): string | null {
  if (!answered) return null;
  if (isCorrect) return '🎉 ¡Correcto!';
  return `❌ Era ${correctCapital}`;
}

export function CapitalPlayingScreen(): React.JSX.Element {
  const difficulty = (sessionStorage.getItem('capital-difficulty') ?? 'easy') as DifficultyKey;
  const state = useCapitalQuiz(difficulty);

  if (!state.current) return <div>Cargando...</div>;

  const seconds = { easy: 20, medium: 15, hard: 10 }[difficulty];
  const timerPct = (state.timeLeft / seconds) * TIMER_PCT_FULL;
  const options = state.options.map((item) => ({ id: item.id, label: item.capital }));
  const feedbackText = getFeedbackText(state.answered, state.isCorrect, state.current.capital);

  return (
    <QuizLayout
      questionSlot={
        <div className={styles.question}>
          <div className={styles.flagEmoji}>{state.current.flagCode}</div>
          <p className={styles.question_text}>¿Cuál es la capital de<br /><strong>{state.current.countryName}</strong>?</p>
        </div>
      }
      options={options}
      selectedId={state.selectedId}
      correctId={state.correctId!}
      onAnswer={state.handleAnswer}
      timerPct={timerPct}
      timerColor={getTimerColor(timerPct)}
      timerUrgent={state.timeLeft <= 5 && !state.answered}
      feedbackText={feedbackText}
      headerLeft={
        <>
          <button onClick={() => state.navigate('/capital-cities')}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
            type="button">🏠</button>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{state.round + 1}/10</span>
        </>
      }
      headerRight={
        <span style={{ fontWeight: 700 }}>{state.score} pts</span>
      }
    />
  );
}
```

```css
/* src/modules/capital-cities/screens/CapitalPlayingScreen.module.css */
.question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}
.flagEmoji { font-size: 4rem; }
.question_text { margin: 0; font-size: 1.05rem; line-height: 1.4; }
```

```tsx
// src/modules/capital-cities/screens/CapitalResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '@/shared/store/profileStore';
import styles from './CapitalResultsScreen.module.css';

interface CapitalResultsScreenProps {
  score: number;
  onPlayAgain: () => void;
}

// Score is passed via sessionStorage so the hook can be stateless
export function CapitalResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const score = parseInt(sessionStorage.getItem('capital-final-score') ?? '0', 10);
  const { recordScore } = useProfileStore();

  React.useEffect(() => {
    recordScore('capital-cities', score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trophy = score >= 200 ? '🏆' : score >= 100 ? '🌟' : '🏛️';

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>{trophy}</div>
      <h2 className={styles.score}>{score} pts</h2>
      <div className={styles.actions}>
        <button className={['btn', styles.primary].join(' ')}
          onClick={() => navigate('/capital-cities/solo')} type="button">
          🔄 De nuevo
        </button>
        <button className={['btn', styles.secondary].join(' ')}
          onClick={() => navigate('/')} type="button">
          🏠 Inicio
        </button>
      </div>
    </div>
  );
}
```

```css
/* src/modules/capital-cities/screens/CapitalResultsScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 1.25rem;
  padding: 2rem 1rem;
}
.trophy { font-size: 5rem; }
.score { font-size: 2.5rem; font-weight: 900; margin: 0; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 260px; }
.primary { padding: 0.9rem; }
.secondary { padding: 0.75rem; background: rgba(255,255,255,0.08); }
```

- [ ] **Step 7.8 — Define routes**

```tsx
// src/modules/capital-cities/routes.tsx
import React from 'react';
import { Route } from 'react-router-dom';
import { CapitalMenuScreen } from './screens/MenuScreen';
import { CapitalDifficultyScreen } from './screens/DifficultyScreen';
import { CapitalPlayingScreen } from './screens/CapitalPlayingScreen';
import { CapitalResultsScreen } from './screens/CapitalResultsScreen';

export const capitalCitiesRoutes = (
  <Route path="capital-cities">
    <Route index element={<CapitalMenuScreen />} />
    <Route path="solo" element={<CapitalDifficultyScreen />} />
    <Route path="solo/play" element={<CapitalPlayingScreen />} />
    <Route path="solo/results" element={<CapitalResultsScreen />} />
  </Route>
);
```

- [ ] **Step 7.9 — Register routes in the router**

In `src/router/index.tsx`, import and add `capitalCitiesRoutes`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { HubScreen } from '@/screens/HubScreen';
import { flagGameRoutes } from '@/modules/flag-game/routes';
import { capitalCitiesRoutes } from '@/modules/capital-cities/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HubScreen /> },
      flagGameRoutes,
      capitalCitiesRoutes,
    ],
  },
]);
```

- [ ] **Step 7.10 — Start dev server and manually verify the capital cities game**

```bash
npm run dev
```

Flow to test:
1. `/` → hub → "Jugar" on Capital Cities
2. `/capital-cities` → menu → "Jugar solo"
3. `/capital-cities/solo` → difficulty picker → pick Easy
4. `/capital-cities/solo/play` → flag + question + 4 city options → answer → feedback → auto-advance
5. After 10 rounds → `/capital-cities/solo/results` → score shown → "De nuevo" restarts, "Inicio" → hub
6. Hub now shows best score on the Capital Cities card

- [ ] **Step 7.11 — Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 7.12 — Commit**

```bash
git add src/modules/capital-cities/ src/router/index.tsx
git commit -m "feat: add capital cities quiz game"
```

---

## Task 8: Cultural Facts Module

**Files:**
- Create: `src/modules/cultural-facts/types.ts`
- Create: `src/modules/cultural-facts/data/facts.ts`
- Create: `src/modules/cultural-facts/hooks/useCulturalFactsQuiz.ts`
- Create: `src/modules/cultural-facts/hooks/useCulturalFactsQuiz.test.ts`
- Create: `src/modules/cultural-facts/screens/MenuScreen.tsx`
- Create: `src/modules/cultural-facts/screens/MenuScreen.module.css`
- Create: `src/modules/cultural-facts/screens/DifficultyScreen.tsx`
- Create: `src/modules/cultural-facts/screens/FactsPlayingScreen.tsx`
- Create: `src/modules/cultural-facts/screens/FactsPlayingScreen.module.css`
- Create: `src/modules/cultural-facts/screens/FactsResultsScreen.tsx`
- Create: `src/modules/cultural-facts/screens/FactsResultsScreen.module.css`
- Create: `src/modules/cultural-facts/routes.tsx`
- Modify: `src/router/index.tsx`

- [ ] **Step 8.1 — Write the types**

```ts
// src/modules/cultural-facts/types.ts
export type FactCategory = 'food' | 'festival' | 'instrument' | 'tradition';

export interface CulturalFact {
  id: string;           // countryName
  countryName: string;
  flagCode: string;
  fact: string;         // e.g. "El sushi"
  category: FactCategory;
  tier: 1 | 2;          // 1 = Easy (20 countries), 2 = Hard (all 40)
}
```

- [ ] **Step 8.2 — Write the facts data file**

```ts
// src/modules/cultural-facts/data/facts.ts
import type { CulturalFact } from '../types';

export const FACTS: CulturalFact[] = [
  // Tier 1 — Easy (20 most recognizable for Spanish-speaking kids 6–12)
  { id: 'Japón',          countryName: 'Japón',          flagCode: '🇯🇵', fact: 'El sushi',             category: 'food',       tier: 1 },
  { id: 'México',         countryName: 'México',         flagCode: '🇲🇽', fact: 'El Día de Muertos',     category: 'festival',   tier: 1 },
  { id: 'Brasil',         countryName: 'Brasil',         flagCode: '🇧🇷', fact: 'El carnaval',           category: 'festival',   tier: 1 },
  { id: 'India',          countryName: 'India',          flagCode: '🇮🇳', fact: 'El yoga',               category: 'tradition',  tier: 1 },
  { id: 'Francia',        countryName: 'Francia',        flagCode: '🇫🇷', fact: 'La baguette',           category: 'food',       tier: 1 },
  { id: 'Italia',         countryName: 'Italia',         flagCode: '🇮🇹', fact: 'La pizza',              category: 'food',       tier: 1 },
  { id: 'China',          countryName: 'China',          flagCode: '🇨🇳', fact: 'El año nuevo chino',    category: 'festival',   tier: 1 },
  { id: 'España',         countryName: 'España',         flagCode: '🇪🇸', fact: 'La corrida de toros',   category: 'tradition',  tier: 1 },
  { id: 'Argentina',      countryName: 'Argentina',      flagCode: '🇦🇷', fact: 'El tango',              category: 'tradition',  tier: 1 },
  { id: 'Escocia',        countryName: 'Escocia',        flagCode: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fact: 'La gaita',              category: 'instrument', tier: 1 },
  { id: 'Grecia',         countryName: 'Grecia',         flagCode: '🇬🇷', fact: 'El souvlaki',           category: 'food',       tier: 1 },
  { id: 'Perú',           countryName: 'Perú',           flagCode: '🇵🇪', fact: 'El ceviche',            category: 'food',       tier: 1 },
  { id: 'Colombia',       countryName: 'Colombia',       flagCode: '🇨🇴', fact: 'El vallenato',          category: 'instrument', tier: 1 },
  { id: 'Irlanda',        countryName: 'Irlanda',        flagCode: '🇮🇪', fact: 'El día de San Patricio', category: 'festival',  tier: 1 },
  { id: 'Alemania',       countryName: 'Alemania',       flagCode: '🇩🇪', fact: 'El Oktoberfest',        category: 'festival',   tier: 1 },
  { id: 'Australia',      countryName: 'Australia',      flagCode: '🇦🇺', fact: 'El boomerang',          category: 'tradition',  tier: 1 },
  { id: 'Tailandia',      countryName: 'Tailandia',      flagCode: '🇹🇭', fact: 'El Songkran',           category: 'festival',   tier: 1 },
  { id: 'Estados Unidos', countryName: 'Estados Unidos', flagCode: '🇺🇸', fact: 'El Día de Acción de Gracias', category: 'festival', tier: 1 },
  { id: 'Rusia',          countryName: 'Rusia',          flagCode: '🇷🇺', fact: 'La matrioshka',         category: 'tradition',  tier: 1 },
  { id: 'Cuba',           countryName: 'Cuba',           flagCode: '🇨🇺', fact: 'La salsa',              category: 'tradition',  tier: 1 },
  // Tier 2 — Hard (additional 20)
  { id: 'Kenia',          countryName: 'Kenia',          flagCode: '🇰🇪', fact: 'La maratón de Nairobi', category: 'tradition',  tier: 2 },
  { id: 'Egipto',         countryName: 'Egipto',         flagCode: '🇪🇬', fact: 'Las pirámides',         category: 'tradition',  tier: 2 },
  { id: 'Marruecos',      countryName: 'Marruecos',      flagCode: '🇲🇦', fact: 'El tagine',             category: 'food',       tier: 2 },
  { id: 'Nigeria',        countryName: 'Nigeria',        flagCode: '🇳🇬', fact: 'El afrobeat',           category: 'instrument', tier: 2 },
  { id: 'Corea del Sur',  countryName: 'Corea del Sur',  flagCode: '🇰🇷', fact: 'El kimchi',             category: 'food',       tier: 2 },
  { id: 'Vietnam',        countryName: 'Vietnam',        flagCode: '🇻🇳', fact: 'El pho',                category: 'food',       tier: 2 },
  { id: 'Portugal',       countryName: 'Portugal',       flagCode: '🇵🇹', fact: 'El fado',               category: 'instrument', tier: 2 },
  { id: 'Turquía',        countryName: 'Turquía',        flagCode: '🇹🇷', fact: 'El baile del vientre',  category: 'tradition',  tier: 2 },
  { id: 'Holanda',        countryName: 'Holanda',        flagCode: '🇳🇱', fact: 'Los tulipanes',         category: 'tradition',  tier: 2 },
  { id: 'Suecia',         countryName: 'Suecia',         flagCode: '🇸🇪', fact: 'El midsommar',          category: 'festival',   tier: 2 },
  { id: 'Bolivia',        countryName: 'Bolivia',        flagCode: '🇧🇴', fact: 'El carnaval de Oruro',  category: 'festival',   tier: 2 },
  { id: 'Venezuela',      countryName: 'Venezuela',      flagCode: '🇻🇪', fact: 'El joropo',             category: 'instrument', tier: 2 },
  { id: 'Chile',          countryName: 'Chile',          flagCode: '🇨🇱', fact: 'La cueca',              category: 'tradition',  tier: 2 },
  { id: 'Jamaica',        countryName: 'Jamaica',        flagCode: '🇯🇲', fact: 'El reggae',             category: 'instrument', tier: 2 },
  { id: 'Polonia',        countryName: 'Polonia',        flagCode: '🇵🇱', fact: 'La mazurca',            category: 'tradition',  tier: 2 },
  { id: 'Brasil (Capoeira)', countryName: 'Brasil',      flagCode: '🇧🇷', fact: 'La capoeira',           category: 'tradition',  tier: 2 },
  { id: 'Etiopía',        countryName: 'Etiopía',        flagCode: '🇪🇹', fact: 'El injera',             category: 'food',       tier: 2 },
  { id: 'Filipinas',      countryName: 'Filipinas',      flagCode: '🇵🇭', fact: 'El sinulog',            category: 'festival',   tier: 2 },
  { id: 'Nepal',          countryName: 'Nepal',          flagCode: '🇳🇵', fact: 'El festival Dashain',   category: 'festival',   tier: 2 },
  { id: 'Uruguay',        countryName: 'Uruguay',        flagCode: '🇺🇾', fact: 'El candombe',           category: 'tradition',  tier: 2 },
];

export function getFactItems(difficulty: 'easy' | 'hard'): CulturalFact[] {
  return difficulty === 'easy' ? FACTS.filter((f) => f.tier === 1) : FACTS;
}

export function generateFactOptions(correct: CulturalFact, pool: CulturalFact[]): CulturalFact[] {
  const sameCategoryWrong = pool.filter(
    (item) => item.id !== correct.id && item.category === correct.category,
  );
  const otherWrong = pool.filter(
    (item) => item.id !== correct.id && item.category !== correct.category,
  );
  const distractors = [...sameCategoryWrong, ...otherWrong].slice(0, 3);
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
}
```

- [ ] **Step 8.3 — Write failing hook tests**

```ts
// src/modules/cultural-facts/hooks/useCulturalFactsQuiz.test.ts
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCulturalFactsQuiz } from './useCulturalFactsQuiz';

describe('useCulturalFactsQuiz', () => {
  it('starts with a current fact and 4 options on easy', () => {
    const { result } = renderHook(() => useCulturalFactsQuiz('easy'));
    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.score).toBe(0);
  });

  it('awards points for a correct answer', () => {
    const { result } = renderHook(() => useCulturalFactsQuiz('easy'));
    act(() => { result.current.handleAnswer(result.current.correctId!); });
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.isCorrect).toBe(true);
  });
});
```

- [ ] **Step 8.4 — Run to confirm they fail**

```bash
npm run test:run -- src/modules/cultural-facts/hooks/useCulturalFactsQuiz.test.ts
```

- [ ] **Step 8.5 — Implement `useCulturalFactsQuiz`**

```ts
// src/modules/cultural-facts/hooks/useCulturalFactsQuiz.ts
import { useNavigate } from 'react-router-dom';
import { useQuizSession } from '@/shared/quiz-engine/useQuizSession';
import { useQuizTimer } from '@/shared/quiz-engine/useQuizTimer';
import { getFactItems, generateFactOptions } from '../data/facts';
import type { CulturalFact } from '../types';

export function useCulturalFactsQuiz(difficulty: 'easy' | 'hard') {
  const navigate = useNavigate();
  const roundCount = difficulty === 'easy' ? 10 : 10;
  const points = difficulty === 'easy' ? 10 : 20;
  const seconds = difficulty === 'easy' ? 20 : 15;

  const session = useQuizSession<CulturalFact>({
    items: getFactItems(difficulty),
    toId: (item) => item.id,
    generateOptions: generateFactOptions,
    roundCount,
    pointsPerCorrect: points,
  });

  const timeLeft = useQuizTimer({
    seconds,
    resetKey: session.current?.id,
    paused: session.answered,
    onTimeout: session.handleTimeout,
  });

  function handleAnswerAndAdvance(id: string): void {
    session.handleAnswer(id);
    setTimeout(() => {
      const nextRound = session.round + 1;
      if (nextRound >= roundCount) {
        const finalScore = session.score + (id === session.correctId ? points : 0);
        sessionStorage.setItem('facts-final-score', String(finalScore));
        navigate('/cultural-facts/solo/results');
      } else {
        session.nextRound();
      }
    }, 1600);
  }

  return { ...session, timeLeft, handleAnswer: handleAnswerAndAdvance, navigate };
}
```

- [ ] **Step 8.6 — Run hook tests to confirm they pass**

```bash
npm run test:run -- src/modules/cultural-facts/hooks/useCulturalFactsQuiz.test.ts
```

- [ ] **Step 8.7 — Implement the screens**

```tsx
// src/modules/cultural-facts/screens/MenuScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MenuScreen.module.css';

export function FactsMenuScreen(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🌍</div>
      <h1 className={styles.title}>¿Cuánto sabés del mundo?</h1>
      <p className={styles.subtitle}>Tradiciones y culturas</p>
      <div className={styles.actions}>
        <button className={['btn', styles.playButton].join(' ')}
          onClick={() => navigate('/cultural-facts/solo')} type="button">
          🎮 Jugar solo
        </button>
        <button className={styles.backButton}
          onClick={() => navigate('/')} type="button">
          ← Inicio
        </button>
      </div>
    </div>
  );
}
```

```css
/* src/modules/cultural-facts/screens/MenuScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem 1rem;
  gap: 1rem;
  text-align: center;
}
.hero { font-size: 5rem; }
.title { font-size: 1.6rem; font-weight: 900; margin: 0; }
.subtitle { opacity: 0.65; margin: 0; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 280px; margin-top: 1rem; }
.playButton { padding: 0.9rem; font-size: 1.05rem; width: 100%; }
.backButton { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem; }
```

```tsx
// src/modules/cultural-facts/screens/DifficultyScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FactsDifficultyScreen(): React.JSX.Element {
  const navigate = useNavigate();
  function pick(d: 'easy' | 'hard'): void {
    sessionStorage.setItem('facts-difficulty', d);
    navigate('/cultural-facts/solo/play');
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100dvh', gap: '1rem', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '3rem' }}>🌍</div>
      <h2 style={{ margin: 0, fontWeight: 900 }}>Elegí la dificultad</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: '280px' }}>
        <button className="btn" onClick={() => pick('easy')} type="button"
          style={{ padding: '0.9rem', fontSize: '1rem' }}>
          😊 Fácil — 20 países
        </button>
        <button className="btn" onClick={() => pick('hard')} type="button"
          style={{ padding: '0.9rem', fontSize: '1rem' }}>
          🧠 Difícil — 40 países
        </button>
      </div>
      <button onClick={() => navigate('/cultural-facts')}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
        type="button">
        ← Volver
      </button>
    </div>
  );
}
```

```tsx
// src/modules/cultural-facts/screens/FactsPlayingScreen.tsx
import React from 'react';
import { QuizLayout } from '@/shared/quiz-engine/QuizLayout';
import { useCulturalFactsQuiz } from '../hooks/useCulturalFactsQuiz';
import { TIMER_PCT_FULL } from '@/modules/flag-game/data/constants';
import styles from './FactsPlayingScreen.module.css';

function getTimerColor(pct: number): string {
  if (pct > 50) return '#22c55e';
  if (pct > 25) return '#eab308';
  return '#ef4444';
}

export function FactsPlayingScreen(): React.JSX.Element {
  const difficulty = (sessionStorage.getItem('facts-difficulty') ?? 'easy') as 'easy' | 'hard';
  const state = useCulturalFactsQuiz(difficulty);

  if (!state.current) return <div>Cargando...</div>;

  const seconds = difficulty === 'easy' ? 20 : 15;
  const timerPct = (state.timeLeft / seconds) * TIMER_PCT_FULL;
  const options = state.options.map((item) => ({ id: item.id, label: item.fact }));
  const feedbackText = state.answered
    ? state.isCorrect
      ? '🎉 ¡Correcto!'
      : `❌ Era ${state.current.fact}`
    : null;

  return (
    <QuizLayout
      questionSlot={
        <div className={styles.question}>
          <div className={styles.flagEmoji}>{state.current.flagCode}</div>
          <p className={styles.questionText}>
            ¿Qué es típico de<br /><strong>{state.current.countryName}</strong>?
          </p>
        </div>
      }
      options={options}
      selectedId={state.selectedId}
      correctId={state.correctId!}
      onAnswer={state.handleAnswer}
      timerPct={timerPct}
      timerColor={getTimerColor(timerPct)}
      timerUrgent={state.timeLeft <= 5 && !state.answered}
      feedbackText={feedbackText}
      headerLeft={
        <>
          <button onClick={() => state.navigate('/cultural-facts')}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
            type="button">🏠</button>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{state.round + 1}/10</span>
        </>
      }
      headerRight={
        <span style={{ fontWeight: 700 }}>{state.score} pts</span>
      }
    />
  );
}
```

```css
/* src/modules/cultural-facts/screens/FactsPlayingScreen.module.css */
.question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}
.flagEmoji { font-size: 4rem; }
.questionText { margin: 0; font-size: 1.05rem; line-height: 1.4; }
```

```tsx
// src/modules/cultural-facts/screens/FactsResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '@/shared/store/profileStore';
import styles from './FactsResultsScreen.module.css';

export function FactsResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const score = parseInt(sessionStorage.getItem('facts-final-score') ?? '0', 10);
  const { recordScore } = useProfileStore();

  React.useEffect(() => {
    recordScore('cultural-facts', score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trophy = score >= 160 ? '🏆' : score >= 80 ? '🌟' : '🌍';

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>{trophy}</div>
      <h2 className={styles.score}>{score} pts</h2>
      <div className={styles.actions}>
        <button className={['btn', styles.primary].join(' ')}
          onClick={() => navigate('/cultural-facts/solo')} type="button">
          🔄 De nuevo
        </button>
        <button className={['btn', styles.secondary].join(' ')}
          onClick={() => navigate('/')} type="button">
          🏠 Inicio
        </button>
      </div>
    </div>
  );
}
```

```css
/* src/modules/cultural-facts/screens/FactsResultsScreen.module.css */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 1.25rem;
  padding: 2rem 1rem;
}
.trophy { font-size: 5rem; }
.score { font-size: 2.5rem; font-weight: 900; margin: 0; }
.actions { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 260px; }
.primary { padding: 0.9rem; }
.secondary { padding: 0.75rem; background: rgba(255,255,255,0.08); }
```

- [ ] **Step 8.8 — Define routes**

```tsx
// src/modules/cultural-facts/routes.tsx
import React from 'react';
import { Route } from 'react-router-dom';
import { FactsMenuScreen } from './screens/MenuScreen';
import { FactsDifficultyScreen } from './screens/DifficultyScreen';
import { FactsPlayingScreen } from './screens/FactsPlayingScreen';
import { FactsResultsScreen } from './screens/FactsResultsScreen';

export const culturalFactsRoutes = (
  <Route path="cultural-facts">
    <Route index element={<FactsMenuScreen />} />
    <Route path="solo" element={<FactsDifficultyScreen />} />
    <Route path="solo/play" element={<FactsPlayingScreen />} />
    <Route path="solo/results" element={<FactsResultsScreen />} />
  </Route>
);
```

- [ ] **Step 8.9 — Register routes in the router**

In `src/router/index.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { HubScreen } from '@/screens/HubScreen';
import { flagGameRoutes } from '@/modules/flag-game/routes';
import { capitalCitiesRoutes } from '@/modules/capital-cities/routes';
import { culturalFactsRoutes } from '@/modules/cultural-facts/routes';

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
```

- [ ] **Step 8.10 — Start dev server and manually verify the cultural facts game**

```bash
npm run dev
```

Flow to test:
1. Hub → "Jugar" on Cultural Facts
2. Menu → "Jugar solo" → difficulty (Easy / Hard)
3. Playing screen: flag + "¿Qué es típico de [País]?" + 4 fact options
4. Answer → correct/wrong feedback → auto-advance → after 10 rounds → results
5. Results screen shows score, trophy; "Inicio" → hub with updated best score

- [ ] **Step 8.11 — Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 8.12 — Commit**

```bash
git add src/modules/cultural-facts/ src/router/index.tsx
git commit -m "feat: add cultural facts quiz game"
```

---

## Task 9: Wire Flag Game Score to Profile Store

The flag game's `ResultsScreen` needs to call `recordScore('flag-game', score)` when solo mode ends.

**Files:**
- Modify: `src/modules/flag-game/screens/ResultsScreen.tsx`

- [ ] **Step 9.1 — Update `ResultsScreen`**

Add the `useEffect` that records the score. The score is already available from `useGameStore`.

```tsx
// src/modules/flag-game/screens/ResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useProfileStore } from '@/shared/store/profileStore';
import {
  SOLO_R,
  TROPHY_GOLD_SCORE,
  TROPHY_SILVER_SCORE,
  RESULT_ROW_ANIM_BASE,
  RESULT_ROW_ANIM_STEP,
} from '../data/constants';

import styles from './ResultsScreen.module.css';

export function ResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { score, roundHistory, bestStreak, difficulty, startSolo } = useGameStore();
  const { recordScore } = useProfileStore();

  React.useEffect(() => {
    recordScore('flag-game', score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRestart(): void {
    if (difficulty) {
      startSolo(difficulty);
      navigate('/flag-game/solo/play');
    }
  }

  const trophy = score > TROPHY_GOLD_SCORE ? '🏆' : score > TROPHY_SILVER_SCORE ? '🌟' : '🌍';

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>{trophy}</div>
      <h2 className={styles.title}>{score} pts</h2>
      <p className={styles.summary}>
        {roundHistory.filter((result) => result.correct).length}/{SOLO_R} · 🔥{bestStreak}
      </p>
      {roundHistory.length > 0 && (
        <div className={styles.historyCard}>
          {roundHistory.map((result, i) => (
            <div
              className={styles.resultRow}
              key={i}
              style={{ '--row-delay': `${RESULT_ROW_ANIM_BASE + i * RESULT_ROW_ANIM_STEP}s` } as React.CSSProperties}
            >
              <span className={styles.flag}>{result.flag.code}</span>
              <span className={styles.resultName}>{result.flag.name}</span>
              <span>{result.correct ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.actions}>
        <button className={['btn', styles.primaryButton].join(' ')} onClick={handleRestart} type="button">
          🔄 De nuevo
        </button>
        <button className={['btn', styles.secondaryButton].join(' ')}
          onClick={() => navigate('/')} type="button">
          🏠 Inicio
        </button>
      </div>
    </div>
  );
}
```

Note: the "🏠 Menú" button now navigates to `/` (hub) instead of `/flag-game`.

- [ ] **Step 9.2 — Run full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 9.3 — Start dev server, play a solo flag game and confirm score appears on hub**

```bash
npm run dev
```

1. Complete a solo flag game
2. Results screen shows score and "🏠 Inicio"
3. Navigate to hub (`/`) — "¿Qué bandera es?" card shows "Mejor: X pts"

- [ ] **Step 9.4 — Run typecheck**

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 9.5 — Commit**

```bash
git add src/modules/flag-game/screens/ResultsScreen.tsx
git commit -m "feat: record flag game score to player profile on session end"
```

---

## Done

All tasks complete. The app is now:
- A unified hub at `/` with player profiles stored in `localStorage`
- Three playable games: flag quiz, capital cities, cultural facts
- Scores tracked per player per game, shown on hub cards
- Shared quiz engine (`useQuizSession`, `QuizLayout`, `useQuizTimer`) ready for future games
