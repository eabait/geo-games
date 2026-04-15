import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';

const ACCENT = '#fbbf24';
const BLUE = '#3b82f6';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ExplorerResultsScreen(): JSX.Element {
  const navigate = useNavigate();
  const {
    explorerScore,
    explorerCorrect,
    explorerBestStreak,
    explorerHistory,
    difficulty,
    startExplorer,
  } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startExplorer(difficulty);
      navigate('/flag-game/explorer/play');
    }
  }

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
        🗺️
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 34,
          fontWeight: 700,
          color: BLUE,
          margin: '0 0 4px',
        }}
      >
        ¡Tiempo!
      </h2>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, marginTop: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: ACCENT,
            }}
          >
            {explorerScore}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>pts</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: '#22c55e',
            }}
          >
            {explorerCorrect}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>ok</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 36,
              fontWeight: 700,
              color: '#f97316',
            }}
          >
            {explorerBestStreak}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>🔥</div>
        </div>
      </div>
      {explorerHistory.length > 0 && (
        <div
          style={{
            ...CARD,
            padding: 16,
            width: '100%',
            maxWidth: 400,
            marginBottom: 24,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {explorerHistory.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
                borderBottom:
                  i < explorerHistory.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
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
            background: BLUE,
            color: '#fff',
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
