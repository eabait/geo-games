import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Flag } from '../types';

import { OptionButton } from './OptionButton';

const flag = (name: string): Flag => ({
  name,
  code: '🏴',
  continent: 'Europe',
  hint: '',
  tier: 1,
  pos: [0, 0],
});

const currentFlag = flag('France');
const wrongFlag = flag('Germany');

interface RenderOptionButtonProps {
  option: Flag;
  selected: Flag | null;
  isLoser: boolean;
  index?: number;
}

function renderOptionButton({
  option,
  selected,
  isLoser,
  index = 0,
}: RenderOptionButtonProps): HTMLElement {
  render(
    <OptionButton
      currentFlag={currentFlag}
      index={index}
      isLoser={isLoser}
      onAnswer={vi.fn()}
      opt={option}
      selected={selected}
    />,
  );

  return screen.getByRole('button', { name: new RegExp(option.name, 'i') });
}

describe('OptionButton revealed state', () => {
  it('sets data-state to revealed when player is loser and option is correct answer', () => {
    const button = renderOptionButton({
      option: currentFlag,
      selected: wrongFlag,
      isLoser: true,
    });

    expect(button).toHaveAttribute('data-state', 'revealed');
  });

  it('sets data-state to correct when player is winner and option is correct answer', () => {
    const button = renderOptionButton({
      option: currentFlag,
      selected: currentFlag,
      isLoser: false,
    });

    expect(button).toHaveAttribute('data-state', 'correct');
  });

  it('shows a cross badge for revealed option', () => {
    renderOptionButton({
      option: currentFlag,
      selected: wrongFlag,
      isLoser: true,
    });

    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it.each([true, false])(
    'sets data-state to wrong for wrong option when isLoser is %s',
    (isLoser) => {
      const button = renderOptionButton({
        option: wrongFlag,
        selected: wrongFlag,
        isLoser,
      });

      expect(button).toHaveAttribute('data-state', 'wrong');
    },
  );

  it('sets data-state to default before any selection', () => {
    const button = renderOptionButton({
      option: currentFlag,
      selected: null,
      isLoser: true,
    });

    expect(button).toHaveAttribute('data-state', 'default');
  });
});
