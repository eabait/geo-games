# Styling Architecture Design

**Date:** 2026-04-22
**Status:** Approved

## Context

The codebase currently uses 100% inline `style` objects in all React components. Colors are hardcoded (e.g. `#fbbf24`) across multiple files, CSS animations are injected as a raw JS string from `Layout.tsx` via a `<style>` tag, and Google Fonts are loaded inside JSX. The project is named `geo-games` (plural) — more games will be added beyond the current `flag-game`.

## Decision

**CSS Modules + CSS Custom Properties (design tokens).**

Alternatives considered:
- **Tailwind CSS** — rejected because the game's custom glassmorphism effects and keyframe animations don't fit cleanly into utility classes, requiring many `[]` arbitrary values.
- **Single global stylesheet** — rejected because it provides no scoping, which leads to class name collisions as more games are added.

## File Structure

```
src/
  styles/
    tokens.css          # CSS custom properties — single source of truth for all design values
    animations.css      # All @keyframes + .btn utility class (moved out of Layout.tsx)
    index.css           # Imports tokens.css + animations.css; replaces current index.css
  index.html            # Google Fonts <link> tags moved here from Layout.tsx JSX

  modules/
    flag-game/
      styles/
        theme.css       # flag-game token overrides (currently empty; placeholder for future use)
      components/
        Foo.tsx
        Foo.module.css  # colocated component styles
      screens/
        Bar.tsx
        Bar.module.css
  shared/
    components/
      Layout.tsx
      Layout.module.css
      BackgroundStars.tsx
      BackgroundStars.module.css
```

## Design Tokens (`tokens.css`)

All values are CSS custom properties on `:root`:

```css
:root {
  /* Colors */
  --color-bg:           #0f172a;
  --color-bg-mid:       #1e293b;
  --color-text:         #f1f5f9;
  --color-text-muted:   #94a3b8;
  --color-text-dim:     #64748b;
  --color-accent:       #fbbf24;

  /* Glassmorphism card */
  --card-bg:            rgba(255, 255, 255, 0.06);
  --card-border:        rgba(255, 255, 255, 0.10);
  --card-radius:        20px;
  --card-blur:          12px;

  /* Typography */
  --font-body:          'Nunito', sans-serif;
  --font-display:       'Fredoka', sans-serif;

  /* Z-index scale */
  --z-overlay:          50;
  --z-fixed:            100;
}
```

## Per-Game Theming

Each game has a `styles/theme.css` that overrides any tokens it needs. The global tokens are the default; the theme file only contains overrides.

```css
/* src/modules/flag-game/styles/theme.css */
/* Currently inherits all global defaults.
   Future games can override tokens here, e.g.:
   --color-accent: #34d399;
   --card-radius: 12px;
*/
```

Each game imports its theme file near its root. For `flag-game`, this means importing `flag-game/styles/theme.css` in `App.tsx` (after `src/styles/index.css` is loaded via `main.tsx`). Future games follow the same pattern in their own root component or route entry.

## Component Styling Pattern

Each component gets a colocated `.module.css` file. The `style` prop is used **only** to pass runtime-dynamic values as CSS custom properties.

**JSX:**
```tsx
import styles from './ModeButton.module.css';

<button
  className={`btn ${styles.button} ${highlight ? styles.highlight : ''}`}
  style={{ '--delay': `${delay}s` } as React.CSSProperties}
>
  <span className={styles.icon}>{icon}</span>
  <div className={styles.sub}>{sub}</div>
  <span className={styles.arrow}>→</span>
</button>
```

**CSS Module:**
```css
.button {
  background: var(--card-bg);
  backdrop-filter: blur(var(--card-blur));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  color: var(--color-text);
  font-family: var(--font-body);
  animation: menuItem 0.6s ease var(--delay) both; /* dynamic via CSS var */
}

.highlight {
  background: linear-gradient(135deg, rgba(59,130,246,.12), rgba(139,92,246,.08));
  border: 1.5px solid rgba(59,130,246,.3);
}

.icon  { font-size: 32px; }
.sub   { font-size: 11px; color: var(--color-text-dim); font-weight: 400; }
.arrow { color: var(--color-accent); font-size: 18px; }
```

**Rule:** If a style value never changes at runtime → CSS Module. If it's driven by a JS prop → CSS custom property via inline `style`.

## Layout.tsx Cleanup

Two problems removed:

1. **`GLOBAL_STYLES` string + `<style>` injection** — All 22 keyframes and the `.btn` class move to `src/styles/animations.css`, imported via `index.css`. The `<style>` tag and `GLOBAL_STYLES` constant are deleted.

2. **`<link>` for Google Fonts inside JSX** — Moves to `index.html` `<head>` with `preconnect` hints. This is the correct place for font loading and avoids a re-evaluation on every render.

## Migration Scope

All screens and components are migrated at once (not incrementally). Every `.tsx` file in `src/` that uses inline `style` objects gets a companion `.module.css` file. After migration, inline `style` props are only allowed for runtime-dynamic CSS custom property values.

## agent-docs Reference

Ongoing style conventions are documented in `agent-docs/STYLES.md`.
