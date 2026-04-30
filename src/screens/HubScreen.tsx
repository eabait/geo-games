import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './HubScreen.module.css';

import { useProfileStore, type PlayerProfile } from '@/shared/store/profileStore';

interface GameCardConfig {
  key: string;
  icon: string;
  title: string;
  route: string;
  description: string;
}

interface ProfileCreatorProps {
  onDone: () => void;
}

interface ProfileBarProps {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  onSwitch: () => void;
}

interface ProfileSwitcherProps {
  profiles: PlayerProfile[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const GAMES: readonly GameCardConfig[] = [
  {
    key: 'flag-game',
    icon: '🏳️',
    title: '¿Qué bandera es?',
    route: '/flag-game',
    description: '195 países del mundo',
  },
  {
    key: 'capital-cities',
    icon: '🏛️',
    title: '¿Cuál es la capital?',
    route: '/capital-cities',
    description: 'Capitales del mundo',
  },
  {
    key: 'cultural-facts',
    icon: '🌍',
    title: '¿Cuánto sabés del mundo?',
    route: '/cultural-facts',
    description: 'Tradiciones y culturas',
  },
];

const AVATARS = ['🦊', '🐸', '🦁', '🐯', '🦉', '🐧', '🚀', '🌟', '🌈', '🐬', '🦄', '🐻'];
const MAX_PROFILES = 5;

function ProfileCreator({ onDone }: ProfileCreatorProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const addProfile = useProfileStore((state) => state.addProfile);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    addProfile(trimmedName, avatar);
    onDone();
  }

  return (
    <div className={styles.creatorOverlay}>
      <div className={styles.creatorCard}>
        <h2 className={styles.creatorTitle}>¿Cómo te llamás?</h2>
        <form className={styles.creatorForm} onSubmit={handleSubmit}>
          <input
            autoFocus
            className={styles.nameInput}
            maxLength={20}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
            type="text"
            value={name}
          />
          <p className={styles.avatarLabel}>Elegí tu avatar</p>
          <div className={styles.avatarGrid}>
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                aria-pressed={avatar === emoji}
                className={[styles.avatarOption, avatar === emoji ? styles.avatarSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setAvatar(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            className={['btn', styles.doneButton].join(' ')}
            disabled={!name.trim()}
            type="submit"
          >
            ¡Listo!
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileBar({ profiles, activeProfileId, onSwitch }: ProfileBarProps): React.JSX.Element {
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);

  return (
    <div className={styles.profileBar}>
      {activeProfile ? (
        <>
          <span className={styles.activeAvatar}>{activeProfile.avatar}</span>
          <span className={styles.activeName}>{activeProfile.name}</span>
          <button className={styles.switchButton} onClick={onSwitch} type="button">
            Cambiar
          </button>
        </>
      ) : (
        <button className={styles.switchButton} onClick={onSwitch} type="button">
          + Agregar jugador
        </button>
      )}
    </div>
  );
}

function ProfileSwitcher({ profiles, onSelect, onAdd }: ProfileSwitcherProps): React.JSX.Element {
  return (
    <div className={styles.switcherOverlay}>
      <div className={styles.switcherCard}>
        <h2 className={styles.switcherTitle}>¿Quién juega?</h2>
        <div className={styles.profileList}>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className={styles.profileItem}
              onClick={() => onSelect(profile.id)}
              type="button"
            >
              <span className={styles.profileAvatar}>{profile.avatar}</span>
              <span className={styles.profileName}>{profile.name}</span>
            </button>
          ))}
        </div>
        {profiles.length < MAX_PROFILES && (
          <button className={styles.addProfile} onClick={onAdd} type="button">
            + Nuevo jugador
          </button>
        )}
      </div>
    </div>
  );
}

function getBestScore(profile: PlayerProfile | undefined, gameKey: string): string {
  const bestScore = profile?.scores[gameKey]?.bestScore;

  if (bestScore === undefined) {
    return '¡Aún no jugaste!';
  }

  return `Mejor: ${bestScore} pts`;
}

export function HubScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { profiles, activeProfileId, setActiveProfile } = useProfileStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showCreator, setShowCreator] = useState(profiles.length === 0);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);

  if (showCreator) {
    return <ProfileCreator onDone={() => setShowCreator(false)} />;
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>🌍 GeoMundo</h1>
      <ProfileBar
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={() => setShowSwitcher(true)}
      />
      <div className={styles.gameList}>
        {GAMES.map((game) => (
          <div key={game.key} className={styles.gameCard}>
            <span className={styles.gameIcon}>{game.icon}</span>
            <div className={styles.gameInfo}>
              <p className={styles.gameTitle}>{game.title}</p>
              <p className={styles.gameDesc}>{game.description}</p>
              <p className={styles.gameBest}>{getBestScore(activeProfile, game.key)}</p>
            </div>
            <button
              className={['btn', styles.playButton].join(' ')}
              onClick={() => navigate(game.route)}
              type="button"
            >
              Jugar
            </button>
          </div>
        ))}
      </div>
      {showSwitcher ? (
        <ProfileSwitcher
          profiles={profiles}
          onAdd={() => {
            setShowSwitcher(false);
            setShowCreator(true);
          }}
          onSelect={(id) => {
            setActiveProfile(id);
            setShowSwitcher(false);
          }}
        />
      ) : null}
    </div>
  );
}
