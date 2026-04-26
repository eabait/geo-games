# Duel UX Improvements — Design Spec

**Date:** 2026-04-26  
**Status:** Approved

## Problem

Three UX issues in the duel game mode:

1. **Flag orientation** — The flag sits in the center strip unrotated, so Player 2 (top, facing the other direction) sees it upside-down.
2. **Vertical space** — The center strip is tall enough that the answer grid buttons are partially off-screen on smaller devices.
3. **Win/loss state** — When a player answers correctly, both players' grids show the correct answer in green, making the loser appear to have also gotten it right.

## Approach

Minimal surgical changes across five files. No new components introduced.

## Changes

### Issue 1 & 2 — Flag placement and vertical space

**`DuelPlayingLayout.tsx`**

Move the flag card from `renderCenterSection` into `renderPlayerSection`. Each player section is already structured correctly for orientation — P2's entire section has `transform: rotate(180deg)` applied via CSS — so placing the flag inside the section means both players read their own flag naturally without any additional rotation logic.

DOM order after change:
- `isTop=true` (P2, rotated): `[header][flagCard][grid]` → after CSS rotation, P2 sees `[grid][flagCard][header]` from their perspective ✓
- `isTop=false` (P1, normal): `[flagCard][grid][header]` ✓

`renderCenterSection` retains only: round label, timer value, quit button, timer progress bar.

**`DuelPlayingScreen.module.css`**

- `.flagCard` moves conceptually to inside player sections (same CSS class, no rename needed).
- `.centerSection` loses its `flagCard` child — padding and gap can be tightened (target ~40px total height vs current ~90px).
- `.flagEmoji` font size can be reduced slightly inside player sections (`clamp(28px, 6vw, 40px)`) since it no longer needs to be readable from distance.

### Issue 3 — Win/loss state

**`useDuelPlayingState.ts`**

Add `isLoser: boolean` to `DuelPlayerPanelState` interface. In `buildDuelPlayerPanels`, compute it as:

```ts
isLoser: resolution !== null && resolution !== 'timeout' && player.id !== resolvedBy
```

**`DuelPlayingLayout.tsx`**

Pass `panel.isLoser` through to each `OptionButton`.

**`OptionButton.tsx`**

- Add `isLoser: boolean` prop.
- Extend `OptionState` union to include `'revealed'`.
- In `getOptionState`: when `isLoser && option.name === currentFlag.name`, return `'revealed'` instead of `'correct'`.
- `'revealed'` badge label: `'✗'` (same as `'wrong'`) — update `getBadgeLabel` to return `'✗'` for the `revealed` case.
- `'revealed'` gets its own `getStateClassName` case.
- `'revealed'` badge uses existing `.badgeWrong` CSS class (red, scale 1.2) — no new badge class needed.

**`OptionButton.module.css`**

Add `.revealed` class:

```css
.revealed {
  background: rgba(239, 68, 68, 0.18);
  border-color: #ef4444;
}
```

Badge for `.revealed` uses `.badgeWrong` (red background, scale 1.2) — no new badge class needed.

## File Impact

| File | Change |
|------|--------|
| `DuelPlayingLayout.tsx` | Move flagCard into `renderPlayerSection`; remove from `renderCenterSection`; pass `isLoser` to `OptionButton` |
| `DuelPlayingScreen.module.css` | Slim `.centerSection`; reduce flag emoji size |
| `useDuelPlayingState.ts` | Add `isLoser` to `DuelPlayerPanelState`; compute in `buildDuelPlayerPanels` |
| `OptionButton.tsx` | Add `isLoser` prop; add `'revealed'` state; update `getOptionState` and `getBadgeLabel` |
| `OptionButton.module.css` | Add `.revealed` style |

## Out of Scope

- No changes to game logic, scoring, or round advancement.
- No changes to the results screen.
- No new components.
