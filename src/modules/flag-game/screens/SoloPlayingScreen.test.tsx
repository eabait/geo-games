import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { FLAGS } from '../data/flags';
import { useSoloPlayingState } from '../hooks/useSoloPlayingState';

import { SoloPlayingScreen } from './SoloPlayingScreen';

vi.mock('../hooks/useSoloPlayingState', () => ({
  useSoloPlayingState: vi.fn(),
}));

type SoloPlayingStateValue = ReturnType<typeof useSoloPlayingState>;

function buildSoloPlayingState(
  overrides: Partial<SoloPlayingStateValue> = {},
): SoloPlayingStateValue {
  return {
    currentFlag: FLAGS[0],
    feedbackClassName: 'feedbackCorrect',
    feedbackText: null,
    hintLabel: '💡 Pista',
    navigate: vi.fn(),
    onAnswer: vi.fn(),
    onRevealHint: vi.fn(),
    options: FLAGS.slice(0, 2),
    roundLabel: '1/10',
    score: 12,
    scorePop: false,
    selected: null,
    showHint: false,
    showSparkles: false,
    sparklesActive: false,
    sfx: vi.fn(),
    streak: 1,
    timeLeft: 12,
    timerColor: '#22c55e',
    timerPct: 60,
    timerUrgent: false,
    visualEffects: {
      flashCorrect: false,
      showConfetti: false,
      showFloatingEmojis: false,
      showScreenFlash: false,
      showSparkles: false,
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(useSoloPlayingState).mockReturnValue(buildSoloPlayingState());
});

describe('SoloPlayingScreen rendering', () => {
  it('renders a loading state when there is no active flag yet', () => {
    vi.mocked(useSoloPlayingState).mockReturnValue(buildSoloPlayingState({ currentFlag: null }));

    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    expect(screen.queryByText(FLAGS[0].code)).not.toBeInTheDocument();
  });

  it('renders the current flag and one button per option during play', () => {
    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText(FLAGS[0].code)).toBeInTheDocument();
    expect(screen.getAllByRole('button').filter((b) => !b.closest('nav'))).toHaveLength(2);
  });
});

describe('SoloPlayingScreen interactions', () => {
  it('navigates home from the header button and shows the streak badge when the streak is high enough', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    vi.mocked(useSoloPlayingState).mockReturnValue(
      buildSoloPlayingState({
        navigate,
        scorePop: true,
        sparklesActive: true,
        streak: 2,
      }),
    );

    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText('🔥x2')).toBeInTheDocument();
    expect(screen.getByText('12').className).toMatch(/scorePop/);

    await user.click(screen.getByRole('button', { name: /🏠/i }));

    expect(navigate).toHaveBeenCalledWith('/flag-game');
  });

  it('hides the streak badge and score-pop styling below the bonus threshold', () => {
    render(
      <MemoryRouter>
        <SoloPlayingScreen />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/🔥x/i)).not.toBeInTheDocument();
    expect(screen.getByText('12').className).not.toMatch(/scorePop/);
  });
});
