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
});
