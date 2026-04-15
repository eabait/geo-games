import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { FLAGS } from '../data/flags';
import { DIFFICULTY, SOLO_R, RPP } from '../data/constants';
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
      const base = continent === 'Todos' ? FLAGS : FLAGS.filter((f) => f.continent === continent);
      return base.filter((f) => f.tier <= maxTier);
    },
    [continent],
  );

  // Set up a new round whenever currentFlag is cleared
  useEffect(() => {
    if (currentFlag || !difficulty || mode === 'explorer') return;
    const diff = DIFFICULTY[difficulty];
    const pool = getPool(diff.maxTier);
    const available = pool.filter((f) => !usedFlags.includes(f.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, mode, usedFlags, getPool, setRoundData]);

  const handleAnswer = useCallback(
    (option: Flag | null): void => {
      if (!currentFlag || !difficulty) return;
      const diff = DIFFICULTY[difficulty];
      const correct = option?.name === currentFlag.name;

      if (!correct) {
        sfx('wrong');
      }

      if (mode === 'solo') {
        const pts = correct
          ? (showHint ? diff.points - diff.hintCost : diff.points) + (streak >= 2 ? streak * 2 : 0)
          : 0;
        recordAnswer(option ?? currentFlag, correct, pts);
        if (correct) sfx(streak >= 2 ? 'streak' : 'correct');

        setTimeout(() => {
          if (round + 1 >= SOLO_R) {
            sfx('victory');
            navigate('/flag-game/solo/results');
          } else {
            useGameStore.setState((s) => {
              s.round += 1;
              s.currentFlag = null;
            });
          }
        }, 1600);
      }

      if (mode === 'family') {
        const pid = players[currentPlayerIdx].id;
        const cs = useGameStore.getState().familyStreaks[pid] ?? 0;
        const ns = correct ? cs + 1 : 0;
        const pts = correct
          ? (showHint ? diff.points - diff.hintCost : diff.points) + (ns >= 2 ? ns * 2 : 0)
          : 0;
        recordAnswer(option ?? currentFlag, correct, pts);
        if (correct) sfx(ns >= 3 ? 'streak' : 'correct');
        useGameStore.setState((s) => {
          s.familyStreaks[pid] = ns;
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
            useGameStore.setState((s) => {
              s.playerRound += 1;
              s.currentFlag = null;
            });
          }
        }, 1600);
      }
    },
    [
      currentFlag,
      difficulty,
      mode,
      showHint,
      streak,
      round,
      playerRound,
      players,
      currentPlayerIdx,
      sfx,
      recordAnswer,
      advancePlayerTurn,
      navigate,
    ],
  );

  return { handleAnswer };
}
