import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ANSWER_DELAY_MS,
  DEFAULT_ROUND_SECONDS,
  DIFFICULTY,
  DUEL_R,
  TIMER_PCT_FULL,
  TIMER_PCT_GREEN,
  TIMER_PCT_YELLOW,
} from '../data/constants';
import { buildNextRound } from '../data/rounds';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import type { Continent, DuelRoundResolution, Flag, Player } from '../types';

import { useGameSfx } from './useGameSfx';
import { usePlayingTimer } from './usePlayingTimer';

interface DuelVisualEffects {
  flashCorrect: boolean;
  showConfetti: boolean;
  showFloatingEmojis: boolean;
  showScreenFlash: boolean;
}

interface DuelCountdownOptions {
  currentFlag: Flag | null;
  difficulty: keyof typeof DIFFICULTY | null;
  duelResolution: DuelRoundResolution | null;
  duelSelectedFlag: Flag | null;
  recordDuelTimeout: () => void;
  sfx: ReturnType<typeof useGameSfx>;
}

interface DuelPlayerPanelsOptions {
  currentFlag: Flag | null;
  duelAnsweringPlayerId: string | null;
  duelPlayers: Player[];
  duelResolvedBy: string | null;
  duelResolution: DuelRoundResolution | null;
  duelScores: Record<string, number>;
  duelSelectedFlag: Flag | null;
  recordDuelAnswer: (playerId: string, chosenFlag: Flag) => void;
  sfx: ReturnType<typeof useGameSfx>;
}

interface DuelPlayerPanelState {
  feedbackText: string | null;
  isLoser: boolean;
  onAnswer: (flag: Flag) => void;
  player: Player;
  score: number;
  selected: Flag | null;
}

export interface DuelPlayingState {
  currentFlag: Flag | null;
  options: Flag[];
  playerPanels: DuelPlayerPanelState[];
  ready: boolean;
  roundLabel: string;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
  visualEffects: DuelVisualEffects;
}

const DUEL_PLAYER_COUNT = 2;
const TIMER_URGENT_THRESHOLD = 5;

function getTimerColor(timerPct: number): string {
  if (timerPct > TIMER_PCT_GREEN) return '#22c55e';
  if (timerPct > TIMER_PCT_YELLOW) return '#eab308';
  return '#ef4444';
}

function getPlayerFeedback(
  playerId: string,
  resolution: DuelRoundResolution | null,
  answeringPlayerId: string | null,
  resolvedBy: string | null,
): string | null {
  if (resolution === null) return null;
  if (resolution === 'timeout') return "Time's up";
  if (playerId === answeringPlayerId && resolution === 'opponent-awarded') return 'Gifted points';
  if (playerId === resolvedBy) return 'Correct';
  return 'Too slow';
}

function getDisplayedSelection(
  playerId: string,
  currentFlag: Flag | null,
  selectedFlag: Flag | null,
  resolution: DuelRoundResolution | null,
  answeringPlayerId: string | null,
): Flag | null {
  if (!currentFlag || resolution === null) return null;
  if (resolution === 'timeout') return currentFlag;
  if (playerId === answeringPlayerId) return selectedFlag ?? currentFlag;
  return currentFlag;
}

function getVisualEffects(resolution: DuelRoundResolution | null): DuelVisualEffects {
  return {
    flashCorrect: resolution === 'correct',
    showConfetti: resolution === 'correct',
    showFloatingEmojis: false,
    showScreenFlash: resolution === 'correct' || resolution === 'opponent-awarded',
  };
}

function useDuelRoundSetup(
  continent: Continent | 'Todos',
  currentFlag: Flag | null,
  difficulty: keyof typeof DIFFICULTY | null,
  duelPlayersLength: number,
  usedFlags: string[],
  setRoundData: (flag: Flag, options: Flag[]) => void,
): void {
  useEffect(() => {
    if (!difficulty || duelPlayersLength !== DUEL_PLAYER_COUNT || currentFlag) {
      return;
    }

    const nextRound = buildNextRound(difficulty, continent, usedFlags);
    setRoundData(nextRound.flag, nextRound.options);
  }, [continent, currentFlag, difficulty, duelPlayersLength, setRoundData, usedFlags]);
}

function useDuelResolutionTransition(
  duelResolution: DuelRoundResolution | null,
  duelRound: number,
  advanceDuelRound: () => void,
  navigate: ReturnType<typeof useNavigate>,
  sfx: ReturnType<typeof useGameSfx>,
): void {
  useEffect(() => {
    if (duelResolution === null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (duelRound + 1 >= DUEL_R) {
        sfx('victory');
        navigate('/flag-game/duel/results');
        return;
      }

      advanceDuelRound();
    }, ANSWER_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [advanceDuelRound, duelResolution, duelRound, navigate, sfx]);
}

function useDuelCountdown({
  currentFlag,
  difficulty,
  duelResolution,
  duelSelectedFlag,
  recordDuelTimeout,
  sfx,
}: DuelCountdownOptions): { seconds: number; timeLeft: number } {
  const seconds = difficulty ? DIFFICULTY[difficulty].time : DEFAULT_ROUND_SECONDS;
  const timerSelected = duelResolution === null ? duelSelectedFlag : currentFlag;
  const onCountdownAnswer = useCallback(
    (flag: Flag | null): void => {
      if (flag !== null || !currentFlag || useGameStore.getState().duelResolution !== null) {
        return;
      }

      recordDuelTimeout();
    },
    [currentFlag, recordDuelTimeout],
  );
  const timeLeft = usePlayingTimer({
    currentFlag,
    onAnswer: onCountdownAnswer,
    seconds,
    selected: timerSelected,
    sfx,
  });

  return { seconds, timeLeft };
}

function buildDuelPlayerPanels({
  currentFlag,
  duelAnsweringPlayerId,
  duelPlayers,
  duelResolvedBy,
  duelResolution,
  duelScores,
  duelSelectedFlag,
  recordDuelAnswer,
  sfx,
}: DuelPlayerPanelsOptions): DuelPlayerPanelState[] {
  return duelPlayers.map((player) => ({
    feedbackText: getPlayerFeedback(
      player.id,
      duelResolution,
      duelAnsweringPlayerId,
      duelResolvedBy,
    ),
    isLoser:
      duelResolution !== null && duelResolution !== 'timeout' && player.id !== duelResolvedBy,
    onAnswer: (flag: Flag) => {
      if (!currentFlag || useGameStore.getState().duelResolution !== null) {
        return;
      }

      sfx(flag.code === currentFlag.code ? 'correct' : 'wrong');
      recordDuelAnswer(player.id, flag);
    },
    player,
    score: duelScores[player.id] ?? 0,
    selected: getDisplayedSelection(
      player.id,
      currentFlag,
      duelSelectedFlag,
      duelResolution,
      duelAnsweringPlayerId,
    ),
  }));
}

// eslint-disable-next-line max-lines-per-function
export function useDuelPlayingState(): DuelPlayingState {
  const navigate = useNavigate();
  const sfx = useGameSfx();
  const { continent } = useSettingsStore();
  const {
    currentFlag,
    options,
    difficulty,
    usedFlags,
    duelPlayers,
    duelScores,
    duelRound,
    duelResolution,
    duelResolvedBy,
    duelAnsweringPlayerId,
    duelSelectedFlag,
    setRoundData,
    recordDuelAnswer,
    recordDuelTimeout,
    advanceDuelRound,
  } = useGameStore();

  useDuelRoundSetup(
    continent,
    currentFlag,
    difficulty,
    duelPlayers.length,
    usedFlags,
    setRoundData,
  );
  useDuelResolutionTransition(duelResolution, duelRound, advanceDuelRound, navigate, sfx);

  const { seconds, timeLeft } = useDuelCountdown({
    currentFlag,
    difficulty,
    duelResolution,
    duelSelectedFlag,
    recordDuelTimeout,
    sfx,
  });
  const playerPanels = buildDuelPlayerPanels({
    currentFlag,
    duelAnsweringPlayerId,
    duelPlayers,
    duelResolvedBy,
    duelResolution,
    duelScores,
    duelSelectedFlag,
    recordDuelAnswer,
    sfx,
  });

  const timerPct = Math.max(0, (timeLeft / seconds) * TIMER_PCT_FULL);

  return {
    currentFlag,
    options,
    playerPanels,
    ready: duelPlayers.length === DUEL_PLAYER_COUNT && currentFlag !== null && options.length > 0,
    roundLabel: `${duelRound + 1}/${DUEL_R}`,
    timeLeft,
    timerColor: getTimerColor(timerPct),
    timerPct,
    timerUrgent: timeLeft <= TIMER_URGENT_THRESHOLD && duelResolution === null,
    visualEffects: getVisualEffects(duelResolution),
  };
}
