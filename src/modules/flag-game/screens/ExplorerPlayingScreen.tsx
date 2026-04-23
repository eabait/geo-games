import React from 'react';

import { ExplorerPlayingLayout } from '../components/game/ExplorerPlayingLayout';
import { PlayingEffects } from '../components/game/PlayingEffects';
import { useExplorerPlayingState } from '../hooks/useExplorerPlayingState';

import styles from './ExplorerPlayingScreen.module.css';

export function ExplorerPlayingScreen(): React.JSX.Element {
  const state = useExplorerPlayingState();

  if (!state.currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  return (
    <>
      <PlayingEffects {...state.visualEffects} />
      <ExplorerPlayingLayout
        currentFlag={state.currentFlag}
        explorerBestStreak={state.explorerBestStreak}
        explorerCorrect={state.explorerCorrect}
        explorerScore={state.explorerScore}
        explorerStreak={state.explorerStreak}
        explorerTime={state.explorerTime}
        explorerTotal={state.explorerTotal}
        feedbackText={state.feedbackText}
        onAnswer={state.onAnswer}
        onGoHome={() => state.navigate('/flag-game')}
        onRevealHint={state.onRevealHint}
        options={state.options}
        selected={state.selected}
        showHint={state.showHint}
        styles={styles}
        timerColor={state.timerColor}
        timerCritical={state.timerCritical}
      />
    </>
  );
}
