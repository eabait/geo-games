import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContinentPicker } from './ContinentPicker';

describe('ContinentPicker', () => {
  it('renders all continent options including Todos', () => {
    render(<ContinentPicker selected="Todos" onChange={vi.fn()} />);
    ['Todos', 'América', 'Europa', 'África', 'Asia', 'Oceanía'].forEach((c) => {
      expect(screen.getByRole('button', { name: new RegExp(c, 'i') })).toBeInTheDocument();
    });
  });

  it('calls onChange with the continent name when a chip is clicked', async () => {
    const onChange = vi.fn();
    render(<ContinentPicker selected="Todos" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /europa/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('Europa');
  });

  it('gives the selected chip a distinct border color', () => {
    render(<ContinentPicker selected="Europa" onChange={vi.fn()} />);
    const europaBtn = screen.getByRole('button', { name: /europa/i });
    // Selected chip uses amber (#fbbf24); unselected chips use rgba(255,255,255,0.1)
    expect(europaBtn).toHaveStyle({ borderColor: '#fbbf24' });
  });
});
