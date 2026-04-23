import React from 'react';

import styles from './Confetti.module.css';

interface ConfettiProps {
  active: boolean;
}

const COLS = ['#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316'];

const CONFETTI_COUNT = 35;
const CONFETTI_MIN_SIZE = 6;
const CONFETTI_SIZE_RANGE = 8;
const CONFETTI_HEIGHT_RATIO = 0.6;
const CONFETTI_MIN_DURATION = 1.2;
const CONFETTI_DELAY_RANGE = 0.5;
const CONFETTI_SPREAD_PCT = 100;
const CONFETTI_DRIFT_CENTER = 0.5;
const CONFETTI_DRIFT_RANGE = 80;

export function Confetti({ active }: ConfettiProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div className={styles.overlay}>
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <div
          className={styles.piece}
          key={i}
          style={
            {
              '--drift': `${(Math.random() - CONFETTI_DRIFT_CENTER) * CONFETTI_DRIFT_RANGE}px`,
              '--piece-width': `${CONFETTI_MIN_SIZE + Math.random() * CONFETTI_SIZE_RANGE}px`,
              '--piece-height': `${(CONFETTI_MIN_SIZE + Math.random() * CONFETTI_SIZE_RANGE) * CONFETTI_HEIGHT_RATIO}px`,
              '--piece-color': COLS[i % COLS.length],
              '--fall-duration': `${CONFETTI_MIN_DURATION + Math.random()}s`,
              '--fall-delay': `${Math.random() * CONFETTI_DELAY_RANGE}s`,
              left: `${Math.random() * CONFETTI_SPREAD_PCT}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
