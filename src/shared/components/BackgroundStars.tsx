import React from 'react';
import { useMemo } from 'react';

import styles from '@/shared/components/BackgroundStars.module.css';

const STAR_COUNT = 80;

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
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        duration: `${3 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`,
      })),
    [],
  );

  return (
    <div className={styles.stars}>
      {stars.map((s) => (
        <div
          key={s.id}
          className={styles.star}
          style={
            {
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--star-duration': s.duration,
              '--star-delay': s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
