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

const duelPlayers = [
  { id: 'p1', name: 'Ana', color: '#f97316', avatar: '🦁' },
  { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
];
const wrongFlag = FLAGS[1];

describe('gameStore — duel mode setup', () => {
  it('startDuel initializes duel state', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);

    const s = useGameStore.getState();
    expect(s.mode).toBe('duel');
    expect(s.difficulty).toBe('medium');
    expect(s.duelPlayers).toEqual(duelPlayers);
    expect(s.duelRound).toBe(0);
    expect(s.duelScores).toEqual({ p1: 0, p2: 0 });
    expect(s.duelHistory).toEqual([]);
    expect(s.duelResolution).toBeNull();
  });
});

describe('gameStore — duel scoring', () => {
  it('correct duel answer awards points to answering player and ignores later answers after resolution', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);

    useGameStore.getState().recordDuelAnswer('p1', mockFlag);
    useGameStore.getState().recordDuelAnswer('p2', wrongFlag);

    const s = useGameStore.getState();
    expect(s.duelScores).toEqual({ p1: 20, p2: 0 });
    expect(s.duelAnsweringPlayerId).toBe('p1');
    expect(s.duelResolvedBy).toBe('p1');
    expect(s.duelResolution).toBe('correct');
    expect(s.duelSelectedFlag).toEqual(mockFlag);
    expect(s.duelHistory).toHaveLength(1);
    expect(s.duelHistory[0]).toMatchObject({
      flag: mockFlag,
      winnerId: 'p1',
      loserId: 'p2',
      resolution: 'correct',
      answeringPlayerId: 'p1',
    });
  });

  it('wrong first tap awards points to the opponent and records duelAnsweringPlayerId', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);

    useGameStore.getState().recordDuelAnswer('p1', wrongFlag);

    const s = useGameStore.getState();
    expect(s.duelScores).toEqual({ p1: 0, p2: 20 });
    expect(s.duelAnsweringPlayerId).toBe('p1');
    expect(s.duelResolvedBy).toBe('p2');
    expect(s.duelResolution).toBe('opponent-awarded');
    expect(s.duelSelectedFlag).toEqual(wrongFlag);
    expect(s.duelHistory).toHaveLength(1);
    expect(s.duelHistory[0]).toMatchObject({
      flag: mockFlag,
      winnerId: 'p2',
      loserId: 'p1',
      resolution: 'opponent-awarded',
      answeringPlayerId: 'p1',
    });
  });

  it('recordDuelAnswer no-ops for unknown duel player ids', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);

    useGameStore.getState().recordDuelAnswer('p3', wrongFlag);

    const s = useGameStore.getState();
    expect(s.duelScores).toEqual({ p1: 0, p2: 0 });
    expect(s.duelAnsweringPlayerId).toBeNull();
    expect(s.duelSelectedFlag).toBeNull();
    expect(s.duelResolvedBy).toBeNull();
    expect(s.duelResolution).toBeNull();
    expect(s.duelHistory).toEqual([]);
  });
});

describe('gameStore — duel round progression', () => {
  it('timeout records no score change and appends timeout history', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);

    useGameStore.getState().recordDuelTimeout();

    const s = useGameStore.getState();
    expect(s.duelScores).toEqual({ p1: 0, p2: 0 });
    expect(s.duelAnsweringPlayerId).toBeNull();
    expect(s.duelResolvedBy).toBeNull();
    expect(s.duelResolution).toBe('timeout');
    expect(s.duelSelectedFlag).toBeNull();
    expect(s.duelHistory).toHaveLength(1);
    expect(s.duelHistory[0]).toMatchObject({
      flag: mockFlag,
      winnerId: null,
      loserId: null,
      resolution: 'timeout',
      answeringPlayerId: null,
    });
  });

  it('advanceDuelRound no-ops outside duel mode', () => {
    useGameStore.getState().startSolo('easy');
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);

    useGameStore.getState().advanceDuelRound();

    const s = useGameStore.getState();
    expect(s.mode).toBe('solo');
    expect(s.duelRound).toBe(0);
    expect(s.currentFlag).toEqual(mockFlag);
    expect(s.options).toEqual([mockFlag, wrongFlag]);
    expect(s.duelAnsweringPlayerId).toBeNull();
    expect(s.duelSelectedFlag).toBeNull();
    expect(s.duelResolvedBy).toBeNull();
    expect(s.duelResolution).toBeNull();
  });

  it('advanceDuelRound increments duelRound and clears round-scoped duel state', () => {
    useGameStore.getState().startDuel('medium', duelPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);
    useGameStore.getState().setShowHint(true);
    useGameStore.getState().recordDuelAnswer('p1', mockFlag);

    useGameStore.getState().advanceDuelRound();

    const s = useGameStore.getState();
    expect(s.duelRound).toBe(1);
    expect(s.currentFlag).toBeNull();
    expect(s.options).toEqual([]);
    expect(s.selected).toBeNull();
    expect(s.showHint).toBe(false);
    expect(s.duelAnsweringPlayerId).toBeNull();
    expect(s.duelSelectedFlag).toBeNull();
    expect(s.duelResolvedBy).toBeNull();
    expect(s.duelResolution).toBeNull();
  });
});

describe('gameStore — duel restarts', () => {
  it('startDuel resets duel collections across restarts', () => {
    const firstPlayers = [
      { id: 'p1', name: 'Ana', color: '#f97316', avatar: '🦁' },
      { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
    ];
    const secondPlayers = [
      { id: 'p3', name: 'Caro', color: '#ef4444', avatar: '🦊' },
      { id: 'p4', name: 'Dani', color: '#10b981', avatar: '🐸' },
    ];

    useGameStore.getState().startDuel('medium', firstPlayers);
    useGameStore.getState().setRoundData(mockFlag, [mockFlag, wrongFlag]);
    useGameStore.getState().recordDuelAnswer('p1', mockFlag);

    useGameStore.getState().startDuel('easy', secondPlayers);

    const s = useGameStore.getState();
    expect(s.mode).toBe('duel');
    expect(s.difficulty).toBe('easy');
    expect(s.duelPlayers).toEqual(secondPlayers);
    expect(s.duelScores).toEqual({ p3: 0, p4: 0 });
    expect(s.duelHistory).toEqual([]);
    expect(s.duelRound).toBe(0);
    expect(s.duelAnsweringPlayerId).toBeNull();
    expect(s.duelSelectedFlag).toBeNull();
    expect(s.duelResolvedBy).toBeNull();
    expect(s.duelResolution).toBeNull();
  });
});
