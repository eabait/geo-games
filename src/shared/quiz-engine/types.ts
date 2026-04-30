export interface QuizConfig<T> {
  items: T[];
  toId: (item: T) => string;
  generateOptions: (correct: T, pool: T[]) => T[];
  roundCount?: number;
  pointsPerCorrect?: number;
}

export interface QuizState<T> {
  round: number;
  score: number;
  current: T | null;
  options: T[];
  selectedId: string | null;
  correctId: string | null;
  answered: boolean;
  isCorrect: boolean;
  isFinished: boolean;
}

export interface QuizActions {
  handleAnswer: (id: string) => void;
  handleTimeout: () => void;
  nextRound: () => void;
}
