import React from 'react';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 210,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: SPARKLE_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * SPARKLE_AREA_RANGE + SPARKLE_AREA_OFFSET}%`,
            left: `${Math.random() * SPARKLE_AREA_RANGE + SPARKLE_AREA_OFFSET}%`,
            width: SPARKLE_MIN_SIZE + Math.random() * SPARKLE_SIZE_RANGE,
            height: SPARKLE_MIN_SIZE + Math.random() * SPARKLE_SIZE_RANGE,
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 6px 2px #fbbf24',
            animation: `sparkle ${SPARKLE_MIN_DURATION + Math.random() * SPARKLE_DURATION_RANGE}s ease-out ${Math.random() * SPARKLE_DELAY_RANGE}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
