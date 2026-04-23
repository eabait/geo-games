import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { PlayerInput } from '../components/PlayerInput';
import { DIFFICULTY, PCOLORS, PAVATARS, MAX_PLAYERS, MIN_PLAYERS } from '../data/constants';
import type { Player } from '../types';

import styles from './FamilySetupScreen.module.css';

import type { DifficultyKey } from '@/shared/types';

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
    const filled = playerNames.filter((n) => n.trim());
    if (filled.length < MIN_PLAYERS) return;
    const players: Player[] = filled.map((name, i) => ({
      id: `player-${i}`,
      name,
      color: PCOLORS[i % PCOLORS.length],
      avatar: PAVATARS[i % PAVATARS.length],
    }));
    startFamily(difficulty, players);
    navigate('/flag-game/family/pass');
  }

  const filledNames = playerNames.filter((n) => n.trim());
  const canStart = filledNames.length >= MIN_PLAYERS;

  return (
    <div className={styles.screen}>
      <div className={styles.emoji}>👨‍👩‍👧‍👦</div>
      <h2 className={styles.title}>Desafío familiar</h2>
      <p className={styles.subtitle}>Configurá la partida</p>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Dificultad</p>
        <div className={styles.difficultyGrid}>
          {(Object.entries(DIFFICULTY) as [DifficultyKey, (typeof DIFFICULTY)[string]][]).map(
            ([key, cfg]) => (
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
                {cfg.emoji} {cfg.label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Jugadores (mínimo 2)</p>
        {playerNames.map((name, idx) => (
          <PlayerInput
            key={idx}
            index={idx}
            value={name}
            avatar={PAVATARS[idx % PAVATARS.length]}
            isLast={idx === playerNames.length - 1}
            showRemove={playerNames.length > MIN_PLAYERS}
            onChange={(val) => setPlayerNames((prev) => prev.map((n, i) => (i === idx ? val : n)))}
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
