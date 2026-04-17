import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { RPP } from '../data/constants';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilyResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, familyScores, familyHistory, difficulty, startFamily } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startFamily(difficulty, players);
      navigate('/flag-game/family/pass');
    }
  }

  const sorted = [...players].sort((a, b) => (familyScores[b.id] ?? 0) - (familyScores[a.id] ?? 0));
  const winner = sorted[0];
  const topScore = winner ? (familyScores[winner.id] ?? 0) : 0;
  const isTie = sorted.filter((p) => (familyScores[p.id] ?? 0) === topScore).length > 1;
  // Podium order: 2nd (index 1), 1st (index 0), 3rd (index 2)
  const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
  const podiumHeights = [100, 150, 80];
  const podiumMedals = ['🥈', '🥇', '🥉'];

  if (!winner) return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>...</div>;

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
        style={{ fontSize: 20, animation: 'crownBounce 1s ease-in-out infinite', marginBottom: 2 }}
      >
        👑
      </div>
      <div
        style={{
          fontSize: 64,
          animation: 'spinIn .6s ease .1s both, bounce 1.5s ease-in-out .7s infinite',
          marginBottom: 4,
        }}
      >
        🏆
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 30,
          fontWeight: 700,
          color: isTie ? ACCENT : winner.color,
          margin: '0 0 4px',
        }}
      >
        {isTie ? '¡Empate!' : `¡${winner.name} gana!`}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>{topScore} pts</p>
      {/* Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 28 }}>
        {podium.map((p, idx) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: `slideUp .6s ease ${0.5 + idx * 0.2}s both`,
            }}
          >
            <span style={{ fontSize: 30, marginBottom: 4 }}>{p.avatar}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 4 }}>
              {p.name}
            </span>
            <div
              style={{
                width: 76,
                height: podiumHeights[idx],
                borderRadius: '14px 14px 0 0',
                background: `linear-gradient(180deg,${p.color}44,${p.color}11)`,
                border: `1.5px solid ${p.color}55`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                animation: `podiumRise .6s ease ${0.8 + idx * 0.15}s both`,
                transformOrigin: 'bottom',
              }}
            >
              <span style={{ fontSize: 26 }}>{podiumMedals[idx]}</span>
              <span
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: p.color,
                }}
              >
                {familyScores[p.id] ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Scoreboard */}
      <div style={{ ...CARD, padding: 16, width: '100%', maxWidth: 400, marginBottom: 24 }}>
        {sorted.map((p, i) => {
          const correct = (familyHistory[p.id] ?? []).filter((r) => r.correct).length;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#64748b',
                  width: 24,
                }}
              >
                #{i + 1}
              </span>
              <span style={{ fontSize: 24 }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {correct}/{RPP}
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: p.color,
                }}
              >
                {familyScores[p.id] ?? 0}
              </span>
            </div>
          );
        })}
      </div>
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
          🔄 Revancha
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
