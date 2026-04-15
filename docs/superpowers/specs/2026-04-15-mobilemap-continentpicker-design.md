# MobileMap + ContinentPicker — Design Spec

**Date:** 2026-04-15
**Task:** Flag-game reorganization — Task 11
**Status:** Approved

---

## Context

Part of the ongoing migration from monolithic `flag-game.jsx` to a modular Vite + React + TypeScript project. The original source file has been deleted. This spec defines MobileMap and ContinentPicker from scratch, consistent with `CODE_CONVENTIONS.md` and the existing plan at `docs/superpowers/plans/2026-04-13-flag-game-reorganization.md`.

---

## MobileMap

### Purpose

Renders the quiz interaction for a single round: a world map with a geographic location hint, plus a grid of answer buttons. The user picks a country name; the component reports the selection and then locks.

### Props

```ts
interface MobileMapProps {
  options: Flag[];                   // the answer choices (2–5 flags depending on difficulty)
  correctName: string;               // name of the correct flag — used to place the hint dot
  selected: Flag | null;             // null = unanswered; non-null = answered (locks buttons)
  onSelect: (flag: Flag) => void;    // called once when the user taps a button
}
```

### Layout

```
┌─────────────────────────────────┐
│        SVG world map            │
│   (continent outlines, dim)     │
│            ● (gold dot)         │  ← correct flag's geographic location
└─────────────────────────────────┘
┌──────────────┐ ┌──────────────┐
│   Brasil     │ │   Francia    │  ← name only, no flag emoji
├──────────────┤ ├──────────────┤
│   Japón      │ │  Alemania    │
└──────────────┘ └──────────────┘
```

### SVG World Map

- `viewBox="0 0 360 180"` — longitude maps to x (0–360, offset by +180), latitude maps to y (flipped: `90 - lat`)
- Continent polygon paths come from `WORLD_SHAPES` (`[lng, lat][][]`). Each sub-array is one closed polygon rendered as an SVG `<polygon>` with low-opacity stroke and no fill.
- A single `<circle>` marks the correct flag's location: `cx = correctFlag.pos[1] + 180`, `cy = 90 - correctFlag.pos[0]`. Gold fill (`#fbbf24`), pulsing glow via drop-shadow or box-shadow equivalent.

### Answer Buttons

- 2-column CSS grid below the SVG
- Each button displays the **country name only** — no flag emoji (showing the emoji would reveal the answer since the question shows the flag)
- When `selected === null`: buttons are enabled, normal style
- When `selected !== null`: all buttons `disabled`; correct button gets green border + text; the button the user selected (if wrong) gets a red border + text
- `onSelect` is called with the full `Flag` object when a button is tapped

### Coordinate Projection

```ts
// Flag.pos is [lat, lng]
// WORLD_SHAPES entries are [lng, lat]
const toX = (lng: number) => lng + 180;          // 0–360
const toY = (lat: number) => 90 - lat;           // 0–180 (north at top)
```

Applied consistently for both polygon points and the hint dot.

---

## ContinentPicker

### Purpose

A horizontal row of chip buttons that filters which flags appear in the round. Controlled — no store dependency inside the component. The consuming screen wires it to `useSettingsStore`.

### Props

```ts
interface ContinentPickerProps {
  selected: string;                        // 'Todos' | Continent value
  onChange: (continent: string) => void;
}
```

### Rendering

- One chip per entry in `CONTINENTS_LIST = ['Todos', 'América', 'Europa', 'África', 'Asia', 'Oceanía']`
- Label format: `"Todos (62)"` / `"América (18)"` — count computed from `FLAGS.filter(f => f.continent === c).length`; `'Todos'` uses `FLAGS.length`
- Selected chip: amber border (`#fbbf24`) + amber text, light amber background
- Unselected chip: muted gray text, near-transparent background
- `flexWrap: 'wrap'` so it reflows on narrow screens; `justifyContent: 'center'`

---

## Testing

### MobileMap.test.tsx

| Test | What it verifies |
|---|---|
| Renders a button for each option | Each `Flag.name` in `options` appears in the DOM |
| Calls `onSelect` when a button is clicked | `vi.fn()` called once with the correct flag object |
| Disables buttons after selection | All `<button>` elements have `disabled` attribute when `selected` is non-null |

### ContinentPicker.test.tsx

| Test | What it verifies |
|---|---|
| Renders all continent options | 'Todos' and all 5 continents visible |
| Calls `onChange` with continent name on click | `vi.fn()` called with `'Europa'` when Europa chip clicked |
| Highlights selected continent | Selected button has a distinct `borderColor` style |

### Coverage target

Components: 70%+ (interaction paths, not exhaustive rendering) — consistent with project-wide targets in `CODE_CONVENTIONS.md`.

---

## What is NOT in scope

- Collision avoidance for the hint dot (only one dot, so not needed)
- Hover states on the map (mobile-first)
- ContinentPicker owning its store connection (the screen does that)
- Any animation on the hint dot beyond a CSS glow (keyframe animation deferred to Layout.tsx in Task 12)

---

## Files

| File | Action |
|---|---|
| `src/modules/flag-game/components/MobileMap.tsx` | Create |
| `src/modules/flag-game/components/MobileMap.test.tsx` | Create |
| `src/modules/flag-game/components/ContinentPicker.tsx` | Create |
| `src/modules/flag-game/components/ContinentPicker.test.tsx` | Create |
