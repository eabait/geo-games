import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useSettingsStore } from '../store/settingsStore';

import { useGameSfx } from './useGameSfx';
import { useSoundEngine } from './useSoundEngine';

vi.mock('./useSoundEngine', () => ({
  useSoundEngine: vi.fn(),
}));

describe('useGameSfx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.getState().reset();
  });

  it('builds sounds with the current sound setting and plays named sounds', () => {
    const correct = vi.fn();

    vi.mocked(useSoundEngine).mockReturnValue({
      current: {
        correct,
      },
    });

    const { result } = renderHook(() => useGameSfx());

    act(() => {
      result.current('correct');
    });

    expect(useSoundEngine).toHaveBeenCalledWith(true);
    expect(correct).toHaveBeenCalledOnce();
  });

  it('does nothing when a sound is missing from the engine map', () => {
    useSettingsStore.setState({ soundOn: false });
    vi.mocked(useSoundEngine).mockReturnValue({
      current: {},
    });

    const { result } = renderHook(() => useGameSfx());

    expect(() => {
      act(() => {
        result.current('victory');
      });
    }).not.toThrow();

    expect(useSoundEngine).toHaveBeenCalledWith(false);
  });
});
