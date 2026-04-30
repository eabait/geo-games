import { useEffect, useRef, useState } from 'react';

const TIMER_INTERVAL_MS = 1000;

interface UseQuizTimerOptions {
  seconds: number;
  resetKey: unknown;
  paused: boolean;
  onTimeout: () => void;
}

export function useQuizTimer({
  seconds,
  resetKey,
  paused,
  onTimeout,
}: UseQuizTimerOptions): number {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onTimeoutRef = useRef(onTimeout);
  const timeoutCalledRef = useRef(false);
  const skipTimeoutForResetRef = useRef(false);

  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    timeoutCalledRef.current = false;
    skipTimeoutForResetRef.current = seconds > 0;
    setTimeLeft(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (paused) {
      return;
    }

    if (timeLeft <= 0) {
      if (skipTimeoutForResetRef.current) {
        skipTimeoutForResetRef.current = false;
        return;
      }

      if (!timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        onTimeoutRef.current();
      }

      return;
    }

    skipTimeoutForResetRef.current = false;

    const intervalId = window.setInterval(() => {
      setTimeLeft((currentTimeLeft) => currentTimeLeft - 1);
    }, TIMER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [paused, resetKey, timeLeft]);

  return timeLeft;
}
