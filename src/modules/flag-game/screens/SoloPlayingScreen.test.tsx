import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { FLAGS } from '../data/flags';

import { SoloPlayingScreen } from './SoloPlayingScreen';

vi.mock('../hooks/useSoundEngine', () => ({
  useSoundEngine: () => ({ current: {} }),
}));

beforeEach(() => {
  useGameStore.getState().reset();
  useGameStore.getState().startSolo('easy');
  useGameStore.getState().setRoundData(FLAGS[0], FLAGS.slice(0, 2));
});

describe('SoloPlayingScreen', () => {
  it('renders the current flag emoji', () => {
    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );
    expect(screen.getByText(FLAGS[0].code)).toBeInTheDocument();
  });

  it('renders one button per option', () => {
    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('button').filter((b) => !b.closest('nav'))).toHaveLength(2);
  });
});
