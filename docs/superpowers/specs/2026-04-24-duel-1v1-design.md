# Duel 1v1 Mode Design

**Date:** 2026-04-24
**Status:** Approved

## Context

`flag-game` currently ships three modes:
- `solo` for a single-player 10-round multiple-choice session
- `explorer` for map-based time pressure
- `family` for turn-based multiplayer

The new feature is a competitive `Duel 1v1` mode with simultaneous play on one shared screen. Both players see the same flag at the same time. The first player to tap the correct answer earns the round's points. If a player taps the wrong answer first, the opponent is immediately awarded the points and the round ends.

The user approved these gameplay constraints:
- The duel lasts `10 fixed rounds`
- The mode reuses the current `easy / medium / hard` difficulty definitions
- A wrong first tap awards the round's points to the opponent and ends the round

## Decision

**Implement Duel as an independent `flag-game` mode with its own route branch, setup screen, playing screen, results screen, hook, and dedicated store slice.**

Alternatives considered:
- **Family-mode variant** — rejected because `family` is turn-based and its state model does not fit simultaneous input.
- **Solo-mode variant** — rejected because `solo` assumes one actor, one score, and one answer source, which would make duel-specific logic harder to reason about and test.

This keeps the new behavior aligned with the current architecture:
- screens stay thin
- mode-specific logic lives in hooks and store actions
- existing `solo`, `family`, and `explorer` flows remain isolated

## Routes

Add a dedicated route branch:

```text
/flag-game/duel          -> Duel setup
/flag-game/duel/play     -> Duel playing screen
/flag-game/duel/results  -> Duel results screen
```

`MenuScreen` gets a new mode card that navigates to `/flag-game/duel`.

## Screen Design

### DuelSetupScreen

Purpose:
- collect exactly two player names
- let the user pick one of the existing difficulty levels
- start the duel and navigate to play

Behavior:
- reuse the family setup interaction pattern where practical
- require two non-empty player names before enabling the start button
- build two `Player` records using the existing avatar/color assignment pattern
- call `startDuel(difficulty, players)`

### DuelPlayingScreen

Purpose:
- render the shared flag and the split-screen competitive interaction

Layout:
- a shared round label such as `3/10`
- a shared timer bar
- a central/shared emphasis on the active flag
- a left player panel and a right player panel
- each player panel shows avatar, name, current score, and that player's answer buttons

Behavior:
- both players see the same `currentFlag`
- both players see the same answer options
- inputs are active for both players until the first tap or timeout
- once one player taps, the round resolves immediately and both sides lock
- after a short feedback delay, the next round loads or the results route is shown

### DuelResultsScreen

Purpose:
- summarize the match outcome and allow replay

Behavior:
- show the winner or a tie state
- show both final scores
- show a compact 10-round history summary
- `Rematch` restarts using the same players and difficulty
- `Menu` returns to `/flag-game`

## Store Design

Extend `GameMode` with:

```ts
type GameMode = 'solo' | 'family' | 'explorer' | 'duel';
```

Add a duel-specific store slice in `gameStore.ts` instead of overloading family state:

```ts
duelPlayers: Player[];
duelRound: number;
duelScores: Record<string, number>;
duelHistory: DuelRoundResult[];
duelResolvedBy: string | null;
duelResolution: 'correct' | 'opponent-awarded' | 'timeout' | null;
```

Shared round state can still reuse:
- `currentFlag`
- `options`
- `usedFlags`

The existing single `selected` field should not be the source of truth for duel winner resolution. Duel needs to record who acted first, who received points, and why the round ended.

## Types

Add a duel round result type in `src/modules/flag-game/types.ts`:

```ts
export interface DuelRoundResult {
  flag: Flag;
  winnerId: string | null;
  loserId: string | null;
  resolution: 'correct' | 'opponent-awarded' | 'timeout';
  answeringPlayerId: string | null;
}
```

This allows the results screen to summarize:
- who won each round
- whether the round ended by correct answer, gifted points, or timeout

## Store Actions

Add duel-specific actions:

```ts
startDuel: (difficulty: DifficultyKey, players: Player[]) => void;
recordDuelAnswer: (playerId: string, chosenFlag: Flag) => void;
recordDuelTimeout: () => void;
advanceDuelRound: () => void;
```

Expected behavior:

### `startDuel`
- resets unrelated game state
- sets `mode = 'duel'`
- stores difficulty and exactly two players
- initializes duel scores to zero
- initializes `duelRound = 0`

### `recordDuelAnswer`
- no-op if the round is already resolved
- compares the chosen answer against `currentFlag`
- if correct:
  - award `DIFFICULTY[difficulty].points` to the answering player
  - set `duelResolvedBy` to that player
  - set `duelResolution = 'correct'`
- if wrong:
  - award the same points to the opponent
  - set `duelResolvedBy` to the opponent
  - set `duelResolution = 'opponent-awarded'`
- append one `DuelRoundResult`
- lock further answers for the round

### `recordDuelTimeout`
- no-op if the round is already resolved
- append a timeout round result with no winner
- set `duelResolution = 'timeout'`
- lock further answers for the round

### `advanceDuelRound`
- clear round-resolution state
- increment duel progression when another round remains
- leave shared round data generation to the same round-setup path used by the playing layer
- leave final navigation to the playing hook/screen

## Playing Hook

Add `useDuelPlayingState.ts` to own duel-specific screen state and progression.

Responsibilities:
- read duel state from the store
- request round generation using the same flag/option logic used by other multiple-choice modes
- expose the two players, their scores, the shared timer state, and per-side answer handlers
- prevent duplicate submissions after the round resolves
- trigger delayed progression:
  - next round when `duelRound < 9`
  - navigate to `/flag-game/duel/results` after round 10 resolves

The hook should return a typed object similar to the existing playing hooks so the screen remains presentational.

## Round Flow

1. User opens `/flag-game/duel`
2. User enters two names and picks a difficulty
3. `startDuel(...)` initializes duel state
4. `DuelPlayingScreen` loads one shared flag and one shared option set
5. Both players can answer simultaneously from their half of the screen
6. The first tap resolves the round:
   - correct tap -> tapping player gets the difficulty points
   - wrong tap -> opponent gets the difficulty points
7. Both sides lock and show immediate feedback
8. After a short delay:
   - next round if fewer than 10 rounds have completed
   - otherwise navigate to results
9. If time expires before any tap, record `timeout` and continue with no score change

## UI Rules

The v1 duel UI should follow these rules:
- one shared flag per round
- one shared option set per round
- duplicated answer controls, one set per player side
- immediate round lock after the first tap
- no hint button
- no streak or combo mechanic

Feedback language can stay simple in v1:
- winner side: `Correct`
- loser side after wrong answer: `Gifted points`
- non-answering side after opponent correct: `Too slow`
- both sides after timeout: `Time's up`

## Error Handling

Guardrails:
- `DuelPlayingScreen` should render a loading or fallback state if the duel is not initialized correctly
- rematch should no-op if the required players or difficulty are missing
- answer handlers should no-op once a round has already been resolved
- timeout handling should no-op if the round was already resolved by a player tap

## Testing Strategy

### Store Tests

Extend `gameStore.test.ts` to cover:
- duel starts with mode, difficulty, players, and zeroed scores
- correct answer awards points to the answering player
- wrong answer awards points to the opponent
- timeout records no score change
- a resolved round does not accept a second answer
- round progression records 10 completed rounds without accepting an 11th scoring event

### Hook Tests

Add `useDuelPlayingState` tests to cover:
- correct score exposure for both players
- input locking after the first answer
- next-round progression after the feedback delay
- results navigation after the final round

### Screen Tests

Add screen coverage for:
- menu entry for duel mode
- setup validation requiring two names
- split-screen rendering during play
- results winner and tie rendering
- rematch action

## Out of Scope

Not included in v1:
- hint usage
- streak bonuses
- steal windows after a wrong answer
- duel-only difficulty tuning
- anti-cheat or device-side reaction fairness controls beyond "first tap wins"

## Implementation Notes

The preferred implementation should reuse existing assets and patterns where they already fit:
- `Player` shape
- difficulty constants
- flag selection and option generation logic
- visual treatment conventions from current screens

The new mode should not repurpose family internals as its primary state model. Reuse utilities, not turn-based semantics.
