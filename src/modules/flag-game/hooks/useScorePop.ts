import { useEffect, useState } from 'react';

import { SCORE_POP_DURATION_MS } from '../data/constants';

export function useScorePop(score: number): boolean {
  const [scorePop, setScorePop] = useState(false);

  useEffect(() => {
    if (score <= 0) return;

    setScorePop(true);
    const timer = setTimeout(() => setScorePop(false), SCORE_POP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [score]);

  return scorePop;
}
