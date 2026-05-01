import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useCulturalFactsQuiz } from './useCulturalFactsQuiz';

interface WrapperProps {
  children: React.ReactNode;
}

function Wrapper({ children }: WrapperProps): React.JSX.Element {
  return React.createElement(MemoryRouter, null, children);
}

describe('useCulturalFactsQuiz', () => {
  it('starts with a current fact and 4 options on easy', () => {
    const { result } = renderHook(() => useCulturalFactsQuiz('easy'), { wrapper: Wrapper });

    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.score).toBe(0);
  });

  it('awards points for a correct answer', () => {
    const { result } = renderHook(() => useCulturalFactsQuiz('easy'), { wrapper: Wrapper });

    if (result.current.correctId === null) {
      throw new Error('Expected current cultural facts item to have a correct id.');
    }

    act(() => {
      result.current.handleAnswer(result.current.correctId ?? '');
    });

    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.isCorrect).toBe(true);
  });
});
