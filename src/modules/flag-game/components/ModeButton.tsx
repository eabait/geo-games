import React from 'react';

import styles from './ModeButton.module.css';

interface ModeButtonProps {
  icon: string;
  label: string;
  sub: string;
  delay: number;
  highlight?: boolean;
  onClick: () => void;
}

export function ModeButton({
  icon,
  label,
  sub,
  delay,
  highlight = false,
  onClick,
}: ModeButtonProps): React.JSX.Element {
  const className = ['btn', styles.button, highlight ? styles.highlight : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={className}
      onClick={onClick}
      style={{ '--item-delay': `${delay}s` } as React.CSSProperties}
      type="button"
    >
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <div>{label}</div>
        <div className={styles.sub}>{sub}</div>
      </div>
      <span className={styles.arrow}>→</span>
    </button>
  );
}
