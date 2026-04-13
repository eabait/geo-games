import { describe, it, expect } from 'vitest';

import { shuffle, pickRandom } from './utils';

describe('shuffle', () => {
  it('returns array with same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('pickRandom', () => {
  it('returns n items', () => {
    expect(pickRandom([1, 2, 3, 4, 5], 3)).toHaveLength(3);
  });

  it('excludes specified items', () => {
    const result = pickRandom([1, 2, 3, 4, 5], 3, [1, 2]);
    expect(result).not.toContain(1);
    expect(result).not.toContain(2);
  });

  it('returns empty array when source is empty', () => {
    expect(pickRandom([], 3)).toHaveLength(0);
  });
});
