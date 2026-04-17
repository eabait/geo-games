import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

const ACCENT = '#fbbf24';

export function PassPhoneScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, currentPlayerIdx } = useGameStore();

  const player = players[currentPlayerIdx];

  if (!player) return <></>;

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
      <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounce 1s ease-in-out infinite' }}>
        {player.avatar}
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(22px,5vw,34px)',
          fontWeight: 700,
          color: ACCENT,
          margin: '0 0 8px',
        }}
      >
        ¡Pasá el teléfono!
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32 }}>
        Es el turno de <span style={{ color: player.color, fontWeight: 700 }}>{player.name}</span>
      </p>
      <button
        className="btn"
        onClick={() => navigate('/flag-game/family/play')}
        style={{
          padding: '18px 48px',
          borderRadius: 20,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          cursor: 'pointer',
          border: 'none',
          background: `linear-gradient(135deg,${ACCENT},#f97316)`,
          color: '#0f172a',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        ¡Listo, soy {player.name}!
      </button>
    </div>
  );
}
