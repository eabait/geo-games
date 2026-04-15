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
    const id = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        onTickRef.current(v - 1);
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, seconds]);

  const reset = (newSeconds?: number): void => {
    setTimeLeft(newSeconds ?? seconds);
  };

  return { timeLeft, reset };
}
