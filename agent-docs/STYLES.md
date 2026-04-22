# Styling Conventions

## Approach

CSS Modules + CSS Custom Properties (design tokens). No inline style objects except for runtime-dynamic values.

## Rules

**1. All visual values come from tokens**
Never hardcode colors, font families, or radii. Use the CSS custom properties defined in `src/styles/tokens.css`.

**2. Component styles live in colocated CSS Modules**
Every component `Foo.tsx` has a companion `Foo.module.css` in the same directory. Import it as `import styles from './Foo.module.css'`.

**3. Inline `style` prop is only for runtime-dynamic values**
If a style value is determined at runtime by a JS prop, pass it as a CSS custom property:
```tsx
// ✅ correct — delay is dynamic
<div style={{ '--delay': `${delay}s` } as React.CSSProperties} />

// ❌ wrong — static value belongs in the CSS Module
<div style={{ borderRadius: 20 }} />
```

**4. Animations are defined in `src/styles/animations.css`**
All `@keyframes` live there. Reference them by name in CSS Modules.

**5. Per-game theming via `theme.css`**
Each game has `src/modules/<game>/styles/theme.css` that overrides tokens for that game. Global defaults come from `src/styles/tokens.css`.

## Token Reference

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0f172a` | Page background |
| `--color-bg-mid` | `#1e293b` | Gradient midpoint |
| `--color-text` | `#f1f5f9` | Primary text |
| `--color-text-muted` | `#94a3b8` | Secondary text |
| `--color-text-dim` | `#64748b` | Tertiary / label text |
| `--color-accent` | `#fbbf24` | Highlight, arrows, CTAs |
| `--card-bg` | `rgba(255,255,255,0.06)` | Glassmorphism card background |
| `--card-border` | `rgba(255,255,255,0.10)` | Glassmorphism card border |
| `--card-radius` | `20px` | Card border radius |
| `--card-blur` | `12px` | Card backdrop blur |
| `--font-body` | `'Nunito', sans-serif` | Body text |
| `--font-display` | `'Fredoka', sans-serif` | Headings |
| `--z-overlay` | `50` | Overlays (confetti, flash) |
| `--z-fixed` | `100` | Fixed UI elements (sound button) |

## File Structure

```
src/
  styles/
    tokens.css        # CSS custom properties
    animations.css    # @keyframes + .btn class
    index.css         # imports tokens + animations
  modules/
    <game>/
      styles/
        theme.css     # token overrides for this game
      components/
        Foo.tsx
        Foo.module.css
      screens/
        Bar.tsx
        Bar.module.css
  shared/
    components/
      Baz.tsx
      Baz.module.css
```
