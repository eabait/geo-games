import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { RESULT_ROW_ANIM_BASE, RESULT_ROW_ANIM_STEP } from '../data/constants';

import styles from './ExplorerResultsScreen.module.css';

export function ExplorerResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const {
    explorerScore,
    explorerCorrect,
    explorerBestStreak,
    explorerHistory,
    difficulty,
    startExplorer,
  } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startExplorer(difficulty);
      navigate('/flag-game/explorer/play');
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.icon}>🗺️</div>
      <h2 className={styles.title}>¡Tiempo!</h2>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={[styles.statValue, styles.scoreValue].join(' ')}>{explorerScore}</div>
          <div className={styles.statLabel}>pts</div>
        </div>
        <div className={styles.stat}>
          <div className={[styles.statValue, styles.correctValue].join(' ')}>{explorerCorrect}</div>
          <div className={styles.statLabel}>ok</div>
        </div>
        <div className={styles.stat}>
          <div className={[styles.statValue, styles.streakValue].join(' ')}>
            {explorerBestStreak}
          </div>
          <div className={styles.statLabel}>🔥</div>
        </div>
      </div>
      {explorerHistory.length > 0 && (
        <div className={styles.historyCard}>
          {explorerHistory.map((result, i) => (
            <div
              className={styles.resultRow}
              key={i}
              style={
                {
                  '--row-delay': `${RESULT_ROW_ANIM_BASE + i * RESULT_ROW_ANIM_STEP}s`,
                } as React.CSSProperties
              }
            >
              <span className={styles.flag}>{result.flag.code}</span>
              <span className={styles.resultName}>{result.flag.name}</span>
              <span>{result.correct ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.actions}>
        <button
          className={['btn', styles.primaryButton].join(' ')}
          onClick={handleRestart}
          type="button"
        >
          🔄 De nuevo
        </button>
        <button
          className={['btn', styles.secondaryButton].join(' ')}
          onClick={() => navigate('/flag-game')}
          type="button"
        >
          🏠 Menú
        </button>
      </div>
    </div>
  );
}
