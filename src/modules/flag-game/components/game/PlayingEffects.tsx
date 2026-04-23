import React from 'react';

import { Confetti } from '../effects/Confetti';
import { FloatingEmojis } from '../effects/FloatingEmojis';
import { ScreenFlash } from '../effects/ScreenFlash';

interface PlayingEffectsProps {
  flashCorrect: boolean;
  showConfetti: boolean;
  showFloatingEmojis: boolean;
  showScreenFlash: boolean;
}

export function PlayingEffects({
  flashCorrect,
  showConfetti,
  showFloatingEmojis,
  showScreenFlash,
}: PlayingEffectsProps): React.JSX.Element {
  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
    </>
  );
}
