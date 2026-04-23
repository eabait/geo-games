import React from 'react';

import styles from './FloatingEmojis.module.css';

interface FloatingEmojisProps {
  active: boolean;
}

const EMOJIS = ['🎉', '🏆', '⭐', '🎊', '🌟', '✨'];

const EMOJI_COUNT = 15;
const EMOJI_SPREAD_PCT = 100;
const EMOJI_MIN_FONT = 16;
const EMOJI_FONT_RANGE = 20;
const EMOJI_MIN_DURATION = 2;
const EMOJI_DURATION_RANGE = 2;
const EMOJI_DELAY_RANGE = 2;

export function FloatingEmojis({ active }: FloatingEmojisProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div className={styles.overlay}>
      {Array.from({ length: EMOJI_COUNT }, (_, i) => (
        <div
          className={styles.emoji}
          key={i}
          style={
            {
              '--emoji-size': `${EMOJI_MIN_FONT + Math.random() * EMOJI_FONT_RANGE}px`,
              '--float-duration': `${EMOJI_MIN_DURATION + Math.random() * EMOJI_DURATION_RANGE}s`,
              '--float-delay': `${Math.random() * EMOJI_DELAY_RANGE}s`,
              left: `${Math.random() * EMOJI_SPREAD_PCT}%`,
            } as React.CSSProperties
          }
        >
          {EMOJIS[i % EMOJIS.length]}
        </div>
      ))}
    </div>
  );
}
