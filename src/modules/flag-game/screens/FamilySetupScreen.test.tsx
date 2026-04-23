import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { FamilySetupScreen } from './FamilySetupScreen';

describe('FamilySetupScreen', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('uses class-based styling for the setup shell and controls', () => {
    render(
      <MemoryRouter>
        <FamilySetupScreen />
      </MemoryRouter>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: /desafío familiar/i });
    const startButton = screen.getByRole('button', { name: /jugar/i });
    const addPlayerButton = screen.getByRole('button', { name: /agregar jugador/i });
    const backButton = screen.getByRole('button', { name: /volver/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
    expect(startButton).not.toHaveAttribute('style');
    expect(startButton.className).toBeTruthy();
    expect(addPlayerButton).not.toHaveAttribute('style');
    expect(addPlayerButton.className).toBeTruthy();
    expect(backButton).not.toHaveAttribute('style');
    expect(backButton.className).toBeTruthy();
  });
});
