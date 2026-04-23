import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { DifficultyScreen } from './DifficultyScreen';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderDifficultyScreen(mode: 'solo' | 'explorer'): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <DifficultyScreen mode={mode} />
    </MemoryRouter>,
  );
}

describe('DifficultyScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
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

  it('starts a solo game and navigates to the solo playing route when a difficulty is selected', async () => {
    const user = userEvent.setup();

    renderDifficultyScreen('solo');

    await user.click(screen.getByRole('button', { name: /fácil/i }));

    expect(useGameStore.getState().mode).toBe('solo');
    expect(useGameStore.getState().difficulty).toBe('easy');
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/solo/play');
  });

  it('starts an explorer game and navigates to the explorer playing route when a difficulty is selected', async () => {
    const user = userEvent.setup();

    renderDifficultyScreen('explorer');

    expect(screen.getByRole('heading', { level: 2, name: /explorador/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /medio/i }));

    expect(useGameStore.getState().mode).toBe('explorer');
    expect(useGameStore.getState().difficulty).toBe('medium');
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/explorer/play');
  });

  it('navigates back when the back button is pressed', async () => {
    const user = userEvent.setup();

    renderDifficultyScreen('solo');

    await user.click(screen.getByRole('button', { name: /volver/i }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
