# MobileMap + ContinentPicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `MobileMap` and `ContinentPicker` components for the flag-game module with full test coverage, using TDD.

**Architecture:** `MobileMap` renders an SVG world map (continent outlines from `WORLD_SHAPES`) with a single glowing dot at the correct flag's geographic location, plus a 2-col button grid of answer choices (country names only — no flag emoji). `ContinentPicker` is a controlled chip-button row for filtering by continent. Both are pure presentational components; no store connections inside them.

**Tech Stack:** React 18, TypeScript 5 (strict), Vitest + React Testing Library + jsdom, inline styles (no CSS modules — consistent with existing components in this project).

---

## File Map

```
src/modules/flag-game/components/
  MobileMap.tsx           ← new: SVG map + answer button grid
  MobileMap.test.tsx      ← new: 4 test cases
  ContinentPicker.tsx     ← new: continent chip buttons
  ContinentPicker.test.tsx ← new: 3 test cases
```

No existing files are modified.

---

## Task 1: MobileMap — failing tests

**Files:**
- Create: `src/modules/flag-game/components/MobileMap.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileMap } from './MobileMap';
import type { Flag } from '../types';

const mockOptions: Flag[] = [
  { code: '🇦🇷', name: 'Argentina', continent: 'América', hint: '', tier: 1, pos: [-34.6, -58.4] },
  { code: '🇧🇷', name: 'Brasil',    continent: 'América', hint: '', tier: 1, pos: [-14.2, -51.9] },
  { code: '🇫🇷', name: 'Francia',   continent: 'Europa',  hint: '', tier: 1, pos: [46.2,   2.2]  },
  { code: '🇯🇵', name: 'Japón',     continent: 'Asia',    hint: '', tier: 1, pos: [36.2, 138.3] },
];

describe('MobileMap', () => {
  it('renders a button for each option', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    mockOptions.forEach((opt) => {
      expect(screen.getByRole('button', { name: opt.name })).toBeInTheDocument();
    });
  });

  it('calls onSelect with the clicked flag', async () => {
    const onSelect = vi.fn();
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Brasil' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it('disables all buttons when selected is non-null', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={mockOptions[1]}
        onSelect={vi.fn()}
      />,
    );
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('does not show flag emoji in answer buttons', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    // Emoji codes must not appear as button text (they would spoil the answer)
    mockOptions.forEach((opt) => {
      expect(screen.queryByText(new RegExp(opt.code))).not.toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test — expect FAIL (module not found)**

```bash
npm run test:run -- src/modules/flag-game/components/MobileMap.test.tsx
```

Expected: `Error: Cannot find module './MobileMap'`

---

## Task 2: MobileMap — implementation

**Files:**
- Create: `src/modules/flag-game/components/MobileMap.tsx`

- [ ] **Step 1: Create `MobileMap.tsx`**

```tsx
import { useMemo } from 'react';

import { WORLD_SHAPES } from '../data/worldShapes';
import type { Flag } from '../types';

interface MobileMapProps {
  options: Flag[];
  correctName: string;
  selected: Flag | null;
  onSelect: (flag: Flag) => void;
}

// WORLD_SHAPES entries are [lng, lat]. Flag.pos is [lat, lng].
// viewBox is 0 0 360 180: longitude → x (offset +180), latitude → y (flipped).
const toX = (lng: number): number => lng + 180;
const toY = (lat: number): number => 90 - lat;

export function MobileMap({ options, correctName, selected, onSelect }: MobileMapProps): JSX.Element {
  const polygonPoints = useMemo(
    () =>
      WORLD_SHAPES.map((poly) =>
        poly.map(([lng, lat]) => `${toX(lng)},${toY(lat)}`).join(' '),
      ),
    [],
  );

  const correctFlag = options.find((f) => f.name === correctName) ?? null;
  const dotX = correctFlag !== null ? toX(correctFlag.pos[1]) : null;
  const dotY = correctFlag !== null ? toY(correctFlag.pos[0]) : null;

  const answered = selected !== null;

  return (
    <div>
      <svg
        viewBox="0 0 360 180"
        style={{ width: '100%', display: 'block', background: 'transparent' }}
        aria-hidden="true"
      >
        {polygonPoints.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#334155"
            strokeWidth="0.5"
            opacity="0.6"
          />
        ))}
        {dotX !== null && dotY !== null && (
          <circle
            cx={dotX}
            cy={dotY}
            r="3"
            fill="#fbbf24"
            style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
          />
        )}
      </svg>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: '0 4px',
        }}
      >
        {options.map((flag) => {
          const isCorrect = flag.name === correctName;
          const isWrongSelection = answered && selected.name === flag.name && !isCorrect;

          let borderColor = 'rgba(255,255,255,0.08)';
          let color = '#cbd5e1';
          let background = 'rgba(30,41,59,0.8)';

          if (answered) {
            if (isCorrect) {
              borderColor = '#22c55e';
              color = '#4ade80';
              background = 'rgba(22,163,74,0.2)';
            } else if (isWrongSelection) {
              borderColor = '#ef4444';
              color = '#f87171';
              background = 'rgba(239,68,68,0.15)';
            }
          }

          return (
            <button
              key={flag.name}
              disabled={answered}
              onClick={() => onSelect(flag)}
              style={{
                border: `1.5px solid ${borderColor}`,
                borderRadius: 10,
                padding: '10px',
                color,
                background,
                fontSize: 13,
                fontWeight: 600,
                cursor: answered ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {flag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the tests — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/components/MobileMap.test.tsx
```

Expected output:
```
✓ MobileMap > renders a button for each option
✓ MobileMap > calls onSelect with the clicked flag
✓ MobileMap > disables all buttons when selected is non-null
✓ MobileMap > does not show flag emoji in answer buttons
Test Files  1 passed (1)
Tests  4 passed (4)
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/flag-game/components/MobileMap.tsx \
        src/modules/flag-game/components/MobileMap.test.tsx
git commit -m "feat(flag-game): add MobileMap component with SVG world map and answer grid"
```

---

## Task 3: ContinentPicker — failing tests

**Files:**
- Create: `src/modules/flag-game/components/ContinentPicker.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContinentPicker } from './ContinentPicker';

describe('ContinentPicker', () => {
  it('renders all continent options including Todos', () => {
    render(<ContinentPicker selected="Todos" onChange={vi.fn()} />);
    ['Todos', 'América', 'Europa', 'África', 'Asia', 'Oceanía'].forEach((c) => {
      expect(screen.getByRole('button', { name: new RegExp(c, 'i') })).toBeInTheDocument();
    });
  });

  it('calls onChange with the continent name when a chip is clicked', async () => {
    const onChange = vi.fn();
    render(<ContinentPicker selected="Todos" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /europa/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('Europa');
  });

  it('gives the selected chip a distinct border color', () => {
    render(<ContinentPicker selected="Europa" onChange={vi.fn()} />);
    const europaBtn = screen.getByRole('button', { name: /europa/i });
    // Selected chip uses amber (#fbbf24); unselected chips use rgba(255,255,255,0.1)
    expect(europaBtn).toHaveStyle({ borderColor: '#fbbf24' });
  });
});
```

- [ ] **Step 2: Run the test — expect FAIL (module not found)**

```bash
npm run test:run -- src/modules/flag-game/components/ContinentPicker.test.tsx
```

Expected: `Error: Cannot find module './ContinentPicker'`

---

## Task 4: ContinentPicker — implementation

**Files:**
- Create: `src/modules/flag-game/components/ContinentPicker.tsx`

- [ ] **Step 1: Create `ContinentPicker.tsx`**

```tsx
import { FLAGS } from '../data/flags';
import { CONTINENTS_LIST } from '../data/constants';

interface ContinentPickerProps {
  selected: string;
  onChange: (continent: string) => void;
}

const ACCENT = '#fbbf24';

function countForContinent(continent: string): number {
  if (continent === 'Todos') return FLAGS.length;
  return FLAGS.filter((f) => f.continent === continent).length;
}

export function ContinentPicker({ selected, onChange }: ContinentPickerProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 18,
      }}
    >
      {CONTINENTS_LIST.map((c) => {
        const isSelected = selected === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              border: isSelected
                ? `1.5px solid ${ACCENT}`
                : '1px solid rgba(255,255,255,0.1)',
              background: isSelected
                ? 'rgba(251,191,36,0.15)'
                : 'rgba(255,255,255,0.04)',
              color: isSelected ? ACCENT : '#94a3b8',
            }}
          >
            {`${c} (${countForContinent(c)})`}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Run all component tests — expect PASS**

```bash
npm run test:run -- src/modules/flag-game/components/
```

Expected output:
```
✓ MobileMap > renders a button for each option
✓ MobileMap > calls onSelect with the clicked flag
✓ MobileMap > disables all buttons when selected is non-null
✓ MobileMap > does not show flag emoji in answer buttons
✓ ContinentPicker > renders all continent options including Todos
✓ ContinentPicker > calls onChange with the continent name when a chip is clicked
✓ ContinentPicker > gives the selected chip a distinct border color
Test Files  2 passed (2)
Tests  7 passed (7)
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors. If boundary violations appear, they mean an import crosses module lines — fix the import path, do not disable the rule.

- [ ] **Step 4: Commit**

```bash
git add src/modules/flag-game/components/ContinentPicker.tsx \
        src/modules/flag-game/components/ContinentPicker.test.tsx
git commit -m "feat(flag-game): add ContinentPicker controlled chip component"
```

---

## Self-Review

**Spec coverage:**
- ✅ `MobileMapProps`: `options`, `correctName`, `selected`, `onSelect` — all four props defined and used
- ✅ SVG from `WORLD_SHAPES` with correct coordinate projection (`toX`/`toY`)
- ✅ Single gold dot at correct flag's geographic position
- ✅ Button grid: country names only, no flag emoji
- ✅ Buttons disabled when `selected !== null`
- ✅ Correct button → green; wrong-selected button → red
- ✅ `ContinentPickerProps`: `selected`, `onChange` — controlled, no store dependency
- ✅ All 6 entries from `CONTINENTS_LIST` rendered as chips
- ✅ Count labels per continent using `FLAGS.filter(...).length`
- ✅ Selected chip: amber border/text; unselected: muted gray
- ✅ Tests: 4 for MobileMap, 3 for ContinentPicker — all cases from spec covered
- ✅ Coverage target: 70%+ components — 7 tests across 2 small files comfortably meets this

**Placeholder scan:** No TBDs, no vague steps, all code blocks complete.

**Type consistency:**
- `Flag` imported from `'../types'` in both component and test files ✅
- `WORLD_SHAPES: [number, number][][]` — accessed as `[lng, lat]` destructured, matching the file comment `// [lng, lat] polygon coordinates` ✅
- `Flag.pos: [lat: number, lng: number]` — accessed as `pos[0]` = lat, `pos[1]` = lng ✅
- `CONTINENTS_LIST` and `FLAGS` imported from `'../data/constants'` and `'../data/flags'` respectively ✅
- `countForContinent` helper name consistent throughout ✅
