import { useNavigate } from 'react-router-dom';

import { generateCapitalOptions, getCapitalItems } from '../data/capitals';
import type { CapitalItem, DifficultyKey } from '../types';

import { useQuizSession } from '@/shared/quiz-engine/useQuizSession';
import { useQuizTimer } from '@/shared/quiz-engine/useQuizTimer';

const RESULT_DELAY_MS = 1600;
const ROUND_COUNT = 10;

const SECONDS_PER_ROUND: Record<DifficultyKey, number> = {
  easy: 20,
  medium: 15,
  hard: 10,
};

const POINTS_PER_CORRECT: Record<DifficultyKey, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

interface CapitalQuizResult extends ReturnType<typeof useQuizSession<CapitalItem>> {
  timeLeft: number;
  handleAnswer: (id: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export function useCapitalQuiz(difficulty: DifficultyKey): CapitalQuizResult {
  const navigate = useNavigate();
  const session = useQuizSession<CapitalItem>({
    items: getCapitalItems(difficulty),
    toId: (item) => item.id,
    generateOptions: generateCapitalOptions,
    roundCount: ROUND_COUNT,
    pointsPerCorrect: POINTS_PER_CORRECT[difficulty],
  });
  const seconds = SECONDS_PER_ROUND[difficulty];

  const timeLeft = useQuizTimer({
    seconds,
    resetKey: session.current?.id,
    paused: session.answered,
    onTimeout: session.handleTimeout,
  });

  function handleAnswerAndAdvance(id: string): void {
    session.handleAnswer(id);

    window.setTimeout(() => {
      const nextRound = session.round + 1;

      if (nextRound >= ROUND_COUNT) {
        const finalScore =
          session.score + (id === session.correctId ? POINTS_PER_CORRECT[difficulty] : 0);
        sessionStorage.setItem('capital-final-score', String(finalScore));
        navigate('/capital-cities/solo/results');
        return;
      }

      session.nextRound();
    }, RESULT_DELAY_MS);
  }

  return {
    ...session,
    timeLeft,
    handleAnswer: handleAnswerAndAdvance,
    navigate,
  };
}
