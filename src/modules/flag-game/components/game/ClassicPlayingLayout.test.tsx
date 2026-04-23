import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FLAGS } from '../../data/flags';

import { ClassicPlayingLayout } from './ClassicPlayingLayout';

const styles = {
  answerSection: 'answerSection',
  continentPill: 'continentPill',
  feedbackCorrect: 'feedbackCorrect',
  feedbackPanel: 'feedbackPanel',
  feedbackWrong: 'feedbackWrong',
  flagCard: 'flagCard',
  flagEmoji: 'flagEmoji',
  header: 'header',
  headerLeft: 'headerLeft',
  headerRight: 'headerRight',
  hintButton: 'hintButton',
  hintNav: 'hintNav',
  hintText: 'hintText',
  screen: 'screen',
  timerFill: 'timerFill',
  timerTrack: 'timerTrack',
  timerUrgent: 'timerUrgent',
};

function renderClassicPlayingLayout(
  overrides: Partial<React.ComponentProps<typeof ClassicPlayingLayout>> = {},
): ReturnType<typeof render> {
  return render(
    <ClassicPlayingLayout
      currentFlag={FLAGS[0]}
      feedbackText={null}
      headerLeft={<span>left</span>}
      headerRight={<span>right</span>}
      hintLabel="💡 Pista"
      onAnswer={vi.fn()}
      onRevealHint={vi.fn()}
      options={[FLAGS[0], FLAGS[1], FLAGS[2]]}
      selected={null}
      showHint={false}
      styles={styles}
      timerColor="#22c55e"
      timerPct={100}
      timerUrgent={false}
      {...overrides}
    />,
  );
}

describe('ClassicPlayingLayout unanswered state', () => {
  it('shows the reveal-hint button while the round is unanswered', async () => {
    const user = userEvent.setup();
    const onRevealHint = vi.fn();

    renderClassicPlayingLayout({ onRevealHint });

    await user.click(screen.getByRole('button', { name: /pista/i }));

    expect(onRevealHint).toHaveBeenCalledOnce();
    expect(screen.queryByText(/💡 verde y amarilla/i)).not.toBeInTheDocument();
  });
});
describe('ClassicPlayingLayout answered state', () => {
  it('renders the hint text and a positive feedback banner after a correct answer', () => {
    const { container } = renderClassicPlayingLayout({
      feedbackText: '🎉 ¡Correcto!',
      selected: FLAGS[0],
      showHint: true,
      timerColor: '#eab308',
      timerPct: 40,
      timerUrgent: true,
    });

    expect(screen.getByText(new RegExp(FLAGS[0].hint, 'i'))).toBeInTheDocument();
    expect(screen.getByText('🎉 ¡Correcto!')).toHaveClass('feedbackPanel', 'feedbackCorrect');
    expect(container.querySelector('.timerFill')).toHaveClass('timerUrgent');
    screen
      .getAllByRole('button')
      .filter(
        (button) =>
          button.textContent?.includes('Argentina') || button.textContent?.includes('Brasil'),
      )
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('hides the hint area and renders a negative feedback banner for wrong answers', () => {
    renderClassicPlayingLayout({
      feedbackText: '❌ Era Argentina',
      selected: FLAGS[1],
      timerColor: '#ef4444',
      timerPct: 10,
    });

    expect(screen.queryByRole('button', { name: /pista/i })).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(FLAGS[0].hint, 'i'))).not.toBeInTheDocument();
    expect(screen.getByText('❌ Era Argentina')).toHaveClass('feedbackPanel', 'feedbackWrong');
  });
});
