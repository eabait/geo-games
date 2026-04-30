import type { DifficultyKey } from '@/shared/types';

export type { DifficultyKey };

export interface CapitalItem {
  id: string;
  flagCode: string;
  countryName: string;
  capital: string;
  continent: string;
  tier: number;
}
