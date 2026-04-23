import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

import styles from './PassPhoneScreen.module.css';

export function PassPhoneScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, currentPlayerIdx } = useGameStore();

  const player = players[currentPlayerIdx];

  if (!player) return <></>;

  return (
    <div className={styles.screen}>
      <div className={styles.avatar}>{player.avatar}</div>
      <h2 className={styles.title}>¡Pasá el teléfono!</h2>
      <p className={styles.subtitle}>
        Es el turno de{' '}
        <span
          className={styles.playerName}
          style={{ '--player-color': player.color } as React.CSSProperties}
        >
          {player.name}
        </span>
      </p>
      <button
        className={['btn', styles.ctaButton].join(' ')}
        onClick={() => navigate('/flag-game/family/play')}
        type="button"
      >
        ¡Listo, soy {player.name}!
      </button>
    </div>
  );
}
