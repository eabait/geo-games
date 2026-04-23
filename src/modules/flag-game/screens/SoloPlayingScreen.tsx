import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useGameRound } from '../hooks/useGameRound';
import { useTimer } from '../hooks/useTimer';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { Sparkles } from '../components/effects/Sparkles';
import { OptionButton } from '../components/OptionButton';
import {
  DIFFICULTY,
  SOLO_R,
  SCORE_POP_DURATION_MS,
  TICK_THRESHOLD,
  TICK_URGENT_THRESHOLD,
  TIMER_PCT_GREEN,
  TIMER_PCT_YELLOW,
  TIMER_PCT_FULL,
  STREAK_BONUS_THRESHOLD,
  STREAK_SOUND_THRESHOLD,
  DEFAULT_ROUND_SECONDS,
} from '../data/constants';
import type { Flag } from '../types';

import styles from './SoloPlayingScreen.module.css';

export function SoloPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect, showSparkles } =
    useVisualEffects();

  const { currentFlag, options, selected, showHint, round, score, streak, setShowHint } =
    useGameStore();
  const diff = DIFFICULTY[useGameStore((state) => state.difficulty ?? 'easy')];

  const [scorePop, setScorePop] = useState(false);
  useEffect(() => {
    if (score > 0) {
      setScorePop(true);
      const timer = setTimeout(() => setScorePop(false), SCORE_POP_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const { handleAnswer } = useGameRound(sfx);

  const { timeLeft } = useTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    active: !!currentFlag && selected === null,
    onTick: (t) => {
      if (t <= TICK_THRESHOLD && t > TICK_URGENT_THRESHOLD) sfx('tick');
      else if (t <= TICK_URGENT_THRESHOLD) sfx('tickUrgent');
    },
    onExpire: () => {
      sfx('timeout');
      handleAnswer(null);
    },
  });

  if (!currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * TIMER_PCT_FULL : TIMER_PCT_FULL;
  const timerColor =
    timerPct > TIMER_PCT_GREEN ? '#22c55e' : timerPct > TIMER_PCT_YELLOW ? '#eab308' : '#ef4444';
  const scoreClassName = [styles.scoreValue, scorePop ? styles.scorePop : '']
    .filter(Boolean)
    .join(' ');
  const timerClassName = [
    styles.timerFill,
    timeLeft <= TICK_THRESHOLD && !selected ? styles.timerUrgent : '',
  ]
    .filter(Boolean)
    .join(' ');
  const feedbackClassName = [
    styles.feedbackPanel,
    selected?.name === currentFlag.name ? styles.feedbackCorrect : styles.feedbackWrong,
  ]
    .filter(Boolean)
    .join(' ');

  const onAnswer = (opt: Flag): void => {
    handleAnswer(opt);
  };

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
            <span className={styles.roundMeta}>
              <span className={styles.roundCurrent}>{round + 1}</span>/{SOLO_R}
            </span>
          </div>
          <div className={styles.headerRight}>
            {streak >= STREAK_BONUS_THRESHOLD && (
              <span className={styles.streakBadge}>🔥x{streak}</span>
            )}
            <Sparkles active={showSparkles} />
            <span className={scoreClassName}>{score}</span>
          </div>
        </nav>
        <div className={styles.timerTrack}>
          <div
            className={timerClassName}
            style={
              {
                '--timer-width': `${timerPct}%`,
                '--timer-color': timerColor,
              } as React.CSSProperties
            }
          />
        </div>
        <div className={styles.flagCard}>
          <div className={styles.flagEmoji}>{currentFlag.code}</div>
        </div>
        <div className={styles.continentPill}>{currentFlag.continent}</div>
        {!showHint && !selected && (
          <nav className={styles.hintNav}>
            <button
              className={styles.hintButton}
              onClick={() => {
                sfx('hint');
                setShowHint(true);
              }}
              type="button"
            >
              💡 Pista (-{diff?.hintCost} pts)
            </button>
          </nav>
        )}
        {showHint && <p className={styles.hintText}>💡 {currentFlag.hint}</p>}
        <div className={styles.answerSection}>
          {options.map((opt, i) => (
            <OptionButton
              key={opt.name}
              opt={opt}
              index={i}
              selected={selected}
              currentFlag={currentFlag}
              onAnswer={onAnswer}
            />
          ))}
        </div>
        {selected && (
          <div className={feedbackClassName}>
            {selected.name === currentFlag.name
              ? streak >= STREAK_SOUND_THRESHOLD
                ? '🔥 ¡Imparable!'
                : '🎉 ¡Correcto!'
              : `❌ Era ${currentFlag.name}`}
          </div>
        )}
        {!selected && timeLeft === 0 && (
          <div className={[styles.feedbackPanel, styles.feedbackWrong].join(' ')}>
            ⏱️ ¡Tiempo! Era {currentFlag.name}
          </div>
        )}
      </div>
    </>
  );
}
