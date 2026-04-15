import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Flag, Player, RoundResult } from '../types';

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

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initial,

    startSolo: (difficulty) =>
      set((s) => {
        Object.assign(s, initial);
        s.mode = 'solo';
        s.difficulty = difficulty;
      }),

    startFamily: (difficulty, players) =>
      set((s) => {
        Object.assign(s, initial);
        s.mode = 'family';
        s.difficulty = difficulty;
        s.players = players;
        players.forEach((p) => {
          s.familyScores[p.id] = 0;
          s.familyHistory[p.id] = [];
          s.familyStreaks[p.id] = 0;
        });
      }),

    startExplorer: (difficulty) =>
      set((s) => {
        Object.assign(s, initial);
        s.mode = 'explorer';
        s.difficulty = difficulty;
        s.explorerTime = 20;
      }),

    setRoundData: (flag, options) =>
      set((s) => {
        s.currentFlag = flag;
        s.options = options;
        s.selected = null;
        s.showHint = false;
        s.usedFlags.push(flag.name);
      }),

    recordAnswer: (flag: Flag | null, correct, points) =>
      set((s) => {
        s.selected = flag;
        s.roundHistory.push({ flag: s.currentFlag!, correct });
        if (correct) {
          s.score += points;
          s.streak += 1;
          s.bestStreak = Math.max(s.bestStreak, s.streak);
        } else {
          s.streak = 0;
        }
      }),

    recordExplorerAnswer: (correct) =>
      set((s) => {
        s.explorerTotal += 1;
        s.explorerHistory.push({ flag: s.currentFlag!, correct });
        if (correct) {
          s.explorerScore += 20;
          s.explorerCorrect += 1;
          s.explorerTime += 3;
          s.explorerStreak += 1;
          s.explorerBestStreak = Math.max(s.explorerBestStreak, s.explorerStreak);
        } else {
          s.explorerStreak = 0;
        }
      }),

    advancePlayerTurn: () =>
      set((s) => {
        s.currentPlayerIdx += 1;
        s.playerRound = 0;
        s.currentFlag = null;
      }),

    setShowHint: (show) =>
      set((s) => {
        s.showHint = show;
      }),

    tickExplorerTime: () =>
      set((s) => {
        s.explorerTime -= 1;
      }),

    reset: () =>
      set((s) => {
        Object.assign(s, initial);
      }),
  })),
);
