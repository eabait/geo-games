import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import {
  DEFAULT_ROUND_SECONDS,
  DIFFICULTY,
  SOLO_R,
  STREAK_BONUS_THRESHOLD,
  STREAK_SOUND_THRESHOLD,
  TICK_THRESHOLD,
  TIMER_PCT_FULL,
  TIMER_PCT_GREEN,
  TIMER_PCT_YELLOW,
} from '../data/constants';
import type { Flag } from '../types';

import { useGameRound } from './useGameRound';
import { useGameSfx } from './useGameSfx';
import { usePlayingTimer } from './usePlayingTimer';
import { useScorePop } from './useScorePop';
import { useVisualEffects } from './useVisualEffects';

export interface SoloPlayingState {
  currentFlag: Flag | null;
  feedbackClassName: string;
  feedbackText: string | null;
  hintLabel: string;
  navigate: ReturnType<typeof useNavigate>;
  onAnswer: (flag: Flag) => void;
  onRevealHint: () => void;
  options: Flag[];
  roundLabel: string;
  score: number;
  scorePop: boolean;
  selected: Flag | null;
  showHint: boolean;
  showSparkles: boolean;
  sparklesActive: boolean;
  sfx: ReturnType<typeof useGameSfx>;
  streak: number;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
  visualEffects: ReturnType<typeof useVisualEffects>;
}

function getTimerColor(timerPct: number): string {
  if (timerPct > TIMER_PCT_GREEN) return '#22c55e';
  if (timerPct > TIMER_PCT_YELLOW) return '#eab308';
  return '#ef4444';
}

function getSoloFeedbackText(
  currentFlag: Flag | null,
  selected: Flag | null,
  streak: number,
  timeLeft: number,
): string | null {
  if (selected?.name === currentFlag?.name) {
    return streak >= STREAK_SOUND_THRESHOLD ? '🔥 ¡Imparable!' : '🎉 ¡Correcto!';
  }
  if (selected && currentFlag) return `❌ Era ${currentFlag.name}`;
  if (!selected && timeLeft === 0 && currentFlag) return `⏱️ ¡Tiempo! Era ${currentFlag.name}`;
  return null;
}

export function useSoloPlayingState(): SoloPlayingState {
  const navigate = useNavigate();
  const sfx = useGameSfx();
  const visualEffects = useVisualEffects();
  const { currentFlag, options, selected, showHint, round, score, streak, setShowHint } =
    useGameStore();
  const difficulty = useGameStore((state) => state.difficulty ?? 'easy');
  const diff = DIFFICULTY[difficulty];
  const scorePop = useScorePop(score);
  const { handleAnswer } = useGameRound(sfx);
  const timeLeft = usePlayingTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    currentFlag,
    selected,
    sfx,
    onAnswer: handleAnswer,
  });

  const timerPct = diff ? (timeLeft / diff.time) * TIMER_PCT_FULL : TIMER_PCT_FULL;
  const feedbackText = getSoloFeedbackText(currentFlag, selected, streak, timeLeft);

  return {
    currentFlag,
    feedbackClassName: selected?.name === currentFlag?.name ? 'feedbackCorrect' : 'feedbackWrong',
    feedbackText,
    hintLabel: `💡 Pista (-${diff?.hintCost} pts)`,
    navigate,
    onAnswer: handleAnswer,
    onRevealHint: () => {
      sfx('hint');
      setShowHint(true);
    },
    options,
    roundLabel: `${round + 1}/${SOLO_R}`,
    score,
    scorePop,
    selected,
    showHint,
    showSparkles: streak >= STREAK_BONUS_THRESHOLD,
    sparklesActive: visualEffects.showSparkles,
    sfx,
    streak,
    timeLeft,
    timerColor: getTimerColor(timerPct),
    timerPct,
    timerUrgent: timeLeft <= TICK_THRESHOLD && !selected,
    visualEffects,
  };
}
