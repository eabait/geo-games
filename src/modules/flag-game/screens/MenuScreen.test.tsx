import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { MenuScreen } from './MenuScreen';

const navigateMock = vi.fn();

// Mock stores
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    soundOn: true,
    continent: 'Todos',
    toggleSound: vi.fn(),
    setContinent: vi.fn(),
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderMenu(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <MenuScreen />
    </MemoryRouter>,
  );
}

describe('MenuScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('renders the game title', () => {
    renderMenu();
    expect(screen.getByText(/qué bandera es/i)).toBeInTheDocument();
  });

  it('renders all four game mode buttons', () => {
    renderMenu();
    expect(screen.getByText(/jugar solo/i)).toBeInTheDocument();
    expect(screen.getByText(/explorador/i)).toBeInTheDocument();
    expect(screen.getByText(/desafío familiar/i)).toBeInTheDocument();
    expect(screen.getByText(/duelo 1v1/i)).toBeInTheDocument();
  });

  it('navigates to the duel setup screen when the duel menu card is clicked', async () => {
    const user = userEvent.setup();

    renderMenu();

    await user.click(screen.getByRole('button', { name: /duelo 1v1/i }));

    expect(navigateMock).toHaveBeenCalledWith('/flag-game/duel');
  });

  it('uses class-based styling for the static screen shell', () => {
    renderMenu();

    const heading = screen.getByRole('heading', { level: 1, name: /qué bandera es/i });
    const screenShell = heading.parentElement;

    expect(screenShell).not.toBeNull();
    expect(screenShell).not.toHaveAttribute('style');
    expect(screenShell?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
  });
});
