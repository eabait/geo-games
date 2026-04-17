import { useState, useEffect, useRef } from 'react';

interface UseTimerOptions {
  seconds: number;
  active: boolean;
  onTick: (remaining: number) => void;
  onExpire: () => void;
}

interface UseTimerResult {
  timeLeft: number;
  reset: (newSeconds?: number) => void;
}

export function useTimer({ seconds, active, onTick, onExpire }: UseTimerOptions): UseTimerResult {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);
  onExpireRef.current = onExpire;
  onTickRef.current = onTick;

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) return;
    setTimeLeft(seconds);
    const MS_PER_SECOND = 1000;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        onTickRef.current(prev - 1);
        return prev - 1;
      });
    }, MS_PER_SECOND);
    return () => clearInterval(id);
  }, [active, seconds]);

  const reset = (newSeconds?: number): void => {
    setTimeLeft(newSeconds ?? seconds);
  };

  return { timeLeft, reset };
}
