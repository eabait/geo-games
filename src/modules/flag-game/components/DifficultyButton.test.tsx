import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DifficultyButton } from './DifficultyButton';

describe('DifficultyButton', () => {
  it('renders the emoji', () => {
    render(
      <DifficultyButton
        emoji="😊"
        label="Fácil"
        description="3 opciones · 20s"
        delay={0.1}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(
      <DifficultyButton
        emoji="😊"
        label="Fácil"
        description="3 opciones · 20s"
        delay={0.1}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Fácil')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(
      <DifficultyButton
        emoji="😊"
        label="Fácil"
        description="3 opciones · 20s"
        delay={0.1}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('3 opciones · 20s')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(
      <DifficultyButton
        emoji="😊"
        label="Fácil"
        description="3 opciones · 20s"
        delay={0.1}
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
