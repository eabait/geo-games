import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DIFFICULTY } from './constants';
import { FLAGS } from './flags';
import { buildNextRound } from './rounds';
import { pickRandom } from './utils';

vi.mock('./utils', () => ({
  pickRandom: vi.fn((pool, count, excluded) =>
    pool
      .filter((flag) => !excluded.some((excludedFlag) => excludedFlag.name === flag.name))
      .slice(0, count),
  ),
  shuffle: vi.fn((items) => items),
}));

describe('buildNextRound', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['easy', DIFFICULTY.easy.options],
    ['medium', DIFFICULTY.medium.options],
    ['hard', DIFFICULTY.hard.options],
  ] as const)('returns %s option count for the selected difficulty', (difficulty, optionCount) => {
    const round = buildNextRound(difficulty, 'Todos', []);

    expect(round.options).toHaveLength(optionCount);
    expect(round.options).toContain(round.flag);
  });

  it('prefers unused flags when enough unused candidates remain', () => {
    const usedFlags = ['Argentina'];

    const round = buildNextRound('easy', 'América', usedFlags);

    expect(round.flag.name).toBe('Brasil');
    expect(usedFlags).not.toContain(round.flag.name);
    expect(pickRandom).toHaveBeenCalledWith(
      expect.arrayContaining(
        FLAGS.filter(
          (flag) => flag.continent === 'América' && flag.tier <= DIFFICULTY.easy.maxTier,
        ),
      ),
      DIFFICULTY.easy.options - 1,
      [round.flag],
    );
  });
});
