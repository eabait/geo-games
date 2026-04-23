import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { PlayerInput } from '../components/PlayerInput';
import { DIFFICULTY, PCOLORS, PAVATARS, MAX_PLAYERS, MIN_PLAYERS } from '../data/constants';
import type { Player } from '../types';

import styles from './FamilySetupScreen.module.css';

import type { DifficultyKey } from '@/shared/types';

type DifficultyEntry = [DifficultyKey, (typeof DIFFICULTY)[DifficultyKey]];

const difficultyOptions = Object.entries(DIFFICULTY) as DifficultyEntry[];

function getFilledNames(playerNames: string[]): string[] {
  return playerNames.filter((playerName) => playerName.trim());
}

function buildPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `player-${index}`,
    name,
    color: PCOLORS[index % PCOLORS.length],
    avatar: PAVATARS[index % PAVATARS.length],
  }));
}

function replacePlayerName(
  playerNames: string[],
  playerIndex: number,
  nextValue: string,
): string[] {
  return playerNames.map((playerName, index) => (index === playerIndex ? nextValue : playerName));
}

function renderDifficultyButtons(
  difficulty: DifficultyKey,
  setDifficulty: (difficulty: DifficultyKey) => void,
): React.JSX.Element {
  return (
    <div className={styles.difficultyGrid}>
      {difficultyOptions.map(([key, config]) => (
        <button
          className={[
            styles.difficultyButton,
            difficulty === key ? styles.difficultyButtonSelected : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={key}
          onClick={() => setDifficulty(key)}
          type="button"
        >
          {config.emoji} {config.label}
        </button>
      ))}
    </div>
  );
}

function renderPlayerInputs(
  addPlayer: () => void,
  playerNames: string[],
  setPlayerNames: React.Dispatch<React.SetStateAction<string[]>>,
): React.JSX.Element {
  return (
    <>
      {playerNames.map((name, idx) => (
        <PlayerInput
          key={idx}
          index={idx}
          value={name}
          avatar={PAVATARS[idx % PAVATARS.length]}
          isLast={idx === playerNames.length - 1}
          showRemove={playerNames.length > MIN_PLAYERS}
          onChange={(nextValue) =>
            setPlayerNames((previousNames) => replacePlayerName(previousNames, idx, nextValue))
          }
          onRemove={() => setPlayerNames((prev) => prev.filter((_, i) => i !== idx))}
          onEnter={addPlayer}
        />
      ))}
      {playerNames.length < MAX_PLAYERS && (
        <button
          className={styles.addPlayerButton}
          onClick={() => setPlayerNames((prev) => [...prev, ''])}
          type="button"
        >
          + Agregar jugador
        </button>
      )}
    </>
  );
}

export function FamilySetupScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { startFamily } = useGameStore();

  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [inputValue, setInputValue] = useState('');

  function addPlayer(): void {
    const name = inputValue.trim();
    if (!name || playerNames.includes(name)) return;
    setPlayerNames((prev) => [...prev.slice(0, prev.length - 1), name, '']);
    setInputValue('');
  }

  function handleStart(): void {
    const filledNames = getFilledNames(playerNames);
    if (filledNames.length < MIN_PLAYERS) return;
    const players = buildPlayers(filledNames);
    startFamily(difficulty, players);
    navigate('/flag-game/family/pass');
  }

  const filledNames = getFilledNames(playerNames);
  const canStart = filledNames.length >= MIN_PLAYERS;

  return (
    <div className={styles.screen}>
      <div className={styles.emoji}>👨‍👩‍👧‍👦</div>
      <h2 className={styles.title}>Desafío familiar</h2>
      <p className={styles.subtitle}>Configurá la partida</p>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Dificultad</p>
        {renderDifficultyButtons(difficulty, setDifficulty)}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Jugadores (mínimo 2)</p>
        {renderPlayerInputs(addPlayer, playerNames, setPlayerNames)}
      </div>

      <button
        className={[
          'btn',
          styles.startButton,
          canStart ? styles.startButtonEnabled : styles.startButtonDisabled,
        ].join(' ')}
        disabled={!canStart}
        onClick={handleStart}
        type="button"
      >
        ¡Jugar!
      </button>

      <button className={styles.backButton} onClick={() => navigate(-1)} type="button">
        ← Volver
      </button>
    </div>
  );
}
