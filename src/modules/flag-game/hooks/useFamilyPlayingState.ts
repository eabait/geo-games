import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import {
  DEFAULT_ROUND_SECONDS,
  DIFFICULTY,
  RPP,
  STREAK_SOUND_THRESHOLD,
  TICK_THRESHOLD,
  TIMER_PCT_FULL,
} from '../data/constants';
import type { Flag, Player } from '../types';

import { useGameRound } from './useGameRound';
import { useGameSfx } from './useGameSfx';
import { usePlayingTimer } from './usePlayingTimer';
import { useScorePop } from './useScorePop';
import { useVisualEffects } from './useVisualEffects';

export interface FamilyPlayingState {
  currentFlag: Flag | null;
  currentPlayer: Player | null;
  currentPlayerScore: number;
  feedbackClassName: string;
  feedbackText: string | null;
  hintLabel: string;
  navigate: ReturnType<typeof useNavigate>;
  onAnswer: (flag: Flag) => void;
  onRevealHint: () => void;
  options: Flag[];
  playerRoundLabel: string;
  scorePop: boolean;
  selected: Flag | null;
  showHint: boolean;
  sparklesActive: boolean;
  streak: number;
  timeLeft: number;
  timerPct: number;
  timerUrgent: boolean;
  visualEffects: ReturnType<typeof useVisualEffects>;
}

function getCurrentPlayerMetrics(
  currentPlayer: Player | null,
  familyScores: Record<string, number>,
  familyStreaks: Record<string, number>,
): { score: number; streak: number } {
  if (!currentPlayer) return { score: 0, streak: 0 };

  return {
    score: familyScores[currentPlayer.id] ?? 0,
    streak: familyStreaks[currentPlayer.id] ?? 0,
  };
}

function getFamilyFeedbackText(
  currentFlag: Flag | null,
  currentPlayerStreak: number,
  selected: Flag | null,
  timeLeft: number,
): string | null {
  if (selected?.name === currentFlag?.name) {
    return currentPlayerStreak >= STREAK_SOUND_THRESHOLD ? '🔥 ¡Imparable!' : '🎉 ¡Correcto!';
  }
  if (selected && currentFlag) return `❌ Era ${currentFlag.name}`;
  if (!selected && timeLeft === 0 && currentFlag) return `⏱️ ¡Tiempo! Era ${currentFlag.name}`;
  return null;
}

function getFeedbackClassName(currentFlag: Flag | null, selected: Flag | null): string {
  return selected?.name === currentFlag?.name ? 'feedbackCorrect' : 'feedbackWrong';
}

function getHintLabel(hintCost: number | undefined): string {
  return `💡 Pista (-${hintCost} pts)`;
}

function getTimerPct(timeLeft: number, totalTime: number | undefined): number {
  return totalTime ? (timeLeft / totalTime) * TIMER_PCT_FULL : TIMER_PCT_FULL;
}

function isTimerUrgent(timeLeft: number, selected: Flag | null): boolean {
  return timeLeft <= TICK_THRESHOLD && !selected;
}

export function useFamilyPlayingState(): FamilyPlayingState {
  const navigate = useNavigate();
  const sfx = useGameSfx();
  const visualEffects = useVisualEffects();
  const gameState = useGameStore();
  const diff = DIFFICULTY[gameState.difficulty ?? 'easy'];
  const currentPlayer = gameState.players[gameState.currentPlayerIdx] ?? null;
  const { score: currentPlayerScore, streak: currentPlayerStreak } = getCurrentPlayerMetrics(
    currentPlayer,
    gameState.familyScores,
    gameState.familyStreaks,
  );
  const scorePop = useScorePop(currentPlayerScore);
  const { handleAnswer } = useGameRound(sfx);
  const timeLeft = usePlayingTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    currentFlag: gameState.currentFlag,
    selected: gameState.selected,
    sfx,
    onAnswer: handleAnswer,
  });
  const feedbackClassName = getFeedbackClassName(gameState.currentFlag, gameState.selected);
  const timerPct = getTimerPct(timeLeft, diff?.time);

  return {
    currentFlag: gameState.currentFlag,
    currentPlayer,
    currentPlayerScore,
    feedbackClassName,
    feedbackText: getFamilyFeedbackText(
      gameState.currentFlag,
      currentPlayerStreak,
      gameState.selected,
      timeLeft,
    ),
    hintLabel: getHintLabel(diff?.hintCost),
    navigate,
    onAnswer: handleAnswer,
    onRevealHint: () => {
      sfx('hint');
      gameState.setShowHint(true);
    },
    options: gameState.options,
    playerRoundLabel: `${gameState.playerRound + 1}/${RPP}`,
    scorePop,
    selected: gameState.selected,
    showHint: gameState.showHint,
    sparklesActive: visualEffects.showSparkles,
    streak: currentPlayerStreak,
    timeLeft,
    timerPct,
    timerUrgent: isTimerUrgent(timeLeft, gameState.selected),
    visualEffects,
  };
}
