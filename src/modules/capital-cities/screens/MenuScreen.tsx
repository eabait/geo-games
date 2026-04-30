import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './MenuScreen.module.css';

export function CapitalMenuScreen(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🏛️</div>
      <h1 className={styles.title}>¿Cuál es la capital?</h1>
      <p className={styles.subtitle}>Capitales del mundo</p>
      <div className={styles.actions}>
        <button
          className={['btn', styles.playButton].join(' ')}
          onClick={() => navigate('/capital-cities/solo')}
          type="button"
        >
          🎮 Jugar solo
        </button>
        <button className={styles.backButton} onClick={() => navigate('/')} type="button">
          ← Inicio
        </button>
      </div>
    </div>
  );
}
