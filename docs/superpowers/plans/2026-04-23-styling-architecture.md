# Styling Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the app from inline styles and `Layout.tsx`-injected global CSS to CSS Modules plus global design tokens, while preserving the current `flag-game` UI and route behavior.

**Architecture:** Introduce a global styling foundation in `src/styles/` for tokens and animations, then migrate shared shell components and `flag-game` components/screens to colocated `.module.css` files. Inline `style` props remain only for runtime CSS custom property values and SVG coordinates that cannot be expressed statically.

**Tech Stack:** React 19, TypeScript strict mode, Vite, CSS Modules, CSS custom properties, Vitest, React Testing Library, ESLint.

---

## File Map

**Create:**
- `src/styles/tokens.css`
- `src/styles/animations.css`
- `src/styles/index.css`
- `src/shared/components/Layout.module.css`
- `src/shared/components/BackgroundStars.module.css`
- `src/modules/flag-game/styles/theme.css`
- `src/modules/flag-game/components/ModeButton.module.css`
- `src/modules/flag-game/components/DifficultyButton.module.css`
- `src/modules/flag-game/components/OptionButton.module.css`
- `src/modules/flag-game/components/PlayerInput.module.css`
- `src/modules/flag-game/components/ContinentPicker.module.css`
- `src/modules/flag-game/components/MobileMap.module.css`
- `src/modules/flag-game/components/effects/Confetti.module.css`
- `src/modules/flag-game/components/effects/FloatingEmojis.module.css`
- `src/modules/flag-game/components/effects/ScreenFlash.module.css`
- `src/modules/flag-game/components/effects/Sparkles.module.css`
- `src/modules/flag-game/components/game/Podium.module.css`
- `src/modules/flag-game/screens/MenuScreen.module.css`
- `src/modules/flag-game/screens/DifficultyScreen.module.css`
- `src/modules/flag-game/screens/FamilySetupScreen.module.css`
- `src/modules/flag-game/screens/PassPhoneScreen.module.css`
- `src/modules/flag-game/screens/SoloPlayingScreen.module.css`
- `src/modules/flag-game/screens/ExplorerPlayingScreen.module.css`
- `src/modules/flag-game/screens/FamilyPlayingScreen.module.css`
- `src/modules/flag-game/screens/ResultsScreen.module.css`
- `src/modules/flag-game/screens/ExplorerResultsScreen.module.css`
- `src/modules/flag-game/screens/FamilyResultsScreen.module.css`
- `agents-docs/STYLES.md`

**Modify:**
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/shared/components/Layout.tsx`
- `src/shared/components/BackgroundStars.tsx`
- `src/modules/flag-game/components/ModeButton.tsx`
- `src/modules/flag-game/components/DifficultyButton.tsx`
- `src/modules/flag-game/components/OptionButton.tsx`
- `src/modules/flag-game/components/PlayerInput.tsx`
- `src/modules/flag-game/components/ContinentPicker.tsx`
- `src/modules/flag-game/components/MobileMap.tsx`
- `src/modules/flag-game/components/effects/Confetti.tsx`
- `src/modules/flag-game/components/effects/FloatingEmojis.tsx`
- `src/modules/flag-game/components/effects/ScreenFlash.tsx`
- `src/modules/flag-game/components/effects/Sparkles.tsx`
- `src/modules/flag-game/components/game/Podium.tsx`
- `src/modules/flag-game/screens/MenuScreen.tsx`
- `src/modules/flag-game/screens/DifficultyScreen.tsx`
- `src/modules/flag-game/screens/FamilySetupScreen.tsx`
- `src/modules/flag-game/screens/PassPhoneScreen.tsx`
- `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`
- `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`
- `src/modules/flag-game/screens/ResultsScreen.tsx`
- `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`
- `src/modules/flag-game/screens/FamilyResultsScreen.tsx`

**Existing tests to keep green during migration:**
- `src/modules/flag-game/components/ModeButton.test.tsx`
- `src/modules/flag-game/components/DifficultyButton.test.tsx`
- `src/modules/flag-game/components/PlayerInput.test.tsx`
- `src/modules/flag-game/components/ContinentPicker.test.tsx`
- `src/modules/flag-game/components/MobileMap.test.tsx`
- `src/modules/flag-game/components/game/Podium.test.tsx`
- `src/modules/flag-game/screens/MenuScreen.test.tsx`
- `src/modules/flag-game/screens/SoloPlayingScreen.test.tsx`

---

## Task 1: Build the global styling foundation

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/animations.css`
- Create: `src/styles/index.css`
- Modify: `src/main.tsx`
- Modify: `index.html`

- [x] **Step 1: Add global tokens in `src/styles/tokens.css`**

```css
:root {
  --color-bg: #0f172a;
  --color-bg-mid: #1e293b;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-text-dim: #64748b;
  --color-accent: #fbbf24;

  --card-bg: rgba(255, 255, 255, 0.06);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-radius: 20px;
  --card-blur: 12px;

  --font-body: 'Nunito', sans-serif;
  --font-display: 'Fredoka', sans-serif;

  --z-overlay: 50;
  --z-fixed: 100;
}
```

- [x] **Step 2: Move all shared keyframes and `.btn` utility into `src/styles/animations.css`**

Copy these animation names from `src/shared/components/Layout.tsx` into the new stylesheet without renaming them: `popIn`, `shake`, `float`, `pulse`, `slideUp`, `bounce`, `glow`, `flagEnter`, `scorePop`, `confettiFall`, `emojiFloat`, `screenFlash`, `sparkle`, `twinkle`, `timerPulse`, `optionEnter`, `correctPulse`, `wrongShake`, `podiumRise`, `crownBounce`, `resultRow`, `spinIn`, `menuItem`, `breathe`, `mapPinEnter`.

```css
.btn {
  transition: all 0.2s cubic-bezier(.34, 1.56, .64, 1);
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-3px) scale(1.02);
}

.btn:active {
  transform: translateY(-1px) scale(.98);
}
```

- [x] **Step 3: Create `src/styles/index.css` as the single global stylesheet entry**

```css
@import './tokens.css';
@import './animations.css';

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-body);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-mid) 50%, var(--color-bg) 100%);
  color: var(--color-text);
}

button,
input {
  font: inherit;
}

* {
  box-sizing: border-box;
}
```

- [x] **Step 4: Load the stylesheet once from `src/main.tsx`**

```tsx
import './styles/index.css';
```

- [x] **Step 5: Move Google Fonts to `index.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
  rel="stylesheet"
/>
```

- [x] **Step 6: Verify the app still boots with the new global entry**

Run: `npm run test:run -- src/modules/flag-game/screens/MenuScreen.test.tsx`

Expected: PASS. No import errors from CSS files or `index.html` font changes.

- [x] **Step 7: Commit**

```bash
git add index.html src/main.tsx src/styles
git commit -m "feat: add global styling foundation"
```

---

## Task 2: Migrate shared shell components out of inline styles

**Files:**
- Create: `src/shared/components/Layout.module.css`
- Create: `src/shared/components/BackgroundStars.module.css`
- Modify: `src/shared/components/Layout.tsx`
- Modify: `src/shared/components/BackgroundStars.tsx`
- Create: `src/modules/flag-game/styles/theme.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `Layout.module.css`**

```css
.shell {
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  color: var(--color-text);
}

.soundToggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: var(--z-fixed);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: var(--color-text);
}
```

- [ ] **Step 2: Remove `GLOBAL_STYLES` and font `<link>` usage from `Layout.tsx`**

```tsx
import styles from './Layout.module.css';

export function Layout(props: LayoutProps): React.JSX.Element {
  return (
    <div className={styles.shell}>
      <BackgroundStars />
      {props.confetti}
      {props.emojis}
      {props.flash}
      <button className={styles.soundToggle} onClick={props.onToggleSound}>
        {props.soundOn ? '🔊' : '🔇'}
      </button>
      {props.children}
    </div>
  );
}
```

- [ ] **Step 3: Move star field static styles to `BackgroundStars.module.css` and keep only runtime coordinates inline**

```css
.stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: twinkle var(--star-duration) ease-in-out var(--star-delay) infinite;
}
```

```tsx
<div className={styles.stars}>
  {stars.map((star) => (
    <div
      key={star.id}
      className={styles.star}
      style={
        {
          top: star.top,
          left: star.left,
          width: `${star.size}px`,
          height: `${star.size}px`,
          '--star-duration': star.duration,
          '--star-delay': star.delay,
        } as React.CSSProperties
      }
    />
  ))}
</div>
```

- [ ] **Step 4: Add the per-game theme file and import it from `App.tsx`**

```css
/* src/modules/flag-game/styles/theme.css */
:root {
}
```

```tsx
import '@/modules/flag-game/styles/theme.css';
```

- [ ] **Step 5: Verify shared shell rendering**

Run: `npm run test:run -- src/modules/flag-game/screens/MenuScreen.test.tsx`

Expected: PASS. Menu still renders inside `Layout` with no missing class imports.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/shared/components src/modules/flag-game/styles/theme.css
git commit -m "refactor: migrate shared shell to CSS modules"
```

---

## Task 3: Convert reusable flag-game components and visual effects

**Files:**
- Create: `src/modules/flag-game/components/ModeButton.module.css`
- Create: `src/modules/flag-game/components/DifficultyButton.module.css`
- Create: `src/modules/flag-game/components/OptionButton.module.css`
- Create: `src/modules/flag-game/components/PlayerInput.module.css`
- Create: `src/modules/flag-game/components/ContinentPicker.module.css`
- Create: `src/modules/flag-game/components/MobileMap.module.css`
- Create: `src/modules/flag-game/components/effects/Confetti.module.css`
- Create: `src/modules/flag-game/components/effects/FloatingEmojis.module.css`
- Create: `src/modules/flag-game/components/effects/ScreenFlash.module.css`
- Create: `src/modules/flag-game/components/effects/Sparkles.module.css`
- Create: `src/modules/flag-game/components/game/Podium.module.css`
- Modify: matching `.tsx` files for each component above

- [ ] **Step 1: Migrate `ModeButton` and `DifficultyButton` to CSS Modules, keeping animation delay dynamic**

```tsx
import styles from './ModeButton.module.css';

<button
  className={`btn ${styles.button} ${highlight ? styles.highlight : ''}`}
  style={{ '--item-delay': `${delay}s` } as React.CSSProperties}
>
```

```css
.button {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--card-bg);
  backdrop-filter: blur(var(--card-blur));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  color: var(--color-text);
  animation: menuItem .6s ease var(--item-delay) both;
}
```

- [ ] **Step 2: Migrate `OptionButton` to semantic state classes**

```tsx
const stateClass = selected
  ? isCorrect
    ? styles.correct
    : isSel
      ? styles.wrong
      : styles.dimmed
  : '';

<button className={`btn ${styles.button} ${stateClass}`} />
```

```css
.button { /* shared card button shell */ }
.correct { background: rgba(34, 197, 94, 0.18); border-color: #22c55e; }
.wrong { background: rgba(239, 68, 68, 0.18); border-color: #ef4444; }
.dimmed { opacity: 0.45; }
```

- [ ] **Step 3: Migrate `ContinentPicker`, `PlayerInput`, `MobileMap`, and `Podium`**

Guideline:
- static layout, typography, borders, colors, and transitions go into `.module.css`
- map pin coordinates, confetti drift values, sparkle angles, and animation delays remain inline as CSS custom properties or SVG attributes
- no component should keep raw color constants such as `#fbbf24` or `#94a3b8` after migration unless the value is intentionally not tokenized

- [ ] **Step 4: Migrate effect components with CSS variables for randomness**

```tsx
style={
  {
    '--drift': `${piece.drift}px`,
    '--fall-duration': `${piece.duration}s`,
    '--fall-delay': `${piece.delay}s`,
    left: piece.left,
  } as React.CSSProperties
}
```

```css
.piece {
  animation: confettiFall var(--fall-duration) ease-out var(--fall-delay) forwards;
}
```

- [ ] **Step 5: Keep component tests green after each small batch**

Run:
- `npm run test:run -- src/modules/flag-game/components/ModeButton.test.tsx`
- `npm run test:run -- src/modules/flag-game/components/DifficultyButton.test.tsx`
- `npm run test:run -- src/modules/flag-game/components/PlayerInput.test.tsx`
- `npm run test:run -- src/modules/flag-game/components/ContinentPicker.test.tsx`
- `npm run test:run -- src/modules/flag-game/components/MobileMap.test.tsx`
- `npm run test:run -- src/modules/flag-game/components/game/Podium.test.tsx`

Expected: PASS. If a test depends on previous inline styles, update the assertion to target visible behavior or semantic attributes instead of implementation-specific style strings.

- [ ] **Step 6: Commit**

```bash
git add src/modules/flag-game/components
git commit -m "refactor: migrate shared flag-game components to CSS modules"
```

---

## Task 4: Convert menu, setup, and results screens

**Files:**
- Create: `src/modules/flag-game/screens/MenuScreen.module.css`
- Create: `src/modules/flag-game/screens/DifficultyScreen.module.css`
- Create: `src/modules/flag-game/screens/FamilySetupScreen.module.css`
- Create: `src/modules/flag-game/screens/PassPhoneScreen.module.css`
- Create: `src/modules/flag-game/screens/ResultsScreen.module.css`
- Create: `src/modules/flag-game/screens/ExplorerResultsScreen.module.css`
- Create: `src/modules/flag-game/screens/FamilyResultsScreen.module.css`
- Modify: matching `.tsx` files for each screen above

- [ ] **Step 1: Extract shared full-screen wrapper patterns**

Apply the same screen shell pattern in each module stylesheet:

```css
.screen {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Migrate `MenuScreen`, `DifficultyScreen`, and `FamilySetupScreen` first**

Guideline:
- use display classes for title, subtitle, picker wrapper, and button stack
- keep only dynamic gradient timing or CSS custom property values inline
- replace raw `fontFamily: "'Fredoka', sans-serif"` with `font-family: var(--font-display)`

- [ ] **Step 3: Migrate `PassPhoneScreen` and results screens**

Guideline:
- preserve bouncing crown, spin, float, and result row stagger animations through classes plus custom properties like `--row-delay`
- preserve player-specific colors via runtime CSS variables where the value comes from store data

Example:

```tsx
<div
  className={styles.resultRow}
  style={{ '--row-delay': `${RESULT_ROW_ANIM_BASE + i * RESULT_ROW_ANIM_STEP}s` } as React.CSSProperties}
>
```

```css
.resultRow {
  animation: resultRow .4s ease var(--row-delay) both;
}
```

- [ ] **Step 4: Re-run screen tests**

Run:
- `npm run test:run -- src/modules/flag-game/screens/MenuScreen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Smoke test navigation screens manually**

Run: `npm run dev`

Verify:
- `/flag-game`
- `/flag-game/solo`
- `/flag-game/family`
- `/flag-game/family/results`

Expected: no missing styles, fonts load from document head, and cards/buttons/gradients match the pre-migration UI.

- [ ] **Step 6: Commit**

```bash
git add src/modules/flag-game/screens
git commit -m "refactor: migrate menu and results screens to CSS modules"
```

---

## Task 5: Convert the three playing screens last

**Files:**
- Create: `src/modules/flag-game/screens/SoloPlayingScreen.module.css`
- Create: `src/modules/flag-game/screens/ExplorerPlayingScreen.module.css`
- Create: `src/modules/flag-game/screens/FamilyPlayingScreen.module.css`
- Modify: `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- Modify: `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`
- Modify: `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`

- [ ] **Step 1: Extract stable layout regions into CSS classes**

Each screen should end up with named classes for:
- screen shell
- top nav/header row
- timer container and inner bar
- flag card
- hint block
- answer section
- feedback panel

- [ ] **Step 2: Keep runtime values inline only when they are truly dynamic**

Allowed inline styles after migration:
- timer width and color via CSS variables, e.g. `--timer-width`, `--timer-color`
- per-player accent color from `player.color`
- stagger delays and conditional animation names
- SVG/Sparkle/confetti coordinate values

Not allowed inline after migration:
- static padding, gap, border radius, font family, text color, background gradients, flex/grid layout declarations

- [ ] **Step 3: Convert timer and score visual state to CSS variable driven classes**

```tsx
<div className={styles.timerTrack}>
  <div
    className={`${styles.timerFill} ${urgent ? styles.timerUrgent : ''}`}
    style={
      {
        '--timer-width': `${pct}%`,
        '--timer-color': timerColor,
      } as React.CSSProperties
    }
  />
</div>
```

```css
.timerFill {
  width: var(--timer-width);
  background: var(--timer-color);
}

.timerUrgent {
  animation: timerPulse .5s ease infinite;
}
```

- [ ] **Step 4: Run focused test coverage**

Run:
- `npm run test:run -- src/modules/flag-game/screens/SoloPlayingScreen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Manual regression pass for all play routes**

Run: `npm run dev`

Verify:
- `/flag-game/solo/play`
- `/flag-game/explorer/play`
- `/flag-game/family/play`
- `/flag-game/family/pass`

Expected:
- answer buttons still disable correctly
- timer urgency animations still fire
- selected/correct/wrong states remain visually distinct
- explorer map pin and stats remain visible

- [ ] **Step 6: Commit**

```bash
git add src/modules/flag-game/screens/SoloPlayingScreen.* src/modules/flag-game/screens/ExplorerPlayingScreen.* src/modules/flag-game/screens/FamilyPlayingScreen.*
git commit -m "refactor: migrate playing screens to CSS modules"
```

---

## Task 6: Document the rules and verify the migration is complete

**Files:**
- Create: `agents-docs/STYLES.md`
- Modify: any tests that still assert on removed inline style strings

- [ ] **Step 1: Add `agents-docs/STYLES.md`**

Document these rules explicitly:
- global design tokens live in `src/styles/tokens.css`
- global animations and `.btn` utility live in `src/styles/animations.css`
- every component/screen owns a colocated `.module.css`
- inline `style` is only for runtime CSS custom properties or SVG geometry values
- game-level token overrides live in `modules/<game>/styles/theme.css`

- [ ] **Step 2: Verify no forbidden inline styling remains**

Run: `rg -n "style=\\{\\{" src`

Expected:
- matches only components using runtime CSS variables or SVG geometry
- no component contains a large inline object with static layout and typography declarations

- [ ] **Step 3: Run full project verification**

Run:
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Expected: all commands pass.

- [ ] **Step 4: Final visual smoke test**

Run: `npm run dev`

Verify all routed screens still render with:
- global fonts loaded from document head
- background gradient and star field intact
- button hover/press states intact
- existing glassmorphism cards and animations preserved

- [ ] **Step 5: Commit**

```bash
git add agents-docs/STYLES.md src
git commit -m "docs: codify styling architecture rules"
```

---

## Spec Coverage Check

- CSS Modules + CSS custom properties: covered by Tasks 1 through 5.
- `src/styles/tokens.css`, `animations.css`, `index.css`: covered by Task 1.
- `index.html` font move: covered by Task 1.
- `Layout.tsx` cleanup and removal of `GLOBAL_STYLES`: covered by Task 2.
- per-game theme file at `src/modules/flag-game/styles/theme.css`: covered by Task 2.
- colocated `.module.css` for every styled component/screen: covered by Tasks 2 through 5.
- all-at-once migration of current inline styles: covered by Tasks 3 through 5.
- ongoing conventions in `agents-docs/STYLES.md`: covered by Task 6.

## Risks / Notes

- `MobileMap.tsx`, `BackgroundStars.tsx`, and the effect components will still need minimal inline values for runtime geometry and randomized timings. That is allowed by the approved design as long as the values are passed as CSS variables or SVG attributes.
- Existing tests may need to stop asserting exact inline style strings after migration. Prefer behavior assertions (`disabled`, text, presence, route flow) over implementation-detail style assertions.
- Do not split this into partial runtime deployment steps. The approved spec requires an all-at-once migration of every styled `.tsx` file in `src/`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-23-styling-architecture.md`.

Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints
