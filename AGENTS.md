# geo-games — Agent Guide

## What this is

A geography learning game suite built with **React + Vite + TypeScript**. Currently ships one game (flag identification) with four modes: Solo, Explorer (map pins), Family (turn-based), and Duel (1v1 split-screen). Designed to grow into multiple geography games.

## Stack

| Layer | Tool |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Client state | Zustand |
| Styling | CSS Modules + CSS Custom Properties |

## Key commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run typecheck # tsc --noEmit
npm run lint      # eslint (includes architecture boundary checks)
npm run lint:fix  # eslint --fix
npm run test:run  # vitest (single run, for CI)
```

## Core rules (always apply)

1. **One screen = one file** in `screens/`. Screens are routed; they are not reused.
2. **No logic in screens.** Screens read from stores/hooks and render. Business logic lives in hooks or the store.
3. **No inline component definitions.** Every component is a named export in its own file.
4. **TypeScript strict mode is on.** No `any`. Explicit return types on hooks.
5. **Follow existing patterns** before introducing new ones. Read the relevant module before touching it.
6. **Keep modules self-contained.** A module must not import from another module's internals — only from `shared/`.

## Reference docs

Read before working in the relevant area:

- [agents-docs/ARCHITECTURE.md](agents-docs/ARCHITECTURE.md) — module structure, routing, state flow, adding a new game
- [agents-docs/CODE_CONVENTIONS.md](agents-docs/CODE_CONVENTIONS.md) — TypeScript, React, naming, imports, Zustand, linting, testing
- [agents-docs/STYLES.md](agents-docs/STYLES.md) — CSS Modules, design tokens, inline style policy
