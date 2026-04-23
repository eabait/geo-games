import React from 'react';

import styles from './DifficultyButton.module.css';

interface DifficultyButtonProps {
  emoji: string;
  label: string;
  description: string;
  delay: number;
  onClick: () => void;
}

export function DifficultyButton({
  emoji,
  label,
  description,
  delay,
  onClick,
}: DifficultyButtonProps): React.JSX.Element {
  const className = ['btn', styles.button].join(' ');

  return (
    <button
      className={className}
      onClick={onClick}
      style={{ '--item-delay': `${delay}s` } as React.CSSProperties}
      type="button"
    >
      <span className={styles.emoji}>{emoji}</span>
      <div className={styles.content}>
        <div>{label}</div>
        <div className={styles.description}>{description}</div>
      </div>
      <span className={styles.arrow}>→</span>
    </button>
  );
}
