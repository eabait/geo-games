import { useCallback, useEffect, useRef } from 'react';

export type SoundName =
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
type ToneWave = OscillatorType;
type ToneFn = (
  ctx: AudioContext,
  freq: number,
  dur: number,
  wave?: ToneWave,
  vol?: number,
  startAt?: number,
) => void;
type PlayFn = (fn: (ctx: AudioContext) => void) => void;

const NOTE_A4 = 440;
const NOTE_C5 = 523.25;
const NOTE_CS5 = 554.37;
const NOTE_E5 = 659.25;
const NOTE_G5 = 783.99;
const NOTE_A5 = 880;
const NOTE_B5 = 987.77;
const NOTE_C6 = 1046.5;
const NOTE_CS6 = 1108.73;
const NOTE_D6 = 1174.66;
const NOTE_E6 = 1318.51;

const LOW_WRONG_NOTE = 200;
const LOWER_WRONG_NOTE = 180;
const HINT_START_NOTE = 660;
const TIMEOUT_START_NOTE = 500;
const TIMEOUT_END_NOTE = 150;
const TICK_URGENT_NOTE = 1200;
const TAP_NOTE = 600;

const FREQS_CORRECT = [NOTE_C5, NOTE_E5, NOTE_G5, NOTE_C6] as const;
const FREQS_WRONG = [LOW_WRONG_NOTE, LOWER_WRONG_NOTE] as const;
const FREQS_HINT = [HINT_START_NOTE, NOTE_A5] as const;
const FREQS_VICTORY = [NOTE_C5, NOTE_E5, NOTE_G5, NOTE_E5, NOTE_G5, NOTE_C6] as const;
const FREQS_READY = [NOTE_A4, NOTE_CS5, NOTE_E5] as const;
const FREQS_STREAK = [NOTE_G5, NOTE_B5, NOTE_D6, NOTE_E6] as const;
const FREQS_BONUS = [NOTE_A5, NOTE_CS6] as const;

const FADE_TO_SILENCE = 0.001;
const OSC_STOP_MARGIN = 0.05;
const DEFAULT_GAIN = 0.3;

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

const USER_GESTURE_EVENTS = ['touchstart', 'click'] as const;

function playSequence(
  play: PlayFn,
  tone: ToneFn,
  freqs: readonly number[],
  config: { dur: number; wave: ToneWave; vol: number; step: number },
): () => void {
  return () =>
    play((ctx) => {
      freqs.forEach((freq, index) => {
        tone(ctx, freq, config.dur, config.wave, config.vol, index * config.step);
      });
    });
}

function playTimeout(play: PlayFn): () => void {
  return () =>
    play((ctx) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(TIMEOUT_START_NOTE, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        TIMEOUT_END_NOTE,
        ctx.currentTime + TIMEOUT_DUR,
      );
      gain.gain.setValueAtTime(TIMEOUT_VOL, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(FADE_TO_SILENCE, ctx.currentTime + TIMEOUT_DUR);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + TIMEOUT_STOP);
    });
}

function buildStandardSounds(
  play: PlayFn,
  tone: ToneFn,
): Omit<Sounds, 'timeout' | 'tickUrgent' | 'victory'> {
  return {
    correct: playSequence(play, tone, FREQS_CORRECT, {
      dur: CORRECT_DUR,
      wave: 'sine',
      vol: CORRECT_VOL,
      step: CORRECT_STEP,
    }),
    wrong: playSequence(play, tone, FREQS_WRONG, {
      dur: WRONG_DUR,
      wave: 'square',
      vol: WRONG_VOL,
      step: WRONG_STEP,
    }),
    tick: () => play((ctx) => tone(ctx, NOTE_A5, TICK_DUR, 'sine', TICK_VOL)),
    hint: playSequence(play, tone, FREQS_HINT, {
      dur: HINT_DUR,
      wave: 'triangle',
      vol: HINT_VOL,
      step: HINT_STEP,
    }),
    tap: () => play((ctx) => tone(ctx, TAP_NOTE, TAP_DUR, 'sine', TAP_VOL)),
    ready: playSequence(play, tone, FREQS_READY, {
      dur: READY_DUR,
      wave: 'triangle',
      vol: READY_VOL,
      step: READY_STEP,
    }),
    streak: playSequence(play, tone, FREQS_STREAK, {
      dur: STREAK_DUR,
      wave: 'sine',
      vol: STREAK_VOL,
      step: STREAK_STEP,
    }),
    bonus: playSequence(play, tone, FREQS_BONUS, {
      dur: BONUS_DUR,
      wave: 'sine',
      vol: BONUS_VOL,
      step: BONUS_STEP,
    }),
  };
}

function buildSpecialSounds(
  play: PlayFn,
  tone: ToneFn,
): Pick<Sounds, 'timeout' | 'tickUrgent' | 'victory'> {
  return {
    timeout: playTimeout(play),
    tickUrgent: () =>
      play((ctx) => {
        tone(ctx, TICK_URGENT_NOTE, TICK_URGENT_DUR, 'square', TICK_URGENT_VOL);
        tone(ctx, TICK_URGENT_NOTE, TICK_URGENT_DUR, 'square', TICK_URGENT_VOL, TICK_URGENT_STEP);
      }),
    victory: () =>
      play((ctx) => {
        FREQS_VICTORY.forEach((freq, index) => {
          const wave = index < VICTORY_WAVE_SWITCH ? 'sine' : 'triangle';
          tone(ctx, freq, VICTORY_DUR, wave, VICTORY_VOL, index * VICTORY_STEP);
        });
      }),
  };
}

function buildSounds(play: PlayFn, tone: ToneFn): Sounds {
  return {
    ...buildStandardSounds(play, tone),
    ...buildSpecialSounds(play, tone),
  };
}

function createAudioContext(): AudioContext {
  return new (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  )();
}

function useAudioWarmUp(getCtx: () => AudioContext): void {
  useEffect(() => {
    const warmUp = (): void => {
      try {
        getCtx();
      } catch {
        // AudioContext may not be available in all environments
      }
    };

    USER_GESTURE_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, warmUp, { once: true });
    });

    return () => {
      USER_GESTURE_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, warmUp);
      });
    };
  }, [getCtx]);
}

function createSilentSounds(): Sounds {
  const noop = (): void => {};

  return {
    correct: noop,
    wrong: noop,
    tick: noop,
    tickUrgent: noop,
    timeout: noop,
    hint: noop,
    tap: noop,
    victory: noop,
    ready: noop,
    streak: noop,
    bonus: noop,
  };
}

export function useSoundEngine(enabled: boolean): React.MutableRefObject<Sounds> {
  const ctxRef = useRef<AudioContext | null>(null);
  const sounds = useRef<Sounds>(createSilentSounds());

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = createAudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }
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

  const tone = useCallback<ToneFn>(
    (ctx, freq, dur, wave = 'sine', vol = DEFAULT_GAIN, startAt = 0): void => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = wave;
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(FADE_TO_SILENCE, ctx.currentTime + startAt + dur);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + startAt);
      oscillator.stop(ctx.currentTime + startAt + dur + OSC_STOP_MARGIN);
    },
    [],
  );

  useEffect(() => {
    sounds.current = buildSounds(play, tone);
  }, [play, tone]);

  useAudioWarmUp(getCtx);

  return sounds;
}
