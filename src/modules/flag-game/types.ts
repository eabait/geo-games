import type { Continent, DifficultyKey, GameMode } from '@/shared/types';

export type { GameMode, DifficultyKey, Continent };

export type Tier = 1 | 2 | 3;

export interface Flag {
  code: string;
  name: string;
  continent: Continent;
  hint: string;
  tier: Tier;
  pos: [lat: number, lng: number];
}

export interface DifficultyConfig {
  label: string;
  emoji: string;
  options: number;
  time: number;
  points: number;
  hintCost: number;
  maxTier: Tier;
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

export type DuelRoundResolution = 'correct' | 'opponent-awarded' | 'timeout';

export interface DuelRoundResult {
  flag: Flag;
  winnerId: string | null;
  loserId: string | null;
  resolution: DuelRoundResolution;
  answeringPlayerId: string | null;
}

export interface FlagGameSettings {
  soundOn: boolean;
  continent: Continent;
}
