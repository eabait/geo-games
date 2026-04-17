import React from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { MobileMap } from '../components/MobileMap';
import {
  DIFFICULTY,
  EXPLORER_STREAK_THRESHOLD,
  EXPLORER_NEXT_DELAY_MS,
  EXPLORER_TIMER_RED,
  EXPLORER_TIMER_YELLOW,
} from '../data/constants';
import { FLAGS } from '../data/flags';
import { shuffle, pickRandom } from '../data/utils';
import type { Flag } from '../types';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ExplorerPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn, continent } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect } = useVisualEffects();

  const {
    currentFlag,
    options,
    selected,
    showHint,
    difficulty,
    usedFlags,
    explorerTime,
    explorerScore,
    explorerCorrect,
    explorerTotal,
    explorerBestStreak,
    explorerStreak,
    setRoundData,
    recordExplorerAnswer,
    tickExplorerTime,
    setShowHint,
  } = useGameStore();

  const diff = DIFFICULTY[difficulty ?? 'easy'];

  // Set up new round when currentFlag is cleared
  useEffect(() => {
    if (currentFlag || !difficulty) return;
    const base =
      continent === 'Todos' ? FLAGS : FLAGS.filter((flag) => flag.continent === continent);
    const pool = base.filter((flag) => flag.tier <= diff.maxTier);
    const available = pool.filter((flag) => !usedFlags.includes(flag.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, usedFlags, continent, diff, setRoundData]);

  // Explorer countdown timer
  useEffect(() => {
    if (explorerTime <= 0) {
      navigate('/flag-game/explorer/results');
      return;
    }
    const id = setInterval(() => {
      tickExplorerTime();
    }, EXPLORER_NEXT_DELAY_MS);
    return () => clearInterval(id);
  }, [explorerTime, tickExplorerTime, navigate]);

  const handleAnswer = useCallback(
    (opt: Flag): void => {
      if (selected !== null || !currentFlag) return;
      const correct = opt.name === currentFlag.name;
      if (correct) sfx(explorerStreak >= EXPLORER_STREAK_THRESHOLD ? 'streak' : 'correct');
      else sfx('wrong');
      useGameStore.setState((state) => {
        state.selected = opt;
      });
      recordExplorerAnswer(correct);

      setTimeout(() => {
        useGameStore.setState((state) => {
          state.currentFlag = null;
          state.selected = null;
          state.showHint = false;
        });
      }, EXPLORER_NEXT_DELAY_MS);
    },
    [selected, currentFlag, sfx, explorerStreak, recordExplorerAnswer],
  );

  if (!currentFlag)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

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
          padding: '14px 12px',
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
            marginBottom: 6,
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
                marginRight: 4,
              }}
            >
              🏠
            </button>
            {explorerStreak >= EXPLORER_STREAK_THRESHOLD && (
              <span
                style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontWeight: 700,
                  animation: 'pulse 1s infinite',
                }}
              >
                🔥x{explorerStreak}
              </span>
            )}
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{explorerCorrect} acertadas</span>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '4px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 14 }}>⏱️</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color:
                  explorerTime <= EXPLORER_TIMER_RED
                    ? '#ef4444'
                    : explorerTime <= EXPLORER_TIMER_YELLOW
                      ? '#eab308'
                      : ACCENT,
                animation: explorerTime <= EXPLORER_TIMER_RED ? 'pulse .5s infinite' : 'none',
              }}
            >
              {explorerTime}s
            </span>
          </div>
        </nav>
        {/* Flag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
            animation: 'flagEnter .5s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          <span style={{ fontSize: 50, lineHeight: 1 }}>{currentFlag.code}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>¿Dónde queda?</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{currentFlag.continent}</div>
          </div>
        </div>
        {/* Hint */}
        {!showHint && selected === null && (
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
                padding: '3px 12px',
                borderRadius: 10,
                fontSize: 12,
                cursor: 'pointer',
                marginBottom: 4,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              💡 Pista
            </button>
          </nav>
        )}
        {showHint && (
          <div style={{ fontSize: 12, color: ACCENT, marginBottom: 4, fontStyle: 'italic' }}>
            💡 {currentFlag.hint}
          </div>
        )}
        {/* Map */}
        <div style={{ width: '100%', maxWidth: 420, marginBottom: 6 }}>
          <MobileMap
            options={options}
            correctName={currentFlag.name}
            selected={selected}
            onSelect={handleAnswer}
          />
        </div>
        {selected !== null && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              animation: 'popIn .3s ease',
              color: selected?.name === currentFlag.name ? '#22c55e' : '#ef4444',
            }}
          >
            {selected?.name === currentFlag.name ? '🎉 ¡Correcto! +3s' : `❌ ${currentFlag.name}`}
          </div>
        )}
        {/* Stats bar */}
        <div
          style={{
            ...CARD,
            padding: '8px 20px',
            marginTop: 4,
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Puntos</div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: ACCENT,
              }}
            >
              {explorerScore}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Aciertos</div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#22c55e',
              }}
            >
              {explorerCorrect}/{explorerTotal}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Racha</div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#f97316',
              }}
            >
              🔥{explorerBestStreak}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
