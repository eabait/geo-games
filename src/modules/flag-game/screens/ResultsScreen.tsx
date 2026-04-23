import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import {
  SOLO_R,
  TROPHY_GOLD_SCORE,
  TROPHY_SILVER_SCORE,
  RESULT_ROW_ANIM_BASE,
  RESULT_ROW_ANIM_STEP,
} from '../data/constants';

import styles from './ResultsScreen.module.css';

export function ResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { score, roundHistory, bestStreak, difficulty, startSolo } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startSolo(difficulty);
      navigate('/flag-game/solo/play');
    }
  }

  const trophy = score > TROPHY_GOLD_SCORE ? '🏆' : score > TROPHY_SILVER_SCORE ? '🌟' : '🌍';

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>{trophy}</div>
      <h2 className={styles.title}>{score} pts</h2>
      <p className={styles.summary}>
        {roundHistory.filter((result) => result.correct).length}/{SOLO_R} · 🔥{bestStreak}
      </p>
      {roundHistory.length > 0 && (
        <div className={styles.historyCard}>
          {roundHistory.map((result, i) => (
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
