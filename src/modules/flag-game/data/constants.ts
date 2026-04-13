import type { DifficultyConfig } from '../types';

export const DIFFICULTY: Record<string, DifficultyConfig> = {
  easy: { label: 'Fácil', emoji: '😊', options: 3, time: 20, points: 10, hintCost: 3, maxTier: 1 },
  medium: {
    label: 'Medio',
    emoji: '🤔',
    options: 4,
    time: 15,
    points: 20,
    hintCost: 7,
    maxTier: 2,
  },
  hard: {
    label: 'Difícil',
    emoji: '🧠',
    options: 5,
    time: 10,
    points: 30,
    hintCost: 12,
    maxTier: 3,
  },
};

export const PCOLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#ec4899'];
export const PAVATARS = ['🦁', '🐯', '🦊', '🐸', '🦉', '🐧'];
export const CONTINENTS_LIST = ['Todos', 'América', 'Europa', 'África', 'Asia', 'Oceanía'];

export const RPP = 5; // rounds per player (family mode)
export const SOLO_R = 10; // rounds in solo mode
