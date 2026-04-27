# Duel UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three UX issues in duel mode: upside-down flag for Player 2, excessive center-strip height on small devices, and both players appearing correct after a round ends.

**Architecture:** Surgical changes across five files — move the flag card from the shared center strip into each player's section (fixing orientation and freeing vertical space), and add a `revealed` state to `OptionButton` so the loser sees a red ✗ on the correct answer instead of a green ✓.

**Tech Stack:** React 18, TypeScript, Vitest + React Testing Library, CSS Modules

---

## File Map

| File | Change |
|------|--------|
| `src/modules/flag-game/components/OptionButton.tsx` | Add `isLoser` prop; add `'revealed'` to `OptionState`; update `getOptionState`, `getStateClassName`, `getBadgeLabel` |
| `src/modules/flag-game/components/OptionButton.module.css` | Add `.revealed` class |
| `src/modules/flag-game/hooks/useDuelPlayingState.ts` | Add `isLoser: boolean` to `DuelPlayerPanelState`; compute in `buildDuelPlayerPanels` |
| `src/modules/flag-game/components/game/DuelPlayingLayout.tsx` | Add `isLoser` to local `DuelPlayerPanelState`; move `flagCard` into `renderPlayerSection`; remove `currentFlag` from `CenterProps`; pass `isLoser` to `OptionButton` |
| `src/modules/flag-game/screens/DuelPlayingScreen.module.css` | Slim `.centerSection` (padding + gap); reduce `.flagEmoji` font-size |

---

### Task 1: Write failing tests for `OptionButton` revealed state

**Files:**
- Create: `src/modules/flag-game/components/OptionButton.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { OptionButton } from './OptionButton';
import type { Flag } from '../types';

const flag = (name: string): Flag => ({ name, code: '🏴', continent: 'Europe' });

describe('OptionButton — revealed state', () => {
  it('data-state is "revealed" when player is loser and option is the correct answer', () => {
    const correctFlag = flag('France');
    render(
      <OptionButton
        currentFlag={correctFlag}
        index={0}
        isLoser={true}
        onAnswer={vi.fn()}
        opt={correctFlag}
        selected={correctFlag}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'revealed');
  });

  it('data-state is "correct" when player is winner and option is the correct answer', () => {
    const correctFlag = flag('France');
    render(
      <OptionButton
        currentFlag={correctFlag}
        index={0}
        isLoser={false}
        onAnswer={vi.fn()}
        opt={correctFlag}
        selected={correctFlag}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'correct');
  });

  it('badge shows ✗ for revealed option', () => {
    const correctFlag = flag('France');
    render(
      <OptionButton
        currentFlag={correctFlag}
        index={0}
        isLoser={true}
        onAnswer={vi.fn()}
        opt={correctFlag}
        selected={correctFlag}
      />,
    );
    expect(screen.getByRole('button')).toHaveTextContent('✗');
  });

  it('data-state is "wrong" for the wrong option regardless of isLoser', () => {
    const correctFlag = flag('France');
    const wrongFlag = flag('Germany');
    render(
      <OptionButton
        currentFlag={correctFlag}
        index={1}
        isLoser={true}
        onAnswer={vi.fn()}
        opt={wrongFlag}
        selected={wrongFlag}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'wrong');
  });

  it('data-state is "default" before any selection', () => {
    const correctFlag = flag('France');
    render(
      <OptionButton
        currentFlag={correctFlag}
        index={0}
        isLoser={false}
        onAnswer={vi.fn()}
        opt={correctFlag}
        selected={null}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'default');
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail (TypeScript error: `isLoser` prop not yet defined)**

```bash
npx vitest run src/modules/flag-game/components/OptionButton.test.tsx
```

Expected: compilation error — `isLoser` does not exist on `OptionButtonProps`

---

### Task 2: Implement `revealed` state in `OptionButton.tsx` + `.module.css`

**Files:**
- Modify: `src/modules/flag-game/components/OptionButton.tsx`
- Modify: `src/modules/flag-game/components/OptionButton.module.css`

- [ ] **Step 1: Replace the full contents of `OptionButton.tsx`**

```tsx
import React from 'react';

import {
  OPTION_ANIM_BASE_DELAY,
  OPTION_ANIM_STEP_DELAY,
  OPTION_FADE_OPACITY,
  CHAR_CODE_A,
} from '../data/constants';
import type { Flag } from '../types';

import styles from './OptionButton.module.css';

interface OptionButtonProps {
  opt: Flag;
  index: number;
  isLoser: boolean;
  selected: Flag | null;
  currentFlag: Flag;
  onAnswer: (opt: Flag) => void;
}

type OptionState = 'correct' | 'wrong' | 'revealed' | 'dimmed' | 'default';

function getOptionState(
  selected: Flag | null,
  option: Flag,
  currentFlag: Flag,
  isLoser: boolean,
): OptionState {
  if (!selected) return 'default';
  if (option.name === currentFlag.name) return isLoser ? 'revealed' : 'correct';
  return selected.name === option.name ? 'wrong' : 'dimmed';
}

function getStateClassName(state: OptionState): string {
  switch (state) {
    case 'correct':
      return styles.correct;
    case 'wrong':
      return styles.wrong;
    case 'revealed':
      return styles.revealed;
    case 'dimmed':
      return styles.dimmed;
    default:
      return '';
  }
}

function getBadgeLabel(state: OptionState, index: number): string {
  if (state === 'correct') return '✓';
  if (state === 'wrong' || state === 'revealed') return '✗';
  return String.fromCharCode(CHAR_CODE_A + index);
}

export function OptionButton({
  opt,
  index,
  isLoser,
  selected,
  currentFlag,
  onAnswer,
}: OptionButtonProps): React.JSX.Element {
  const state = getOptionState(selected, opt, currentFlag, isLoser);
  const stateClassName = getStateClassName(state);
  const buttonClassName = ['btn', styles.button, stateClassName].filter(Boolean).join(' ');
  const badgeClassName = [
    styles.badge,
    state === 'correct' ? styles.badgeCorrect : '',
    state === 'wrong' || state === 'revealed' ? styles.badgeWrong : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClassName}
      data-state={state}
      onClick={() => onAnswer(opt)}
      disabled={selected !== null}
      style={
        {
          '--item-delay': `${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s`,
          '--option-fade-opacity': OPTION_FADE_OPACITY,
        } as React.CSSProperties
      }
      type="button"
    >
      <span className={badgeClassName}>{getBadgeLabel(state, index)}</span>
      {opt.name}
    </button>
  );
}
```

- [ ] **Step 2: Add `.revealed` class to `OptionButton.module.css`**

Append after the `.dimmed` rule (line 22):

```css
.revealed {
  background: rgba(239, 68, 68, 0.18);
  border-color: #ef4444;
}
```

- [ ] **Step 3: Run the tests — expect all 5 to pass**

```bash
npx vitest run src/modules/flag-game/components/OptionButton.test.tsx
```

Expected output:
```
 ✓ OptionButton — revealed state (5 tests)
 Test Files  1 passed (1)
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/flag-game/components/OptionButton.tsx \
        src/modules/flag-game/components/OptionButton.module.css \
        src/modules/flag-game/components/OptionButton.test.tsx
git commit -m "feat: add revealed state to OptionButton for duel loser UX"
```

---

### Task 3: Add `isLoser` to `useDuelPlayingState.ts`

**Files:**
- Modify: `src/modules/flag-game/hooks/useDuelPlayingState.ts:38-41` (interface) and `:130-141` (buildDuelPlayerPanels map)

- [ ] **Step 1: Add `isLoser` to the `DuelPlayerPanelState` interface (line 38)**

Replace:
```ts
interface DuelPlayerPanelState {
  feedbackText: string | null;
  onAnswer: (flag: Flag) => void;
  player: Player;
  score: number;
  selected: Flag | null;
}
```

With:
```ts
interface DuelPlayerPanelState {
  feedbackText: string | null;
  isLoser: boolean;
  onAnswer: (flag: Flag) => void;
  player: Player;
  score: number;
  selected: Flag | null;
}
```

- [ ] **Step 2: Compute `isLoser` in `buildDuelPlayerPanels` (inside the `.map` callback)**

Replace the return object inside `duelPlayers.map(...)` (line 130):
```ts
  return duelPlayers.map((player) => ({
    feedbackText: getPlayerFeedback(
      player.id,
      duelResolution,
      duelAnsweringPlayerId,
      duelResolvedBy,
    ),
    onAnswer: (flag: Flag) => {
```

With:
```ts
  return duelPlayers.map((player) => ({
    feedbackText: getPlayerFeedback(
      player.id,
      duelResolution,
      duelAnsweringPlayerId,
      duelResolvedBy,
    ),
    isLoser: duelResolution !== null && duelResolution !== 'timeout' && player.id !== duelResolvedBy,
    onAnswer: (flag: Flag) => {
```

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests pass (TypeScript will surface any type mismatch with `DuelPlayingLayout.tsx` as an error before the next step).

- [ ] **Step 4: Commit**

```bash
git add src/modules/flag-game/hooks/useDuelPlayingState.ts
git commit -m "feat: compute isLoser in duel player panels state"
```

---

### Task 4: Update `DuelPlayingLayout.tsx` — move flag, sync interface, pass `isLoser`

**Files:**
- Modify: `src/modules/flag-game/components/game/DuelPlayingLayout.tsx`

- [ ] **Step 1: Replace the full file contents**

```tsx
import React from 'react';

import { OptionButton } from '../OptionButton';
import type { Flag, Player } from '../../types';

interface DuelPlayerPanelState {
  feedbackText: string | null;
  isLoser: boolean;
  onAnswer: (flag: Flag) => void;
  player: Player;
  score: number;
  selected: Flag | null;
}

interface DuelPlayingLayoutProps {
  currentFlag: Flag;
  onQuit: () => void;
  options: Flag[];
  playerPanels: DuelPlayerPanelState[];
  roundLabel: string;
  styles: Record<string, string>;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

interface CenterProps {
  onQuit: () => void;
  roundLabel: string;
  styles: Record<string, string>;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

// isTop=true → Player 2: DOM [header, flagCard, grid], rotated 180° so grid appears at physical top
// isTop=false → Player 1: DOM [flagCard, grid, header], normal orientation
function renderPlayerSection(
  panel: DuelPlayerPanelState,
  options: Flag[],
  currentFlag: Flag,
  isTop: boolean,
  styles: Record<string, string>,
): React.JSX.Element {
  const header = (
    <header className={styles.playerHeader}>
      <span className={styles.playerAvatar}>{panel.player.avatar}</span>
      <div className={styles.playerMeta}>
        <div className={styles.playerName}>{panel.player.name}</div>
        <div className={styles.playerScore}>{panel.score} pts</div>
      </div>
      {panel.feedbackText ? <div className={styles.feedback}>{panel.feedbackText}</div> : null}
    </header>
  );

  const flagCard = (
    <div className={styles.flagCard}>
      <div className={styles.flagEmoji}>{currentFlag.code}</div>
      <div className={styles.flagMeta}>{currentFlag.continent}</div>
    </div>
  );

  const grid = (
    <div className={styles.answerGrid}>
      {options.map((option, index) => (
        <OptionButton
          key={`${panel.player.id}-${option.name}`}
          currentFlag={currentFlag}
          index={index}
          isLoser={panel.isLoser}
          onAnswer={panel.onAnswer}
          opt={option}
          selected={panel.selected}
        />
      ))}
    </div>
  );

  return (
    <section
      className={[
        styles.playerSection,
        isTop ? styles.playerSectionTop : styles.playerSectionBottom,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--player-color': panel.player.color } as React.CSSProperties}
    >
      {isTop ? (
        <>
          {header}
          {flagCard}
          {grid}
        </>
      ) : (
        <>
          {flagCard}
          {grid}
          {header}
        </>
      )}
    </section>
  );
}

function renderCenterSection({
  onQuit,
  roundLabel,
  styles,
  timeLeft,
  timerColor,
  timerPct,
  timerUrgent,
}: CenterProps): React.JSX.Element {
  return (
    <div className={styles.centerSection}>
      <div className={styles.centerBar}>
        <span className={styles.roundLabel}>RONDA {roundLabel}</span>
        <span className={styles.timerValue}>{timeLeft}s</span>
        <button className={styles.quitBtn} onClick={onQuit} type="button">
          ✕
        </button>
      </div>
      <div className={styles.timerTrack}>
        <div
          className={[styles.timerFill, timerUrgent ? styles.timerUrgent : '']
            .filter(Boolean)
            .join(' ')}
          style={
            { '--timer-width': `${timerPct}%`, '--timer-color': timerColor } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

export function DuelPlayingLayout({
  currentFlag,
  onQuit,
  options,
  playerPanels,
  roundLabel,
  styles,
  timeLeft,
  timerColor,
  timerPct,
  timerUrgent,
}: DuelPlayingLayoutProps): React.JSX.Element {
  const [p1, p2] = playerPanels;

  return (
    <div className={styles.screen}>
      {renderPlayerSection(p2, options, currentFlag, true, styles)}
      {renderCenterSection({
        onQuit,
        roundLabel,
        styles,
        timeLeft,
        timerColor,
        timerPct,
        timerUrgent,
      })}
      {renderPlayerSection(p1, options, currentFlag, false, styles)}
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/modules/flag-game/components/game/DuelPlayingLayout.tsx
git commit -m "feat: move flag card into player sections and wire isLoser to OptionButton"
```

---

### Task 5: Slim the center strip and resize the flag emoji in `DuelPlayingScreen.module.css`

**Files:**
- Modify: `src/modules/flag-game/screens/DuelPlayingScreen.module.css`

- [ ] **Step 1: Slim `.centerSection` — reduce `gap` and `padding`**

Replace (lines 94–103):
```css
.centerSection {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 16px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.6);
}
```

With:
```css
.centerSection {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 16px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.6);
}
```

- [ ] **Step 2: Reduce `.flagEmoji` font-size**

Replace (lines 146–148):
```css
.flagEmoji {
  font-size: clamp(40px, 8vw, 60px);
  line-height: 1;
}
```

With:
```css
.flagEmoji {
  font-size: clamp(28px, 6vw, 40px);
  line-height: 1;
}
```

- [ ] **Step 3: Run the full test suite one final time**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 4: Manual verification checklist**

Start the dev server (`npm run dev`) and open a duel game:
- [ ] P1 (bottom): flag card appears above the answer grid, readable normally ✓
- [ ] P2 (top, rotated): flag card appears above P2's answer grid from their perspective (between header and grid in DOM order), readable correctly — not upside-down ✓
- [ ] Center strip is visibly shorter — answer grids no longer clipped on a small viewport ✓
- [ ] When P1 answers correctly: P1's grid shows green ✓ on the correct answer; P2's grid shows red ✗ on the correct answer ✓
- [ ] When P2 answers correctly: P2's grid shows green ✓; P1's grid shows red ✗ ✓
- [ ] On timeout: both grids show green ✓ on the correct answer (timeout is not a loss) ✓

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/screens/DuelPlayingScreen.module.css
git commit -m "fix: slim center strip and resize flag emoji for player-section placement"
```
