import React from 'react';

import { PlayingEffects } from '../components/game/PlayingEffects';
import { Sparkles } from '../components/effects/Sparkles';
import { STREAK_BONUS_THRESHOLD } from '../data/constants';
import { useSoloPlayingState, type SoloPlayingState } from '../hooks/useSoloPlayingState';

import styles from './SoloPlayingScreen.module.css';

import { QuizLayout } from '@/shared/quiz-engine/QuizLayout';

function renderQuestionSlot(state: SoloPlayingState): React.ReactNode {
  if (!state.currentFlag) return null;

  return (
    <div className={styles.flagCard}>
      <div className={styles.flagEmoji}>{state.currentFlag.code}</div>
      <div className={styles.continentPill}>{state.currentFlag.continent}</div>
      {state.showHint && <p className={styles.hintText}>💡 {state.currentFlag.hint}</p>}
      {!state.showHint && !state.selected && (
        <button className={styles.hintButton} onClick={state.onRevealHint} type="button">
          {state.hintLabel}
        </button>
      )}
    </div>
  );
}

function renderHeaderLeft(state: SoloPlayingState): React.ReactNode {
  return (
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
  );
}

function renderHeaderRight(state: SoloPlayingState): React.ReactNode {
  return (
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
  );
}

export function SoloPlayingScreen(): React.JSX.Element {
  const state = useSoloPlayingState();

  if (!state.currentFlag) return <div className={styles.loadingState}>Cargando...</div>;

  const options = state.options.map((flag) => ({ id: flag.name, label: flag.name }));
  const correctId = state.currentFlag.name;
  const selectedId = state.selected?.name ?? null;

  function handleAnswer(id: string): void {
    const flag = state.options.find((option) => option.name === id);

    if (flag) {
      state.onAnswer(flag);
    }
  }

  return (
    <>
      <PlayingEffects {...state.visualEffects} />
      <QuizLayout
        correctId={correctId}
        feedbackText={state.feedbackText}
        headerLeft={renderHeaderLeft(state)}
        headerRight={renderHeaderRight(state)}
        onAnswer={handleAnswer}
        options={options}
        questionSlot={renderQuestionSlot(state)}
        selectedId={selectedId}
        timerColor={state.timerColor}
        timerPct={state.timerPct}
        timerUrgent={state.timerUrgent}
      />
    </>
  );
}
