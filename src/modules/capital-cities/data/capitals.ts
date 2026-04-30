import type { CapitalItem, DifficultyKey } from '../types';

import { FLAGS } from '@/modules/flag-game/data/flags';

const OPTION_COUNT = 4;
const SHUFFLE_RANDOM_OFFSET = 0.5;

const ALL_ITEMS: CapitalItem[] = FLAGS.map((flag) => ({
  id: flag.name,
  flagCode: flag.code,
  countryName: flag.name,
  capital: flag.capital,
  continent: flag.continent,
  tier: flag.tier,
}));

const TIER_LIMITS: Record<DifficultyKey, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export function getCapitalItems(difficulty: DifficultyKey): CapitalItem[] {
  return ALL_ITEMS.filter((item) => item.tier <= TIER_LIMITS[difficulty]);
}

export function generateCapitalOptions(correct: CapitalItem, pool: CapitalItem[]): CapitalItem[] {
  const sameContinentWrong = pool.filter(
    (item) => item.id !== correct.id && item.continent === correct.continent,
  );
  const otherWrong = pool.filter(
    (item) => item.id !== correct.id && item.continent !== correct.continent,
  );
  const distractors = [...sameContinentWrong, ...otherWrong].slice(0, OPTION_COUNT - 1);

  return [correct, ...distractors].sort(() => Math.random() - SHUFFLE_RANDOM_OFFSET);
}
