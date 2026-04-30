import React from 'react';

import { useCapitalQuiz } from '../hooks/useCapitalQuiz';
import type { DifficultyKey } from '../types';

import styles from './CapitalPlayingScreen.module.css';

import { TIMER_PCT_FULL } from '@/modules/flag-game/data/constants';
import { QuizLayout } from '@/shared/quiz-engine/QuizLayout';

const TIMER_GREEN_THRESHOLD = 50;
const TIMER_YELLOW_THRESHOLD = 25;
const TIMER_URGENT_SECONDS = 5;

const SECONDS_PER_ROUND: Record<DifficultyKey, number> = {
  easy: 20,
  medium: 15,
  hard: 10,
};

function getDifficulty(): DifficultyKey {
  const value = sessionStorage.getItem('capital-difficulty');

  return value === 'medium' || value === 'hard' ? value : 'easy';
}

function getTimerColor(timerPct: number): string {
  if (timerPct > TIMER_GREEN_THRESHOLD) return '#22c55e';
  if (timerPct > TIMER_YELLOW_THRESHOLD) return '#eab308';
  return '#ef4444';
}

function getFeedbackText(
  answered: boolean,
  isCorrect: boolean,
  correctCapital: string,
): string | null {
  if (!answered) return null;
  if (isCorrect) return '🎉 ¡Correcto!';
  return `❌ Era ${correctCapital}`;
}

export function CapitalPlayingScreen(): React.JSX.Element {
  const difficulty = getDifficulty();
  const state = useCapitalQuiz(difficulty);

  if (!state.current) return <div className={styles.loadingState}>Cargando...</div>;

  const seconds = SECONDS_PER_ROUND[difficulty];
  const timerPct = (state.timeLeft / seconds) * TIMER_PCT_FULL;
  const options = state.options.map((item) => ({ id: item.id, label: item.capital }));
  const feedbackText = getFeedbackText(state.answered, state.isCorrect, state.current.capital);

  return (
    <QuizLayout
      correctId={state.correctId ?? ''}
      feedbackText={feedbackText}
      headerLeft={
        <>
          <button
            className={styles.homeButton}
            onClick={() => state.navigate('/capital-cities')}
            type="button"
          >
            🏠
          </button>
          <span className={styles.roundMeta}>{state.round + 1}/10</span>
        </>
      }
      headerRight={<span className={styles.scoreValue}>{state.score} pts</span>}
      onAnswer={state.handleAnswer}
      options={options}
      questionSlot={
        <div className={styles.question}>
          <div className={styles.flagEmoji}>{state.current.flagCode}</div>
          <p className={styles.questionText}>
            ¿Cuál es la capital de
            <br />
            <strong>{state.current.countryName}</strong>?
          </p>
        </div>
      }
      selectedId={state.selectedId}
      timerColor={getTimerColor(timerPct)}
      timerPct={timerPct}
      timerUrgent={state.timeLeft <= TIMER_URGENT_SECONDS && !state.answered}
    />
  );
}
