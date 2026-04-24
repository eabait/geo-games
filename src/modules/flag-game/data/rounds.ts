import type { Continent, Flag } from '../types';

import { DIFFICULTY } from './constants';
import { FLAGS } from './flags';
import { pickRandom, shuffle } from './utils';

function getPool(maxTier: number, continent: Continent | 'Todos'): Flag[] {
  const baseFlags =
    continent === 'Todos' ? FLAGS : FLAGS.filter((flag) => flag.continent === continent);

  return baseFlags.filter((flag) => flag.tier <= maxTier);
}

export function buildNextRound(
  difficulty: keyof typeof DIFFICULTY,
  continent: Continent | 'Todos',
  usedFlags: string[],
): { flag: Flag; options: Flag[] } {
  const diff = DIFFICULTY[difficulty];
  const pool = getPool(diff.maxTier, continent);
  const availableFlags = pool.filter((flag) => !usedFlags.includes(flag.name));
  const candidateFlags = availableFlags.length >= diff.options ? availableFlags : pool;
  const flag = candidateFlags[Math.floor(Math.random() * candidateFlags.length)];
  const wrongOptions = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [
    flag,
  ]);

  return {
    flag,
    options: shuffle([flag, ...wrongOptions]),
  };
}
