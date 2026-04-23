import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { DifficultyButton } from '../components/DifficultyButton';
import { DIFFICULTY, DIFFICULTY_ANIM_BASE, DIFFICULTY_ANIM_STEP } from '../data/constants';

import styles from './DifficultyScreen.module.css';

import type { DifficultyKey } from '@/shared/types';

interface DifficultyScreenProps {
  mode: 'solo' | 'explorer';
}

const PLAY_ROUTE: Record<string, string> = {
  solo: '/flag-game/solo/play',
  explorer: '/flag-game/explorer/play',
};

export function DifficultyScreen({ mode }: DifficultyScreenProps): React.JSX.Element {
  const navigate = useNavigate();
  const { startSolo, startExplorer } = useGameStore();

  function handleSelect(key: DifficultyKey): void {
    if (mode === 'solo') startSolo(key);
    else startExplorer(key);
    navigate(PLAY_ROUTE[mode]);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.emoji}>{mode === 'solo' ? '🎮' : '🗺️'}</div>
      <h2 className={styles.title}>{mode === 'solo' ? 'Jugar solo' : 'Explorador'}</h2>
      <p className={styles.subtitle}>Elegí una dificultad</p>
      <div className={styles.options}>
        {(Object.entries(DIFFICULTY) as [DifficultyKey, (typeof DIFFICULTY)[string]][]).map(
          ([key, cfg], i) => (
            <DifficultyButton
              key={key}
              emoji={cfg.emoji}
              label={cfg.label}
              description={`${cfg.options} opciones · ${cfg.time}s · ${cfg.points} pts`}
              delay={DIFFICULTY_ANIM_BASE + i * DIFFICULTY_ANIM_STEP}
              onClick={() => handleSelect(key)}
            />
          ),
        )}
      </div>
      <button className={styles.backButton} onClick={() => navigate(-1)} type="button">
        ← Volver
      </button>
    </div>
  );
}
