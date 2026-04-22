import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { DifficultyButton } from '../components/DifficultyButton';
import { DIFFICULTY, DIFFICULTY_ANIM_BASE, DIFFICULTY_ANIM_STEP } from '../data/constants';

import type { DifficultyKey } from '@/shared/types';

interface DifficultyScreenProps {
  mode: 'solo' | 'explorer';
}

const ACCENT = '#fbbf24';

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 12 }}>{mode === 'solo' ? '🎮' : '🗺️'}</div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(22px,5vw,34px)',
          fontWeight: 700,
          color: ACCENT,
          margin: '0 0 8px',
        }}
      >
        {mode === 'solo' ? 'Jugar solo' : 'Explorador'}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Elegí una dificultad</p>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}
      >
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
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 24,
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        ← Volver
      </button>
    </div>
  );
}
