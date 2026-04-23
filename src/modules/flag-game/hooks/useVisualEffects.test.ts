import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { STREAK_BONUS_THRESHOLD, STREAK_SOUND_THRESHOLD } from '../data/constants';
import { FLAGS } from '../data/flags';
import { useGameStore } from '../store/gameStore';

import { useVisualEffects } from './useVisualEffects';

beforeEach(() => {
  vi.useFakeTimers();
  useGameStore.getState().reset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useVisualEffects initial state', () => {
  it('returns an empty effect state when nothing is selected', () => {
    const { result } = renderHook(() => useVisualEffects());

    expect(result.current).toEqual({
      showConfetti: false,
      showFloatingEmojis: false,
      showScreenFlash: false,
      flashCorrect: false,
      showSparkles: false,
    });
  });
});

describe('useVisualEffects answered state', () => {
  it('shows the success effects for a correct answer and clears them later', () => {
    const { result } = renderHook(() => useVisualEffects());

    act(() => {
      useGameStore.setState({
        currentFlag: FLAGS[0],
        selected: FLAGS[0],
        streak: STREAK_SOUND_THRESHOLD,
        explorerStreak: STREAK_BONUS_THRESHOLD,
      });
    });

    expect(result.current).toEqual({
      showConfetti: true,
      showFloatingEmojis: true,
      showScreenFlash: true,
      flashCorrect: true,
      showSparkles: true,
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current).toEqual({
      showConfetti: false,
      showFloatingEmojis: false,
      showScreenFlash: false,
      flashCorrect: false,
      showSparkles: false,
    });
  });

  it('shows a wrong-answer flash without celebratory effects', () => {
    const { result } = renderHook(() => useVisualEffects());

    act(() => {
      useGameStore.setState({
        currentFlag: FLAGS[0],
        selected: FLAGS[1],
        streak: STREAK_SOUND_THRESHOLD,
        explorerStreak: STREAK_BONUS_THRESHOLD,
      });
    });

    expect(result.current).toEqual({
      showConfetti: false,
      showFloatingEmojis: false,
      showScreenFlash: true,
      flashCorrect: false,
      showSparkles: false,
    });
  });
});
