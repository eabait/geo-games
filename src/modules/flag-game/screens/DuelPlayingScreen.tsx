import React from 'react';

import { DuelPlayingLayout } from '../components/game/DuelPlayingLayout';
import { PlayingEffects } from '../components/game/PlayingEffects';
import { useDuelPlayingState } from '../hooks/useDuelPlayingState';

import styles from './DuelPlayingScreen.module.css';

export function DuelPlayingScreen(): React.JSX.Element {
  const state = useDuelPlayingState();

  if (!state.ready || !state.currentFlag) {
    return <div className={styles.loadingState}>Preparando duelo...</div>;
  }

  return (
    <>
      <PlayingEffects {...state.visualEffects} />
      <DuelPlayingLayout
        currentFlag={state.currentFlag}
        options={state.options}
        playerPanels={state.playerPanels}
        roundLabel={state.roundLabel}
        styles={styles}
        timeLeft={state.timeLeft}
        timerColor={state.timerColor}
        timerPct={state.timerPct}
        timerUrgent={state.timerUrgent}
      />
    </>
  );
}
