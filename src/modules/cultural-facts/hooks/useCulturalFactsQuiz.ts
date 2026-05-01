import { useNavigate } from 'react-router-dom';

import { generateFactOptions, getFactItems } from '../data/facts';
import type { CulturalFact, FactsDifficulty } from '../types';

import { useQuizSession } from '@/shared/quiz-engine/useQuizSession';
import { useQuizTimer } from '@/shared/quiz-engine/useQuizTimer';

const RESULT_DELAY_MS = 1600;
const ROUND_COUNT = 10;

const POINTS_PER_CORRECT: Record<FactsDifficulty, number> = {
  easy: 10,
  hard: 20,
};

const SECONDS_PER_ROUND: Record<FactsDifficulty, number> = {
  easy: 20,
  hard: 15,
};

interface CulturalFactsQuizResult extends ReturnType<typeof useQuizSession<CulturalFact>> {
  timeLeft: number;
  handleAnswer: (id: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export function useCulturalFactsQuiz(difficulty: FactsDifficulty): CulturalFactsQuizResult {
  const navigate = useNavigate();
  const session = useQuizSession<CulturalFact>({
    items: getFactItems(difficulty),
    toId: (item) => item.id,
    generateOptions: generateFactOptions,
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
        sessionStorage.setItem('facts-final-score', String(finalScore));
        navigate('/cultural-facts/solo/results');
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
