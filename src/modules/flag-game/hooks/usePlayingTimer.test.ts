import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { TICK_THRESHOLD, TICK_URGENT_THRESHOLD } from '../data/constants';
import { FLAGS } from '../data/flags';

import { usePlayingTimer } from './usePlayingTimer';
import { useTimer } from './useTimer';

vi.mock('./useTimer', () => ({
  useTimer: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePlayingTimer activity', () => {
  it('starts the timer only when a round is active and no option is selected', () => {
    vi.mocked(useTimer).mockReturnValue({ timeLeft: 12 });

    renderHook(() =>
      usePlayingTimer({
        currentFlag: FLAGS[0],
        onAnswer: vi.fn(),
        seconds: 15,
        selected: null,
        sfx: vi.fn(),
      }),
    );

    expect(useTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        seconds: 15,
      }),
    );
  });

  it('keeps the timer inactive when there is no flag or an answer was already selected', () => {
    vi.mocked(useTimer).mockReturnValue({ timeLeft: 9 });

    renderHook(() =>
      usePlayingTimer({
        currentFlag: null,
        onAnswer: vi.fn(),
        seconds: 10,
        selected: null,
        sfx: vi.fn(),
      }),
    );

    expect(useTimer).toHaveBeenLastCalledWith(expect.objectContaining({ active: false }));

    renderHook(() =>
      usePlayingTimer({
        currentFlag: FLAGS[0],
        onAnswer: vi.fn(),
        seconds: 10,
        selected: FLAGS[1],
        sfx: vi.fn(),
      }),
    );

    expect(useTimer).toHaveBeenLastCalledWith(expect.objectContaining({ active: false }));
  });
});

describe('usePlayingTimer callbacks', () => {
  it('plays the regular and urgent tick sounds at the configured thresholds', () => {
    vi.mocked(useTimer).mockReturnValue({ timeLeft: 5 });
    const sfx = vi.fn();

    renderHook(() =>
      usePlayingTimer({
        currentFlag: FLAGS[0],
        onAnswer: vi.fn(),
        seconds: 12,
        selected: null,
        sfx,
      }),
    );

    const timerConfig = vi.mocked(useTimer).mock.calls[0]?.[0];

    timerConfig?.onTick(TICK_THRESHOLD);
    timerConfig?.onTick(TICK_URGENT_THRESHOLD);
    timerConfig?.onTick(TICK_THRESHOLD + 1);

    expect(sfx).toHaveBeenNthCalledWith(1, 'tick');
    expect(sfx).toHaveBeenNthCalledWith(2, 'tickUrgent');
    expect(sfx).toHaveBeenCalledTimes(2);
  });

  it('plays timeout audio and submits a null answer when the timer expires', () => {
    vi.mocked(useTimer).mockReturnValue({ timeLeft: 0 });
    const onAnswer = vi.fn();
    const sfx = vi.fn();

    renderHook(() =>
      usePlayingTimer({
        currentFlag: FLAGS[0],
        onAnswer,
        seconds: 8,
        selected: null,
        sfx,
      }),
    );

    const timerConfig = vi.mocked(useTimer).mock.calls[0]?.[0];

    timerConfig?.onExpire();

    expect(sfx).toHaveBeenCalledWith('timeout');
    expect(onAnswer).toHaveBeenCalledWith(null);
  });
});
