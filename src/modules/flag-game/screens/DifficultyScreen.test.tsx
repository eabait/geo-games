import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { DifficultyScreen } from './DifficultyScreen';

function renderDifficultyScreen(mode: 'solo' | 'explorer'): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <DifficultyScreen mode={mode} />
    </MemoryRouter>,
  );
}

describe('DifficultyScreen', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('uses class-based styling for the solo difficulty shell and actions', () => {
    renderDifficultyScreen('solo');

    const heading = screen.getByRole('heading', { level: 2, name: /jugar solo/i });
    const backButton = screen.getByRole('button', { name: /volver/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
    expect(backButton).not.toHaveAttribute('style');
    expect(backButton.className).toBeTruthy();
  });
});
