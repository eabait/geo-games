import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useGameRound } from '../hooks/useGameRound';
import { useTimer } from '../hooks/useTimer';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { Sparkles } from '../components/effects/Sparkles';
import { DIFFICULTY, RPP } from '../data/constants';
import type { Flag } from '../types';

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilyPlayingScreen(): JSX.Element {
  const navigate = useNavigate();
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect, showSparkles } =
    useVisualEffects();

  const {
    currentFlag,
    options,
    selected,
    showHint,
    players,
    currentPlayerIdx,
    playerRound,
    familyScores,
    familyStreaks,
    difficulty,
    setShowHint,
  } = useGameStore();

  const diff = DIFFICULTY[difficulty ?? 'easy'];
  const cp = players[currentPlayerIdx] ?? null;

  const [scorePop, setScorePop] = useState(false);
  const cpScore = cp ? (familyScores[cp.id] ?? 0) : 0;
  useEffect(() => {
    if (cpScore > 0) {
      setScorePop(true);
      const t = setTimeout(() => setScorePop(false), 400);
      return () => clearTimeout(t);
    }
  }, [cpScore]);

  const { handleAnswer } = useGameRound(sfx);

  const { timeLeft } = useTimer({
    seconds: diff?.time ?? 15,
    active: !!currentFlag && selected === null,
    onTick: (t) => {
      if (t <= 5 && t > 2) sfx('tick');
      else if (t <= 2) sfx('tickUrgent');
    },
    onExpire: () => {
      sfx('timeout');
      handleAnswer(null);
    },
  });

  if (!currentFlag || !cp)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * 100 : 100;
  const cpStreak = familyStreaks[cp.id] ?? 0;

  const onAnswer = (opt: Flag): void => {
    handleAnswer(opt);
  };

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 16px',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <nav
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => navigate('/flag-game')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 18,
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              🏠
            </button>
            <span style={{ fontSize: 20 }}>{cp.avatar}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: cp.color }}>{cp.name}</span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
              {playerRound + 1}/{RPP}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            {cpStreak >= 2 && (
              <span
                style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontWeight: 700,
                  animation: 'pulse 1s infinite',
                }}
              >
                🔥x{cpStreak}
              </span>
            )}
            <Sparkles active={showSparkles} />
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: cp.color,
                animation: scorePop ? 'scorePop .4s ease' : 'none',
              }}
            >
              {cpScore}
            </span>
          </div>
        </nav>
        {/* Timer bar */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            height: 6,
            background: 'rgba(255,255,255,.08)',
            borderRadius: 4,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${timerPct}%`,
              background: cp.color,
              borderRadius: 4,
              transition: 'width 1s linear',
              animation: timeLeft <= 5 && !selected ? 'timerPulse .5s ease infinite' : 'none',
            }}
          />
        </div>
        {/* Flag */}
        <div
          style={{
            ...CARD,
            padding: '32px 40px',
            marginBottom: 8,
            animation: 'flagEnter .6s cubic-bezier(.34,1.56,.64,1) both',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 'clamp(80px,20vw,120px)', lineHeight: 1 }}>
            {currentFlag.code}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            background: 'rgba(255,255,255,.06)',
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          {currentFlag.continent}
        </div>
        {/* Hint */}
        {!showHint && !selected && (
          <nav>
            <button
              onClick={() => {
                sfx('hint');
                setShowHint(true);
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,.1)',
                color: '#94a3b8',
                padding: '6px 16px',
                borderRadius: 12,
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: 16,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              💡 Pista (-{diff?.hintCost} pts)
            </button>
          </nav>
        )}
        {showHint && (
          <div
            style={{
              fontSize: 14,
              color: cp.color,
              marginBottom: 16,
              fontStyle: 'italic',
              animation: 'popIn .3s ease',
            }}
          >
            💡 {currentFlag.hint}
          </div>
        )}
        {/* Options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: '100%',
            maxWidth: 420,
          }}
        >
          {options.map((opt, i) => {
            const isCorrect = opt.name === currentFlag.name;
            const isSel = selected?.name === opt.name;
            const bg = selected
              ? isCorrect
                ? 'rgba(34,197,94,.18)'
                : isSel
                  ? 'rgba(239,68,68,.18)'
                  : 'rgba(255,255,255,.06)'
              : 'rgba(255,255,255,.06)';
            const bc = selected
              ? isCorrect
                ? '#22c55e'
                : isSel
                  ? '#ef4444'
                  : 'rgba(255,255,255,.1)'
              : 'rgba(255,255,255,.1)';
            return (
              <button
                key={opt.name}
                className="btn"
                onClick={() => onAnswer(opt)}
                disabled={selected !== null}
                style={{
                  ...CARD,
                  background: bg,
                  border: `1.5px solid ${bc}`,
                  padding: '14px 20px',
                  color: '#f1f5f9',
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: selected ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  animation: `optionEnter .4s ease ${0.05 + i * 0.07}s both`,
                  opacity: selected && !isCorrect && !isSel ? 0.35 : 1,
                  transition: 'opacity .4s',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background:
                      selected && isCorrect
                        ? '#22c55e'
                        : selected && isSel
                          ? '#ef4444'
                          : 'rgba(255,255,255,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    color: '#fff',
                    transition: 'all .3s',
                    transform: selected && (isCorrect || isSel) ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {selected && isCorrect
                    ? '✓'
                    : selected && isSel && !isCorrect
                      ? '✗'
                      : String.fromCharCode(65 + i)}
                </span>
                {opt.name}
              </button>
            );
          })}
        </div>
        {selected && (
          <div
            style={{
              marginTop: 16,
              fontSize: 16,
              fontWeight: 700,
              animation: 'popIn .4s ease',
              color: selected.name === currentFlag.name ? '#22c55e' : '#ef4444',
            }}
          >
            {selected.name === currentFlag.name
              ? cpStreak >= 3
                ? '🔥 ¡Imparable!'
                : '🎉 ¡Correcto!'
              : `❌ Era ${currentFlag.name}`}
          </div>
        )}
        {!selected && timeLeft === 0 && (
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
            ⏱️ ¡Tiempo! Era {currentFlag.name}
          </div>
        )}
      </div>
    </>
  );
}
