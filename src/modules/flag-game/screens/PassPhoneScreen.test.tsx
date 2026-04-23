import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import { PassPhoneScreen } from './PassPhoneScreen';

describe('PassPhoneScreen', () => {
  beforeEach(() => {
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
});
