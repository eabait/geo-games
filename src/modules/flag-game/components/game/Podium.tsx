import React from 'react';

import {
  PODIUM_SLIDE_BASE,
  PODIUM_SLIDE_STEP,
  PODIUM_RISE_BASE,
  PODIUM_RISE_STEP,
  PODIUM_HEIGHT_FIRST,
  PODIUM_HEIGHT_SECOND,
  PODIUM_HEIGHT_THIRD,
  PODIUM_BLOCK_WIDTH,
} from '../../data/constants';
import type { Player } from '../../types';

import styles from './Podium.module.css';

interface PodiumProps {
  sorted: Player[];
  scores: Record<string, number>;
}

const MEDALS = ['🥈', '🥇', '🥉'];
const HEIGHTS = [PODIUM_HEIGHT_SECOND, PODIUM_HEIGHT_FIRST, PODIUM_HEIGHT_THIRD];

export function Podium({ sorted, scores }: PodiumProps): React.JSX.Element {
  const [first, second, third] = sorted;
  const podium = [second, first, third].filter(Boolean) as Player[];

  return (
    <div className={styles.root}>
      {podium.map((player, idx) => (
        <div
          className={styles.item}
          key={player.id}
          style={
            {
              '--player-color': player.color,
              '--slide-delay': `${PODIUM_SLIDE_BASE + idx * PODIUM_SLIDE_STEP}s`,
            } as React.CSSProperties
          }
        >
          <span className={styles.avatar}>{player.avatar}</span>
          <span className={styles.name}>{player.name}</span>
          <div
            className={styles.block}
            style={
              {
                '--block-width': `${PODIUM_BLOCK_WIDTH}px`,
                '--block-height': `${HEIGHTS[idx]}px`,
                '--block-background-start': `${player.color}44`,
                '--block-background-end': `${player.color}11`,
                '--block-border-color': `${player.color}55`,
                '--rise-delay': `${PODIUM_RISE_BASE + idx * PODIUM_RISE_STEP}s`,
              } as React.CSSProperties
            }
          >
            <span className={styles.medal}>{MEDALS[idx]}</span>
            <span className={styles.score}>{scores[player.id] ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
