import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FLAGS } from '../../data/flags';
import { EXPLORER_STREAK_THRESHOLD } from '../../data/constants';

import { ExplorerPlayingLayout } from './ExplorerPlayingLayout';

const styles = {
  screen: 'screen',
  header: 'header',
  headerLeft: 'headerLeft',
  homeButton: 'homeButton',
  streakBadge: 'streakBadge',
  correctCount: 'correctCount',
  timerPill: 'timerPill',
  timerIcon: 'timerIcon',
  timerValue: 'timerValue',
  timerCritical: 'timerCritical',
  flagPrompt: 'flagPrompt',
  flagEmoji: 'flagEmoji',
  promptTitle: 'promptTitle',
  promptContinent: 'promptContinent',
  hintNav: 'hintNav',
  hintButton: 'hintButton',
  hintText: 'hintText',
  mapWrap: 'mapWrap',
  feedbackPanel: 'feedbackPanel',
  feedbackCorrect: 'feedbackCorrect',
  feedbackWrong: 'feedbackWrong',
  statsCard: 'statsCard',
  statsItem: 'statsItem',
  statsLabel: 'statsLabel',
  statsValue: 'statsValue',
  statsValueScore: 'statsValueScore',
  statsValueCorrect: 'statsValueCorrect',
  statsValueStreak: 'statsValueStreak',
};

function renderExplorerPlayingLayout(
  overrides: Partial<React.ComponentProps<typeof ExplorerPlayingLayout>> = {},
): ReturnType<typeof render> {
  return render(
    <ExplorerPlayingLayout
      currentFlag={FLAGS[0]}
      explorerBestStreak={1}
      explorerCorrect={2}
      explorerScore={40}
      explorerStreak={1}
      explorerTime={12}
      explorerTotal={3}
      feedbackText={null}
      onAnswer={vi.fn()}
      onGoHome={vi.fn()}
      onRevealHint={vi.fn()}
      options={[FLAGS[0], FLAGS[1], FLAGS[2]]}
      selected={null}
      showHint={false}
      styles={styles}
      timerColor="#fbbf24"
      timerCritical={false}
      {...overrides}
    />,
  );
}

describe('ExplorerPlayingLayout idle state', () => {
  it('renders the idle explorer state with hint and home actions', async () => {
    const user = userEvent.setup();
    const onGoHome = vi.fn();
    const onRevealHint = vi.fn();

    renderExplorerPlayingLayout({ onGoHome, onRevealHint });

    await user.click(screen.getByRole('button', { name: '🏠' }));
    await user.click(screen.getByRole('button', { name: /pista/i }));

    expect(onGoHome).toHaveBeenCalledOnce();
    expect(onRevealHint).toHaveBeenCalledOnce();
    expect(screen.queryByText(/🔥x/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/correcto/i)).not.toBeInTheDocument();
  });
});
describe('ExplorerPlayingLayout answered state', () => {
  it('renders the streak, hint and correct feedback states', () => {
    renderExplorerPlayingLayout({
      explorerBestStreak: 5,
      explorerCorrect: 7,
      explorerScore: 140,
      explorerStreak: EXPLORER_STREAK_THRESHOLD,
      explorerTime: 4,
      explorerTotal: 8,
      feedbackText: '🎉 ¡Correcto! +3s',
      selected: FLAGS[0],
      showHint: true,
      timerColor: '#ef4444',
      timerCritical: true,
    });

    expect(screen.getByText(/🔥x2/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(FLAGS[0].hint, 'i'))).toBeInTheDocument();
    expect(screen.getByText('🎉 ¡Correcto! +3s')).toHaveClass('feedbackPanel', 'feedbackCorrect');
    expect(screen.getByText('4s')).toHaveClass('timerValue', 'timerCritical');
  });

  it('renders the wrong-answer feedback without a hint button once an option is selected', () => {
    renderExplorerPlayingLayout({
      explorerBestStreak: 0,
      explorerCorrect: 0,
      explorerScore: 0,
      explorerStreak: 0,
      explorerTime: 9,
      explorerTotal: 1,
      feedbackText: '❌ Argentina',
      selected: FLAGS[1],
      timerColor: '#eab308',
    });

    expect(screen.queryByRole('button', { name: /pista/i })).not.toBeInTheDocument();
    expect(screen.getByText('❌ Argentina')).toHaveClass('feedbackPanel', 'feedbackWrong');
  });
});
