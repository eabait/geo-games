import React from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { MobileMap } from '../components/MobileMap';
import {
  DIFFICULTY,
  EXPLORER_STREAK_THRESHOLD,
  EXPLORER_NEXT_DELAY_MS,
  EXPLORER_TIMER_RED,
  EXPLORER_TIMER_YELLOW,
} from '../data/constants';
import { FLAGS } from '../data/flags';
import { shuffle, pickRandom } from '../data/utils';
import type { Flag } from '../types';

import styles from './ExplorerPlayingScreen.module.css';

export function ExplorerPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn, continent } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect } = useVisualEffects();

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

  const diff = DIFFICULTY[difficulty ?? 'easy'];

  // Set up new round when currentFlag is cleared
  useEffect(() => {
    if (currentFlag || !difficulty) return;
    const base =
      continent === 'Todos' ? FLAGS : FLAGS.filter((flag) => flag.continent === continent);
    const pool = base.filter((flag) => flag.tier <= diff.maxTier);
    const available = pool.filter((flag) => !usedFlags.includes(flag.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, usedFlags, continent, diff, setRoundData]);

  // Explorer countdown timer
  useEffect(() => {
    if (explorerTime <= 0) {
      navigate('/flag-game/explorer/results');
      return;
    }
    const id = setInterval(() => {
      tickExplorerTime();
    }, EXPLORER_NEXT_DELAY_MS);
    return () => clearInterval(id);
  }, [explorerTime, tickExplorerTime, navigate]);

  const handleAnswer = useCallback(
    (opt: Flag): void => {
      if (selected !== null || !currentFlag) return;
      const correct = opt.name === currentFlag.name;
      if (correct) sfx(explorerStreak >= EXPLORER_STREAK_THRESHOLD ? 'streak' : 'correct');
      else sfx('wrong');
      useGameStore.setState((state) => {
        state.selected = opt;
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
    [selected, currentFlag, sfx, explorerStreak, recordExplorerAnswer],
  );

  if (!currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  const timerColor =
    explorerTime <= EXPLORER_TIMER_RED
      ? '#ef4444'
      : explorerTime <= EXPLORER_TIMER_YELLOW
        ? '#eab308'
        : '#fbbf24';
  const timerClassName = [
    styles.timerValue,
    explorerTime <= EXPLORER_TIMER_RED ? styles.timerCritical : '',
  ]
    .filter(Boolean)
    .join(' ');
  const feedbackClassName = [
    styles.feedbackPanel,
    selected?.name === currentFlag.name ? styles.feedbackCorrect : styles.feedbackWrong,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
      <div className={styles.screen}>
        <nav className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.homeButton}
              onClick={() => navigate('/flag-game')}
              type="button"
            >
              🏠
            </button>
            {explorerStreak >= EXPLORER_STREAK_THRESHOLD && (
              <span className={styles.streakBadge}>🔥x{explorerStreak}</span>
            )}
            <span className={styles.correctCount}>{explorerCorrect} acertadas</span>
          </div>
          <div className={styles.timerPill}>
            <span className={styles.timerIcon}>⏱️</span>
            <span
              className={timerClassName}
              style={{ '--timer-color': timerColor } as React.CSSProperties}
            >
              {explorerTime}s
            </span>
          </div>
        </nav>
        <div className={styles.flagPrompt}>
          <span className={styles.flagEmoji}>{currentFlag.code}</span>
          <div>
            <div className={styles.promptTitle}>¿Dónde queda?</div>
            <div className={styles.promptContinent}>{currentFlag.continent}</div>
          </div>
        </div>
        {!showHint && selected === null && (
          <nav className={styles.hintNav}>
            <button
              className={styles.hintButton}
              onClick={() => {
                sfx('hint');
                setShowHint(true);
              }}
              type="button"
            >
              💡 Pista
            </button>
          </nav>
        )}
        {showHint && <p className={styles.hintText}>💡 {currentFlag.hint}</p>}
        <div className={styles.mapWrap}>
          <MobileMap
            options={options}
            correctName={currentFlag.name}
            selected={selected}
            onSelect={handleAnswer}
          />
        </div>
        {selected !== null && (
          <div className={feedbackClassName}>
            {selected.name === currentFlag.name ? '🎉 ¡Correcto! +3s' : `❌ ${currentFlag.name}`}
          </div>
        )}
        <div className={styles.statsCard}>
          <div className={styles.statsItem}>
            <div className={styles.statsLabel}>Puntos</div>
            <div className={[styles.statsValue, styles.statsValueScore].join(' ')}>
              {explorerScore}
            </div>
          </div>
          <div className={styles.statsItem}>
            <div className={styles.statsLabel}>Aciertos</div>
            <div className={[styles.statsValue, styles.statsValueCorrect].join(' ')}>
              {explorerCorrect}/{explorerTotal}
            </div>
          </div>
          <div className={styles.statsItem}>
            <div className={styles.statsLabel}>Racha</div>
            <div className={[styles.statsValue, styles.statsValueStreak].join(' ')}>
              🔥{explorerBestStreak}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
