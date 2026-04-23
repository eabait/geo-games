import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { FLAGS } from '../data/flags';
import { useGameStore } from '../store/gameStore';

import { useGameRound } from './useGameRound';
import { useGameSfx } from './useGameSfx';
import { usePlayingTimer } from './usePlayingTimer';
import { useScorePop } from './useScorePop';
import { useSoloPlayingState } from './useSoloPlayingState';
import { useVisualEffects } from './useVisualEffects';

const navigateMock = vi.fn();
const handleAnswerMock = vi.fn();
const sfxMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('./useGameRound', () => ({
  useGameRound: vi.fn(),
}));

vi.mock('./useGameSfx', () => ({
  useGameSfx: vi.fn(),
}));

vi.mock('./usePlayingTimer', () => ({
  usePlayingTimer: vi.fn(),
}));

vi.mock('./useScorePop', () => ({
  useScorePop: vi.fn(),
}));

vi.mock('./useVisualEffects', () => ({
  useVisualEffects: vi.fn(),
}));

function resetSoloPlayingStateMocks(): void {
  navigateMock.mockReset();
  handleAnswerMock.mockReset();
  sfxMock.mockReset();

  useGameStore.getState().reset();
  useGameStore.getState().startSolo('medium');
  useGameStore.getState().setRoundData(FLAGS[0], [FLAGS[0], FLAGS[1], FLAGS[2], FLAGS[3]]);

  vi.mocked(useGameRound).mockReturnValue({ handleAnswer: handleAnswerMock });
  vi.mocked(useGameSfx).mockReturnValue(sfxMock);
  vi.mocked(usePlayingTimer).mockReturnValue(12);
  vi.mocked(useScorePop).mockReturnValue(false);
  vi.mocked(useVisualEffects).mockReturnValue({
    flashCorrect: false,
    showConfetti: false,
    showFloatingEmojis: false,
    showScreenFlash: false,
    showSparkles: false,
  });
}

beforeEach(() => {
  resetSoloPlayingStateMocks();
});

describe('useSoloPlayingState timer and feedback', () => {
  it('derives the timer color from the remaining timer percentage', () => {
    const { result, rerender } = renderHook(() => useSoloPlayingState());

    expect(result.current.timerColor).toBe('#22c55e');

    vi.mocked(usePlayingTimer).mockReturnValue(6);
    rerender();

    expect(result.current.timerColor).toBe('#eab308');

    vi.mocked(usePlayingTimer).mockReturnValue(3);
    rerender();

    expect(result.current.timerColor).toBe('#ef4444');
  });

  it('returns regular positive feedback before the streak sound threshold', () => {
    useGameStore.setState({
      selected: FLAGS[0],
      streak: 1,
    });

    const { result } = renderHook(() => useSoloPlayingState());

    expect(result.current.feedbackClassName).toBe('feedbackCorrect');
    expect(result.current.feedbackText).toBe('🎉 ¡Correcto!');
    expect(result.current.showSparkles).toBe(false);
    expect(result.current.onAnswer).toBe(handleAnswerMock);
  });

  it('returns streak feedback and sparkle state when the streak reaches the threshold', () => {
    useGameStore.setState({
      selected: FLAGS[0],
      streak: 3,
    });

    const { result } = renderHook(() => useSoloPlayingState());

    expect(result.current.feedbackText).toBe('🔥 ¡Imparable!');
    expect(result.current.showSparkles).toBe(true);
  });

  it('returns wrong-answer feedback for an incorrect selection', () => {
    useGameStore.setState({
      selected: FLAGS[1],
      streak: 0,
    });

    const { result } = renderHook(() => useSoloPlayingState());

    expect(result.current.feedbackClassName).toBe('feedbackWrong');
    expect(result.current.feedbackText).toBe(`❌ Era ${FLAGS[0].name}`);
  });
});

describe('useSoloPlayingState actions', () => {
  it('returns timeout feedback and urgent timer state when time expires with no selection', () => {
    vi.mocked(usePlayingTimer).mockReturnValue(0);

    const { result } = renderHook(() => useSoloPlayingState());

    expect(result.current.feedbackText).toBe(`⏱️ ¡Tiempo! Era ${FLAGS[0].name}`);
    expect(result.current.timerUrgent).toBe(true);
    expect(result.current.hintLabel).toBe('💡 Pista (-7 pts)');
  });

  it('reveals the hint and plays the hint sound', () => {
    const { result } = renderHook(() => useSoloPlayingState());

    act(() => {
      result.current.onRevealHint();
    });

    expect(sfxMock).toHaveBeenCalledWith('hint');
    expect(useGameStore.getState().showHint).toBe(true);
    expect(result.current.showHint).toBe(true);
  });
});
