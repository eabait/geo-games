import type { Continent, DifficultyKey, GameMode } from '@/shared/types';

export type { GameMode, DifficultyKey, Continent };

export interface Flag {
  code: string;
  name: string;
  continent: Continent;
  hint: string;
  tier: 1 | 2 | 3;
  pos: [lat: number, lng: number];
}

export interface DifficultyConfig {
  label: string;
  emoji: string;
  options: number;
  time: number;
  points: number;
  hintCost: number;
  maxTier: 1 | 2 | 3;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface RoundResult {
  flag: Flag;
  correct: boolean;
}

export interface FlagGameSettings {
  soundOn: boolean;
  continent: string;
}
