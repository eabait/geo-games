import React from 'react';
import { useNavigate } from 'react-router-dom';

import type { DifficultyKey } from '../types';

import styles from './DifficultyScreen.module.css';

import { DifficultyButton } from '@/modules/flag-game/components/DifficultyButton';
import { DIFFICULTY } from '@/modules/flag-game/data/constants';

const DIFFICULTY_ANIM_STEP = 0.1;

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyKey, string> = {
  easy: 'Países conocidos',
  medium: 'Más capitales para descubrir',
  hard: 'Todo el mundo',
};

export function CapitalDifficultyScreen(): React.JSX.Element {
  const navigate = useNavigate();

  function handleSelect(key: DifficultyKey): void {
    sessionStorage.setItem('capital-difficulty', key);
    navigate('/capital-cities/solo/play');
  }

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🏛️</div>
      <h2 className={styles.title}>Elegí la dificultad</h2>
      <div className={styles.difficultyList}>
        {(Object.keys(DIFFICULTY) as DifficultyKey[]).map((key, index) => (
          <DifficultyButton
            key={key}
            delay={index * DIFFICULTY_ANIM_STEP}
            description={DIFFICULTY_DESCRIPTIONS[key]}
            emoji={DIFFICULTY[key].emoji}
            label={DIFFICULTY[key].label}
            onClick={() => handleSelect(key)}
          />
        ))}
      </div>
      <button
        className={styles.backButton}
        onClick={() => navigate('/capital-cities')}
        type="button"
      >
        ← Volver
      </button>
    </div>
  );
}
