import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { SOLO_R } from '../data/constants';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ResultsScreen(): JSX.Element {
  const navigate = useNavigate();
  const { score, roundHistory, bestStreak, difficulty, startSolo } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startSolo(difficulty);
      navigate('/flag-game/solo/play');
    }
  }

  const trophy = score > 200 ? '🏆' : score > 100 ? '🌟' : '🌍';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          fontSize: 64,
          animation: 'spinIn .6s ease both, float 2.5s ease-in-out .6s infinite',
          marginBottom: 8,
        }}
      >
        {trophy}
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 34,
          fontWeight: 700,
          color: ACCENT,
          margin: '0 0 4px',
        }}
      >
        {score} pts
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
        {roundHistory.filter((r) => r.correct).length}/{SOLO_R} · 🔥{bestStreak}
      </p>
      {roundHistory.length > 0 && (
        <div
          style={{
            ...CARD,
            padding: 16,
            width: '100%',
            maxWidth: 400,
            marginBottom: 24,
            marginTop: 16,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {roundHistory.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
                borderBottom:
                  i < roundHistory.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
                animation: `resultRow .4s ease ${0.2 + i * 0.05}s both`,
              }}
            >
              <span style={{ fontSize: 22 }}>{r.flag.code}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{r.flag.name}</span>
              <span>{r.correct ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn"
          onClick={handleRestart}
          style={{
            padding: '12px 28px',
            borderRadius: 14,
            border: 'none',
            background: ACCENT,
            color: '#1e293b',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          🔄 De nuevo
        </button>
        <button
          className="btn"
          onClick={() => navigate('/flag-game')}
          style={{
            ...CARD,
            padding: '12px 28px',
            borderRadius: 14,
            color: '#f1f5f9',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            background: 'transparent',
          }}
        >
          🏠 Menú
        </button>
      </div>
    </div>
  );
}
