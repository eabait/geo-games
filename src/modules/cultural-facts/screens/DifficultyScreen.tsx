import React from 'react';
import { useNavigate } from 'react-router-dom';

import type { FactsDifficulty } from '../types';

import styles from './DifficultyScreen.module.css';

function getDifficultyRoute(difficulty: FactsDifficulty): string {
  sessionStorage.setItem('facts-difficulty', difficulty);
  return '/cultural-facts/solo/play';
}

export function FactsDifficultyScreen(): React.JSX.Element {
  const navigate = useNavigate();

  function pick(difficulty: FactsDifficulty): void {
    navigate(getDifficultyRoute(difficulty));
  }

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🌍</div>
      <h2 className={styles.title}>Elegí la dificultad</h2>
      <div className={styles.difficultyList}>
        <button
          className={['btn', styles.difficultyButton].join(' ')}
          onClick={() => pick('easy')}
          type="button"
        >
          😊 Fácil — 20 países
        </button>
        <button
          className={['btn', styles.difficultyButton].join(' ')}
          onClick={() => pick('hard')}
          type="button"
        >
          🧠 Difícil — 40 países
        </button>
      </div>
      <button
        className={styles.backButton}
        onClick={() => navigate('/cultural-facts')}
        type="button"
      >
        ← Volver
      </button>
    </div>
  );
}
