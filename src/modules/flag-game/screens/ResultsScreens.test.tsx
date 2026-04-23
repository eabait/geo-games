import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { FLAGS } from '../data/flags';
import { useGameStore } from '../store/gameStore';

import { ExplorerResultsScreen } from './ExplorerResultsScreen';
import { FamilyResultsScreen } from './FamilyResultsScreen';
import { ResultsScreen } from './ResultsScreen';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderResultsScreen(): void {
  render(
    <MemoryRouter>
      <ResultsScreen />
    </MemoryRouter>,
  );
}

function renderExplorerResultsScreen(): void {
  render(
    <MemoryRouter>
      <ExplorerResultsScreen />
    </MemoryRouter>,
  );
}

function renderFamilyResultsScreen(): void {
  render(
    <MemoryRouter>
      <FamilyResultsScreen />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  navigateMock.mockReset();
  useGameStore.getState().reset();
});

describe('ResultsScreen', () => {
  it('uses class-based styling for the solo results shell and actions', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.setState({
      score: 120,
      bestStreak: 3,
      roundHistory: [
        { flag: FLAGS[0], correct: true },
        { flag: FLAGS[1], correct: false },
      ],
    });

    renderResultsScreen();

    const heading = screen.getByRole('heading', { level: 2, name: /120 pts/i });
    const restartButton = screen.getByRole('button', { name: /de nuevo/i });
    const menuButton = screen.getByRole('button', { name: /menú/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
    expect(restartButton).not.toHaveAttribute('style');
    expect(restartButton.className).toBeTruthy();
    expect(menuButton).not.toHaveAttribute('style');
    expect(menuButton.className).toBeTruthy();
  });
});

describe('ResultsScreen trophies', () => {
  it.each([
    { score: 201, trophy: '🏆' },
    { score: 150, trophy: '🌟' },
    { score: 90, trophy: '🌍' },
  ])('renders $trophy for a $score point solo result', ({ score, trophy }) => {
    useGameStore.getState().startSolo('easy');
    useGameStore.setState({
      score,
      roundHistory: [{ flag: FLAGS[0], correct: true }],
    });

    renderResultsScreen();

    expect(screen.getByText(trophy)).toBeInTheDocument();
  });
});

describe('ResultsScreen restart', () => {
  it('restarts the solo game when a difficulty is available', async () => {
    const user = userEvent.setup();

    useGameStore.getState().startSolo('hard');
    useGameStore.setState({
      score: 210,
      roundHistory: [{ flag: FLAGS[0], correct: true }],
    });

    renderResultsScreen();

    await user.click(screen.getByRole('button', { name: /de nuevo/i }));

    expect(useGameStore.getState().mode).toBe('solo');
    expect(useGameStore.getState().difficulty).toBe('hard');
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/solo/play');
  });

  it('keeps the user on the results screen when there is no saved difficulty to restart', async () => {
    const user = userEvent.setup();

    useGameStore.setState({
      difficulty: null,
      score: 80,
      roundHistory: [{ flag: FLAGS[1], correct: false }],
    });

    renderResultsScreen();

    await user.click(screen.getByRole('button', { name: /de nuevo/i }));

    expect(useGameStore.getState().mode).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

describe('ExplorerResultsScreen', () => {
  it('uses class-based styling for the explorer results shell and actions', () => {
    useGameStore.getState().startExplorer('medium');
    useGameStore.setState({
      explorerScore: 140,
      explorerCorrect: 7,
      explorerBestStreak: 4,
      explorerHistory: [
        { flag: FLAGS[2], correct: true },
        { flag: FLAGS[3], correct: false },
      ],
    });

    renderExplorerResultsScreen();

    const heading = screen.getByRole('heading', { level: 2, name: /tiempo/i });
    const restartButton = screen.getByRole('button', { name: /de nuevo/i });
    const menuButton = screen.getByRole('button', { name: /menú/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading).not.toHaveAttribute('style');
    expect(heading.className).toBeTruthy();
    expect(restartButton).not.toHaveAttribute('style');
    expect(restartButton.className).toBeTruthy();
    expect(menuButton).not.toHaveAttribute('style');
    expect(menuButton.className).toBeTruthy();
  });
});

describe('FamilyResultsScreen', () => {
  it('uses class-based styling for the family results shell and actions', () => {
    const players = [
      { id: 'player-0', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
      { id: 'player-1', name: 'Luis', color: '#3b82f6', avatar: '🐯' },
    ];

    useGameStore.getState().startFamily('hard', players);
    useGameStore.setState({
      familyScores: {
        'player-0': 60,
        'player-1': 40,
      },
      familyHistory: {
        'player-0': [
          { flag: FLAGS[0], correct: true },
          { flag: FLAGS[1], correct: true },
        ],
        'player-1': [{ flag: FLAGS[2], correct: false }],
      },
    });

    renderFamilyResultsScreen();

    const heading = screen.getByRole('heading', { level: 2, name: /ana gana/i });
    const rematchButton = screen.getByRole('button', { name: /revancha/i });
    const menuButton = screen.getByRole('button', { name: /menú/i });

    expect(heading.parentElement).not.toBeNull();
    expect(heading.parentElement).not.toHaveAttribute('style');
    expect(heading.parentElement?.className).toBeTruthy();
    expect(heading.className).toBeTruthy();
    expect(heading).toHaveAttribute('style');
    expect(rematchButton).not.toHaveAttribute('style');
    expect(rematchButton.className).toBeTruthy();
    expect(menuButton).not.toHaveAttribute('style');
    expect(menuButton.className).toBeTruthy();
  });
});
