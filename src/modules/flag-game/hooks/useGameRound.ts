import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { FLAGS } from '../data/flags';
import {
  DIFFICULTY,
  SOLO_R,
  RPP,
  ANSWER_DELAY_MS,
  STREAK_BONUS_THRESHOLD,
  STREAK_BONUS_MULTIPLIER,
  STREAK_SOUND_THRESHOLD,
} from '../data/constants';
import { shuffle, pickRandom } from '../data/utils';
import type { Flag } from '../types';

interface UseGameRoundResult {
  handleAnswer: (option: Flag | null) => void;
}

export function useGameRound(sfx: (name: string) => void): UseGameRoundResult {
  const navigate = useNavigate();
  const {
    mode,
    difficulty,
    currentFlag,
    usedFlags,
    showHint,
    round,
    streak,
    playerRound,
    players,
    currentPlayerIdx,
    setRoundData,
    recordAnswer,
    advancePlayerTurn,
  } = useGameStore();
  const { continent } = useSettingsStore();

  const getPool = useCallback(
    (maxTier: number): Flag[] => {
      const base =
        continent === 'Todos' ? FLAGS : FLAGS.filter((flag) => flag.continent === continent);
      return base.filter((flag) => flag.tier <= maxTier);
    },
    [continent],
  );

  useEffect(() => {
    if (currentFlag || !difficulty || mode === 'explorer') return;
    const diff = DIFFICULTY[difficulty];
    const pool = getPool(diff.maxTier);
    const available = pool.filter((flag) => !usedFlags.includes(flag.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, mode, usedFlags, getPool, setRoundData]);

  const handleSoloAnswer = useCallback(
    (option: Flag | null, correct: boolean): void => {
      if (!difficulty) return;
      const diff = DIFFICULTY[difficulty];
      const bonus = streak >= STREAK_BONUS_THRESHOLD ? streak * STREAK_BONUS_MULTIPLIER : 0;
      const pts = correct ? (showHint ? diff.points - diff.hintCost : diff.points) + bonus : 0;
      recordAnswer(option, correct, pts);
      if (correct) sfx(streak >= STREAK_BONUS_THRESHOLD ? 'streak' : 'correct');
      setTimeout(() => {
        if (round + 1 >= SOLO_R) {
          sfx('victory');
          navigate('/flag-game/solo/results');
        } else {
          useGameStore.setState((state) => {
            state.round += 1;
            state.currentFlag = null;
          });
        }
      }, ANSWER_DELAY_MS);
    },
    [difficulty, showHint, streak, round, sfx, recordAnswer, navigate],
  );

  const handleFamilyAnswer = useCallback(
    (option: Flag | null, correct: boolean): void => {
      if (!difficulty) return;
      const diff = DIFFICULTY[difficulty];
      const pid = players[currentPlayerIdx].id;
      const cs = useGameStore.getState().familyStreaks[pid] ?? 0;
      const ns = correct ? cs + 1 : 0;
      const bonus = ns >= STREAK_BONUS_THRESHOLD ? ns * STREAK_BONUS_MULTIPLIER : 0;
      const pts = correct ? (showHint ? diff.points - diff.hintCost : diff.points) + bonus : 0;
      recordAnswer(option, correct, pts);
      if (correct) sfx(ns >= STREAK_SOUND_THRESHOLD ? 'streak' : 'correct');
      useGameStore.setState((state) => {
        state.familyStreaks[pid] = ns;
        state.familyScores[pid] = (state.familyScores[pid] ?? 0) + pts;
        state.familyHistory[pid] = [
          ...(state.familyHistory[pid] ?? []),
          { flag: state.currentFlag!, correct },
        ];
      });
      setTimeout(() => {
        if (playerRound + 1 >= RPP) {
          if (currentPlayerIdx + 1 >= players.length) {
            sfx('victory');
            navigate('/flag-game/family/results');
          } else {
            advancePlayerTurn();
            navigate('/flag-game/family/pass');
          }
        } else {
          useGameStore.setState((state) => {
            state.playerRound += 1;
            state.currentFlag = null;
          });
        }
      }, ANSWER_DELAY_MS);
    },
    [
      difficulty,
      showHint,
      players,
      currentPlayerIdx,
      playerRound,
      sfx,
      recordAnswer,
      advancePlayerTurn,
      navigate,
    ],
  );

  const handleAnswer = useCallback(
    (option: Flag | null): void => {
      if (!currentFlag || !difficulty) return;
      const correct = option?.name === currentFlag.name;
      if (!correct) sfx('wrong');
      if (mode === 'solo') handleSoloAnswer(option, correct);
      else if (mode === 'family') handleFamilyAnswer(option, correct);
    },
    [currentFlag, difficulty, mode, sfx, handleSoloAnswer, handleFamilyAnswer],
  );

  return { handleAnswer };
}
