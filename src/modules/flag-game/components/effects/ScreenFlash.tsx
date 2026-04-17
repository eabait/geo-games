import React from 'react';
interface ScreenFlashProps {
  active: boolean;
  correct: boolean;
}

export function ScreenFlash({ active, correct }: ScreenFlashProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 150,
        background: correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
        animation: 'screenFlash 0.6s ease-out forwards',
      }}
    />
  );
}
