import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ModeButton } from './ModeButton';

describe('ModeButton', () => {
  it('renders the icon', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });

  it('renders the sub description', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('10 rounds')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
