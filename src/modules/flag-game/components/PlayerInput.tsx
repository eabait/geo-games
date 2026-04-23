import React from 'react';

import styles from './PlayerInput.module.css';

interface PlayerInputProps {
  index: number;
  value: string;
  avatar: string;
  isLast: boolean;
  showRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  onEnter: () => void;
}

export function PlayerInput({
  index,
  value,
  avatar,
  isLast,
  showRemove,
  onChange,
  onRemove,
  onEnter,
}: PlayerInputProps): React.JSX.Element {
  return (
    <div className={styles.row}>
      <span className={styles.avatar}>{avatar}</span>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && isLast && onEnter()}
        placeholder={`Jugador ${index + 1}`}
      />
      {showRemove && (
        <button
          aria-label={`Eliminar jugador ${index + 1}`}
          className={styles.removeButton}
          onClick={onRemove}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
