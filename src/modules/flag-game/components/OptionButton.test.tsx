import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FLAGS } from '../data/flags';

import { OptionButton } from './OptionButton';

function renderOptionButton(
  selected: (typeof FLAGS)[number] | null,
  opt: (typeof FLAGS)[number],
): void {
  render(
    <OptionButton
      currentFlag={FLAGS[0]}
      index={0}
      onAnswer={vi.fn()}
      opt={opt}
      selected={selected}
    />,
  );
}

describe('OptionButton default state', () => {
  it('renders the default state and answers when clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const option = FLAGS[1];

    render(
      <OptionButton
        currentFlag={FLAGS[0]}
        index={0}
        onAnswer={onAnswer}
        opt={option}
        selected={null}
      />,
    );

    const button = screen.getByRole('button', { name: new RegExp(option.name, 'i') });

    await user.click(button);

    expect(button).toHaveAttribute('data-state', 'default');
    expect(button).toBeEnabled();
    expect(onAnswer).toHaveBeenCalledWith(option);
  });
});

describe('OptionButton answered state', () => {
  it('marks the correct option after an answer is selected', () => {
    renderOptionButton(FLAGS[0], FLAGS[0]);

    const button = screen.getByRole('button', { name: new RegExp(FLAGS[0].name, 'i') });

    expect(button).toHaveAttribute('data-state', 'correct');
    expect(button).toBeDisabled();
  });

  it('marks the chosen wrong option with a cross badge', () => {
    renderOptionButton(FLAGS[1], FLAGS[1]);

    const button = screen.getByRole('button', { name: new RegExp(FLAGS[1].name, 'i') });

    expect(button).toHaveAttribute('data-state', 'wrong');
    expect(button).toBeDisabled();
  });

  it('dims the non-selected wrong options once an answer was chosen', () => {
    renderOptionButton(FLAGS[1], FLAGS[2]);

    const button = screen.getByRole('button', { name: new RegExp(FLAGS[2].name, 'i') });

    expect(button).toHaveAttribute('data-state', 'dimmed');
    expect(button).toBeDisabled();
  });
});
