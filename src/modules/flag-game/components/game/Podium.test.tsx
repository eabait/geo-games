import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { Player } from '../../types';

import { Podium } from './Podium';

const players: Player[] = [
  { id: 'p1', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
  { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
  { id: 'p3', name: 'Cara', color: '#ef4444', avatar: '🦊' },
];
const scores: Record<string, number> = { p1: 100, p2: 70, p3: 40 };

describe('Podium', () => {
  it('renders the winner name', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('renders all three players', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Cara')).toBeInTheDocument();
  });

  it('renders the gold medal for the winner block', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('renders scores for each player', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });
});
