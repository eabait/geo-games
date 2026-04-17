import React from 'react';
import { useMemo } from 'react';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.8)',
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
