import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useQuizSession } from './useQuizSession';

const ITEMS = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
  { id: 'd', name: 'Delta' },
  { id: 'e', name: 'Epsilon' },
];

const config = {
  items: ITEMS,
  toId: (item: { id: string }) => item.id,
  generateOptions: (correct: { id: string }, pool: { id: string }[]) => {
    const others = pool.filter((item) => item.id !== correct.id).slice(0, 3);

    return [correct, ...others];
  },
  roundCount: 3,
  pointsPerCorrect: 10,
};

describe('useQuizSession — initial state', () => {
  it('starts at round 0 with a current item and 4 options', () => {
    const { result } = renderHook(() => useQuizSession(config));

    expect(result.current.round).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.current).not.toBeNull();
    expect(result.current.options).toHaveLength(4);
    expect(result.current.answered).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });
});

describe('useQuizSession — correct answer', () => {
  it('awards points and marks answered=true when the correct id is submitted', () => {
    const { result } = renderHook(() => useQuizSession(config));
    const correctId = result.current.correctId;

    if (correctId === null) {
      throw new Error('Expected initial quiz session to have a correct id.');
    }

    act(() => {
      result.current.handleAnswer(correctId);
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.score).toBe(10);
    expect(result.current.selectedId).toBe(correctId);
  });
});

describe('useQuizSession — wrong answer', () => {
  it('awards no points when a wrong id is submitted', () => {
    const { result } = renderHook(() => useQuizSession(config));
    const wrongItem = result.current.options.find(
      (option) => config.toId(option) !== result.current.correctId,
    );

    if (wrongItem === undefined) {
      throw new Error('Expected initial quiz session to include a wrong option.');
    }

    act(() => {
      result.current.handleAnswer(config.toId(wrongItem));
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });
});

describe('useQuizSession — timeout', () => {
  it('counts as wrong and sets answered=true on handleTimeout', () => {
    const { result } = renderHook(() => useQuizSession(config));

    act(() => {
      result.current.handleTimeout();
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });
});

describe('useQuizSession — round progression', () => {
  it('advances to round 1 after nextRound', () => {
    const { result } = renderHook(() => useQuizSession(config));

    if (result.current.correctId === null) {
      throw new Error('Expected initial quiz session to have a correct id.');
    }

    act(() => {
      result.current.handleAnswer(result.current.correctId ?? '');
    });
    act(() => {
      result.current.nextRound();
    });

    expect(result.current.round).toBe(1);
    expect(result.current.answered).toBe(false);
  });

  it('sets isFinished after the last round', () => {
    const { result } = renderHook(() => useQuizSession(config));

    for (let index = 0; index < 3; index += 1) {
      if (result.current.correctId === null) {
        throw new Error('Expected quiz session to have a correct id.');
      }

      act(() => {
        result.current.handleAnswer(result.current.correctId ?? '');
      });
      act(() => {
        result.current.nextRound();
      });
    }

    expect(result.current.isFinished).toBe(true);
    expect(result.current.current).toBeNull();
    expect(result.current.options).toEqual([]);
    expect(result.current.correctId).toBeNull();
    expect(result.current.answered).toBe(false);
  });
});
