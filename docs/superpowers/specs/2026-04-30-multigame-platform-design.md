# GeoMundo — Multigame Platform Design

**Date:** 2026-04-30
**Status:** Approved

## Overview

Evolve the existing flag quiz app into a unified geography learning platform called **GeoMundo**, targeting kids aged 6–12. The app launches with three games: the existing flag quiz, a new capital cities quiz, and a new cultural facts quiz. Player profiles and scores are stored locally in `localStorage` — no backend or auth required for v1.

---

## Goals

- Single hub screen at `/` where kids pick a game
- Up to 5 player profiles per device (name + emoji avatar), no passwords
- Per-profile score tracking across all games (games played, best score)
- Two new games: Capital Cities and Cultural Facts
- Shared quiz engine powering all three games' solo modes — no duplicated round/scoring logic
- Existing flag game modes (Explorer, Family, Duel) are untouched

---

## Architecture

### Routing

```
/                          → HubScreen (new)
/flag-game/...             → flag game (unchanged)
/capital-cities/           → capital cities menu
/capital-cities/solo       → difficulty picker
/capital-cities/solo/play  → playing screen
/capital-cities/solo/results → results screen
/cultural-facts/           → cultural facts menu
/cultural-facts/solo       → difficulty picker
/cultural-facts/solo/play  → playing screen
/cultural-facts/solo/results → results screen
```

`src/router/index.tsx` registers `capitalCitiesRoutes` and `culturalFactsRoutes` alongside the existing `flagGameRoutes`. The root redirect to `/flag-game` is replaced with the `HubScreen`.

### New shared building blocks

```
src/shared/
  quiz-engine/
    types.ts           # QuizItem<T>, QuizConfig<T>, QuizState<T>
    useQuizSession.ts  # generic round/scoring hook
    QuizLayout.tsx     # generic playing screen shell
  store/
    profileStore.ts    # Zustand + localStorage persist
```

Only `quiz-engine` and `profileStore` are promoted to `shared/` — everything else stays per-module.

---

## Shared Quiz Engine

### Types (`quiz-engine/types.ts`)

```ts
interface QuizItem<T> {
  id: string;
  data: T;
}

interface QuizConfig<T> {
  items: QuizItem<T>[];
  roundCount: number;
  generateOptions: (correct: QuizItem<T>, pool: QuizItem<T>[]) => QuizItem<T>[];
}

interface QuizState<T> {
  round: number;
  score: number;
  current: QuizItem<T> | null;
  options: QuizItem<T>[];
  selected: QuizItem<T> | null;
  answered: boolean;   // true after the player picks, before nextRound()
  isCorrect: boolean;  // drives correct/wrong feedback UI
  isFinished: boolean;
}
```

### Hook (`quiz-engine/useQuizSession.ts`)

Accepts a `QuizConfig<T>`, returns `QuizState<T>` plus `handleAnswer(item)`, `nextRound()`, `reset()`. Contains all round progression and scoring logic currently duplicated across `useSoloPlayingState`, and the equivalent logic in the new games.

### Layout (`quiz-engine/QuizLayout.tsx`)

Generic playing screen shell: timer bar, score display, round counter, 4 option buttons. Each game passes:
- `questionSlot` — render prop for the question area (flag emoji, country name, etc.)
- `renderOption` — function mapping a `QuizItem<T>` to a label string

Visual effects (confetti, sounds) slot in via the existing `PlayingEffects` pattern.

### Flag game refactor

`useSoloPlayingState.ts` is replaced by a thin wrapper around `useQuizSession`:

```ts
export function useSoloPlayingState(difficulty: DifficultyKey) {
  return useQuizSession({
    items: getFilteredFlags(difficulty),
    roundCount: ROUND_COUNT,
    generateOptions: pickFlagOptions,
  });
}
```

The flag game's `SoloPlayingScreen` switches to `QuizLayout`. Explorer, Family, and Duel modes are not changed.

---

## Player Profiles

### Store (`shared/store/profileStore.ts`)

```ts
interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;  // emoji
  scores: {
    [gameKey: string]: {
      gamesPlayed: number;
      totalScore: number;
      bestScore: number;
    };
  };
}

interface ProfileStore {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  addProfile: (name: string, avatar: string) => void;
  setActiveProfile: (id: string) => void;
  recordScore: (gameKey: string, score: number) => void;
}
```

Persisted via Zustand's `persist` middleware with `localStorage` as the storage adapter. Max 5 profiles enforced in `addProfile`.

### Game integration

Each game's results screen calls `profileStore.recordScore(gameKey, finalScore)` when a solo session ends. No other coupling between games and the profile store.

---

## Hub Screen

**Route:** `/`
**File:** `src/screens/HubScreen.tsx` — a new top-level `src/screens/` folder for platform-level screens (not inside any game module). The router registers it directly under the root `App` layout.

### Layout

1. **Profile bar (top)** — active player's emoji + name, "Cambiar jugador" button. On first visit (no profiles yet), shows a prompt to create one (enter name + pick avatar from 12 emoji options).

2. **Game cards (center)** — vertical list of 3 cards, one per game:
   - Icon, title, short description
   - Active player's best score (or "¡Aún no jugaste!" if never played)
   - "Jugar" button → navigates to that game's menu route

3. **Platform title** — "GeoMundo" at page top.

### Game card registry

A static array in `HubScreen.tsx` defines the available games:

```ts
const GAMES = [
  { key: 'flag-game',      icon: '🏳️', title: '¿Qué bandera es?',    route: '/flag-game',      description: '195 países del mundo' },
  { key: 'capital-cities', icon: '🏛️', title: '¿Cuál es la capital?', route: '/capital-cities', description: 'Capitales del mundo' },
  { key: 'cultural-facts', icon: '🌍', title: '¿Cuánto sabés del mundo?', route: '/cultural-facts', description: 'Tradiciones y culturas' },
];
```

Adding a future game means adding one entry here and registering its routes.

---

## Capital Cities Game (`src/modules/capital-cities/`)

### Data

Add a `capital: string` field to each entry in `src/modules/flag-game/data/flags.ts`. The capital cities module imports `FLAGS` and maps it to `QuizItem<{ name: string; capital: string; flag: string }>`.

### Question format

Show flag emoji + country name. Ask: "¿Cuál es la capital?" Four city-name options. Distractors are drawn from countries on the same continent to make wrong answers plausible.

### Difficulty

Reuses existing `DifficultyKey` — Easy: ~40 well-known countries, Medium: ~100, Hard: all 195.

### Module anatomy

```
modules/capital-cities/
  data/
    capitals.ts        # filter/map logic over FLAGS
  hooks/
    useCapitalQuiz.ts  # wraps useQuizSession with capital config
  screens/
    MenuScreen.tsx
    DifficultyScreen.tsx
    CapitalPlayingScreen.tsx
    CapitalResultsScreen.tsx
  routes.tsx
  types.ts
```

---

## Cultural Facts Game (`src/modules/cultural-facts/`)

### Data

New file `src/modules/cultural-facts/data/facts.ts` — ~40 countries, each with one cultural fact entry:

```ts
interface CulturalFact {
  countryId: string;
  countryName: string;
  flag: string;
  fact: string;      // e.g. "El sushi"
  category: 'food' | 'festival' | 'instrument' | 'tradition';
}
```

Starting set: 40 countries chosen for cultural recognizability for Spanish-speaking kids aged 6–12 (strong Latin American, European, and Asian representation).

### Question format

Show country name + flag emoji. Ask: "¿Qué es típico de [Country]?" Four options. Distractors come from other countries' facts **within the same category** (food vs food, festival vs festival) so wrong answers are educational, not random noise.

### Difficulty

Easy: 20 most recognizable countries. Hard: all 40.

### Module anatomy

Same structure as capital cities module.

---

## What is NOT in scope for v1

- Cloud accounts / backend
- Family or Duel modes for new games
- Country silhouette, food match, or other game ideas
- Leaderboards across players
- Badges or achievement system
- Internationalisation (app stays in Spanish)

---

## Claude Design Prompts

**Hub screen:**
> "Design a kids' geography learning app hub screen called GeoMundo, for ages 6–12, in Spanish. Dark space-themed background with stars. At the top: a player avatar (emoji) and name with a 'Cambiar' button. Center: 3 large colorful game cards in a vertical list — '¿Qué bandera es?' (🏳️), '¿Cuál es la capital?' (🏛️), '¿Cuánto sabés del mundo?' (🌍). Each card shows a best score badge. A big rounded 'Jugar' button on each card. Fun, playful, bold typography. Similar vibe to Duolingo but more adventurous."

**Quiz playing screens:**
> "Design two quiz game playing screens for a kids' geography app (ages 6–12) in Spanish, dark space theme with stars. Screen 1 — Capital Cities: shows a large flag emoji and country name at top, question '¿Cuál es la capital?', 4 rounded answer buttons with city names, a timer bar, score counter. Screen 2 — Cultural Facts: shows a country name and globe emoji, question '¿Qué es típico de Japón?', 4 answer buttons with short text options. Both screens: bright colors, big touch targets, celebratory green flash on correct answer."

**Profile creation:**
> "Design a profile creation screen for a kids' app in Spanish. Dark space background. A text input for the player's name ('¿Cómo te llamás?'). A grid of 12 large emoji avatar options to pick from (animals, rockets, planets). A 'Listo' confirmation button. Simple, fun, age 6–12."
