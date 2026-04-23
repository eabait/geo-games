import { useCallback } from 'react';

import { useSettingsStore } from '../store/settingsStore';

import { useSoundEngine } from './useSoundEngine';
import type { SoundName } from './useSoundEngine';

export function useGameSfx(): (name: SoundName) => void {
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);

  return useCallback(
    (name: SoundName): void => {
      sounds.current[name]?.();
    },
    [sounds],
  );
}
