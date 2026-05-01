import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './MenuScreen.module.css';

export function FactsMenuScreen(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🌍</div>
      <h1 className={styles.title}>¿Cuánto sabés del mundo?</h1>
      <p className={styles.subtitle}>Tradiciones y culturas</p>
      <div className={styles.actions}>
        <button
          className={['btn', styles.playButton].join(' ')}
          onClick={() => navigate('/cultural-facts/solo')}
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
