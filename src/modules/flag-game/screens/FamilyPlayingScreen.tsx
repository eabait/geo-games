import React from 'react';
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
import { OptionButton } from '../components/OptionButton';
import {
  DIFFICULTY,
  RPP,
  SCORE_POP_DURATION_MS,
  TICK_THRESHOLD,
  TICK_URGENT_THRESHOLD,
  TIMER_PCT_FULL,
  STREAK_BONUS_THRESHOLD,
  STREAK_SOUND_THRESHOLD,
  DEFAULT_ROUND_SECONDS,
} from '../data/constants';
import type { Flag } from '../types';

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilyPlayingScreen(): React.JSX.Element {
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
      const timer = setTimeout(() => setScorePop(false), SCORE_POP_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [cpScore]);

  const { handleAnswer } = useGameRound(sfx);

  const { timeLeft } = useTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    active: !!currentFlag && selected === null,
    onTick: (t) => {
      if (t <= TICK_THRESHOLD && t > TICK_URGENT_THRESHOLD) sfx('tick');
      else if (t <= TICK_URGENT_THRESHOLD) sfx('tickUrgent');
    },
    onExpire: () => {
      sfx('timeout');
      handleAnswer(null);
    },
  });

  if (!currentFlag || !cp)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * TIMER_PCT_FULL : TIMER_PCT_FULL;
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
            {cpStreak >= STREAK_BONUS_THRESHOLD && (
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
              animation:
                timeLeft <= TICK_THRESHOLD && !selected ? 'timerPulse .5s ease infinite' : 'none',
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
          {options.map((opt, i) => (
            <OptionButton
              key={opt.name}
              opt={opt}
              index={i}
              selected={selected}
              currentFlag={currentFlag}
              onAnswer={onAnswer}
            />
          ))}
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
              ? cpStreak >= STREAK_SOUND_THRESHOLD
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
