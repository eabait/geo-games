import React from 'react';

import { ClassicPlayingLayout } from '../components/game/ClassicPlayingLayout';
import { PlayingEffects } from '../components/game/PlayingEffects';
import { Sparkles } from '../components/effects/Sparkles';
import { STREAK_BONUS_THRESHOLD } from '../data/constants';
import { useFamilyPlayingState } from '../hooks/useFamilyPlayingState';

import styles from './FamilyPlayingScreen.module.css';

export function FamilyPlayingScreen(): React.JSX.Element {
  const state = useFamilyPlayingState();

  if (!state.currentFlag || !state.currentPlayer) {
    return <div className={styles.loadingState}>Cargando...</div>;
  }

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
            <span className={styles.playerAvatar}>{state.currentPlayer.avatar}</span>
            <span className={styles.playerName}>{state.currentPlayer.name}</span>
            <span className={styles.playerRound}>{state.playerRoundLabel}</span>
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
              {state.currentPlayerScore}
            </span>
          </>
        }
        hintLabel={state.hintLabel}
        onAnswer={state.onAnswer}
        onRevealHint={state.onRevealHint}
        options={state.options}
        rootStyle={{ '--accent-color': state.currentPlayer.color } as React.CSSProperties}
        selected={state.selected}
        showHint={state.showHint}
        styles={styles}
        timerColor={state.currentPlayer.color}
        timerPct={state.timerPct}
        timerUrgent={state.timerUrgent}
      />
    </>
  );
}
