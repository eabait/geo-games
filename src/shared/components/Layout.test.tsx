import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Layout } from './Layout';

describe('Layout', () => {
  it('renders children and the sound toggle', () => {
    render(
      <Layout soundOn onToggleSound={vi.fn()}>
        <div>screen content</div>
      </Layout>,
    );

    expect(screen.getByText('screen content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🔊' })).toBeInTheDocument();
  });

  it('does not inject font links or global style tags', () => {
    const { container } = render(
      <Layout soundOn={false} onToggleSound={vi.fn()}>
        <div>screen content</div>
      </Layout>,
    );

    expect(container.querySelector('link')).not.toBeInTheDocument();
    expect(container.querySelector('style')).not.toBeInTheDocument();
  });
});
