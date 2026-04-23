import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Flag, Player, RoundResult } from '../types';
import {
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
  setRoundData: (flag: Flag, options: Flag[]) => void;
  recordAnswer: (flag: Flag | null, correct: boolean, points: number) => void;
  recordExplorerAnswer: (correct: boolean) => void;
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

function createStartActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'startExplorer' | 'startFamily' | 'startSolo'> {
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
  };
}

function createRoundActions(
  set: (recipe: (state: typeof initial) => void) => void,
): Pick<GameStore, 'advancePlayerTurn' | 'recordAnswer' | 'recordExplorerAnswer' | 'setRoundData'> {
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

    advancePlayerTurn: () =>
      set((state) => {
        state.currentPlayerIdx += 1;
        state.playerRound = 0;
        state.currentFlag = null;
      }),
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
