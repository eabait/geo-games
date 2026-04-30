import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './CapitalResultsScreen.module.css';

import { useProfileStore } from '@/shared/store/profileStore';

const GOLD_TROPHY_SCORE = 200;
const STAR_TROPHY_SCORE = 100;

function getStoredScore(): number {
  return Number.parseInt(sessionStorage.getItem('capital-final-score') ?? '0', 10);
}

function getTrophy(score: number): string {
  if (score >= GOLD_TROPHY_SCORE) return '🏆';
  if (score >= STAR_TROPHY_SCORE) return '🌟';
  return '🏛️';
}

export function CapitalResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const recordScore = useProfileStore((state) => state.recordScore);
  const score = getStoredScore();

  React.useEffect(() => {
    recordScore('capital-cities', score);
  }, [recordScore, score]);

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>{getTrophy(score)}</div>
      <h2 className={styles.score}>{score} pts</h2>
      <div className={styles.actions}>
        <button
          className={['btn', styles.primary].join(' ')}
          onClick={() => navigate('/capital-cities/solo')}
          type="button"
        >
          🔄 De nuevo
        </button>
        <button
          className={['btn', styles.secondary].join(' ')}
          onClick={() => navigate('/')}
          type="button"
        >
          🏠 Inicio
        </button>
      </div>
    </div>
  );
}
