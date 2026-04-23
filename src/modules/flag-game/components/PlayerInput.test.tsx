import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlayerInput } from './PlayerInput';

const defaultProps = {
  index: 0,
  value: '',
  avatar: '🦁',
  isLast: false,
  showRemove: false,
};

function renderPlayerInput(overrides: Partial<typeof defaultProps> = {}): {
  onChange: ReturnType<typeof vi.fn>;
  onRemove: ReturnType<typeof vi.fn>;
  onEnter: ReturnType<typeof vi.fn>;
} {
  const onChange = vi.fn();
  const onRemove = vi.fn();
  const onEnter = vi.fn();

  render(
    <PlayerInput
      {...defaultProps}
      {...overrides}
      onChange={onChange}
      onRemove={onRemove}
      onEnter={onEnter}
    />,
  );

  return { onChange, onRemove, onEnter };
}

describe('PlayerInput', () => {
  it('renders the avatar', () => {
    renderPlayerInput();
    expect(screen.getByText('🦁')).toBeInTheDocument();
  });

  it('renders an input with the current value', () => {
    renderPlayerInput({ value: 'Ana' });
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const { onChange } = renderPlayerInput();
    await userEvent.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows the remove button when showRemove is true', () => {
    renderPlayerInput({ value: 'Ana', showRemove: true });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides the remove button when showRemove is false', () => {
    renderPlayerInput({ value: 'Ana' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const { onRemove } = renderPlayerInput({ value: 'Ana', showRemove: true });
    await userEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
