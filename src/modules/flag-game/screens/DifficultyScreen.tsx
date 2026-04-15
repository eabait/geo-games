import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { DIFFICULTY } from '../data/constants';

import type { DifficultyKey } from '@/shared/types';

interface DifficultyScreenProps {
  mode: 'solo' | 'explorer';
}

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

const PLAY_ROUTE: Record<string, string> = {
  solo: '/flag-game/solo/play',
  explorer: '/flag-game/explorer/play',
};

export function DifficultyScreen({ mode }: DifficultyScreenProps): JSX.Element {
  const navigate = useNavigate();
  const { startSolo, startExplorer } = useGameStore();

  function handleSelect(d: DifficultyKey): void {
    if (mode === 'solo') startSolo(d);
    else startExplorer(d);
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
            <button
              key={key}
              className="btn"
              onClick={() => handleSelect(key)}
              style={{
                ...CARD,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                color: '#f1f5f9',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                animation: `menuItem .6s ease ${i * 0.1 + 0.1}s both`,
              }}
            >
              <span style={{ fontSize: 32 }}>{cfg.emoji}</span>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div>{cfg.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                  {cfg.options} opciones · {cfg.time}s · {cfg.points} pts
                </div>
              </div>
              <span style={{ color: ACCENT, fontSize: 18 }}>→</span>
            </button>
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
