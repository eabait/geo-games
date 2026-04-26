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
  isLoser: boolean;
}

type OptionButtonInputProps = Omit<OptionButtonProps, 'isLoser'> & {
  isLoser?: boolean;
};

type OptionState = 'correct' | 'wrong' | 'revealed' | 'dimmed' | 'default';

function getOptionState(
  selected: Flag | null,
  option: Flag,
  currentFlag: Flag,
  isLoser: boolean,
): OptionState {
  if (!selected) return 'default';
  if (option.name === currentFlag.name) return isLoser ? 'revealed' : 'correct';
  return selected.name === option.name ? 'wrong' : 'dimmed';
}

function getStateClassName(state: OptionState): string {
  switch (state) {
    case 'correct':
      return styles.correct;
    case 'wrong':
      return styles.wrong;
    case 'revealed':
      return styles.revealed;
    case 'dimmed':
      return styles.dimmed;
    default:
      return '';
  }
}

function getBadgeLabel(state: OptionState, index: number): string {
  if (state === 'correct') return '✓';
  if (state === 'wrong' || state === 'revealed') return '✗';
  return String.fromCharCode(CHAR_CODE_A + index);
}

export function OptionButton({
  opt,
  index,
  selected,
  currentFlag,
  onAnswer,
  isLoser = false,
}: OptionButtonInputProps): React.JSX.Element {
  const state = getOptionState(selected, opt, currentFlag, isLoser);
  const stateClassName = getStateClassName(state);
  const buttonClassName = ['btn', styles.button, stateClassName].filter(Boolean).join(' ');
  const badgeClassName = [
    styles.badge,
    state === 'correct' ? styles.badgeCorrect : '',
    state === 'wrong' || state === 'revealed' ? styles.badgeWrong : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClassName}
      data-state={state}
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
      <span className={badgeClassName}>{getBadgeLabel(state, index)}</span>
      {opt.name}
    </button>
  );
}
