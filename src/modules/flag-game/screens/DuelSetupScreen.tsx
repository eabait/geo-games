import React from 'react';
import { useNavigate } from 'react-router-dom';

import { PlayerInput } from '../components/PlayerInput';
import { useDuelSetup } from '../hooks/useDuelSetup';
import type { DuelSetupState } from '../hooks/useDuelSetup';

import styles from './DuelSetupScreen.module.css';

function renderDifficultyButtons(
  difficulty: DuelSetupState['difficulty'],
  difficultyOptions: DuelSetupState['difficultyOptions'],
  setDifficulty: DuelSetupState['setDifficulty'],
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
  playerAvatars: DuelSetupState['playerAvatars'],
  playerNames: DuelSetupState['playerNames'],
  setPlayerName: DuelSetupState['setPlayerName'],
  startDuel: DuelSetupState['startDuel'],
): React.JSX.Element {
  return (
    <div className={styles.playerList}>
      {playerNames.map((playerName, index) => (
        <PlayerInput
          key={index}
          index={index}
          value={playerName}
          avatar={playerAvatars[index]}
          isLast={index === playerNames.length - 1}
          showRemove={false}
          onChange={(value) => setPlayerName(index, value)}
          onRemove={() => undefined}
          onEnter={startDuel}
        />
      ))}
    </div>
  );
}

export function DuelSetupScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const {
    difficulty,
    difficultyOptions,
    playerNames,
    playerAvatars,
    canStart,
    setDifficulty,
    setPlayerName,
    startDuel,
  } = useDuelSetup();

  return (
    <div className={styles.screen}>
      <div className={styles.emoji}>⚔️</div>
      <h2 className={styles.title}>Duelo 1v1</h2>
      <p className={styles.subtitle}>Elegí dificultad y prepará a los dos duelistas</p>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Dificultad</p>
        {renderDifficultyButtons(difficulty, difficultyOptions, setDifficulty)}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Jugadores</p>
        {renderPlayerInputs(playerAvatars, playerNames, setPlayerName, startDuel)}
      </div>

      <button
        className={[
          'btn',
          styles.startButton,
          canStart ? styles.startButtonEnabled : styles.startButtonDisabled,
        ].join(' ')}
        disabled={!canStart}
        onClick={startDuel}
        type="button"
      >
        Empezar duelo
      </button>

      <button className={styles.backButton} onClick={() => navigate(-1)} type="button">
        ← Volver
      </button>
    </div>
  );
}
