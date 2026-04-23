import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { SCORE_POP_DURATION_MS } from '../data/constants';

import { useScorePop } from './useScorePop';

describe('useScorePop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays disabled for zero or negative scores', () => {
    const { result, rerender } = renderHook(({ score }) => useScorePop(score), {
      initialProps: { score: 0 },
    });

    expect(result.current).toBe(false);

    rerender({ score: -5 });

    expect(result.current).toBe(false);
  });

  it('turns on briefly after a positive score change', () => {
    const { result, rerender } = renderHook(({ score }) => useScorePop(score), {
      initialProps: { score: 0 },
    });

    rerender({ score: 15 });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(SCORE_POP_DURATION_MS);
    });

    expect(result.current).toBe(false);
  });

  it('clears the previous timeout when a new score arrives', () => {
    const { result, rerender } = renderHook(({ score }) => useScorePop(score), {
      initialProps: { score: 10 },
    });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(SCORE_POP_DURATION_MS - 50);
    });

    rerender({ score: 20 });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(51);
    });

    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(SCORE_POP_DURATION_MS - 51);
    });

    expect(result.current).toBe(false);
  });
});
