import React from 'react';
import { useMemo } from 'react';

import { WORLD_SHAPES } from '../data/worldShapes';
import type { Flag } from '../types';

import styles from './MobileMap.module.css';

interface MobileMapProps {
  options: Flag[];
  correctName: string;
  selected: Flag | null;
  onSelect: (flag: Flag) => void;
}

// WORLD_SHAPES entries are [lng, lat]. Flag.pos is [lat, lng].
// viewBox is 0 0 360 180: longitude → x (offset +180), latitude → y (flipped).
const MAP_LNG_OFFSET = 180;
const MAP_LAT_OFFSET = 90;

const toX = (lng: number): number => lng + MAP_LNG_OFFSET;
const toY = (lat: number): number => MAP_LAT_OFFSET - lat;

export function MobileMap({
  options,
  correctName,
  selected,
  onSelect,
}: MobileMapProps): React.JSX.Element {
  const polygonPoints = useMemo(
    () => WORLD_SHAPES.map((poly) => poly.map(([lng, lat]) => `${toX(lng)},${toY(lat)}`).join(' ')),
    [],
  );

  const correctFlag = options.find((flag) => flag.name === correctName) ?? null;
  const dotX = correctFlag !== null ? toX(correctFlag.pos[1]) : null;
  const dotY = correctFlag !== null ? toY(correctFlag.pos[0]) : null;

  const answered = selected !== null;

  return (
    <div className={styles.root}>
      <svg viewBox="0 0 360 180" className={styles.map} aria-hidden="true">
        {polygonPoints.map((points, i) => (
          <polygon key={i} points={points} className={styles.polygon} />
        ))}
        {dotX !== null && dotY !== null && (
          <circle cx={dotX} cy={dotY} r="3" className={styles.dot} />
        )}
      </svg>

      <div className={styles.optionsGrid}>
        {options.map((flag) => {
          const isCorrect = flag.name === correctName;
          const isWrongSelection = answered && selected.name === flag.name && !isCorrect;
          const stateClassName = answered
            ? isCorrect
              ? styles.correct
              : isWrongSelection
                ? styles.wrong
                : ''
            : '';
          const className = [styles.optionButton, stateClassName].filter(Boolean).join(' ');

          return (
            <button
              key={flag.name}
              className={className}
              data-state={
                answered
                  ? isCorrect
                    ? 'correct'
                    : isWrongSelection
                      ? 'wrong'
                      : 'default'
                  : 'default'
              }
              disabled={answered}
              onClick={() => onSelect(flag)}
              type="button"
            >
              {flag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
