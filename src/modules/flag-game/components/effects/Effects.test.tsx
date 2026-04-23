import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Confetti } from './Confetti';
import { FloatingEmojis } from './FloatingEmojis';
import { ScreenFlash } from './ScreenFlash';
import { Sparkles } from './Sparkles';

describe('effect components', () => {
  it('renders nothing for inactive effects', () => {
    const { container } = render(
      <>
        <Confetti active={false} />
        <FloatingEmojis active={false} />
        <ScreenFlash active={false} correct />
        <Sparkles active={false} />
      </>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders all animated pieces when effects are active', () => {
    const { container } = render(
      <>
        <Confetti active />
        <FloatingEmojis active />
        <Sparkles active />
      </>,
    );

    expect(container.firstChild).not.toBeNull();
    expect(container.querySelectorAll('div').length).toBeGreaterThan(60);
    expect(screen.getAllByText('🎉').length).toBeGreaterThan(0);
  });

  it('renders the correct and wrong flash variants', () => {
    const { rerender, container } = render(<ScreenFlash active correct />);

    const flash = container.firstChild as HTMLElement | null;

    expect(flash).not.toBeNull();
    expect(flash?.className).toContain('flash');
    expect(flash?.className).toContain('correct');

    rerender(<ScreenFlash active={true} correct={false} />);

    expect((container.firstChild as HTMLElement | null)?.className).toContain('wrong');
  });
});
