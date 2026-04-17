# Component Refactoring Design

**Date:** 2026-04-17  
**Goal:** Improve code quality by decomposing large screen components into focused, reusable sub-components. Eliminate all 48 ESLint `max-lines-per-function` and complexity warnings as a side effect.

---

## Context

TypeScript compiles clean. ESLint has 48 remaining warnings (0 errors), all `max-lines-per-function` violations on screen components. The three playing screens are the worst offenders: 249–278 lines per function, cyclomatic complexity 22–26. The project already uses component extraction patterns (effects folder, ContinentPicker, OptionButton, MobileMap) — this refactor extends that pattern consistently.

**Approach chosen:** Screen-first decomposition (Approach A). Extract shared sub-components as we work through each screen, starting with the highest-complexity screens. Shared components emerge with the right API because all callers are seen before abstracting.

---

## New File Structure

```
src/modules/flag-game/components/
├── game/                        ← NEW subfolder for in-session UI
│   ├── PlayingHeader.tsx
│   ├── TimerBar.tsx
│   ├── FlagCard.tsx
│   ├── HintSection.tsx
│   ├── AnswerFeedback.tsx
│   ├── ExplorerStatsBar.tsx
│   ├── Podium.tsx
│   ├── RoundHistoryTable.tsx
│   └── StatsCard.tsx
├── ModeButton.tsx               ← NEW
├── DifficultyButton.tsx         ← NEW
├── PlayerInput.tsx              ← NEW
├── effects/                     (unchanged)
├── ContinentPicker.tsx          (unchanged)
├── MobileMap.tsx                (unchanged)
└── OptionButton.tsx             (internal refactor only)
```

`game/` holds components that only make sense inside an active game session. Root-level components are standalone UI atoms reusable anywhere in the module.

---

## Component APIs

### Playing-screen shared components (`components/game/`)

**`PlayingHeader`**
```ts
{ leftSlot: ReactNode, rightSlot: ReactNode }
```
The `<nav>` shell shared by all three playing screens. Each screen passes its own left and right slot content. Left: home button + game info. Right: score or countdown timer.

**`TimerBar`**
```ts
{ pct: number, color: string, urgent: boolean }
```
Animated progress bar. `urgent` drives the `timerPulse` animation. Used by SoloPlayingScreen and FamilyPlayingScreen only — Explorer's timer lives in the header.

**`FlagCard`**
```ts
{ flag: Flag }
```
Large flag emoji in a glass-morphism card + continent pill below. Used by Solo and Family. Explorer uses a different inline layout and will not use this component.

**`HintSection`**
```ts
{ hint: string, showHint: boolean, onShowHint: () => void, hintCost?: number, accentColor: string }
```
Hint button (when `!showHint`) and revealed hint text (when `showHint`). `hintCost` is optional — Explorer shows no cost. `accentColor` varies: Family passes player color, others pass `#fbbf24`.

**`AnswerFeedback`**
```ts
{ selected: Flag | null, currentFlag: Flag, streak: number, timeLeft: number, correctBonusLabel?: string }
```
Correct/wrong/timeout message shown after answering. `correctBonusLabel` lets Explorer pass `"+3s"` without the component encoding Explorer-specific logic.

**`ExplorerStatsBar`**
```ts
{ score: number, correct: number, total: number, bestStreak: number }
```
Bottom row of three stat tiles unique to ExplorerPlayingScreen.

### Results-screen components (`components/game/`)

**`RoundHistoryTable`** — round-by-round result table. Props defined during Phase 2 implementation.  
**`Podium`** — player ranking with medal heights. Props defined during Phase 2 implementation.  
**`StatsCard`** — single labeled stat tile. Props defined during Phase 2 implementation.

### Setup & menu atoms (`components/` root)

**`ModeButton`** — extracted from MenuScreen. Props defined during Phase 3 implementation.  
**`DifficultyButton`** — extracted from DifficultyScreen. Props defined during Phase 3 implementation.  
**`PlayerInput`** — extracted from FamilySetupScreen. Props defined during Phase 3 implementation.

### `OptionButton` (internal refactor)

No new props. The 24-node cyclomatic complexity is resolved by extracting inline ternary chains into named helper functions: `getButtonBackground`, `getButtonBorderColor`, `getButtonTextColor`. Logic stays in the same file.

---

## Refactoring Order

### Phase 1 — Playing screens (complexity 22–26, 249–278 lines)

1. **`SoloPlayingScreen`** — extract all 5 shared components into `game/` as we go. Solo is the cleanest template with no multi-player state.
2. **`FamilyPlayingScreen`** — wire up the same components; pass player-specific props (player color, player score, player streak).
3. **`ExplorerPlayingScreen`** — wire `PlayingHeader`, `HintSection`, `AnswerFeedback`; add `ExplorerStatsBar`. Explorer does not use `TimerBar` or `FlagCard`.
4. **`OptionButton`** — refactor style ternaries into named helpers to resolve complexity-24 violation.

### Phase 2 — Results screens

5. **`ResultsScreen`** — extract `RoundHistoryTable`.
6. **`ExplorerResultsScreen`** — extract `StatsCard`, reuse `RoundHistoryTable`.
7. **`FamilyResultsScreen`** — extract `Podium` and player result rows.

### Phase 3 — Setup & menu screens

8. **`MenuScreen`** — extract `ModeButton`.
9. **`DifficultyScreen`** — extract `DifficultyButton`.
10. **`FamilySetupScreen`** — extract `PlayerInput`.

---

## Success Criteria

- TypeScript compiles clean throughout (no regressions).
- ESLint warnings reach 0.
- The three playing screens drop from ~260 lines to ~60–80 lines each.
- Cyclomatic complexity violations on `FamilyPlayingScreen` (26), `SoloPlayingScreen` (22), `OptionButton` (24) are resolved.
- Each extracted component has a single clear purpose and can be understood without reading its callers.
- No behavioral changes — this is a pure structural refactor.
