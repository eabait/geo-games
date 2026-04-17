import React from 'react';

import {
  OPTION_ANIM_BASE_DELAY,
  OPTION_ANIM_STEP_DELAY,
  OPTION_FADE_OPACITY,
  CHAR_CODE_A,
} from '../data/constants';
import type { Flag } from '../types';

interface OptionButtonProps {
  opt: Flag;
  index: number;
  selected: Flag | null;
  currentFlag: Flag;
  onAnswer: (opt: Flag) => void;
}

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function OptionButton({
  opt,
  index,
  selected,
  currentFlag,
  onAnswer,
}: OptionButtonProps): React.JSX.Element {
  const isCorrect = opt.name === currentFlag.name;
  const isSel = selected?.name === opt.name;
  const bg = selected
    ? isCorrect
      ? 'rgba(34,197,94,.18)'
      : isSel
        ? 'rgba(239,68,68,.18)'
        : 'rgba(255,255,255,.06)'
    : 'rgba(255,255,255,.06)';
  const bc = selected
    ? isCorrect
      ? '#22c55e'
      : isSel
        ? '#ef4444'
        : 'rgba(255,255,255,.1)'
    : 'rgba(255,255,255,.1)';

  return (
    <button
      className="btn"
      onClick={() => onAnswer(opt)}
      disabled={selected !== null}
      style={{
        ...CARD,
        background: bg,
        border: `1.5px solid ${bc}`,
        padding: '14px 20px',
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "'Nunito', sans-serif",
        cursor: selected ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: `optionEnter .4s ease ${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s both`,
        opacity: selected && !isCorrect && !isSel ? OPTION_FADE_OPACITY : 1,
        transition: 'opacity .4s',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background:
            selected && isCorrect
              ? '#22c55e'
              : selected && isSel
                ? '#ef4444'
                : 'rgba(255,255,255,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          color: '#fff',
          transition: 'all .3s',
          transform: selected && (isCorrect || isSel) ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        {selected && isCorrect
          ? '✓'
          : selected && isSel && !isCorrect
            ? '✗'
            : String.fromCharCode(CHAR_CODE_A + index)}
      </span>
      {opt.name}
    </button>
  );
}
