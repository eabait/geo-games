import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useCapitalQuiz } from './useCapitalQuiz';

interface WrapperProps {
  children: React.ReactNode;
}

function Wrapper({ children }: WrapperProps): React.JSX.Element {
  return React.createElement(MemoryRouter, null, children);
}

describe('useCapitalQuiz', () => {
  it('starts with a current item and 4 options on easy difficulty', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'), { wrapper: Wrapper });

    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.score).toBe(0);
    expect(result.current.isFinished).toBe(false);
  });

  it('awards points for a correct answer', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'), { wrapper: Wrapper });

    if (result.current.correctId === null) {
      throw new Error('Expected current capital quiz item to have a correct id.');
    }

    act(() => {
      result.current.handleAnswer(result.current.correctId ?? '');
    });

    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.isCorrect).toBe(true);
  });

  it('exposes timeLeft as a number', () => {
    const { result } = renderHook(() => useCapitalQuiz('easy'), { wrapper: Wrapper });

    expect(typeof result.current.timeLeft).toBe('number');
    expect(result.current.timeLeft).toBeGreaterThan(0);
  });
});
