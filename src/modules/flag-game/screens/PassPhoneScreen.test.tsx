import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { PassPhoneScreen } from './PassPhoneScreen';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('PassPhoneScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useGameStore.getState().reset();
    useGameStore.getState().startFamily('easy', [
      { id: 'player-0', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
      { id: 'player-1', name: 'Luis', color: '#3b82f6', avatar: '🐯' },
    ]);
  });

  it('uses class-based styling for the pass-phone shell and CTA', () => {
    render(
      <MemoryRouter>
        <PassPhoneScreen />
      </MemoryRouter>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: /pasá el teléfono/i });
    const ctaButton = screen.getByRole('button', { name: /listo, soy ana/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
    expect(ctaButton).not.toHaveAttribute('style');
    expect(ctaButton.className).toBeTruthy();
  });

  it('renders nothing when there is no current player to hand the phone to', () => {
    useGameStore.getState().reset();

    const { container } = render(
      <MemoryRouter>
        <PassPhoneScreen />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('navigates to the family playing screen when the current player confirms the handoff', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PassPhoneScreen />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /listo, soy ana/i }));

    expect(navigateMock).toHaveBeenCalledWith('/flag-game/family/play');
  });
});
