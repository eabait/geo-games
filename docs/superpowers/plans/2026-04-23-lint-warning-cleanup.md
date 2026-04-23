# Lint Warning Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the current ESLint output from `61 warnings` to `0 warnings`, and block commits when staged files still produce lint warnings.

**Architecture:** Fix this in layers: first tighten the staged-file commit workflow, then modernize the ESLint config, then remove warning clusters with targeted refactors and narrow rule exceptions only where the code is clearly data-only. Prefer extracting hooks and small components over weakening rules for production code.

**Tech Stack:** React 19, TypeScript strict mode, Vite, Zustand, React Router, ESLint 9 flat config, Husky, lint-staged, Vitest.

---

## File Map

**Modify:**
- `.husky/pre-commit`
- `package.json`
- `eslint.config.js`
- `src/modules/flag-game/components/DifficultyButton.test.tsx`
- `src/modules/flag-game/components/MobileMap.tsx`
- `src/modules/flag-game/components/OptionButton.tsx`
- `src/modules/flag-game/components/PlayerInput.test.tsx`
- `src/modules/flag-game/components/effects/Confetti.tsx`
- `src/modules/flag-game/components/effects/Sparkles.tsx`
- `src/modules/flag-game/data/flags.ts`
- `src/modules/flag-game/data/worldShapes.ts`
- `src/modules/flag-game/hooks/useGameRound.ts`
- `src/modules/flag-game/hooks/useSoundEngine.ts`
- `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`
- `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`
- `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`
- `src/modules/flag-game/screens/FamilyResultsScreen.tsx`
- `src/modules/flag-game/screens/FamilySetupScreen.tsx`
- `src/modules/flag-game/screens/ResultsScreens.test.tsx`
- `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- `src/modules/flag-game/store/gameStore.ts`
- `src/shared/components/BackgroundStars.tsx`

**Create:**
- `src/modules/flag-game/hooks/useGameSfx.ts`
- `src/modules/flag-game/hooks/useScorePop.ts`
- `src/modules/flag-game/hooks/usePlayingTimer.ts`
- `src/modules/flag-game/hooks/useSoloPlayingState.ts`
- `src/modules/flag-game/hooks/useFamilyPlayingState.ts`
- `src/modules/flag-game/hooks/useExplorerPlayingState.ts`

**Verification commands:**
- `npm run lint`
- `npx eslint --max-warnings=0 <staged files>`
- `npm run test:run`
- `npm run typecheck`

---

## Task 1: Enforce the staged-file warning gate

**Files:**
- Modify: `.husky/pre-commit`
- Modify: `package.json`

- [ ] Update `lint-staged` so staged `*.ts` and `*.tsx` files run `eslint --max-warnings=0 --fix` before Prettier.
- [ ] Keep the pre-commit hook minimal: continue using `npx lint-staged` instead of adding a second full-repo lint step.
- [ ] Document the behavior in the `lint-staged` config comments or script naming: this gate is scoped to staged files, not the whole repository.
- [ ] Verify the gate with one staged warning in a TS/TSX file and confirm the commit path fails until the warning is fixed.
- [ ] Re-run the staged-file check with the warning removed and confirm the hook succeeds.
- [ ] Commit this as its own change: `chore: fail staged commits on lint warnings`

**Notes:**
- This is the pragmatic version of "only when staged files introduce warnings". It blocks commits when a staged file still has warnings. It does not compute a warning diff against the pre-staged version.
- If true warning-delta detection is required later, add a dedicated script after the main cleanup is complete.

---

## Task 2: Modernize the ESLint boundaries config

**Files:**
- Modify: `eslint.config.js`

- [ ] Replace deprecated `boundaries/element-types` with `boundaries/dependencies`.
- [ ] Convert legacy selector syntax to the current object-based selector format for all five rule entries.
- [ ] Keep the existing architecture policy intact:
- [ ] `app` can depend on `router` and `shared`
- [ ] `router` can depend on `module` and `shared`
- [ ] `module` can depend on `shared`
- [ ] `shared` can depend only on `shared`
- [ ] `main` can depend on `app` and `shared`
- [ ] Run `npm run lint` and confirm the boundaries deprecation warnings are gone before touching feature code.
- [ ] Commit this separately: `chore: migrate boundaries lint config`

---

## Task 3: Remove warnings that should be solved by config, not refactors

**Files:**
- Modify: `eslint.config.js`
- Modify: `src/modules/flag-game/data/flags.ts`
- Modify: `src/modules/flag-game/data/worldShapes.ts`

- [ ] Extend the existing data-file carve-out so pure data files are exempt from `max-lines` in addition to `no-magic-numbers`.
- [ ] Keep the exemption scoped to `flags.ts` and `worldShapes.ts`; do not broaden it to all module data files without a clear reason.
- [ ] Do not split `flags.ts` only to satisfy `max-lines`; that would add maintenance overhead without improving behavior.
- [ ] Re-run `npm run lint` and confirm both data-file warnings disappear.
- [ ] Commit this as `chore: relax size rules for pure data files`

---

## Task 4: Extract shared playing-screen orchestration into hooks

**Files:**
- Create: `src/modules/flag-game/hooks/useGameSfx.ts`
- Create: `src/modules/flag-game/hooks/useScorePop.ts`
- Create: `src/modules/flag-game/hooks/usePlayingTimer.ts`
- Create: `src/modules/flag-game/hooks/useSoloPlayingState.ts`
- Create: `src/modules/flag-game/hooks/useFamilyPlayingState.ts`
- Create: `src/modules/flag-game/hooks/useExplorerPlayingState.ts`
- Modify: `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- Modify: `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`
- Modify: `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`

- [ ] Extract the repeated `useSoundEngine` plus typed `sfx` wrapper into `useGameSfx`.
- [ ] Extract the repeated score-pop timeout behavior into `useScorePop`.
- [ ] Extract the repeated timer setup and urgent-tick behavior shared by solo and family modes into `usePlayingTimer`.
- [ ] Move non-render logic out of each playing screen into a dedicated hook per screen so the routed screen component mainly reads state and renders.
- [ ] Keep explorer-specific round generation and countdown behavior in `useExplorerPlayingState`, not in the screen file.
- [ ] Keep solo/family mode differences explicit; do not force all three screens through one oversized abstraction.
- [ ] Re-run targeted tests for the playing screens after each hook extraction to avoid large regressions.
- [ ] Commit this as one or more small refactor commits, not one giant screen rewrite.

**Why this task exists:**
- `SoloPlayingScreen.tsx`, `FamilyPlayingScreen.tsx`, and `ExplorerPlayingScreen.tsx` currently violate the project rule that screens should not own business logic.
- Fixing the lint warnings here should also move the code closer to the repo architecture instead of just silencing ESLint.

---

## Task 5: Split `useGameRound` into smaller responsibilities

**Files:**
- Modify: `src/modules/flag-game/hooks/useGameRound.ts`

- [ ] Extract round-pool selection logic into a small pure helper inside the module or a nearby private function.
- [ ] Extract solo answer handling into a focused function with explicit inputs.
- [ ] Extract family answer handling into a focused function with explicit inputs.
- [ ] Keep the exported hook surface small: it should still return `handleAnswer`.
- [ ] Avoid introducing a new cross-module utility; this logic belongs to the flag-game module.
- [ ] Re-run lint and the playing-screen tests after this refactor.
- [ ] Commit this as `refactor: simplify game round hook`

---

## Task 6: Refactor `gameStore` for readability and size

**Files:**
- Modify: `src/modules/flag-game/store/gameStore.ts`

- [ ] Pull repeated reset logic behind a local helper instead of repeating `Object.assign(state, initial)` patterns inline.
- [ ] Extract family-player initialization into a named helper so `startFamily` is shorter and easier to read.
- [ ] Keep the public store API stable unless a caller refactor is already required for another lint fix.
- [ ] Preserve Zustand plus Immer behavior exactly; this task is about readability and function size, not state-model changes.
- [ ] Re-run tests that cover game startup flows after this change.
- [ ] Commit this as `refactor: simplify game store actions`

---

## Task 7: Normalize named constants in effects and sound code

**Files:**
- Modify: `src/modules/flag-game/components/effects/Confetti.tsx`
- Modify: `src/modules/flag-game/components/effects/Sparkles.tsx`
- Modify: `src/modules/flag-game/hooks/useSoundEngine.ts`
- Modify: `src/shared/components/BackgroundStars.tsx`

- [ ] Replace remaining inline numeric literals in effect components with named constants colocated near the top of each file.
- [ ] Rename short variables like `s` in `BackgroundStars.tsx` to descriptive names.
- [ ] In `useSoundEngine.ts`, keep musical frequencies and timing values as named constants, but split the current large builder into smaller sound-group helpers so the file drops below the line-count limit.
- [ ] Do not weaken `no-magic-numbers` for these files; the better fix is readable constants.
- [ ] Re-run lint after each file group to make sure the warning count trends down rather than moving around.
- [ ] Commit this as `refactor: clean up sound and effects constants`

---

## Task 8: Clean up test-file size warnings without weakening test coverage

**Files:**
- Modify: `src/modules/flag-game/components/DifficultyButton.test.tsx`
- Modify: `src/modules/flag-game/components/PlayerInput.test.tsx`
- Modify: `src/modules/flag-game/screens/ResultsScreens.test.tsx`

- [ ] Split oversized test functions into smaller `it` blocks with one behavior each.
- [ ] Extract duplicated setup into local test helpers where it reduces line count without hiding test intent.
- [ ] Keep assertions behavior-focused; do not collapse multiple scenarios into a single large helper-driven test just to satisfy the linter.
- [ ] Run the touched tests directly after each refactor.
- [ ] Commit this as `test: split oversized lint-heavy specs`

---

## Task 9: Clean up the remaining screen and component warnings

**Files:**
- Modify: `src/modules/flag-game/components/MobileMap.tsx`
- Modify: `src/modules/flag-game/components/OptionButton.tsx`
- Modify: `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`
- Modify: `src/modules/flag-game/screens/FamilyResultsScreen.tsx`
- Modify: `src/modules/flag-game/screens/FamilySetupScreen.tsx`

- [ ] Reduce `OptionButton.tsx` complexity by replacing nested conditional styling and label logic with precomputed state helpers.
- [ ] Reduce `MobileMap.tsx` size by extracting coordinate helpers or small render helpers, not by moving logic into the screen.
- [ ] Simplify the family results and setup screens by replacing one-letter callback parameters with descriptive names and extracting local derived values.
- [ ] Trim `ExplorerResultsScreen.tsx` below the function-length threshold with the same approach: derived values first, render second.
- [ ] Re-run the specific screen and component tests affected by each cleanup.
- [ ] Commit this as `refactor: finish lint cleanup on remaining ui files`

---

## Task 10: Final verification and lock the baseline

**Files:**
- Modify: any files still touched by the tasks above

- [ ] Run `npm run lint` and confirm the output is `0 errors, 0 warnings`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test:run`.
- [ ] Inspect the final `git diff --stat` to make sure no unrelated files were changed during cleanup.
- [ ] If any warning remains, fix it before merging; do not ship with "just one leftover warning".
- [ ] Commit the final verification or fold it into the last cleanup commit if no extra code changes were needed.

---

## Suggested Commit Order

1. `chore: fail staged commits on lint warnings`
2. `chore: migrate boundaries lint config`
3. `chore: relax size rules for pure data files`
4. `refactor: extract shared playing screen hooks`
5. `refactor: simplify game round hook`
6. `refactor: simplify game store actions`
7. `refactor: clean up sound and effects constants`
8. `test: split oversized lint-heavy specs`
9. `refactor: finish lint cleanup on remaining ui files`

---

## Success Criteria

- `npm run lint` returns no warnings and no errors.
- A staged TS/TSX file with a warning fails the pre-commit hook.
- Existing architecture rules stay enforced after the boundaries migration.
- Playing screens become thinner and align better with the repo rule that screens should read from hooks and stores rather than own business logic.
