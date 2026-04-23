import { TICK_THRESHOLD, TICK_URGENT_THRESHOLD } from '../data/constants';
import type { Flag } from '../types';

import { useTimer } from './useTimer';
import type { SoundName } from './useSoundEngine';

interface UsePlayingTimerOptions {
  currentFlag: Flag | null;
  onAnswer: (flag: Flag | null) => void;
  seconds: number;
  selected: Flag | null;
  sfx: (name: SoundName) => void;
}

export function usePlayingTimer({
  currentFlag,
  onAnswer,
  seconds,
  selected,
  sfx,
}: UsePlayingTimerOptions): number {
  const { timeLeft } = useTimer({
    seconds,
    active: !!currentFlag && selected === null,
    onTick: (remainingSeconds) => {
      if (remainingSeconds <= TICK_THRESHOLD && remainingSeconds > TICK_URGENT_THRESHOLD) {
        sfx('tick');
      } else if (remainingSeconds <= TICK_URGENT_THRESHOLD) {
        sfx('tickUrgent');
      }
    },
    onExpire: () => {
      sfx('timeout');
      onAnswer(null);
    },
  });

  return timeLeft;
}
