import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { buildNextRound } from '../data/rounds';
import {
  ANSWER_DELAY_MS,
  DIFFICULTY,
  RPP,
  SOLO_R,
  STREAK_BONUS_MULTIPLIER,
  STREAK_BONUS_THRESHOLD,
  STREAK_SOUND_THRESHOLD,
} from '../data/constants';
import type { Flag, Player } from '../types';

import type { SoundName } from './useSoundEngine';

interface UseGameRoundResult {
  handleAnswer: (option: Flag | null) => void;
}

interface AnswerConfig {
  difficulty: keyof typeof DIFFICULTY;
  showHint: boolean;
  correct: boolean;
  option: Flag | null;
}

function getSoloPoints(config: AnswerConfig, streak: number): number {
  if (!config.correct) return 0;

  const diff = DIFFICULTY[config.difficulty];
  const bonus = streak >= STREAK_BONUS_THRESHOLD ? streak * STREAK_BONUS_MULTIPLIER : 0;
  const basePoints = config.showHint ? diff.points - diff.hintCost : diff.points;

  return basePoints + bonus;
}

function getFamilyPoints(config: AnswerConfig, streak: number): number {
  if (!config.correct) return 0;

  const diff = DIFFICULTY[config.difficulty];
  const bonus = streak >= STREAK_BONUS_THRESHOLD ? streak * STREAK_BONUS_MULTIPLIER : 0;
  const basePoints = config.showHint ? diff.points - diff.hintCost : diff.points;

  return basePoints + bonus;
}

function playCorrectSound(correct: boolean, streak: number, sfx: (name: SoundName) => void): void {
  if (!correct) {
    sfx('wrong');
    return;
  }

  sfx(streak >= STREAK_SOUND_THRESHOLD ? 'streak' : 'correct');
}

function queueSoloTransition(
  round: number,
  navigate: ReturnType<typeof useNavigate>,
  sfx: (name: SoundName) => void,
): void {
  setTimeout(() => {
    if (round + 1 >= SOLO_R) {
      sfx('victory');
      navigate('/flag-game/solo/results');
      return;
    }

    useGameStore.setState((state) => {
      state.round += 1;
      state.currentFlag = null;
    });
  }, ANSWER_DELAY_MS);
}

function queueFamilyTransition(
  playerRound: number,
  currentPlayerIdx: number,
  players: Player[],
  advancePlayerTurn: () => void,
  navigate: ReturnType<typeof useNavigate>,
  sfx: (name: SoundName) => void,
): void {
  setTimeout(() => {
    if (playerRound + 1 >= RPP) {
      if (currentPlayerIdx + 1 >= players.length) {
        sfx('victory');
        navigate('/flag-game/family/results');
        return;
      }

      advancePlayerTurn();
      navigate('/flag-game/family/pass');
      return;
    }

    useGameStore.setState((state) => {
      state.playerRound += 1;
      state.currentFlag = null;
    });
  }, ANSWER_DELAY_MS);
}

function useRoundBootstrap(): void {
  const { mode, difficulty, currentFlag, usedFlags, setRoundData } = useGameStore();
  const { continent } = useSettingsStore();

  useEffect(() => {
    if (currentFlag || !difficulty || mode === 'explorer' || mode === 'duel') return;

    const nextRound = buildNextRound(difficulty, continent, usedFlags);
    setRoundData(nextRound.flag, nextRound.options);
  }, [continent, currentFlag, difficulty, mode, setRoundData, usedFlags]);
}

function useSoloAnswerHandler(
  navigate: ReturnType<typeof useNavigate>,
  sfx: (name: SoundName) => void,
): (option: Flag | null, correct: boolean) => void {
  const { difficulty, showHint, round, streak, recordAnswer } = useGameStore();

  return useCallback(
    (option: Flag | null, correct: boolean): void => {
      if (!difficulty) return;

      const points = getSoloPoints({ difficulty, showHint, correct, option }, streak);
      recordAnswer(option, correct, points);
      playCorrectSound(correct, streak, sfx);
      queueSoloTransition(round, navigate, sfx);
    },
    [difficulty, navigate, recordAnswer, round, sfx, showHint, streak],
  );
}

function useFamilyAnswerHandler(
  navigate: ReturnType<typeof useNavigate>,
  sfx: (name: SoundName) => void,
): (option: Flag | null, correct: boolean) => void {
  const {
    difficulty,
    showHint,
    playerRound,
    players,
    currentPlayerIdx,
    recordAnswer,
    advancePlayerTurn,
  } = useGameStore();

  return useCallback(
    (option: Flag | null, correct: boolean): void => {
      if (!difficulty) return;

      const playerId = players[currentPlayerIdx].id;
      const currentStreak = useGameStore.getState().familyStreaks[playerId] ?? 0;
      const nextStreak = correct ? currentStreak + 1 : 0;
      const points = getFamilyPoints({ difficulty, showHint, correct, option }, nextStreak);

      recordAnswer(option, correct, points);
      playCorrectSound(correct, nextStreak, sfx);

      useGameStore.setState((state) => {
        state.familyStreaks[playerId] = nextStreak;
        state.familyScores[playerId] = (state.familyScores[playerId] ?? 0) + points;
        state.familyHistory[playerId] = [
          ...(state.familyHistory[playerId] ?? []),
          { flag: state.currentFlag!, correct },
        ];
      });

      queueFamilyTransition(
        playerRound,
        currentPlayerIdx,
        players,
        advancePlayerTurn,
        navigate,
        sfx,
      );
    },
    [
      advancePlayerTurn,
      currentPlayerIdx,
      difficulty,
      navigate,
      playerRound,
      players,
      recordAnswer,
      sfx,
      showHint,
    ],
  );
}

export function useGameRound(sfx: (name: SoundName) => void): UseGameRoundResult {
  const navigate = useNavigate();
  const { mode, difficulty, currentFlag } = useGameStore();
  const handleSoloAnswer = useSoloAnswerHandler(navigate, sfx);
  const handleFamilyAnswer = useFamilyAnswerHandler(navigate, sfx);

  useRoundBootstrap();

  const handleAnswer = useCallback(
    (option: Flag | null): void => {
      if (!currentFlag || !difficulty) return;

      const correct = option?.name === currentFlag.name;

      if (mode === 'solo') {
        handleSoloAnswer(option, correct);
      } else if (mode === 'family') {
        handleFamilyAnswer(option, correct);
      }
    },
    [currentFlag, difficulty, handleFamilyAnswer, handleSoloAnswer, mode],
  );

  return { handleAnswer };
}
