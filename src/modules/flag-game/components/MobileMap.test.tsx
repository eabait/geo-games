import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Flag } from '../types';

import { MobileMap } from './MobileMap';

const mockOptions: Flag[] = [
  { code: '🇦🇷', name: 'Argentina', continent: 'América', hint: '', tier: 1, pos: [-34.6, -58.4] },
  { code: '🇧🇷', name: 'Brasil', continent: 'América', hint: '', tier: 1, pos: [-14.2, -51.9] },
  { code: '🇫🇷', name: 'Francia', continent: 'Europa', hint: '', tier: 1, pos: [46.2, 2.2] },
  { code: '🇯🇵', name: 'Japón', continent: 'Asia', hint: '', tier: 1, pos: [36.2, 138.3] },
];

describe('MobileMap', () => {
  it('renders a button for each option', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    mockOptions.forEach((opt) => {
      expect(screen.getByRole('button', { name: opt.name })).toBeInTheDocument();
    });
  });

  it('calls onSelect with the clicked flag', async () => {
    const onSelect = vi.fn();
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Brasil' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it('disables all buttons when selected is non-null', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={mockOptions[1]}
        onSelect={vi.fn()}
      />,
    );
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('does not show flag emoji in answer buttons', () => {
    render(
      <MobileMap
        options={mockOptions}
        correctName="Argentina"
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    // Emoji codes must not appear as button text (they would spoil the answer)
    mockOptions.forEach((opt) => {
      expect(screen.queryByText(new RegExp(opt.code))).not.toBeInTheDocument();
    });
  });
});
