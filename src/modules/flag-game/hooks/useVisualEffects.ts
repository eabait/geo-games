import { useState, useEffect } from 'react';

import { useGameStore } from '../store/gameStore';

interface VisualEffectsResult {
  showConfetti: boolean;
  showFloatingEmojis: boolean;
  showScreenFlash: boolean;
  flashCorrect: boolean;
  showSparkles: boolean;
}

const EFFECT_DURATION_MS = 1200;

export function useVisualEffects(): VisualEffectsResult {
  const selected = useGameStore((s) => s.selected);
  const currentFlag = useGameStore((s) => s.currentFlag);
  const soloStreak = useGameStore((s) => s.streak);
  const explorerStreak = useGameStore((s) => s.explorerStreak);

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
      showFloatingEmojis: correct && streak >= 3,
      showSparkles: correct && streak >= 2,
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
