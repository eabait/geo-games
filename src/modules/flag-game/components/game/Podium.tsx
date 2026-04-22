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
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 28 }}>
      {podium.map((player, idx) => (
        <div
          key={player.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: `slideUp .6s ease ${PODIUM_SLIDE_BASE + idx * PODIUM_SLIDE_STEP}s both`,
          }}
        >
          <span style={{ fontSize: 30, marginBottom: 4 }}>{player.avatar}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: player.color, marginBottom: 4 }}>
            {player.name}
          </span>
          <div
            style={{
              width: PODIUM_BLOCK_WIDTH,
              height: HEIGHTS[idx],
              borderRadius: '14px 14px 0 0',
              background: `linear-gradient(180deg,${player.color}44,${player.color}11)`,
              border: `1.5px solid ${player.color}55`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              animation: `podiumRise .6s ease ${PODIUM_RISE_BASE + idx * PODIUM_RISE_STEP}s both`,
              transformOrigin: 'bottom',
            }}
          >
            <span style={{ fontSize: 26 }}>{MEDALS[idx]}</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: player.color,
              }}
            >
              {scores[player.id] ?? 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
