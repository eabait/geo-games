# Styling Rules

## Global Foundation

- Global design tokens live in `src/styles/tokens.css`.
- Global animations and the shared `.btn` utility live in `src/styles/animations.css`.
- `src/styles/index.css` is the single global stylesheet entry loaded from `src/main.tsx`.

## Component Ownership

- Every styled component or screen owns a colocated `.module.css` file.
- Screen and component `.tsx` files should import their own CSS module instead of defining large inline style objects.
- Game-level token overrides belong in `modules/<game>/styles/theme.css`.

## Inline Style Policy

- Inline `style` is allowed only for runtime CSS custom properties or SVG geometry values.
- Valid examples:
  - timer width/color via `--timer-width` and `--timer-color`
  - player-specific accent colors via `--accent-color` or `--player-color`
  - staggered animation delays via CSS custom properties
  - SVG coordinates such as `cx`, `cy`, `points`, and similar runtime geometry
- Inline `style` must not contain static layout, spacing, typography, border, or background declarations that belong in CSS Modules.

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

## Migration Heuristics

- Prefer design tokens over repeating raw app colors when a matching token exists.
- Keep animations in CSS classes; use runtime custom properties only when the animation timing or value is dynamic.
- Tests should assert behavior and structure first. If a styling architecture rule needs protection, add a narrow regression test for that rule rather than snapshotting large style strings.
