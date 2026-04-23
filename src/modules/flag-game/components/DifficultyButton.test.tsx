import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DifficultyButton } from './DifficultyButton';

const defaultProps = {
  emoji: '😊',
  label: 'Fácil',
  description: '3 opciones · 20s',
  delay: 0.1,
};

function renderDifficultyButton(overrides: Partial<typeof defaultProps> = {}): {
  onClick: ReturnType<typeof vi.fn>;
} {
  const onClick = vi.fn();

  render(<DifficultyButton {...defaultProps} {...overrides} onClick={onClick} />);

  return { onClick };
}

describe('DifficultyButton', () => {
  it('renders the emoji', () => {
    renderDifficultyButton();
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('renders the label', () => {
    renderDifficultyButton();
    expect(screen.getByText('Fácil')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderDifficultyButton();
    expect(screen.getByText('3 opciones · 20s')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const { onClick } = renderDifficultyButton();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('passes the animation delay through a CSS custom property', () => {
    renderDifficultyButton();
    expect(screen.getByRole('button')).toHaveStyle({ '--item-delay': '0.1s' });
  });
});
