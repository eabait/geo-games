import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { ANSWER_DELAY_MS, DIFFICULTY, DUEL_R } from '../data/constants';
import { FLAGS } from '../data/flags';
import { useGameStore } from '../store/gameStore';
import type { Player } from '../types';

import { useGameSfx } from './useGameSfx';
import { useDuelPlayingState } from './useDuelPlayingState';
import { usePlayingTimer } from './usePlayingTimer';

const navigateMock = vi.fn();
const sfxMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('./useGameSfx', () => ({
  useGameSfx: vi.fn(),
}));

vi.mock('./usePlayingTimer', () => ({
  usePlayingTimer: vi.fn(),
}));

function createPlayers(): Player[] {
  return [
    { id: 'player-0', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
    { id: 'player-1', name: 'Luis', color: '#3b82f6', avatar: '🐯' },
  ];
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);

  navigateMock.mockReset();
  sfxMock.mockReset();

  vi.mocked(useGameSfx).mockReturnValue(sfxMock);
  vi.mocked(usePlayingTimer).mockImplementation(({ seconds }) => seconds);

  useGameStore.getState().reset();
  useGameStore.getState().startDuel('easy', createPlayers());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useDuelPlayingState', () => {
  it('bootstraps the first round and exposes both player scores', () => {
    const { result } = renderHook(() => useDuelPlayingState());

    expect(result.current.currentFlag).toEqual(FLAGS[0]);
    expect(result.current.roundLabel).toBe(`1/${DUEL_R}`);
    expect(result.current.playerPanels.map((panel) => panel.score)).toEqual([0, 0]);
  });

  it('locks the round after the first correct answer and advances after the delay', () => {
    const { result } = renderHook(() => useDuelPlayingState());

    act(() => {
      result.current.playerPanels[0].onAnswer(FLAGS[0]);
      result.current.playerPanels[1].onAnswer(FLAGS[0]);
    });

    expect(useGameStore.getState().duelScores['player-0']).toBe(DIFFICULTY.easy.points);
    expect(useGameStore.getState().duelScores['player-1']).toBe(0);
    expect(useGameStore.getState().duelHistory).toHaveLength(1);
    expect(result.current.playerPanels[0].feedbackText).toBe('Correct');
    expect(result.current.playerPanels[1].feedbackText).toBe('Too slow');

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(useGameStore.getState().duelRound).toBe(1);
  });

  it('awards a wrong answer to the opponent with appropriate feedback', () => {
    const { result } = renderHook(() => useDuelPlayingState());

    act(() => {
      result.current.playerPanels[0].onAnswer(FLAGS[1]);
    });

    expect(useGameStore.getState().duelScores['player-0']).toBe(0);
    expect(useGameStore.getState().duelScores['player-1']).toBe(DIFFICULTY.easy.points);
    expect(result.current.playerPanels[0].feedbackText).toBe('Gifted points');
    expect(result.current.playerPanels[1].feedbackText).toBe('Correct');
  });

  it('handles timeout through the countdown path', () => {
    const { result } = renderHook(() => useDuelPlayingState());

    const timerConfig = vi.mocked(usePlayingTimer).mock.calls.at(-1)?.[0];

    act(() => {
      timerConfig?.onAnswer(null);
    });

    expect(useGameStore.getState().duelResolution).toBe('timeout');
    expect(useGameStore.getState().duelHistory[0]?.resolution).toBe('timeout');
    expect(result.current.playerPanels[0].feedbackText).toBe("Time's up");
    expect(result.current.playerPanels[1].feedbackText).toBe("Time's up");

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(useGameStore.getState().duelRound).toBe(1);
  });

  it('navigates to duel results after the tenth resolved round', () => {
    useGameStore.setState({ duelRound: DUEL_R - 1 });

    const { result } = renderHook(() => useDuelPlayingState());

    act(() => {
      result.current.playerPanels[0].onAnswer(FLAGS[0]);
    });

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(navigateMock).toHaveBeenCalledWith('/flag-game/duel/results');
  });
});
