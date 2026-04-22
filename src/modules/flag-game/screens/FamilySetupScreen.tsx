import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { PlayerInput } from '../components/PlayerInput';
import { DIFFICULTY, PCOLORS, PAVATARS, MAX_PLAYERS, MIN_PLAYERS } from '../data/constants';
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

  function handleStart(): void {
    const filled = playerNames.filter((n) => n.trim());
    if (filled.length < MIN_PLAYERS) return;
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
  const canStart = filledNames.length >= MIN_PLAYERS;

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

      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>
          Jugadores (mínimo 2)
        </p>
        {playerNames.map((name, idx) => (
          <PlayerInput
            key={idx}
            index={idx}
            value={name}
            avatar={PAVATARS[idx % PAVATARS.length]}
            isLast={idx === playerNames.length - 1}
            showRemove={playerNames.length > MIN_PLAYERS}
            onChange={(val) => setPlayerNames((prev) => prev.map((n, i) => (i === idx ? val : n)))}
            onRemove={() => setPlayerNames((prev) => prev.filter((_, i) => i !== idx))}
            onEnter={addPlayer}
          />
        ))}
        {playerNames.length < MAX_PLAYERS && (
          <button
            onClick={() => setPlayerNames((prev) => [...prev, ''])}
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
