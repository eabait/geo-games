import { useReducer } from 'react';

import type { QuizActions, QuizConfig, QuizState } from './types';

const DEFAULT_ROUND_COUNT = 10;
const DEFAULT_POINTS_PER_CORRECT = 10;

interface QuizSessionResult<T> extends QuizState<T>, QuizActions {
  pool: T[];
}

interface InternalQuizState<T> extends QuizState<T> {
  pool: T[];
  config: QuizConfig<T>;
}

type QuizAction<T> =
  | { type: 'ANSWER'; id: string }
  | { type: 'TIMEOUT' }
  | { type: 'NEXT'; next: T | null; options: T[] };

function pickRandomItem<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function buildInitialState<T>(config: QuizConfig<T>): InternalQuizState<T> {
  const pool = [...config.items];
  const current = pickRandomItem(pool);
  const options = current === null ? [] : config.generateOptions(current, pool);

  return {
    round: 0,
    score: 0,
    current,
    options,
    selectedId: null,
    correctId: current === null ? null : config.toId(current),
    answered: false,
    isCorrect: false,
    isFinished: current === null,
    pool,
    config,
  };
}

function answerQuestion<T>(state: InternalQuizState<T>, id: string): InternalQuizState<T> {
  if (state.answered || state.isFinished) {
    return state;
  }

  const pointsPerCorrect = state.config.pointsPerCorrect ?? DEFAULT_POINTS_PER_CORRECT;
  const isCorrect = id === state.correctId;

  return {
    ...state,
    selectedId: id,
    answered: true,
    isCorrect,
    score: state.score + (isCorrect ? pointsPerCorrect : 0),
  };
}

function timeoutQuestion<T>(state: InternalQuizState<T>): InternalQuizState<T> {
  if (state.answered || state.isFinished) {
    return state;
  }

  return {
    ...state,
    selectedId: null,
    answered: true,
    isCorrect: false,
  };
}

function advanceQuestion<T>(
  state: InternalQuizState<T>,
  next: T | null,
  options: T[],
): InternalQuizState<T> {
  if (state.isFinished) {
    return state;
  }

  const roundCount = state.config.roundCount ?? DEFAULT_ROUND_COUNT;
  const nextRound = state.round + 1;
  const isFinished = nextRound >= roundCount || next === null;

  return {
    ...state,
    round: nextRound,
    current: isFinished ? null : next,
    options: isFinished ? [] : options,
    selectedId: null,
    correctId: isFinished || next === null ? null : state.config.toId(next),
    answered: false,
    isCorrect: false,
    isFinished,
  };
}

function quizReducer<T>(state: InternalQuizState<T>, action: QuizAction<T>): InternalQuizState<T> {
  switch (action.type) {
    case 'ANSWER':
      return answerQuestion(state, action.id);
    case 'TIMEOUT':
      return timeoutQuestion(state);
    case 'NEXT':
      return advanceQuestion(state, action.next, action.options);
  }
}

export function useQuizSession<T>(config: QuizConfig<T>): QuizSessionResult<T> {
  // A quiz session captures its config at mount. Remount the hook to start over with new data.
  const [state, dispatch] = useReducer(quizReducer<T>, config, buildInitialState);

  const handleAnswer = (id: string): void => {
    dispatch({ type: 'ANSWER', id });
  };

  const handleTimeout = (): void => {
    dispatch({ type: 'TIMEOUT' });
  };

  const nextRound = (): void => {
    const remaining = state.pool.filter((item) => {
      if (state.current === null) {
        return true;
      }

      return state.config.toId(item) !== state.config.toId(state.current);
    });
    const next = pickRandomItem(remaining.length > 0 ? remaining : state.pool);
    const options = next === null ? [] : state.config.generateOptions(next, state.pool);

    dispatch({ type: 'NEXT', next, options });
  };

  return {
    round: state.round,
    score: state.score,
    current: state.current,
    options: state.options,
    selectedId: state.selectedId,
    correctId: state.correctId,
    answered: state.answered,
    isCorrect: state.isCorrect,
    isFinished: state.isFinished,
    pool: state.pool,
    handleAnswer,
    handleTimeout,
    nextRound,
  };
}
