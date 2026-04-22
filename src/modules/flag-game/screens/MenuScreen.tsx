import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useSettingsStore } from '../store/settingsStore';
import { ContinentPicker } from '../components/ContinentPicker';
import { ModeButton } from '../components/ModeButton';
import { FLAGS } from '../data/flags';

const ACCENT = '#fbbf24';

const MODES = [
  {
    key: 'solo-diff',
    icon: '🎮',
    label: 'Jugar solo',
    sub: '10 rondas · Opciones múltiples',
    delay: 0.1,
    highlight: false,
  },
  {
    key: 'explorer-diff',
    icon: '🗺️',
    label: 'Explorador',
    sub: 'Ubicá países en su continente · Contrarreloj',
    delay: 0.2,
    highlight: true,
  },
  {
    key: 'family-setup',
    icon: '👨‍👩‍👧‍👦',
    label: 'Desafío familiar',
    sub: 'Turnos por jugador',
    delay: 0.3,
    highlight: false,
  },
] as const;

const ROUTE_MAP: Record<string, string> = {
  'solo-diff': '/flag-game/solo',
  'explorer-diff': '/flag-game/explorer',
  'family-setup': '/flag-game/family',
};

export function MenuScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { continent, setContinent } = useSettingsStore();

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
      <div
        style={{
          fontSize: 80,
          animation: 'float 3s ease-in-out infinite, spinIn 0.8s ease both',
          marginBottom: 8,
        }}
      >
        🌍
      </div>
      <h1
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(28px,6vw,44px)',
          fontWeight: 700,
          background: `linear-gradient(135deg,${ACCENT},#f97316,#ef4444)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 4px',
          animation: 'breathe 4s ease-in-out infinite',
        }}
      >
        ¿Qué bandera es?
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>
        {FLAGS.length} países del mundo
      </p>
      <ContinentPicker selected={continent} onChange={setContinent} />
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}
      >
        {MODES.map((mode) => (
          <ModeButton
            key={mode.key}
            icon={mode.icon}
            label={mode.label}
            sub={mode.sub}
            delay={mode.delay}
            highlight={mode.highlight}
            onClick={() => navigate(ROUTE_MAP[mode.key])}
          />
        ))}
      </div>
    </div>
  );
}
