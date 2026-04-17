import { useState, useEffect } from 'react';

import { useGameStore } from '../store/gameStore';
import { STREAK_BONUS_THRESHOLD, STREAK_SOUND_THRESHOLD } from '../data/constants';

interface VisualEffectsResult {
  showConfetti: boolean;
  showFloatingEmojis: boolean;
  showScreenFlash: boolean;
  flashCorrect: boolean;
  showSparkles: boolean;
}

const EFFECT_DURATION_MS = 1200;

export function useVisualEffects(): VisualEffectsResult {
  const selected = useGameStore((state) => state.selected);
  const currentFlag = useGameStore((state) => state.currentFlag);
  const soloStreak = useGameStore((state) => state.streak);
  const explorerStreak = useGameStore((state) => state.explorerStreak);

  const [effects, setEffects] = useState<VisualEffectsResult>({
    showConfetti: false,
    showFloatingEmojis: false,
    showScreenFlash: false,
    flashCorrect: false,
    showSparkles: false,
  });

  useEffect(() => {
    if (!selected) {
      setEffects({
        showConfetti: false,
        showFloatingEmojis: false,
        showScreenFlash: false,
        flashCorrect: false,
        showSparkles: false,
      });
      return;
    }

    const correct = selected.name === currentFlag?.name;
    const streak = Math.max(soloStreak, explorerStreak);

    setEffects({
      showScreenFlash: true,
      flashCorrect: correct,
      showConfetti: correct,
      showFloatingEmojis: correct && streak >= STREAK_SOUND_THRESHOLD,
      showSparkles: correct && streak >= STREAK_BONUS_THRESHOLD,
    });

    const timer = setTimeout(() => {
      setEffects({
        showConfetti: false,
        showFloatingEmojis: false,
        showScreenFlash: false,
        flashCorrect: false,
        showSparkles: false,
      });
    }, EFFECT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [selected, currentFlag, soloStreak, explorerStreak]);

  return effects;
}
