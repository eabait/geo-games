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

## Migration Heuristics

- Prefer design tokens over repeating raw app colors when a matching token exists.
- Keep animations in CSS classes; use runtime custom properties only when the animation timing or value is dynamic.
- Tests should assert behavior and structure first. If a styling architecture rule needs protection, add a narrow regression test for that rule rather than snapshotting large style strings.
