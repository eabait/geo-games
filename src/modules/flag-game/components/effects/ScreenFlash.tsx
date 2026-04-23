import React from 'react';

import styles from './ScreenFlash.module.css';

interface ScreenFlashProps {
  active: boolean;
  correct: boolean;
}

export function ScreenFlash({ active, correct }: ScreenFlashProps): React.JSX.Element | null {
  if (!active) return null;
  const className = [styles.flash, correct ? styles.correct : styles.wrong].join(' ');
  return <div className={className} />;
}
