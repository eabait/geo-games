import React from 'react';

interface ConfettiProps {
  active: boolean;
}

const COLS = ['#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316'];

const CONFETTI_COUNT = 35;
const CONFETTI_MIN_SIZE = 6;
const CONFETTI_SIZE_RANGE = 8;
const CONFETTI_HEIGHT_RATIO = 0.6;
const CONFETTI_BORDER_RADIUS = 2;
const CONFETTI_MIN_DURATION = 1.2;
const CONFETTI_DELAY_RANGE = 0.5;
const CONFETTI_SPREAD_PCT = 100;

export function Confetti({ active }: ConfettiProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '40%',
            left: `${Math.random() * CONFETTI_SPREAD_PCT}%`,
            width: CONFETTI_MIN_SIZE + Math.random() * CONFETTI_SIZE_RANGE,
            height:
              (CONFETTI_MIN_SIZE + Math.random() * CONFETTI_SIZE_RANGE) * CONFETTI_HEIGHT_RATIO,
            background: COLS[i % COLS.length],
            borderRadius: CONFETTI_BORDER_RADIUS,
            animation: `confettiFall ${CONFETTI_MIN_DURATION + Math.random()}s ease-out ${Math.random() * CONFETTI_DELAY_RANGE}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
