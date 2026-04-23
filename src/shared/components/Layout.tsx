import React from 'react';

import { BackgroundStars } from '@/shared/components/BackgroundStars';
import styles from '@/shared/components/Layout.module.css';

// NOTE: Layout is shared; do not import flag-game specifics here long-term.
// BackgroundStars should move to shared if other games use it.

interface LayoutProps {
  children: React.ReactNode;
  soundOn: boolean;
  onToggleSound: () => void;
  confetti?: React.ReactNode;
  flash?: React.ReactNode;
  emojis?: React.ReactNode;
}

export function Layout({
  children,
  soundOn,
  onToggleSound,
  confetti,
  flash,
  emojis,
}: LayoutProps): React.JSX.Element {
  return (
    <div className={styles.shell}>
      <BackgroundStars />
      {confetti}
      {emojis}
      {flash}
      <button className={styles.soundToggle} onClick={onToggleSound} type="button">
        {soundOn ? '🔊' : '🔇'}
      </button>
      {children}
    </div>
  );
}
