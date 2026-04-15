import { useRef, useCallback, useEffect } from 'react';

type SoundName =
  | 'correct'
  | 'wrong'
  | 'tick'
  | 'tickUrgent'
  | 'timeout'
  | 'hint'
  | 'tap'
  | 'victory'
  | 'ready'
  | 'streak'
  | 'bonus';

type Sounds = Record<SoundName, () => void>;

export function useSoundEngine(enabled: boolean): React.MutableRefObject<Sounds> {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (fn: (ctx: AudioContext) => void): void => {
      if (!enabled) return;
      try {
        fn(getCtx());
      } catch {
        // AudioContext may not be available in all environments
      }
    },
    [enabled, getCtx],
  );

  const tone = useCallback(
    (c: AudioContext, f: number, d: number, t = 'sine', v = 0.3, s = 0): void => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = t as OscillatorType;
      o.frequency.value = f;
      g.gain.setValueAtTime(v, c.currentTime + s);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + s + d);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + s);
      o.stop(c.currentTime + s + d + 0.05);
    },
    [],
  );

  const sounds = useRef<Sounds>({} as Sounds);

  useEffect(() => {
    sounds.current = {
      correct: () =>
        play((c) => {
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(c, f, 0.3, 'sine', 0.25, i * 0.08),
          );
        }),
      wrong: () =>
        play((c) => {
          [200, 180].forEach((f, i) => tone(c, f, 0.25, 'square', 0.18, i * 0.15));
        }),
      tick: () => play((c) => tone(c, 880, 0.06, 'sine', 0.15)),
      tickUrgent: () =>
        play((c) => {
          tone(c, 1200, 0.05, 'square', 0.18);
          tone(c, 1200, 0.05, 'square', 0.18, 0.07);
        }),
      timeout: () =>
        play((c) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(500, c.currentTime);
          o.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.5);
          g.gain.setValueAtTime(0.2, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + 0.55);
        }),
      hint: () =>
        play((c) => {
          [660, 880].forEach((f, i) => tone(c, f, 0.2, 'triangle', 0.18, i * 0.1));
        }),
      tap: () => play((c) => tone(c, 600, 0.05, 'sine', 0.1)),
      victory: () =>
        play((c) => {
          [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(c, f, 0.35, i < 3 ? 'sine' : 'triangle', 0.22, i * 0.12),
          );
        }),
      ready: () =>
        play((c) => {
          [440, 554.37, 659.25].forEach((f, i) => tone(c, f, 0.25, 'triangle', 0.2, i * 0.12));
        }),
      streak: () =>
        play((c) => {
          [783.99, 987.77, 1174.66, 1318.51].forEach((f, i) =>
            tone(c, f, 0.2, 'sine', 0.18, i * 0.06),
          );
        }),
      bonus: () =>
        play((c) => {
          [880, 1108.73].forEach((f, i) => tone(c, f, 0.15, 'sine', 0.12, i * 0.08));
        }),
    };
  }, [play, tone]);

  useEffect(() => {
    const w = (): void => {
      try {
        getCtx();
      } catch {
        // AudioContext may not be available in all environments
      }
    };
    document.addEventListener('touchstart', w, { once: true });
    document.addEventListener('click', w, { once: true });
    return () => {
      document.removeEventListener('touchstart', w);
      document.removeEventListener('click', w);
    };
  }, [getCtx]);

  return sounds;
}
