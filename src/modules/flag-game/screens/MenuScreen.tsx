import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useSettingsStore } from '../store/settingsStore';
import { ContinentPicker } from '../components/ContinentPicker';
import { ModeButton } from '../components/ModeButton';
import { FLAGS } from '../data/flags';

import styles from './MenuScreen.module.css';

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
  {
    key: 'duel-setup',
    icon: '⚔️',
    label: 'Duelo 1v1',
    sub: 'Ambos juegan a la vez · 10 rondas',
    delay: 0.4,
    highlight: false,
  },
] as const;

const ROUTE_MAP: Record<string, string> = {
  'solo-diff': '/flag-game/solo',
  'explorer-diff': '/flag-game/explorer',
  'family-setup': '/flag-game/family',
  'duel-setup': '/flag-game/duel',
};

export function MenuScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { continent, setContinent } = useSettingsStore();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>🌍</div>
      <h1 className={styles.title}>¿Qué bandera es?</h1>
      <p className={styles.subtitle}>{FLAGS.length} países del mundo</p>
      <ContinentPicker selected={continent} onChange={setContinent} />
      <div className={styles.modes}>
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
