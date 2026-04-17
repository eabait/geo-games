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
type ToneFn = (
  ctx: AudioContext,
  freq: number,
  dur: number,
  wave?: string,
  vol?: number,
  startAt?: number,
) => void;
type PlayFn = (fn: (ctx: AudioContext) => void) => void;

// Module-level frequency arrays (Hz)
const FREQS_CORRECT = [523.25, 659.25, 783.99, 1046.5] as const;
const FREQS_WRONG = [200, 180] as const;
const FREQ_TICK = 880;
const FREQ_TICK_URGENT = 1200;
const FREQ_TIMEOUT_START = 500;
const FREQ_TIMEOUT_END = 150;
const FREQS_HINT = [660, 880] as const;
const FREQ_TAP = 600;
const FREQS_VICTORY = [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5] as const;
const FREQS_READY = [440, 554.37, 659.25] as const;
const FREQS_STREAK = [783.99, 987.77, 1174.66, 1318.51] as const;
const FREQS_BONUS = [880, 1108.73] as const;

// Tone synthesis constants
const FADE_TO_SILENCE = 0.001;
const OSC_STOP_MARGIN = 0.05;
const DEFAULT_GAIN = 0.3;

// Per-sound timing and volume
const CORRECT_DUR = 0.3;
const CORRECT_VOL = 0.25;
const CORRECT_STEP = 0.08;
const WRONG_DUR = 0.25;
const WRONG_VOL = 0.18;
const WRONG_STEP = 0.15;
const TICK_DUR = 0.06;
const TICK_VOL = 0.15;
const TICK_URGENT_DUR = 0.05;
const TICK_URGENT_VOL = 0.18;
const TICK_URGENT_STEP = 0.07;
const TIMEOUT_DUR = 0.5;
const TIMEOUT_VOL = 0.2;
const TIMEOUT_STOP = 0.55;
const HINT_DUR = 0.2;
const HINT_VOL = 0.18;
const HINT_STEP = 0.1;
const TAP_DUR = 0.05;
const TAP_VOL = 0.1;
const VICTORY_DUR = 0.35;
const VICTORY_VOL = 0.22;
const VICTORY_STEP = 0.12;
const VICTORY_WAVE_SWITCH = 3;
const READY_DUR = 0.25;
const READY_VOL = 0.2;
const READY_STEP = 0.12;
const STREAK_DUR = 0.2;
const STREAK_VOL = 0.18;
const STREAK_STEP = 0.06;
const BONUS_DUR = 0.15;
const BONUS_VOL = 0.12;
const BONUS_STEP = 0.08;

function buildSounds(play: PlayFn, tone: ToneFn): Sounds {
  return {
    correct: () =>
      play((ctx) => {
        FREQS_CORRECT.forEach((freq, i) =>
          tone(ctx, freq, CORRECT_DUR, 'sine', CORRECT_VOL, i * CORRECT_STEP),
        );
      }),
    wrong: () =>
      play((ctx) => {
        FREQS_WRONG.forEach((freq, i) =>
          tone(ctx, freq, WRONG_DUR, 'square', WRONG_VOL, i * WRONG_STEP),
        );
      }),
    tick: () => play((ctx) => tone(ctx, FREQ_TICK, TICK_DUR, 'sine', TICK_VOL)),
    tickUrgent: () =>
      play((ctx) => {
        tone(ctx, FREQ_TICK_URGENT, TICK_URGENT_DUR, 'square', TICK_URGENT_VOL);
        tone(ctx, FREQ_TICK_URGENT, TICK_URGENT_DUR, 'square', TICK_URGENT_VOL, TICK_URGENT_STEP);
      }),
    timeout: () =>
      play((ctx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(FREQ_TIMEOUT_START, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(FREQ_TIMEOUT_END, ctx.currentTime + TIMEOUT_DUR);
        gain.gain.setValueAtTime(TIMEOUT_VOL, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(FADE_TO_SILENCE, ctx.currentTime + TIMEOUT_DUR);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + TIMEOUT_STOP);
      }),
    hint: () =>
      play((ctx) => {
        FREQS_HINT.forEach((freq, i) =>
          tone(ctx, freq, HINT_DUR, 'triangle', HINT_VOL, i * HINT_STEP),
        );
      }),
    tap: () => play((ctx) => tone(ctx, FREQ_TAP, TAP_DUR, 'sine', TAP_VOL)),
    victory: () =>
      play((ctx) => {
        FREQS_VICTORY.forEach((freq, i) =>
          tone(
            ctx,
            freq,
            VICTORY_DUR,
            i < VICTORY_WAVE_SWITCH ? 'sine' : 'triangle',
            VICTORY_VOL,
            i * VICTORY_STEP,
          ),
        );
      }),
    ready: () =>
      play((ctx) => {
        FREQS_READY.forEach((freq, i) =>
          tone(ctx, freq, READY_DUR, 'triangle', READY_VOL, i * READY_STEP),
        );
      }),
    streak: () =>
      play((ctx) => {
        FREQS_STREAK.forEach((freq, i) =>
          tone(ctx, freq, STREAK_DUR, 'sine', STREAK_VOL, i * STREAK_STEP),
        );
      }),
    bonus: () =>
      play((ctx) => {
        FREQS_BONUS.forEach((freq, i) =>
          tone(ctx, freq, BONUS_DUR, 'sine', BONUS_VOL, i * BONUS_STEP),
        );
      }),
  };
}

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
    (
      ctx: AudioContext,
      freq: number,
      dur: number,
      wave = 'sine',
      vol = DEFAULT_GAIN,
      startAt = 0,
    ): void => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave as OscillatorType;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(FADE_TO_SILENCE, ctx.currentTime + startAt + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + dur + OSC_STOP_MARGIN);
    },
    [],
  );

  const sounds = useRef<Sounds>({} as Sounds);

  useEffect(() => {
    sounds.current = buildSounds(play, tone);
  }, [play, tone]);

  useEffect(() => {
    const warmUp = (): void => {
      try {
        getCtx();
      } catch {
        // AudioContext may not be available in all environments
      }
    };
    document.addEventListener('touchstart', warmUp, { once: true });
    document.addEventListener('click', warmUp, { once: true });
    return () => {
      document.removeEventListener('touchstart', warmUp);
      document.removeEventListener('click', warmUp);
    };
  }, [getCtx]);

  return sounds;
}
