import React from 'react';

import styles from './Sparkles.module.css';

interface SparklesProps {
  active: boolean;
}

const SPARKLE_COUNT = 20;
const SPARKLE_AREA_OFFSET = 10;
const SPARKLE_AREA_RANGE = 80;
const SPARKLE_MIN_SIZE = 4;
const SPARKLE_SIZE_RANGE = 6;
const SPARKLE_MIN_DURATION = 0.4;
const SPARKLE_DURATION_RANGE = 0.6;
const SPARKLE_DELAY_RANGE = 0.4;

export function Sparkles({ active }: SparklesProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div className={styles.overlay}>
      {Array.from({ length: SPARKLE_COUNT }, (_, i) => (
        <div
          className={styles.sparkle}
          key={i}
          style={
            {
              '--angle': `${Math.random() * 360}deg`,
              '--sparkle-size': `${SPARKLE_MIN_SIZE + Math.random() * SPARKLE_SIZE_RANGE}px`,
              '--sparkle-duration': `${SPARKLE_MIN_DURATION + Math.random() * SPARKLE_DURATION_RANGE}s`,
              '--sparkle-delay': `${Math.random() * SPARKLE_DELAY_RANGE}s`,
              top: `${Math.random() * SPARKLE_AREA_RANGE + SPARKLE_AREA_OFFSET}%`,
              left: `${Math.random() * SPARKLE_AREA_RANGE + SPARKLE_AREA_OFFSET}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
