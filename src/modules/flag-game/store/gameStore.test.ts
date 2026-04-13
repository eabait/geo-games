import { describe, it, expect, beforeEach } from 'vitest';

import { FLAGS } from '../data/flags';

import { useGameStore } from './gameStore';

const mockFlag = FLAGS[0];

beforeEach(() => useGameStore.getState().reset());

describe('gameStore — solo mode', () => {
  it('starts solo game with correct initial state', () => {
    useGameStore.getState().startSolo('easy');
    const s = useGameStore.getState();
    expect(s.mode).toBe('solo');
    expect(s.difficulty).toBe('easy');
    expect(s.round).toBe(0);
    expect(s.score).toBe(0);
    expect(s.streak).toBe(0);
  });

  it('sets current round data', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    expect(useGameStore.getState().currentFlag).toEqual(mockFlag);
  });

  it('records correct answer and updates score', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    useGameStore.getState().recordAnswer(mockFlag, true, 10);
    const s = useGameStore.getState();
    expect(s.score).toBeGreaterThan(0);
    expect(s.streak).toBe(1);
    expect(s.roundHistory).toHaveLength(1);
    expect(s.roundHistory[0].correct).toBe(true);
  });

  it('resets streak on wrong answer', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    useGameStore.getState().recordAnswer(mockFlag, true, 10);
    useGameStore.getState().recordAnswer(mockFlag, false, 0);
    expect(useGameStore.getState().streak).toBe(0);
  });
});

describe('gameStore — family mode', () => {
  const players = [
    { id: 'p1', name: 'Ana', color: '#f97316', avatar: '🦁' },
    { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
  ];

  it('starts family game initializing scores for all players', () => {
    useGameStore.getState().startFamily('easy', players);
    const s = useGameStore.getState();
    expect(s.mode).toBe('family');
    expect(s.familyScores).toEqual({ p1: 0, p2: 0 });
    expect(s.currentPlayerIdx).toBe(0);
  });

  it('advances to next player after RPP rounds', () => {
    useGameStore.getState().startFamily('easy', players);
    useGameStore.getState().advancePlayerTurn();
    expect(useGameStore.getState().currentPlayerIdx).toBe(1);
  });
});

describe('gameStore — explorer mode', () => {
  it('starts explorer with timer and zero score', () => {
    useGameStore.getState().startExplorer('easy');
    const s = useGameStore.getState();
    expect(s.mode).toBe('explorer');
    expect(s.explorerTime).toBeGreaterThan(0);
    expect(s.explorerScore).toBe(0);
  });

  it('adds time on correct explorer answer', () => {
    useGameStore.getState().startExplorer('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag]);
    const timeBefore = useGameStore.getState().explorerTime;
    useGameStore.getState().recordExplorerAnswer(true);
    expect(useGameStore.getState().explorerTime).toBeGreaterThan(timeBefore);
  });
});
