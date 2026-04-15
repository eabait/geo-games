import { useMemo } from 'react';

import { WORLD_SHAPES } from '../data/worldShapes';
import type { Flag } from '../types';

interface MobileMapProps {
  options: Flag[];
  correctName: string;
  selected: Flag | null;
  onSelect: (flag: Flag) => void;
}

// WORLD_SHAPES entries are [lng, lat]. Flag.pos is [lat, lng].
// viewBox is 0 0 360 180: longitude → x (offset +180), latitude → y (flipped).
const toX = (lng: number): number => lng + 180;
const toY = (lat: number): number => 90 - lat;

export function MobileMap({
  options,
  correctName,
  selected,
  onSelect,
}: MobileMapProps): JSX.Element {
  const polygonPoints = useMemo(
    () => WORLD_SHAPES.map((poly) => poly.map(([lng, lat]) => `${toX(lng)},${toY(lat)}`).join(' ')),
    [],
  );

  const correctFlag = options.find((f) => f.name === correctName) ?? null;
  const dotX = correctFlag !== null ? toX(correctFlag.pos[1]) : null;
  const dotY = correctFlag !== null ? toY(correctFlag.pos[0]) : null;

  const answered = selected !== null;

  return (
    <div>
      <svg
        viewBox="0 0 360 180"
        style={{ width: '100%', display: 'block', background: 'transparent' }}
        aria-hidden="true"
      >
        {polygonPoints.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#334155"
            strokeWidth="0.5"
            opacity="0.6"
          />
        ))}
        {dotX !== null && dotY !== null && (
          <circle
            cx={dotX}
            cy={dotY}
            r="3"
            fill="#fbbf24"
            style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
          />
        )}
      </svg>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: '0 4px',
        }}
      >
        {options.map((flag) => {
          const isCorrect = flag.name === correctName;
          const isWrongSelection = answered && selected.name === flag.name && !isCorrect;

          let borderColor = 'rgba(255,255,255,0.08)';
          let color = '#cbd5e1';
          let background = 'rgba(30,41,59,0.8)';

          if (answered) {
            if (isCorrect) {
              borderColor = '#22c55e';
              color = '#4ade80';
              background = 'rgba(22,163,74,0.2)';
            } else if (isWrongSelection) {
              borderColor = '#ef4444';
              color = '#f87171';
              background = 'rgba(239,68,68,0.15)';
            }
          }

          return (
            <button
              key={flag.name}
              disabled={answered}
              onClick={() => onSelect(flag)}
              style={{
                border: `1.5px solid ${borderColor}`,
                borderRadius: 10,
                padding: '10px',
                color,
                background,
                fontSize: 13,
                fontWeight: 600,
                cursor: answered ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {flag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
