import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  DIFFICULTY,
  EXPLORER_NEXT_DELAY_MS,
  EXPLORER_STREAK_THRESHOLD,
  EXPLORER_TIMER_RED,
  EXPLORER_TIMER_YELLOW,
} from '../data/constants';
import { FLAGS } from '../data/flags';
import { pickRandom, shuffle } from '../data/utils';
import type { Flag } from '../types';

import { useGameSfx } from './useGameSfx';
import { useVisualEffects } from './useVisualEffects';

export interface ExplorerPlayingState {
  currentFlag: Flag | null;
  explorerBestStreak: number;
  explorerCorrect: number;
  explorerScore: number;
  explorerStreak: number;
  explorerTime: number;
  explorerTotal: number;
  feedbackClassName: string;
  feedbackText: string | null;
  navigate: ReturnType<typeof useNavigate>;
  onAnswer: (flag: Flag) => void;
  onRevealHint: () => void;
  options: Flag[];
  selected: Flag | null;
  showHint: boolean;
  timerColor: string;
  timerCritical: boolean;
  visualEffects: ReturnType<typeof useVisualEffects>;
}

function getExplorerTimerColor(explorerTime: number): string {
  if (explorerTime <= EXPLORER_TIMER_RED) return '#ef4444';
  if (explorerTime <= EXPLORER_TIMER_YELLOW) return '#eab308';
  return '#fbbf24';
}

function getExplorerFeedbackText(currentFlag: Flag | null, selected: Flag | null): string | null {
  if (!selected || !currentFlag) return null;
  return selected.name === currentFlag.name ? '🎉 ¡Correcto! +3s' : `❌ ${currentFlag.name}`;
}

function useExplorerRoundSetup(
  continent: string,
  currentFlag: Flag | null,
  difficulty: keyof typeof DIFFICULTY | null,
  usedFlags: string[],
  setRoundData: (flag: Flag, options: Flag[]) => void,
): void {
  const diff = DIFFICULTY[difficulty ?? 'easy'];

  useEffect(() => {
    if (currentFlag || !difficulty) return;

    const baseFlags =
      continent === 'Todos' ? FLAGS : FLAGS.filter((flag) => flag.continent === continent);
    const pool = baseFlags.filter((flag) => flag.tier <= diff.maxTier);
    const availableFlags = pool.filter((flag) => !usedFlags.includes(flag.name));
    const candidateFlags = availableFlags.length >= diff.options ? availableFlags : pool;
    const nextFlag = candidateFlags[Math.floor(Math.random() * candidateFlags.length)];
    const wrongOptions = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [
      nextFlag,
    ]);

    setRoundData(nextFlag, shuffle([nextFlag, ...wrongOptions]));
  }, [continent, currentFlag, diff.maxTier, diff.options, difficulty, setRoundData, usedFlags]);
}

function useExplorerCountdown(
  explorerTime: number,
  navigate: ReturnType<typeof useNavigate>,
  tickExplorerTime: () => void,
): void {
  useEffect(() => {
    if (explorerTime <= 0) {
      navigate('/flag-game/explorer/results');
      return;
    }

    const intervalId = setInterval(() => {
      tickExplorerTime();
    }, EXPLORER_NEXT_DELAY_MS);

    return () => clearInterval(intervalId);
  }, [explorerTime, navigate, tickExplorerTime]);
}

function useExplorerAnswerHandler(
  currentFlag: Flag | null,
  explorerStreak: number,
  recordExplorerAnswer: (correct: boolean) => void,
  selected: Flag | null,
  sfx: ReturnType<typeof useGameSfx>,
): (option: Flag) => void {
  return useCallback(
    (option: Flag): void => {
      if (selected !== null || !currentFlag) return;

      const correct = option.name === currentFlag.name;
      sfx(
        correct && explorerStreak >= EXPLORER_STREAK_THRESHOLD
          ? 'streak'
          : correct
            ? 'correct'
            : 'wrong',
      );
      useGameStore.setState((state) => {
        state.selected = option;
      });
      recordExplorerAnswer(correct);

      setTimeout(() => {
        useGameStore.setState((state) => {
          state.currentFlag = null;
          state.selected = null;
          state.showHint = false;
        });
      }, EXPLORER_NEXT_DELAY_MS);
    },
    [currentFlag, explorerStreak, recordExplorerAnswer, selected, sfx],
  );
}

export function useExplorerPlayingState(): ExplorerPlayingState {
  const navigate = useNavigate();
  const sfx = useGameSfx();
  const { continent } = useSettingsStore();
  const visualEffects = useVisualEffects();
  const {
    currentFlag,
    options,
    selected,
    showHint,
    difficulty,
    usedFlags,
    explorerTime,
    explorerScore,
    explorerCorrect,
    explorerTotal,
    explorerBestStreak,
    explorerStreak,
    setRoundData,
    recordExplorerAnswer,
    tickExplorerTime,
    setShowHint,
  } = useGameStore();
  const onAnswer = useExplorerAnswerHandler(
    currentFlag,
    explorerStreak,
    recordExplorerAnswer,
    selected,
    sfx,
  );

  useExplorerRoundSetup(continent, currentFlag, difficulty, usedFlags, setRoundData);
  useExplorerCountdown(explorerTime, navigate, tickExplorerTime);

  return {
    currentFlag,
    explorerBestStreak,
    explorerCorrect,
    explorerScore,
    explorerStreak,
    explorerTime,
    explorerTotal,
    feedbackClassName: selected?.name === currentFlag?.name ? 'feedbackCorrect' : 'feedbackWrong',
    feedbackText: getExplorerFeedbackText(currentFlag, selected),
    navigate,
    onAnswer,
    onRevealHint: () => {
      sfx('hint');
      setShowHint(true);
    },
    options,
    selected,
    showHint,
    timerColor: getExplorerTimerColor(explorerTime),
    timerCritical: explorerTime <= EXPLORER_TIMER_RED,
    visualEffects,
  };
}
