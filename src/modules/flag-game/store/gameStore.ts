/* eslint-disable max-lines */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { DuelRoundResolution, DuelRoundResult, Flag, Player, RoundResult } from '../types';
import {
  DIFFICULTY,
  EXPLORER_INITIAL_TIME,
  EXPLORER_SCORE_PER_CORRECT,
  EXPLORER_TIME_BONUS,
} from '../data/constants';

import type { DifficultyKey, GameMode } from '@/shared/types';

interface GameStore {
  // Common
  mode: GameMode | null;
  difficulty: DifficultyKey | null;
  currentFlag: Flag | null;
  options: Flag[];
  selected: Flag | null;
  showHint: boolean;
  usedFlags: string[];
  // Solo
  round: number;
  score: number;
  streak: number;
  bestStreak: number;
  roundHistory: RoundResult[];
  // Family
  players: Player[];
  currentPlayerIdx: number;
  playerRound: number;
  familyScores: Record<string, number>;
  familyHistory: Record<string, RoundResult[]>;
  familyStreaks: Record<string, number>;
  // Duel
  duelPlayers: Player[];
  duelRound: number;
  duelScores: Record<string, number>;
  duelHistory: DuelRoundResult[];
  duelAnsweringPlayerId: string | null;
  duelSelectedFlag: Flag | null;
  duelResolvedBy: string | null;
  duelResolution: DuelRoundResolution | null;
  // Explorer
  explorerTime: number;
  explorerScore: number;
  explorerCorrect: number;
  explorerTotal: number;
  explorerHistory: RoundResult[];
  explorerStreak: number;
  explorerBestStreak: number;
  // Actions
  startSolo: (difficulty: DifficultyKey) => void;
  startFamily: (difficulty: DifficultyKey, players: Player[]) => void;
  startExplorer: (difficulty: DifficultyKey) => void;
  startDuel: (difficulty: DifficultyKey, players: Player[]) => void;
  setRoundData: (flag: Flag, options: Flag[]) => void;
  recordAnswer: (flag: Flag | null, correct: boolean, points: number) => void;
  recordDuelAnswer: (playerId: string, chosenFlag: Flag) => void;
  recordDuelTimeout: () => void;
  recordExplorerAnswer: (correct: boolean) => void;
  advanceDuelRound: () => void;
  advancePlayerTurn: () => void;
  setShowHint: (show: boolean) => void;
  tickExplorerTime: () => void;
  reset: () => void;
}

const initial = {
  mode: null as GameMode | null,
  difficulty: null as DifficultyKey | null,
  currentFlag: null as Flag | null,
  options: [] as Flag[],
  selected: null as Flag | null,
  showHint: false,
  usedFlags: [] as string[],
  round: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  roundHistory: [] as RoundResult[],
  players: [] as Player[],
  currentPlayerIdx: 0,
  playerRound: 0,
  familyScores: {} as Record<string, number>,
  familyHistory: {} as Record<string, RoundResult[]>,
  familyStreaks: {} as Record<string, number>,
  duelPlayers: [] as Player[],
  duelRound: 0,
  duelScores: {} as Record<string, number>,
  duelHistory: [] as DuelRoundResult[],
  duelAnsweringPlayerId: null as string | null,
  duelSelectedFlag: null as Flag | null,
  duelResolvedBy: null as string | null,
  duelResolution: null as DuelRoundResolution | null,
  explorerTime: 0,
  explorerScore: 0,
  explorerCorrect: 0,
  explorerTotal: 0,
  explorerHistory: [] as RoundResult[],
  explorerStreak: 0,
  explorerBestStreak: 0,
};

function resetState(state: typeof initial): void {
  Object.assign(state, initial);
}

function initializeFamilyPlayers(state: typeof initial, players: Player[]): void {
  state.players = players;
  players.forEach((player) => {
    state.familyScores[player.id] = 0;
    state.familyHistory[player.id] = [];
    state.familyStreaks[player.id] = 0;
  });
}

function initializeDuelPlayers(state: typeof initial, players: Player[]): void {
  state.duelPlayers = [...players];
  state.duelScores = {};
  state.duelHistory = [];
  players.forEach((player) => {
    state.duelScores[player.id] = 0;
  });
}

function getDuelOpponent(players: Player[], playerId: string): Player | null {
  return players.find((player) => player.id !== playerId) ?? null;
}

function canRecordDuelResolution(
  state: typeof initial,
  answeringPlayer: Player | null,
): answeringPlayer is Player {
  return (
    state.mode === 'duel' &&
    answeringPlayer !== null &&
    state.currentFlag !== null &&
    state.difficulty !== null &&
    state.duelResolution === null
  );
}

function applyDuelAnswerResult(state: typeof initial, playerId: string, chosenFlag: Flag): void {
  const opponent = getDuelOpponent(state.duelPlayers, playerId);
  const isCorrect = chosenFlag.code === state.currentFlag!.code;
  const winnerId = isCorrect ? playerId : (opponent?.id ?? null);
  const loserId = isCorrect ? (opponent?.id ?? null) : playerId;

  state.duelAnsweringPlayerId = playerId;
  state.duelSelectedFlag = chosenFlag;
  state.duelResolvedBy = winnerId;
  state.duelResolution = isCorrect ? 'correct' : 'opponent-awarded';
  if (winnerId) {
    state.duelScores[winnerId] =
      (state.duelScores[winnerId] ?? 0) + DIFFICULTY[state.difficulty!].points;
  }
  state.duelHistory.push({
    flag: state.currentFlag!,
    winnerId,
    loserId,
    resolution: state.duelResolution,
    answeringPlayerId: playerId,
  });
}

function clearDuelRoundState(state: typeof initial): void {
  state.currentFlag = null;
  state.options = [];
  state.selected = null;
  state.showHint = false;
  state.duelAnsweringPlayerId = null;
  state.duelSelectedFlag = null;
  state.duelResolvedBy = null;
  state.duelResolution = null;
}

function createStartActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'startDuel' | 'startExplorer' | 'startFamily' | 'startSolo'> {
  return {
    startSolo: (difficulty) =>
      set((state) => {
        resetState(state);
        state.mode = 'solo';
        state.difficulty = difficulty;
      }),

    startFamily: (difficulty, players) =>
      set((state) => {
        resetState(state);
        state.mode = 'family';
        state.difficulty = difficulty;
        initializeFamilyPlayers(state, players);
      }),

    startExplorer: (difficulty) =>
      set((state) => {
        resetState(state);
        state.mode = 'explorer';
        state.difficulty = difficulty;
        state.explorerTime = EXPLORER_INITIAL_TIME;
      }),

    startDuel: (difficulty, players) =>
      set((state) => {
        resetState(state);
        state.mode = 'duel';
        state.difficulty = difficulty;
        initializeDuelPlayers(state, players);
      }),
  };
}

function createCommonRoundActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'recordAnswer' | 'setRoundData'> {
  return {
    setRoundData: (flag, options) =>
      set((state) => {
        state.currentFlag = flag;
        state.options = options;
        state.selected = null;
        state.showHint = false;
        state.usedFlags.push(flag.name);
      }),

    recordAnswer: (flag, correct, points) =>
      set((state) => {
        state.selected = flag;
        state.roundHistory.push({ flag: state.currentFlag!, correct });
        if (correct) {
          state.score += points;
          state.streak += 1;
          state.bestStreak = Math.max(state.bestStreak, state.streak);
        } else {
          state.streak = 0;
        }
      }),
  };
}

function createDuelRoundActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'advanceDuelRound' | 'recordDuelAnswer' | 'recordDuelTimeout'> {
  return {
    recordDuelAnswer: (playerId, chosenFlag) =>
      set((state) => {
        const answeringPlayer = state.duelPlayers.find((player) => player.id === playerId) ?? null;
        if (!canRecordDuelResolution(state, answeringPlayer)) {
          return;
        }

        applyDuelAnswerResult(state, playerId, chosenFlag);
      }),

    recordDuelTimeout: () =>
      set((state) => {
        if (
          state.mode !== 'duel' ||
          !state.currentFlag ||
          !state.difficulty ||
          state.duelResolution !== null
        ) {
          return;
        }

        state.duelResolution = 'timeout';
        state.duelHistory.push({
          flag: state.currentFlag,
          winnerId: null,
          loserId: null,
          resolution: 'timeout',
          answeringPlayerId: null,
        });
      }),

    advanceDuelRound: () =>
      set((state) => {
        if (state.mode !== 'duel') {
          return;
        }

        state.duelRound += 1;
        clearDuelRoundState(state);
      }),
  };
}

function createExplorerRoundActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'recordExplorerAnswer'> {
  return {
    recordExplorerAnswer: (correct) =>
      set((state) => {
        state.explorerTotal += 1;
        state.explorerHistory.push({ flag: state.currentFlag!, correct });
        if (correct) {
          state.explorerScore += EXPLORER_SCORE_PER_CORRECT;
          state.explorerCorrect += 1;
          state.explorerTime += EXPLORER_TIME_BONUS;
          state.explorerStreak += 1;
          state.explorerBestStreak = Math.max(state.explorerBestStreak, state.explorerStreak);
        } else {
          state.explorerStreak = 0;
        }
      }),
  };
}

function createTurnActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'advancePlayerTurn'> {
  return {
    advancePlayerTurn: () =>
      set((state) => {
        state.currentPlayerIdx += 1;
        state.playerRound = 0;
        state.currentFlag = null;
      }),
  };
}

function createRoundActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<
  GameStore,
  | 'advanceDuelRound'
  | 'advancePlayerTurn'
  | 'recordAnswer'
  | 'recordDuelAnswer'
  | 'recordDuelTimeout'
  | 'recordExplorerAnswer'
  | 'setRoundData'
> {
  return {
    ...createCommonRoundActions(set),
    ...createDuelRoundActions(set),
    ...createExplorerRoundActions(set),
    ...createTurnActions(set),
  };
}

function createUtilityActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'reset' | 'setShowHint' | 'tickExplorerTime'> {
  return {
    setShowHint: (show) =>
      set((state) => {
        state.showHint = show;
      }),

    tickExplorerTime: () =>
      set((state) => {
        state.explorerTime -= 1;
      }),

    reset: () =>
      set((state) => {
        resetState(state);
      }),
  };
}

function createActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Omit<GameStore, keyof typeof initial> {
  return {
    ...createStartActions(set),
    ...createRoundActions(set),
    ...createUtilityActions(set),
  };
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initial,
    ...createActions(set),
  })),
);
