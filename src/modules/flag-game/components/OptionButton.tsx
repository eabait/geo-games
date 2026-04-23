import React from 'react';

import {
  OPTION_ANIM_BASE_DELAY,
  OPTION_ANIM_STEP_DELAY,
  OPTION_FADE_OPACITY,
  CHAR_CODE_A,
} from '../data/constants';
import type { Flag } from '../types';

import styles from './OptionButton.module.css';

interface OptionButtonProps {
  opt: Flag;
  index: number;
  selected: Flag | null;
  currentFlag: Flag;
  onAnswer: (opt: Flag) => void;
}

export function OptionButton({
  opt,
  index,
  selected,
  currentFlag,
  onAnswer,
}: OptionButtonProps): React.JSX.Element {
  const isCorrect = opt.name === currentFlag.name;
  const isSel = selected?.name === opt.name;
  const stateClassName = selected
    ? isCorrect
      ? styles.correct
      : isSel
        ? styles.wrong
        : styles.dimmed
    : '';
  const buttonClassName = ['btn', styles.button, stateClassName].filter(Boolean).join(' ');
  const badgeClassName = [
    styles.badge,
    selected && isCorrect ? styles.badgeCorrect : '',
    selected && isSel && !isCorrect ? styles.badgeWrong : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClassName}
      data-state={selected ? (isCorrect ? 'correct' : isSel ? 'wrong' : 'dimmed') : 'default'}
      onClick={() => onAnswer(opt)}
      disabled={selected !== null}
      style={
        {
          '--item-delay': `${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s`,
          '--option-fade-opacity': OPTION_FADE_OPACITY,
        } as React.CSSProperties
      }
      type="button"
    >
      <span className={badgeClassName}>
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
