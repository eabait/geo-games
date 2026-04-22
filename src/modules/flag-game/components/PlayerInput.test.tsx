import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlayerInput } from './PlayerInput';

describe('PlayerInput', () => {
  it('renders the avatar', () => {
    render(
      <PlayerInput
        index={0}
        value=""
        avatar="🦁"
        isLast={false}
        showRemove={false}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
      />,
    );
    expect(screen.getByText('🦁')).toBeInTheDocument();
  });

  it('renders an input with the current value', () => {
    render(
      <PlayerInput
        index={0}
        value="Ana"
        avatar="🦁"
        isLast={false}
        showRemove={false}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const onChange = vi.fn();
    render(
      <PlayerInput
        index={0}
        value=""
        avatar="🦁"
        isLast={false}
        showRemove={false}
        onChange={onChange}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows the remove button when showRemove is true', () => {
    render(
      <PlayerInput
        index={0}
        value="Ana"
        avatar="🦁"
        isLast={false}
        showRemove={true}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides the remove button when showRemove is false', () => {
    render(
      <PlayerInput
        index={0}
        value="Ana"
        avatar="🦁"
        isLast={false}
        showRemove={false}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onEnter={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(
      <PlayerInput
        index={0}
        value="Ana"
        avatar="🦁"
        isLast={false}
        showRemove={true}
        onChange={vi.fn()}
        onRemove={onRemove}
        onEnter={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
