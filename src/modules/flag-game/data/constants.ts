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

// Game timing (milliseconds)
export const ANSWER_DELAY_MS = 1600;
export const SCORE_POP_DURATION_MS = 400;
export const EXPLORER_NEXT_DELAY_MS = 1000;
export const MS_PER_SECOND = 1000;

// Streak thresholds (answer count)
export const STREAK_BONUS_THRESHOLD = 2; // streak >= 2 triggers bonus multiplier
export const STREAK_SOUND_THRESHOLD = 3; // streak >= 3 triggers streak sound

// Timer colour thresholds (percentage of time remaining)
export const TIMER_PCT_GREEN = 50;
export const TIMER_PCT_YELLOW = 25;

// Timer tick thresholds (seconds remaining)
export const TICK_THRESHOLD = 5;
export const TICK_URGENT_THRESHOLD = 2;

// Explorer mode
export const EXPLORER_INITIAL_TIME = 20;
export const EXPLORER_SCORE_PER_CORRECT = 20;
export const EXPLORER_TIME_BONUS = 3;
export const EXPLORER_TIMER_RED = 5;
export const EXPLORER_TIMER_YELLOW = 10;
export const EXPLORER_STREAK_THRESHOLD = 2;

// Option button animation stagger
export const OPTION_ANIM_BASE_DELAY = 0.05;
export const OPTION_ANIM_STEP_DELAY = 0.07;
export const OPTION_FADE_OPACITY = 0.35;
export const CHAR_CODE_A = 65; // String.fromCharCode base for option labels A/B/C/D

// Results screen trophy thresholds
export const TROPHY_GOLD_SCORE = 200;
export const TROPHY_SILVER_SCORE = 100;

// Staggered row/item animation (seconds)
export const RESULT_ROW_ANIM_BASE = 0.2;
export const RESULT_ROW_ANIM_STEP = 0.05;
export const DIFFICULTY_ANIM_BASE = 0.1;
export const DIFFICULTY_ANIM_STEP = 0.1;

// Family results podium animation
export const PODIUM_SLIDE_BASE = 0.5;
export const PODIUM_SLIDE_STEP = 0.2;
export const PODIUM_RISE_BASE = 0.8;
export const PODIUM_RISE_STEP = 0.15;

// Family setup constraints
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;

// Streak bonus scoring
export const STREAK_BONUS_MULTIPLIER = 2;

// Timer percentage (convert to 0-100 scale)
export const TIMER_PCT_FULL = 100;

// Default round seconds (fallback when difficulty not set)
export const DEFAULT_ROUND_SECONDS = 15;

// Family results podium heights (px)
export const PODIUM_HEIGHT_FIRST = 150;
export const PODIUM_HEIGHT_SECOND = 100;
export const PODIUM_HEIGHT_THIRD = 80;
export const PODIUM_BLOCK_WIDTH = 76;
