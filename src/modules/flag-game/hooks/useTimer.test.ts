import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down from initial seconds', () => {
    const { result } = renderHook(() =>
      useTimer({ seconds: 5, active: true, onTick: vi.fn(), onExpire: vi.fn() }),
    );
    expect(result.current.timeLeft).toBe(5);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(4);
  });

  it('calls onExpire when timer reaches zero', () => {
    const onExpire = vi.fn();
    renderHook(() => useTimer({ seconds: 2, active: true, onTick: vi.fn(), onExpire }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('does not tick when inactive', () => {
    const { result } = renderHook(() =>
      useTimer({ seconds: 5, active: false, onTick: vi.fn(), onExpire: vi.fn() }),
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timeLeft).toBe(5);
  });
});
