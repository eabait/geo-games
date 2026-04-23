import React from 'react';
import { useMemo } from 'react';

import styles from '@/shared/components/BackgroundStars.module.css';

const STAR_COUNT = 80;
const MAX_PERCENT = 100;
const MIN_STAR_SIZE = 1;
const STAR_SIZE_RANGE = 2;
const MIN_DURATION_SECONDS = 3;
const DURATION_RANGE_SECONDS = 4;
const DELAY_RANGE_SECONDS = 4;

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
}

export function BackgroundStars(): React.JSX.Element {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${Math.random() * MAX_PERCENT}%`,
        left: `${Math.random() * MAX_PERCENT}%`,
        size: MIN_STAR_SIZE + Math.random() * STAR_SIZE_RANGE,
        duration: `${MIN_DURATION_SECONDS + Math.random() * DURATION_RANGE_SECONDS}s`,
        delay: `${Math.random() * DELAY_RANGE_SECONDS}s`,
      })),
    [],
  );

  return (
    <div className={styles.stars}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={styles.star}
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--star-duration': star.duration,
              '--star-delay': star.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
