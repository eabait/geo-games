import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DIFFICULTY, PCOLORS, PAVATARS } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import type { Player } from '../types';

import type { DifficultyKey } from '@/shared/types';

type DifficultyEntry = [DifficultyKey, (typeof DIFFICULTY)[DifficultyKey]];

export interface DuelSetupState {
  difficulty: DifficultyKey;
  difficultyOptions: DifficultyEntry[];
  playerNames: string[];
  playerAvatars: string[];
  canStart: boolean;
  setDifficulty: (difficulty: DifficultyKey) => void;
  setPlayerName: (playerIndex: number, value: string) => void;
  startDuel: () => void;
}

const difficultyOptions = Object.entries(DIFFICULTY) as DifficultyEntry[];
const initialPlayerNames = ['', ''];

function buildPlayers(playerNames: string[]): Player[] {
  return playerNames.map((name, index) => ({
    id: `player-${index}`,
    name: name.trim(),
    color: PCOLORS[index % PCOLORS.length],
    avatar: PAVATARS[index % PAVATARS.length],
  }));
}

function replacePlayerName(playerNames: string[], playerIndex: number, value: string): string[] {
  return playerNames.map((playerName, index) => (index === playerIndex ? value : playerName));
}

export function useDuelSetup(): DuelSetupState {
  const navigate = useNavigate();
  const startDuelInStore = useGameStore((state) => state.startDuel);

  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy');
  const [playerNames, setPlayerNames] = useState<string[]>(initialPlayerNames);

  const canStart = playerNames.every((playerName) => playerName.trim().length > 0);

  function setPlayerName(playerIndex: number, value: string): void {
    setPlayerNames((currentPlayerNames) =>
      replacePlayerName(currentPlayerNames, playerIndex, value),
    );
  }

  function startDuel(): void {
    if (!canStart) {
      return;
    }

    startDuelInStore(difficulty, buildPlayers(playerNames));
    navigate('/flag-game/duel/play');
  }

  return {
    difficulty,
    difficultyOptions,
    playerNames,
    playerAvatars: PAVATARS.slice(0, initialPlayerNames.length),
    canStart,
    setDifficulty,
    setPlayerName,
    startDuel,
  };
}
