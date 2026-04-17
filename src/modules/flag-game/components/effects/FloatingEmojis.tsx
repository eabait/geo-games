import React from 'react';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: EMOJI_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: `${Math.random() * EMOJI_SPREAD_PCT}%`,
            fontSize: EMOJI_MIN_FONT + Math.random() * EMOJI_FONT_RANGE,
            animation: `emojiFloat ${EMOJI_MIN_DURATION + Math.random() * EMOJI_DURATION_RANGE}s ease-out ${Math.random() * EMOJI_DELAY_RANGE}s forwards`,
            opacity: 0,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </div>
      ))}
    </div>
  );
}
