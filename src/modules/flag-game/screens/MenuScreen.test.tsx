import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { MenuScreen } from './MenuScreen';

// Mock stores
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    soundOn: true,
    continent: 'Todos',
    toggleSound: vi.fn(),
    setContinent: vi.fn(),
  })),
}));

function renderMenu(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <MenuScreen />
    </MemoryRouter>,
  );
}

describe('MenuScreen', () => {
  it('renders the game title', () => {
    renderMenu();
    expect(screen.getByText(/qué bandera es/i)).toBeInTheDocument();
  });

  it('renders all three game mode buttons', () => {
    renderMenu();
    expect(screen.getByText(/jugar solo/i)).toBeInTheDocument();
    expect(screen.getByText(/explorador/i)).toBeInTheDocument();
    expect(screen.getByText(/familiar/i)).toBeInTheDocument();
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
