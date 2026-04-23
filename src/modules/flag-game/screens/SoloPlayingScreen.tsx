import React from 'react';

import { ClassicPlayingLayout } from '../components/game/ClassicPlayingLayout';
import { PlayingEffects } from '../components/game/PlayingEffects';
import { Sparkles } from '../components/effects/Sparkles';
import { STREAK_BONUS_THRESHOLD } from '../data/constants';
import { useSoloPlayingState } from '../hooks/useSoloPlayingState';

import styles from './SoloPlayingScreen.module.css';

export function SoloPlayingScreen(): React.JSX.Element {
  const state = useSoloPlayingState();

  if (!state.currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  return (
    <>
      <PlayingEffects {...state.visualEffects} />
      <ClassicPlayingLayout
        currentFlag={state.currentFlag}
        feedbackText={state.feedbackText}
        headerLeft={
          <>
            <button
              className={styles.homeButton}
              onClick={() => state.navigate('/flag-game')}
              type="button"
            >
              🏠
            </button>
            <span className={styles.roundMeta}>{state.roundLabel}</span>
          </>
        }
        headerRight={
          <>
            {state.streak >= STREAK_BONUS_THRESHOLD && (
              <span className={styles.streakBadge}>🔥x{state.streak}</span>
            )}
            <Sparkles active={state.sparklesActive} />
            <span
              className={[styles.scoreValue, state.scorePop ? styles.scorePop : '']
                .filter(Boolean)
                .join(' ')}
            >
              {state.score}
            </span>
          </>
        }
        hintLabel={state.hintLabel}
        onAnswer={state.onAnswer}
        onRevealHint={state.onRevealHint}
        options={state.options}
        selected={state.selected}
        showHint={state.showHint}
        styles={styles}
        timerColor={state.timerColor}
        timerPct={state.timerPct}
        timerUrgent={state.timerUrgent}
      />
    </>
  );
}
