import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { DIFFICULTY, PCOLORS, PAVATARS } from '../data/constants';
import type { Player } from '../types';

import type { DifficultyKey } from '@/shared/types';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilySetupScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { startFamily } = useGameStore();

  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [inputValue, setInputValue] = useState('');

  function addPlayer(): void {
    const name = inputValue.trim();
    if (!name || playerNames.includes(name)) return;
    setPlayerNames((prev) => [...prev.slice(0, prev.length - 1), name, '']);
    setInputValue('');
  }

  function removePlayer(idx: number): void {
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateName(idx: number, value: string): void {
    setPlayerNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  }

  function handleStart(): void {
    const filled = playerNames.filter((n) => n.trim());
    if (filled.length < 2) return;
    const players: Player[] = filled.map((name, i) => ({
      id: `player-${i}`,
      name,
      color: PCOLORS[i % PCOLORS.length],
      avatar: PAVATARS[i % PAVATARS.length],
    }));
    startFamily(difficulty, players);
    navigate('/flag-game/family/pass');
  }

  const filledNames = playerNames.filter((n) => n.trim());
  const canStart = filledNames.length >= 2;

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
      <div style={{ fontSize: 60, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(22px,5vw,34px)',
          fontWeight: 700,
          color: ACCENT,
          margin: '0 0 8px',
        }}
      >
        Desafío familiar
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Configurá la partida</p>

      {/* Difficulty */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>
          Dificultad
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.entries(DIFFICULTY) as [DifficultyKey, (typeof DIFFICULTY)[string]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  border:
                    difficulty === key
                      ? `1.5px solid ${ACCENT}`
                      : '1px solid rgba(255,255,255,0.1)',
                  background:
                    difficulty === key ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  color: difficulty === key ? ACCENT : '#94a3b8',
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Players */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>
          Jugadores (mínimo 2)
        </p>
        {playerNames.map((name, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>{PAVATARS[idx % PAVATARS.length]}</span>
            <input
              value={name}
              onChange={(e) => updateName(idx, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && idx === playerNames.length - 1 && addPlayer()}
              placeholder={`Jugador ${idx + 1}`}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
              }}
            />
            {playerNames.length > 2 && (
              <button
                onClick={() => removePlayer(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {playerNames.length < 6 && (
          <button
            onClick={() => setPlayerNames((p) => [...p, ''])}
            style={{
              ...CARD,
              width: '100%',
              padding: '10px',
              fontSize: 13,
              color: '#64748b',
              fontFamily: "'Nunito', sans-serif",
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            + Agregar jugador
          </button>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="btn"
        style={{
          ...CARD,
          padding: '16px 40px',
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          color: canStart ? '#0f172a' : '#64748b',
          background: canStart
            ? `linear-gradient(135deg,${ACCENT},#f97316)`
            : 'rgba(255,255,255,0.06)',
          border: 'none',
          cursor: canStart ? 'pointer' : 'not-allowed',
        }}
      >
        ¡Jugar!
      </button>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 16,
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
