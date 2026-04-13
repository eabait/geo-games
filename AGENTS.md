# geo-games — Agent Guide

## What this is

A geography learning game suite built with **React + Vite + TypeScript**.
Currently ships one game (flag identification) with three modes: Solo, Explorer (map pins), and Family (turn-based). Designed to grow into multiple geography games.

## Stack

| Layer | Tool |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Client state | Zustand |
| Server/async state | TanStack Query (React Query) |
| Styling | Inline styles + CSS-in-JS (no external CSS framework) |

## Source layout

```
src/
  modules/
    flag-game/          # self-contained game module
      components/       # UI pieces used within this game
      screens/          # one file per routed screen
      hooks/            # game-specific hooks
      store/            # Zustand store
      data/             # static data (flags, world shapes, constants)
      routes.tsx        # route definitions exported by this module
      types.ts          # TypeScript types for this module
    shared/
      components/       # reusable across all modules
      hooks/            # cross-module hooks (e.g. useSoundEngine)
      types.ts
  router/
    index.tsx           # root router, composes module routes
  App.tsx
  main.tsx
```

> Each module is self-contained. It owns its routes, state, data, and types.
> Cross-cutting concerns live in `shared/`.

## Route structure

```
/                          → redirects to /flag-game
/flag-game                 → game menu
/flag-game/solo            → difficulty picker
/flag-game/solo/play       → solo game
/flag-game/solo/results    → solo results
/flag-game/explorer        → difficulty picker
/flag-game/explorer/play   → explorer game (map pins)
/flag-game/explorer/results
/flag-game/family          → player setup
/flag-game/family/play     → family game (turn-based)
/flag-game/family/results
```

Routes are defined per-module in `routes.tsx` and registered in `src/router/index.tsx`.

## State management rules

- **Zustand** for all client game state (current round, score, selected answer, player turns).
  Store lives at `modules/<game>/store/`. Never put store logic in components.
- **TanStack Query** for any async data (API calls, leaderboards, remote flag data).
  Wrap fetches in query hooks inside `hooks/`. Components call hooks, not `fetch` directly.
- Local `useState` is fine for UI-only ephemeral state (hover, open/closed, input value).

## Key commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run typecheck # tsc --noEmit
npm run lint      # eslint (includes architecture boundary checks)
npm run lint:fix  # eslint --fix
npm run test      # vitest (watch mode)
npm run test:run  # vitest (single run, for CI)
npm run test:ui   # vitest UI
```

## Detailed docs

Read these before working in the relevant area:

- [agents-docs/ARCHITECTURE.md](agents-docs/ARCHITECTURE.md) — module boundaries, routing conventions, state flow, how to add a new game
- [agents-docs/CODE_CONVENTIONS.md](agents-docs/CODE_CONVENTIONS.md) — TypeScript, React, naming, file structure, import order, linting rules, testing patterns

## Core rules (always apply)

1. **One screen = one file** in `screens/`. Screens are routed; they are not reused.
2. **No logic in screens.** Screens read from stores/hooks and render. Business logic lives in hooks or the store.
3. **No inline component definitions.** Every component is a named export in its own file.
4. **TypeScript strict mode is on.** No `any`. Prefer explicit return types on hooks.
5. **Follow existing patterns** before introducing new ones. Read the relevant module before touching it.
6. **Keep modules self-contained.** A module must not import from another module's internals — only from `shared/`.
