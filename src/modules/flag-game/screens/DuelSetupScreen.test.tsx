import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { DuelSetupScreen } from './DuelSetupScreen';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderDuelSetupScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <DuelSetupScreen />
    </MemoryRouter>,
  );
}

describe('DuelSetupScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useGameStore.getState().reset();
  });

  it('keeps the start button disabled until both player names are non-empty', async () => {
    const user = userEvent.setup();

    renderDuelSetupScreen();

    const startButton = screen.getByRole('button', { name: /empezar duelo/i });
    const firstPlayerInput = screen.getByPlaceholderText('Jugador 1');
    const secondPlayerInput = screen.getByPlaceholderText('Jugador 2');

    expect(startButton).toBeDisabled();

    await user.type(firstPlayerInput, 'Ana');
    expect(startButton).toBeDisabled();

    await user.type(secondPlayerInput, '   ');
    expect(startButton).toBeDisabled();

    await user.clear(secondPlayerInput);
    await user.type(secondPlayerInput, 'Luis');

    expect(startButton).toBeEnabled();
  });

  it('selects a difficulty and starts the duel flow', async () => {
    const user = userEvent.setup();

    renderDuelSetupScreen();

    await user.click(screen.getByRole('button', { name: /difícil/i }));
    await user.type(screen.getByPlaceholderText('Jugador 1'), 'Ana');
    await user.type(screen.getByPlaceholderText('Jugador 2'), 'Luis');
    await user.click(screen.getByRole('button', { name: /empezar duelo/i }));

    const state = useGameStore.getState();

    expect(state.mode).toBe('duel');
    expect(state.difficulty).toBe('hard');
    expect(state.duelPlayers).toEqual([
      { id: 'player-0', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
      { id: 'player-1', name: 'Luis', color: '#3b82f6', avatar: '🐯' },
    ]);
    expect(state.duelScores).toEqual({
      'player-0': 0,
      'player-1': 0,
    });
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/duel/play');
  });
});
