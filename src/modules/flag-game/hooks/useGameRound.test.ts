import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
  ANSWER_DELAY_MS,
  DIFFICULTY,
  RPP,
  SOLO_R,
  STREAK_BONUS_MULTIPLIER,
  STREAK_SOUND_THRESHOLD,
} from '../data/constants';
import { FLAGS } from '../data/flags';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

import { useGameRound } from './useGameRound';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../data/utils', () => ({
  pickRandom: vi.fn((pool, count, excluded) =>
    pool
      .filter((flag) => !excluded.some((excludedFlag) => excludedFlag.name === flag.name))
      .slice(0, count),
  ),
  shuffle: vi.fn((items) => items),
}));

function createPlayers(): { id: string; name: string; color: string; avatar: string }[] {
  return [
    { id: 'player-0', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
    { id: 'player-1', name: 'Luis', color: '#3b82f6', avatar: '🐯' },
  ];
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  navigateMock.mockReset();
  useGameStore.getState().reset();
  useSettingsStore.getState().reset();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useGameRound setup', () => {
  it('bootstraps a round automatically for solo mode when there is no active flag', () => {
    useGameStore.getState().startSolo('easy');

    renderHook(() => useGameRound(vi.fn()));

    const state = useGameStore.getState();

    expect(state.currentFlag).toEqual(FLAGS[0]);
    expect(state.options).toHaveLength(DIFFICULTY.easy.options);
    expect(state.usedFlags).toContain(FLAGS[0].name);
  });

  it('does not bootstrap a new round for explorer mode', () => {
    useGameStore.getState().startExplorer('easy');

    renderHook(() => useGameRound(vi.fn()));

    expect(useGameStore.getState().currentFlag).toBeNull();
  });

  it('ignores answers when the round is not ready', () => {
    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[0]);
    });

    expect(useGameStore.getState().roundHistory).toHaveLength(0);
    expect(sfx).not.toHaveBeenCalled();
  });
});

describe('useGameRound solo mode', () => {
  it('records a hinted solo answer with streak bonus audio and advances to the next round', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({
      showHint: true,
      streak: STREAK_SOUND_THRESHOLD,
    });

    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[0]);
    });

    const expectedPoints =
      DIFFICULTY.easy.points -
      DIFFICULTY.easy.hintCost +
      STREAK_SOUND_THRESHOLD * STREAK_BONUS_MULTIPLIER;

    expect(useGameStore.getState().score).toBe(expectedPoints);
    expect(useGameStore.getState().roundHistory.at(-1)).toEqual({
      flag: FLAGS[0],
      correct: true,
    });
    expect(sfx).toHaveBeenCalledWith('streak');

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(useGameStore.getState().round).toBe(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('handles a wrong solo answer and resets the streak without scoring', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({ streak: 4 });

    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[1]);
    });

    expect(useGameStore.getState().score).toBe(0);
    expect(useGameStore.getState().streak).toBe(0);
    expect(sfx).toHaveBeenCalledWith('wrong');
  });

  it('finishes the final solo round by playing victory audio and navigating to results', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({ round: SOLO_R - 1 });

    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[0]);
    });

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(sfx).toHaveBeenCalledWith('victory');
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/solo/results');
  });
});

describe('useGameRound family mode', () => {
  it('updates family scores and streaks, then advances the player round', () => {
    const players = createPlayers();

    useGameStore.getState().startFamily('easy', players);
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({
      showHint: true,
      familyStreaks: { 'player-0': STREAK_SOUND_THRESHOLD - 1, 'player-1': 0 },
    });

    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[0]);
    });

    const expectedPoints =
      DIFFICULTY.easy.points -
      DIFFICULTY.easy.hintCost +
      STREAK_SOUND_THRESHOLD * STREAK_BONUS_MULTIPLIER;

    const stateAfterAnswer = useGameStore.getState();

    expect(stateAfterAnswer.familyScores['player-0']).toBe(expectedPoints);
    expect(stateAfterAnswer.familyStreaks['player-0']).toBe(STREAK_SOUND_THRESHOLD);
    expect(stateAfterAnswer.familyHistory['player-0']).toEqual([{ flag: FLAGS[0], correct: true }]);
    expect(sfx).toHaveBeenCalledWith('streak');

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(useGameStore.getState().playerRound).toBe(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

describe('useGameRound family navigation', () => {
  it('moves to the pass-phone screen after the last round of a non-final family player', () => {
    const players = createPlayers();

    useGameStore.getState().startFamily('easy', players);
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({
      currentPlayerIdx: 0,
      playerRound: RPP - 1,
    });

    const { result } = renderHook(() => useGameRound(vi.fn()));

    act(() => {
      result.current.handleAnswer(FLAGS[1]);
    });

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(useGameStore.getState().currentPlayerIdx).toBe(1);
    expect(useGameStore.getState().playerRound).toBe(0);
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/family/pass');
  });

  it('finishes the final family turn by navigating to the family results screen', () => {
    const players = createPlayers();

    useGameStore.getState().startFamily('easy', players);
    useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1]]);
    useGameStore.setState({
      currentPlayerIdx: players.length - 1,
      playerRound: RPP - 1,
    });

    const sfx = vi.fn();
    const { result } = renderHook(() => useGameRound(sfx));

    act(() => {
      result.current.handleAnswer(FLAGS[0]);
    });

    act(() => {
      vi.advanceTimersByTime(ANSWER_DELAY_MS);
    });

    expect(sfx).toHaveBeenCalledWith('victory');
    expect(navigateMock).toHaveBeenCalledWith('/flag-game/family/results');
  });
});
