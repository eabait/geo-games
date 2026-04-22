# Component Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose 11 large screen components into focused, reusable sub-components to improve code quality and eliminate all 48 ESLint warnings.

**Architecture:** Screen-first decomposition — extract shared sub-components as we encounter them working through each screen, starting with the three highest-complexity playing screens. Shared components live in `src/modules/flag-game/components/game/`; standalone UI atoms live in `src/modules/flag-game/components/`.

**Tech Stack:** React 18, TypeScript, Vitest, React Testing Library, inline styles (no CSS-in-JS library).

---

## File Map

**Create:**
- `src/modules/flag-game/components/game/PlayingHeader.tsx`
- `src/modules/flag-game/components/game/PlayingHeader.test.tsx`
- `src/modules/flag-game/components/game/TimerBar.tsx`
- `src/modules/flag-game/components/game/TimerBar.test.tsx`
- `src/modules/flag-game/components/game/FlagCard.tsx`
- `src/modules/flag-game/components/game/FlagCard.test.tsx`
- `src/modules/flag-game/components/game/HintSection.tsx`
- `src/modules/flag-game/components/game/HintSection.test.tsx`
- `src/modules/flag-game/components/game/AnswerFeedback.tsx`
- `src/modules/flag-game/components/game/AnswerFeedback.test.tsx`
- `src/modules/flag-game/components/game/ExplorerStatsBar.tsx`
- `src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx`
- `src/modules/flag-game/components/game/RoundHistoryTable.tsx`
- `src/modules/flag-game/components/game/RoundHistoryTable.test.tsx`
- `src/modules/flag-game/components/game/StatsCard.tsx`
- `src/modules/flag-game/components/game/StatsCard.test.tsx`
- `src/modules/flag-game/components/game/Podium.tsx`
- `src/modules/flag-game/components/game/Podium.test.tsx`
- `src/modules/flag-game/components/ModeButton.tsx`
- `src/modules/flag-game/components/ModeButton.test.tsx`
- `src/modules/flag-game/components/DifficultyButton.tsx`
- `src/modules/flag-game/components/DifficultyButton.test.tsx`
- `src/modules/flag-game/components/PlayerInput.tsx`
- `src/modules/flag-game/components/PlayerInput.test.tsx`

**Modify:**
- `src/modules/flag-game/screens/SoloPlayingScreen.tsx`
- `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`
- `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`
- `src/modules/flag-game/screens/ResultsScreen.tsx`
- `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`
- `src/modules/flag-game/screens/FamilyResultsScreen.tsx`
- `src/modules/flag-game/screens/MenuScreen.tsx`
- `src/modules/flag-game/screens/DifficultyScreen.tsx`
- `src/modules/flag-game/screens/FamilySetupScreen.tsx`
- `src/modules/flag-game/components/OptionButton.tsx`

---

## Task 1: PlayingHeader

The nav shell shared by all three playing screens. Accepts `leftSlot` and `rightSlot` as ReactNode.

**Files:**
- Create: `src/modules/flag-game/components/game/PlayingHeader.tsx`
- Create: `src/modules/flag-game/components/game/PlayingHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/flag-game/components/game/PlayingHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayingHeader } from './PlayingHeader';

describe('PlayingHeader', () => {
  it('renders leftSlot content', () => {
    render(<PlayingHeader leftSlot={<span>left content</span>} rightSlot={<span>right</span>} />);
    expect(screen.getByText('left content')).toBeInTheDocument();
  });

  it('renders rightSlot content', () => {
    render(<PlayingHeader leftSlot={<span>left</span>} rightSlot={<span>right content</span>} />);
    expect(screen.getByText('right content')).toBeInTheDocument();
  });

  it('uses marginBottom 12 by default', () => {
    const { container } = render(
      <PlayingHeader leftSlot={<span>l</span>} rightSlot={<span>r</span>} />,
    );
    expect(container.firstChild).toHaveStyle({ marginBottom: '12px' });
  });

  it('accepts a custom marginBottom', () => {
    const { container } = render(
      <PlayingHeader leftSlot={<span>l</span>} rightSlot={<span>r</span>} marginBottom={6} />,
    );
    expect(container.firstChild).toHaveStyle({ marginBottom: '6px' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/PlayingHeader.test.tsx
```

Expected: FAIL — `PlayingHeader` does not exist yet.

- [ ] **Step 3: Create PlayingHeader**

```tsx
// src/modules/flag-game/components/game/PlayingHeader.tsx
import React from 'react';

interface PlayingHeaderProps {
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
  marginBottom?: number;
}

export function PlayingHeader({
  leftSlot,
  rightSlot,
  marginBottom = 12,
}: PlayingHeaderProps): React.JSX.Element {
  return (
    <nav
      style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{leftSlot}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
        {rightSlot}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/PlayingHeader.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/game/PlayingHeader.tsx src/modules/flag-game/components/game/PlayingHeader.test.tsx
git commit -m "feat: add PlayingHeader component"
```

---

## Task 2: TimerBar

The animated progress bar used in Solo and Family playing screens.

**Files:**
- Create: `src/modules/flag-game/components/game/TimerBar.tsx`
- Create: `src/modules/flag-game/components/game/TimerBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/flag-game/components/game/TimerBar.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TimerBar } from './TimerBar';

describe('TimerBar', () => {
  it('sets bar width based on pct prop', () => {
    const { container } = render(<TimerBar pct={75} color="#22c55e" urgent={false} />);
    const bar = container.querySelector('div > div') as HTMLElement;
    expect(bar).toHaveStyle({ width: '75%' });
  });

  it('applies the given color to the inner bar', () => {
    const { container } = render(<TimerBar pct={50} color="#ef4444" urgent={false} />);
    const bar = container.querySelector('div > div') as HTMLElement;
    expect(bar).toHaveStyle({ background: '#ef4444' });
  });

  it('applies timerPulse animation when urgent is true', () => {
    const { container } = render(<TimerBar pct={20} color="#ef4444" urgent={true} />);
    const bar = container.querySelector('div > div') as HTMLElement;
    expect(bar).toHaveStyle({ animation: 'timerPulse .5s ease infinite' });
  });

  it('has no animation when urgent is false', () => {
    const { container } = render(<TimerBar pct={80} color="#22c55e" urgent={false} />);
    const bar = container.querySelector('div > div') as HTMLElement;
    expect(bar).toHaveStyle({ animation: 'none' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/TimerBar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create TimerBar**

```tsx
// src/modules/flag-game/components/game/TimerBar.tsx
import React from 'react';

interface TimerBarProps {
  pct: number;
  color: string;
  urgent: boolean;
}

export function TimerBar({ pct, color, urgent }: TimerBarProps): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        height: 6,
        background: 'rgba(255,255,255,.08)',
        borderRadius: 4,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 1s linear',
          animation: urgent ? 'timerPulse .5s ease infinite' : 'none',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/TimerBar.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/game/TimerBar.tsx src/modules/flag-game/components/game/TimerBar.test.tsx
git commit -m "feat: add TimerBar component"
```

---

## Task 3: FlagCard

The large flag emoji card with continent pill used in Solo and Family screens.

**Files:**
- Create: `src/modules/flag-game/components/game/FlagCard.tsx`
- Create: `src/modules/flag-game/components/game/FlagCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/flag-game/components/game/FlagCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlagCard } from './FlagCard';
import type { Flag } from '../../types';

const flag: Flag = {
  code: '🇦🇷',
  name: 'Argentina',
  continent: 'América',
  hint: 'South America',
  tier: 1,
  pos: [-34, -64],
};

describe('FlagCard', () => {
  it('renders the flag emoji code', () => {
    render(<FlagCard flag={flag} />);
    expect(screen.getByText('🇦🇷')).toBeInTheDocument();
  });

  it('renders the continent name', () => {
    render(<FlagCard flag={flag} />);
    expect(screen.getByText('América')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/FlagCard.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create FlagCard**

```tsx
// src/modules/flag-game/components/game/FlagCard.tsx
import React from 'react';
import type { Flag } from '../../types';

interface FlagCardProps {
  flag: Flag;
}

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FlagCard({ flag }: FlagCardProps): React.JSX.Element {
  return (
    <>
      <div
        style={{
          ...CARD,
          padding: '32px 40px',
          marginBottom: 8,
          animation: 'flagEnter .6s cubic-bezier(.34,1.56,.64,1) both',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'clamp(80px,20vw,120px)', lineHeight: 1 }}>{flag.code}</div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#64748b',
          background: 'rgba(255,255,255,.06)',
          padding: '4px 12px',
          borderRadius: 20,
          marginBottom: 20,
        }}
      >
        {flag.continent}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/FlagCard.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/game/FlagCard.tsx src/modules/flag-game/components/game/FlagCard.test.tsx
git commit -m "feat: add FlagCard component"
```

---

## Task 4: HintSection

The hint button + revealed hint text, shared across all three playing screens.

**Files:**
- Create: `src/modules/flag-game/components/game/HintSection.tsx`
- Create: `src/modules/flag-game/components/game/HintSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/flag-game/components/game/HintSection.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HintSection } from './HintSection';

describe('HintSection', () => {
  it('renders the hint button when showHint is false', () => {
    render(
      <HintSection
        hint="South America"
        showHint={false}
        onShowHint={vi.fn()}
        accentColor="#fbbf24"
      />,
    );
    expect(screen.getByRole('button', { name: /pista/i })).toBeInTheDocument();
  });

  it('shows hint cost in button label when hintCost is provided', () => {
    render(
      <HintSection
        hint="South America"
        showHint={false}
        onShowHint={vi.fn()}
        hintCost={5}
        accentColor="#fbbf24"
      />,
    );
    expect(screen.getByRole('button', { name: /-5 pts/i })).toBeInTheDocument();
  });

  it('does not show cost text when hintCost is omitted', () => {
    render(
      <HintSection
        hint="South America"
        showHint={false}
        onShowHint={vi.fn()}
        accentColor="#fbbf24"
      />,
    );
    expect(screen.queryByText(/pts/i)).not.toBeInTheDocument();
  });

  it('renders hint text when showHint is true', () => {
    render(
      <HintSection
        hint="South America"
        showHint={true}
        onShowHint={vi.fn()}
        accentColor="#fbbf24"
      />,
    );
    expect(screen.getByText(/south america/i)).toBeInTheDocument();
  });

  it('does not render the button when showHint is true', () => {
    render(
      <HintSection
        hint="South America"
        showHint={true}
        onShowHint={vi.fn()}
        accentColor="#fbbf24"
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onShowHint when the hint button is clicked', async () => {
    const onShowHint = vi.fn();
    render(
      <HintSection
        hint="South America"
        showHint={false}
        onShowHint={onShowHint}
        accentColor="#fbbf24"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /pista/i }));
    expect(onShowHint).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/HintSection.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create HintSection**

```tsx
// src/modules/flag-game/components/game/HintSection.tsx
import React from 'react';

interface HintSectionProps {
  hint: string;
  showHint: boolean;
  onShowHint: () => void;
  hintCost?: number;
  accentColor: string;
  compact?: boolean;
}

export function HintSection({
  hint,
  showHint,
  onShowHint,
  hintCost,
  accentColor,
  compact = false,
}: HintSectionProps): React.JSX.Element {
  if (showHint) {
    return (
      <div
        style={{
          fontSize: compact ? 12 : 14,
          color: accentColor,
          marginBottom: compact ? 4 : 16,
          fontStyle: 'italic',
          animation: 'popIn .3s ease',
        }}
      >
        💡 {hint}
      </div>
    );
  }

  return (
    <nav>
      <button
        onClick={onShowHint}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,.1)',
          color: '#94a3b8',
          padding: compact ? '3px 12px' : '6px 16px',
          borderRadius: compact ? 10 : 12,
          fontSize: compact ? 12 : 13,
          cursor: 'pointer',
          marginBottom: compact ? 4 : 16,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        💡 Pista{hintCost !== undefined ? ` (-${hintCost} pts)` : ''}
      </button>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/HintSection.test.tsx
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/game/HintSection.tsx src/modules/flag-game/components/game/HintSection.test.tsx
git commit -m "feat: add HintSection component"
```

---

## Task 5: AnswerFeedback

The correct/wrong/timeout message shown after answering, shared across all three playing screens.

**Files:**
- Create: `src/modules/flag-game/components/game/AnswerFeedback.tsx`
- Create: `src/modules/flag-game/components/game/AnswerFeedback.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/flag-game/components/game/AnswerFeedback.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnswerFeedback } from './AnswerFeedback';
import { STREAK_SOUND_THRESHOLD } from '../../data/constants';
import type { Flag } from '../../types';

const currentFlag: Flag = {
  code: '🇦🇷',
  name: 'Argentina',
  continent: 'América',
  hint: 'South America',
  tier: 1,
  pos: [-34, -64],
};
const wrongFlag: Flag = {
  code: '🇧🇷',
  name: 'Brasil',
  continent: 'América',
  hint: 'Largest country',
  tier: 1,
  pos: [-10, -55],
};

describe('AnswerFeedback', () => {
  it('renders nothing when selected is null and timeLeft > 0', () => {
    const { container } = render(
      <AnswerFeedback
        selected={null}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={10}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows correct message when answer matches current flag', () => {
    render(
      <AnswerFeedback
        selected={currentFlag}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={10}
      />,
    );
    expect(screen.getByText(/correcto/i)).toBeInTheDocument();
  });

  it('shows streak message when streak meets threshold', () => {
    render(
      <AnswerFeedback
        selected={currentFlag}
        currentFlag={currentFlag}
        streak={STREAK_SOUND_THRESHOLD}
        timeLeft={10}
      />,
    );
    expect(screen.getByText(/imparable/i)).toBeInTheDocument();
  });

  it('shows wrong message with flag name when answer is incorrect', () => {
    render(
      <AnswerFeedback
        selected={wrongFlag}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={10}
      />,
    );
    expect(screen.getByText(/Era Argentina/i)).toBeInTheDocument();
  });

  it('shows timeout message when selected is null and timeLeft is 0', () => {
    render(
      <AnswerFeedback
        selected={null}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={0}
      />,
    );
    expect(screen.getByText(/tiempo/i)).toBeInTheDocument();
    expect(screen.getByText(/Argentina/i)).toBeInTheDocument();
  });

  it('appends correctBonusLabel to correct message when provided', () => {
    render(
      <AnswerFeedback
        selected={currentFlag}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={10}
        correctBonusLabel="+3s"
      />,
    );
    expect(screen.getByText(/\+3s/)).toBeInTheDocument();
  });

  it('does not show timeout message when compact is true', () => {
    const { container } = render(
      <AnswerFeedback
        selected={null}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={0}
        compact={true}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('uses wrongPrefix when provided', () => {
    render(
      <AnswerFeedback
        selected={wrongFlag}
        currentFlag={currentFlag}
        streak={0}
        timeLeft={10}
        wrongPrefix=""
      />,
    );
    expect(screen.getByText(/❌ Argentina/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/AnswerFeedback.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create AnswerFeedback**

```tsx
// src/modules/flag-game/components/game/AnswerFeedback.tsx
import React from 'react';
import { STREAK_SOUND_THRESHOLD } from '../../data/constants';
import type { Flag } from '../../types';

interface AnswerFeedbackProps {
  selected: Flag | null;
  currentFlag: Flag;
  streak: number;
  timeLeft: number;
  correctBonusLabel?: string;
  wrongPrefix?: string;
  compact?: boolean;
}

export function AnswerFeedback({
  selected,
  currentFlag,
  streak,
  timeLeft,
  correctBonusLabel,
  wrongPrefix = 'Era ',
  compact = false,
}: AnswerFeedbackProps): React.JSX.Element | null {
  const fontSize = compact ? 14 : 16;
  const marginTop = compact ? 0 : 16;

  if (selected) {
    const isCorrect = selected.name === currentFlag.name;
    let message: string;
    if (isCorrect) {
      message =
        correctBonusLabel !== undefined
          ? `🎉 ¡Correcto! ${correctBonusLabel}`
          : streak >= STREAK_SOUND_THRESHOLD
            ? '🔥 ¡Imparable!'
            : '🎉 ¡Correcto!';
    } else {
      message = `❌ ${wrongPrefix}${currentFlag.name}`;
    }
    return (
      <div
        style={{
          marginTop,
          fontSize,
          fontWeight: 700,
          animation: 'popIn .4s ease',
          color: isCorrect ? '#22c55e' : '#ef4444',
        }}
      >
        {message}
      </div>
    );
  }

  if (!compact && timeLeft === 0) {
    return (
      <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
        ⏱️ ¡Tiempo! Era {currentFlag.name}
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/AnswerFeedback.test.tsx
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/game/AnswerFeedback.tsx src/modules/flag-game/components/game/AnswerFeedback.test.tsx
git commit -m "feat: add AnswerFeedback component"
```

---

## Task 6: Refactor SoloPlayingScreen

Replace the inline header, timer bar, flag card, hint section, and answer feedback with the components from Tasks 1–5.

**Files:**
- Modify: `src/modules/flag-game/screens/SoloPlayingScreen.tsx`

- [ ] **Step 1: Replace SoloPlayingScreen with the refactored version**

```tsx
// src/modules/flag-game/screens/SoloPlayingScreen.tsx
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useGameRound } from '../hooks/useGameRound';
import { useTimer } from '../hooks/useTimer';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { Sparkles } from '../components/effects/Sparkles';
import { OptionButton } from '../components/OptionButton';
import { PlayingHeader } from '../components/game/PlayingHeader';
import { TimerBar } from '../components/game/TimerBar';
import { FlagCard } from '../components/game/FlagCard';
import { HintSection } from '../components/game/HintSection';
import { AnswerFeedback } from '../components/game/AnswerFeedback';
import {
  DIFFICULTY,
  SOLO_R,
  SCORE_POP_DURATION_MS,
  TICK_THRESHOLD,
  TICK_URGENT_THRESHOLD,
  TIMER_PCT_GREEN,
  TIMER_PCT_YELLOW,
  TIMER_PCT_FULL,
  STREAK_BONUS_THRESHOLD,
  DEFAULT_ROUND_SECONDS,
} from '../data/constants';

const ACCENT = '#fbbf24';

export function SoloPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect, showSparkles } =
    useVisualEffects();

  const { currentFlag, options, selected, showHint, round, score, streak, setShowHint } =
    useGameStore();
  const diff = DIFFICULTY[useGameStore((state) => state.difficulty ?? 'easy')];

  const [scorePop, setScorePop] = useState(false);
  useEffect(() => {
    if (score > 0) {
      setScorePop(true);
      const timer = setTimeout(() => setScorePop(false), SCORE_POP_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const { handleAnswer } = useGameRound(sfx);
  const { timeLeft } = useTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    active: !!currentFlag && selected === null,
    onTick: (t) => {
      if (t <= TICK_THRESHOLD && t > TICK_URGENT_THRESHOLD) sfx('tick');
      else if (t <= TICK_URGENT_THRESHOLD) sfx('tickUrgent');
    },
    onExpire: () => { sfx('timeout'); handleAnswer(null); },
  });

  if (!currentFlag)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * TIMER_PCT_FULL : TIMER_PCT_FULL;
  const timerColor =
    timerPct > TIMER_PCT_GREEN ? '#22c55e' : timerPct > TIMER_PCT_YELLOW ? '#eab308' : '#ef4444';

  const leftSlot = (
    <>
      <button
        onClick={() => navigate('/flag-game')}
        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: 4 }}
      >
        🏠
      </button>
      <span style={{ fontSize: 13, color: '#64748b' }}>
        <span style={{ color: ACCENT, fontWeight: 700, fontSize: 15 }}>{round + 1}</span>/{SOLO_R}
      </span>
    </>
  );

  const rightSlot = (
    <>
      {streak >= STREAK_BONUS_THRESHOLD && (
        <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700, animation: 'pulse 1s infinite' }}>
          🔥x{streak}
        </span>
      )}
      <Sparkles active={showSparkles} />
      <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: ACCENT, animation: scorePop ? 'scorePop .4s ease' : 'none' }}>
        {score}
      </span>
    </>
  );

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <PlayingHeader leftSlot={leftSlot} rightSlot={rightSlot} />
        <TimerBar pct={timerPct} color={timerColor} urgent={timeLeft <= TICK_THRESHOLD && !selected} />
        <FlagCard flag={currentFlag} />
        {(!selected || showHint) && (
          <HintSection hint={currentFlag.hint} showHint={showHint} onShowHint={() => { sfx('hint'); setShowHint(true); }} hintCost={diff?.hintCost} accentColor={ACCENT} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420 }}>
          {options.map((opt, i) => (
            <OptionButton key={opt.name} opt={opt} index={i} selected={selected} currentFlag={currentFlag} onAnswer={handleAnswer} />
          ))}
        </div>
        <AnswerFeedback selected={selected} currentFlag={currentFlag} streak={streak} timeLeft={timeLeft} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run TypeScript and existing tests**

```bash
npx tsc --noEmit && npx vitest run src/modules/flag-game/screens/SoloPlayingScreen.test.tsx
```

Expected: tsc clean, tests PASS.

- [ ] **Step 3: Verify ESLint warning count dropped**

```bash
npx eslint src/modules/flag-game/screens/SoloPlayingScreen.tsx 2>/dev/null | grep -c warning || echo 0
```

Expected: 0 warnings for this file.

- [ ] **Step 4: Commit**

```bash
git add src/modules/flag-game/screens/SoloPlayingScreen.tsx
git commit -m "refactor: decompose SoloPlayingScreen into sub-components"
```

---

## Task 7: Refactor FamilyPlayingScreen

Apply the same five components. Family differs in that header shows player info and the timer bar uses the player's color.

**Files:**
- Modify: `src/modules/flag-game/screens/FamilyPlayingScreen.tsx`

- [ ] **Step 1: Replace FamilyPlayingScreen with the refactored version**

```tsx
// src/modules/flag-game/screens/FamilyPlayingScreen.tsx
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useGameRound } from '../hooks/useGameRound';
import { useTimer } from '../hooks/useTimer';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { Sparkles } from '../components/effects/Sparkles';
import { OptionButton } from '../components/OptionButton';
import { PlayingHeader } from '../components/game/PlayingHeader';
import { TimerBar } from '../components/game/TimerBar';
import { FlagCard } from '../components/game/FlagCard';
import { HintSection } from '../components/game/HintSection';
import { AnswerFeedback } from '../components/game/AnswerFeedback';
import {
  DIFFICULTY,
  RPP,
  SCORE_POP_DURATION_MS,
  TICK_THRESHOLD,
  TICK_URGENT_THRESHOLD,
  TIMER_PCT_FULL,
  STREAK_BONUS_THRESHOLD,
  DEFAULT_ROUND_SECONDS,
} from '../data/constants';
import type { Flag } from '../types';

export function FamilyPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect, showSparkles } =
    useVisualEffects();

  const {
    currentFlag, options, selected, showHint, players, currentPlayerIdx,
    playerRound, familyScores, familyStreaks, difficulty, setShowHint,
  } = useGameStore();

  const diff = DIFFICULTY[difficulty ?? 'easy'];
  const cp = players[currentPlayerIdx] ?? null;

  const [scorePop, setScorePop] = useState(false);
  const cpScore = cp ? (familyScores[cp.id] ?? 0) : 0;
  useEffect(() => {
    if (cpScore > 0) {
      setScorePop(true);
      const timer = setTimeout(() => setScorePop(false), SCORE_POP_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [cpScore]);

  const { handleAnswer } = useGameRound(sfx);
  const { timeLeft } = useTimer({
    seconds: diff?.time ?? DEFAULT_ROUND_SECONDS,
    active: !!currentFlag && selected === null,
    onTick: (t) => {
      if (t <= TICK_THRESHOLD && t > TICK_URGENT_THRESHOLD) sfx('tick');
      else if (t <= TICK_URGENT_THRESHOLD) sfx('tickUrgent');
    },
    onExpire: () => { sfx('timeout'); handleAnswer(null); },
  });

  if (!currentFlag || !cp)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerPct = diff ? (timeLeft / diff.time) * TIMER_PCT_FULL : TIMER_PCT_FULL;
  const cpStreak = familyStreaks[cp.id] ?? 0;

  const leftSlot = (
    <>
      <button
        onClick={() => navigate('/flag-game')}
        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '4px' }}
      >
        🏠
      </button>
      <span style={{ fontSize: 20 }}>{cp.avatar}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color: cp.color }}>{cp.name}</span>
      <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{playerRound + 1}/{RPP}</span>
    </>
  );

  const rightSlot = (
    <>
      {cpStreak >= STREAK_BONUS_THRESHOLD && (
        <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700, animation: 'pulse 1s infinite' }}>
          🔥x{cpStreak}
        </span>
      )}
      <Sparkles active={showSparkles} />
      <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: cp.color, animation: scorePop ? 'scorePop .4s ease' : 'none' }}>
        {cpScore}
      </span>
    </>
  );

  const onAnswer = (opt: Flag): void => { handleAnswer(opt); };

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <PlayingHeader leftSlot={leftSlot} rightSlot={rightSlot} />
        <TimerBar pct={timerPct} color={cp.color} urgent={timeLeft <= TICK_THRESHOLD && !selected} />
        <FlagCard flag={currentFlag} />
        {(!selected || showHint) && (
          <HintSection hint={currentFlag.hint} showHint={showHint} onShowHint={() => { sfx('hint'); setShowHint(true); }} hintCost={diff?.hintCost} accentColor={cp.color} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420 }}>
          {options.map((opt, i) => (
            <OptionButton key={opt.name} opt={opt} index={i} selected={selected} currentFlag={currentFlag} onAnswer={onAnswer} />
          ))}
        </div>
        <AnswerFeedback selected={selected} currentFlag={currentFlag} streak={cpStreak} timeLeft={timeLeft} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run TypeScript and tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/modules/flag-game/screens/FamilyPlayingScreen.tsx
git commit -m "refactor: decompose FamilyPlayingScreen into sub-components"
```

---

## Task 8: ExplorerStatsBar + Refactor ExplorerPlayingScreen

Create ExplorerStatsBar, then apply PlayingHeader, HintSection, AnswerFeedback, and ExplorerStatsBar to ExplorerPlayingScreen. Explorer does not use TimerBar or FlagCard.

**Files:**
- Create: `src/modules/flag-game/components/game/ExplorerStatsBar.tsx`
- Create: `src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx`
- Modify: `src/modules/flag-game/screens/ExplorerPlayingScreen.tsx`

- [ ] **Step 1: Write the failing ExplorerStatsBar test**

```tsx
// src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExplorerStatsBar } from './ExplorerStatsBar';

describe('ExplorerStatsBar', () => {
  it('renders the score', () => {
    render(<ExplorerStatsBar score={42} correct={5} total={8} bestStreak={3} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders correct/total ratio', () => {
    render(<ExplorerStatsBar score={42} correct={5} total={8} bestStreak={3} />);
    expect(screen.getByText('5/8')).toBeInTheDocument();
  });

  it('renders the best streak', () => {
    render(<ExplorerStatsBar score={42} correct={5} total={8} bestStreak={3} />);
    expect(screen.getByText('🔥3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create ExplorerStatsBar**

```tsx
// src/modules/flag-game/components/game/ExplorerStatsBar.tsx
import React from 'react';

interface ExplorerStatsBarProps {
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
}

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ExplorerStatsBar({
  score,
  correct,
  total,
  bestStreak,
}: ExplorerStatsBarProps): React.JSX.Element {
  return (
    <div
      style={{
        ...CARD,
        padding: '8px 20px',
        marginTop: 4,
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        justifyContent: 'space-around',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#64748b' }}>Puntos</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
          {score}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#64748b' }}>Aciertos</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, color: '#22c55e' }}>
          {correct}/{total}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#64748b' }}>Racha</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, color: '#f97316' }}>
          🔥{bestStreak}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run ExplorerStatsBar test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Replace ExplorerPlayingScreen with refactored version**

```tsx
// src/modules/flag-game/screens/ExplorerPlayingScreen.tsx
import React from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { Confetti } from '../components/effects/Confetti';
import { FloatingEmojis } from '../components/effects/FloatingEmojis';
import { ScreenFlash } from '../components/effects/ScreenFlash';
import { MobileMap } from '../components/MobileMap';
import { PlayingHeader } from '../components/game/PlayingHeader';
import { HintSection } from '../components/game/HintSection';
import { AnswerFeedback } from '../components/game/AnswerFeedback';
import { ExplorerStatsBar } from '../components/game/ExplorerStatsBar';
import {
  DIFFICULTY,
  EXPLORER_STREAK_THRESHOLD,
  EXPLORER_NEXT_DELAY_MS,
  EXPLORER_TIMER_RED,
  EXPLORER_TIMER_YELLOW,
} from '../data/constants';
import { FLAGS } from '../data/flags';
import { shuffle, pickRandom } from '../data/utils';
import type { Flag } from '../types';

const ACCENT = '#fbbf24';

export function ExplorerPlayingScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { soundOn, continent } = useSettingsStore();
  const sounds = useSoundEngine(soundOn);
  const sfx = useCallback(
    (name: string) => sounds.current[name as keyof typeof sounds.current]?.(),
    [sounds],
  );

  const { showConfetti, showFloatingEmojis, showScreenFlash, flashCorrect } = useVisualEffects();

  const {
    currentFlag, options, selected, showHint, difficulty, usedFlags,
    explorerTime, explorerScore, explorerCorrect, explorerTotal,
    explorerBestStreak, explorerStreak, setRoundData, recordExplorerAnswer,
    tickExplorerTime, setShowHint,
  } = useGameStore();

  const diff = DIFFICULTY[difficulty ?? 'easy'];

  useEffect(() => {
    if (currentFlag || !difficulty) return;
    const base = continent === 'Todos' ? FLAGS : FLAGS.filter((f) => f.continent === continent);
    const pool = base.filter((f) => f.tier <= diff.maxTier);
    const available = pool.filter((f) => !usedFlags.includes(f.name));
    const pickFrom = available.length >= diff.options ? available : pool;
    const flag = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const wrong = pickRandom(pool.length >= diff.options ? pool : FLAGS, diff.options - 1, [flag]);
    setRoundData(flag, shuffle([flag, ...wrong]));
  }, [currentFlag, difficulty, usedFlags, continent, diff, setRoundData]);

  useEffect(() => {
    if (explorerTime <= 0) { navigate('/flag-game/explorer/results'); return; }
    const id = setInterval(() => { tickExplorerTime(); }, EXPLORER_NEXT_DELAY_MS);
    return () => clearInterval(id);
  }, [explorerTime, tickExplorerTime, navigate]);

  const handleAnswer = useCallback(
    (opt: Flag): void => {
      if (selected !== null || !currentFlag) return;
      const correct = opt.name === currentFlag.name;
      if (correct) sfx(explorerStreak >= EXPLORER_STREAK_THRESHOLD ? 'streak' : 'correct');
      else sfx('wrong');
      useGameStore.setState((state) => { state.selected = opt; });
      recordExplorerAnswer(correct);
      setTimeout(() => {
        useGameStore.setState((state) => {
          state.currentFlag = null;
          state.selected = null;
          state.showHint = false;
        });
      }, EXPLORER_NEXT_DELAY_MS);
    },
    [selected, currentFlag, sfx, explorerStreak, recordExplorerAnswer],
  );

  if (!currentFlag)
    return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const timerColor =
    explorerTime <= EXPLORER_TIMER_RED ? '#ef4444'
      : explorerTime <= EXPLORER_TIMER_YELLOW ? '#eab308'
        : ACCENT;

  const leftSlot = (
    <>
      <button
        onClick={() => navigate('/flag-game')}
        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '4px', marginRight: 4 }}
      >
        🏠
      </button>
      {explorerStreak >= EXPLORER_STREAK_THRESHOLD && (
        <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700, animation: 'pulse 1s infinite' }}>
          🔥x{explorerStreak}
        </span>
      )}
      <span style={{ fontSize: 13, color: '#94a3b8' }}>{explorerCorrect} acertadas</span>
    </>
  );

  const rightSlot = (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 14 }}>⏱️</span>
      <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 700, color: timerColor, animation: explorerTime <= EXPLORER_TIMER_RED ? 'pulse .5s infinite' : 'none' }}>
        {explorerTime}s
      </span>
    </div>
  );

  return (
    <>
      <Confetti active={showConfetti} />
      <FloatingEmojis active={showFloatingEmojis} />
      <ScreenFlash active={showScreenFlash} correct={flashCorrect} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 12px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <PlayingHeader leftSlot={leftSlot} rightSlot={rightSlot} marginBottom={6} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, animation: 'flagEnter .5s cubic-bezier(.34,1.56,.64,1) both' }}>
          <span style={{ fontSize: 50, lineHeight: 1 }}>{currentFlag.code}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>¿Dónde queda?</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{currentFlag.continent}</div>
          </div>
        </div>
        {(selected === null || showHint) && (
          <HintSection hint={currentFlag.hint} showHint={showHint} onShowHint={() => { sfx('hint'); setShowHint(true); }} accentColor={ACCENT} compact />
        )}
        <div style={{ width: '100%', maxWidth: 420, marginBottom: 6 }}>
          <MobileMap options={options} correctName={currentFlag.name} selected={selected} onSelect={handleAnswer} />
        </div>
        <AnswerFeedback selected={selected} currentFlag={currentFlag} streak={explorerStreak} timeLeft={explorerTime} correctBonusLabel="+3s" wrongPrefix="" compact />
        <ExplorerStatsBar score={explorerScore} correct={explorerCorrect} total={explorerTotal} bestStreak={explorerBestStreak} />
      </div>
    </>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/game/ExplorerStatsBar.tsx src/modules/flag-game/components/game/ExplorerStatsBar.test.tsx src/modules/flag-game/screens/ExplorerPlayingScreen.tsx
git commit -m "feat: add ExplorerStatsBar; refactor ExplorerPlayingScreen"
```

---

## Task 9: Refactor OptionButton (reduce complexity)

Extract the three inline ternary chains into named helper functions. No prop changes.

**Files:**
- Modify: `src/modules/flag-game/components/OptionButton.tsx`

- [ ] **Step 1: Replace OptionButton with the refactored version**

```tsx
// src/modules/flag-game/components/OptionButton.tsx
import React from 'react';

import {
  OPTION_ANIM_BASE_DELAY,
  OPTION_ANIM_STEP_DELAY,
  OPTION_FADE_OPACITY,
  CHAR_CODE_A,
} from '../data/constants';
import type { Flag } from '../types';

interface OptionButtonProps {
  opt: Flag;
  index: number;
  selected: Flag | null;
  currentFlag: Flag;
  onAnswer: (opt: Flag) => void;
}

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

function getButtonBackground(selected: Flag | null, isCorrect: boolean, isSel: boolean): string {
  if (!selected) return 'rgba(255,255,255,.06)';
  if (isCorrect) return 'rgba(34,197,94,.18)';
  if (isSel) return 'rgba(239,68,68,.18)';
  return 'rgba(255,255,255,.06)';
}

function getButtonBorderColor(selected: Flag | null, isCorrect: boolean, isSel: boolean): string {
  if (!selected) return 'rgba(255,255,255,.1)';
  if (isCorrect) return '#22c55e';
  if (isSel) return '#ef4444';
  return 'rgba(255,255,255,.1)';
}

function getBadgeBackground(selected: Flag | null, isCorrect: boolean, isSel: boolean): string {
  if (selected && isCorrect) return '#22c55e';
  if (selected && isSel) return '#ef4444';
  return 'rgba(255,255,255,.08)';
}

function getBadgeContent(
  selected: Flag | null,
  isCorrect: boolean,
  isSel: boolean,
  index: number,
): string {
  if (selected && isCorrect) return '✓';
  if (selected && isSel && !isCorrect) return '✗';
  return String.fromCharCode(CHAR_CODE_A + index);
}

export function OptionButton({
  opt,
  index,
  selected,
  currentFlag,
  onAnswer,
}: OptionButtonProps): React.JSX.Element {
  const isCorrect = opt.name === currentFlag.name;
  const isSel = selected?.name === opt.name;

  return (
    <button
      className="btn"
      onClick={() => onAnswer(opt)}
      disabled={selected !== null}
      style={{
        ...CARD,
        background: getButtonBackground(selected, isCorrect, isSel ?? false),
        border: `1.5px solid ${getButtonBorderColor(selected, isCorrect, isSel ?? false)}`,
        padding: '14px 20px',
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "'Nunito', sans-serif",
        cursor: selected ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: `optionEnter .4s ease ${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s both`,
        opacity: selected && !isCorrect && !isSel ? OPTION_FADE_OPACITY : 1,
        transition: 'opacity .4s',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: getBadgeBackground(selected, isCorrect, isSel ?? false),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          color: '#fff',
          transition: 'all .3s',
          transform: selected && (isCorrect || isSel) ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        {getBadgeContent(selected, isCorrect, isSel ?? false, index)}
      </span>
      {opt.name}
    </button>
  );
}
```

- [ ] **Step 2: Write a test for OptionButton (create new file)**

```tsx
// src/modules/flag-game/components/OptionButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptionButton } from './OptionButton';
import type { Flag } from '../types';

const correctFlag: Flag = { code: '🇦🇷', name: 'Argentina', continent: 'América', hint: 'hint', tier: 1, pos: [-34, -64] };
const wrongFlag: Flag = { code: '🇧🇷', name: 'Brasil', continent: 'América', hint: 'hint', tier: 1, pos: [-10, -55] };

describe('OptionButton', () => {
  it('renders the option name', () => {
    render(<OptionButton opt={correctFlag} index={0} selected={null} currentFlag={correctFlag} onAnswer={vi.fn()} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('calls onAnswer with the option when clicked', async () => {
    const onAnswer = vi.fn();
    render(<OptionButton opt={correctFlag} index={0} selected={null} currentFlag={correctFlag} onAnswer={onAnswer} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onAnswer).toHaveBeenCalledWith(correctFlag);
  });

  it('is disabled when selected is not null', () => {
    render(<OptionButton opt={wrongFlag} index={1} selected={wrongFlag} currentFlag={correctFlag} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows green background for the correct option after selection', () => {
    render(<OptionButton opt={correctFlag} index={0} selected={wrongFlag} currentFlag={correctFlag} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveStyle({ background: 'rgba(34,197,94,.18)' });
  });

  it('shows red background for the selected wrong option', () => {
    render(<OptionButton opt={wrongFlag} index={1} selected={wrongFlag} currentFlag={correctFlag} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveStyle({ background: 'rgba(239,68,68,.18)' });
  });
});
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run 2>/dev/null | tail -5
```

Expected: all pass.

- [ ] **Step 4: Verify ESLint complexity warning is gone for OptionButton**

```bash
npx eslint src/modules/flag-game/components/OptionButton.tsx 2>/dev/null | grep complexity || echo "no complexity warnings"
```

Expected: `no complexity warnings`.

- [ ] **Step 5: Commit**

```bash
git add src/modules/flag-game/components/OptionButton.tsx src/modules/flag-game/components/OptionButton.test.tsx
git commit -m "refactor: extract style helpers in OptionButton to reduce complexity"
```

---

## Task 10: RoundHistoryTable + Refactor ResultsScreen

The history table is identical in ResultsScreen and ExplorerResultsScreen.

**Files:**
- Create: `src/modules/flag-game/components/game/RoundHistoryTable.tsx`
- Create: `src/modules/flag-game/components/game/RoundHistoryTable.test.tsx`
- Modify: `src/modules/flag-game/screens/ResultsScreen.tsx`

- [ ] **Step 1: Write the failing RoundHistoryTable test**

```tsx
// src/modules/flag-game/components/game/RoundHistoryTable.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundHistoryTable } from './RoundHistoryTable';
import type { RoundResult } from '../../types';

const history: RoundResult[] = [
  { flag: { code: '🇦🇷', name: 'Argentina', continent: 'América', hint: 'h', tier: 1, pos: [-34, -64] }, correct: true },
  { flag: { code: '🇧🇷', name: 'Brasil', continent: 'América', hint: 'h', tier: 1, pos: [-10, -55] }, correct: false },
];

describe('RoundHistoryTable', () => {
  it('renders a row for each result', () => {
    render(<RoundHistoryTable history={history} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Brasil')).toBeInTheDocument();
  });

  it('shows ✅ for correct results', () => {
    render(<RoundHistoryTable history={history} />);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('shows ❌ for incorrect results', () => {
    render(<RoundHistoryTable history={history} />);
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders flag codes', () => {
    render(<RoundHistoryTable history={history} />);
    expect(screen.getByText('🇦🇷')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/RoundHistoryTable.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create RoundHistoryTable**

```tsx
// src/modules/flag-game/components/game/RoundHistoryTable.tsx
import React from 'react';
import { RESULT_ROW_ANIM_BASE, RESULT_ROW_ANIM_STEP } from '../../data/constants';
import type { RoundResult } from '../../types';

interface RoundHistoryTableProps {
  history: RoundResult[];
}

const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function RoundHistoryTable({ history }: RoundHistoryTableProps): React.JSX.Element | null {
  if (history.length === 0) return null;

  return (
    <div
      style={{
        ...CARD,
        padding: 16,
        width: '100%',
        maxWidth: 400,
        marginBottom: 24,
        marginTop: 16,
        maxHeight: 300,
        overflowY: 'auto',
      }}
    >
      {history.map((result, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 0',
            borderBottom:
              i < history.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
            animation: `resultRow .4s ease ${RESULT_ROW_ANIM_BASE + i * RESULT_ROW_ANIM_STEP}s both`,
          }}
        >
          <span style={{ fontSize: 22 }}>{result.flag.code}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{result.flag.name}</span>
          <span>{result.correct ? '✅' : '❌'}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run RoundHistoryTable test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/RoundHistoryTable.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Refactor ResultsScreen**

```tsx
// src/modules/flag-game/screens/ResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { RoundHistoryTable } from '../components/game/RoundHistoryTable';
import { SOLO_R, TROPHY_GOLD_SCORE, TROPHY_SILVER_SCORE } from '../data/constants';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { score, roundHistory, bestStreak, difficulty, startSolo } = useGameStore();

  function handleRestart(): void {
    if (difficulty) { startSolo(difficulty); navigate('/flag-game/solo/play'); }
  }

  const trophy = score > TROPHY_GOLD_SCORE ? '🏆' : score > TROPHY_SILVER_SCORE ? '🌟' : '🌍';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 64, animation: 'spinIn .6s ease both, float 2.5s ease-in-out .6s infinite', marginBottom: 8 }}>
        {trophy}
      </div>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 34, fontWeight: 700, color: ACCENT, margin: '0 0 4px' }}>
        {score} pts
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
        {roundHistory.filter((r) => r.correct).length}/{SOLO_R} · 🔥{bestStreak}
      </p>
      <RoundHistoryTable history={roundHistory} />
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleRestart} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: ACCENT, color: '#1e293b', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700 }}>
          🔄 De nuevo
        </button>
        <button className="btn" onClick={() => navigate('/flag-game')} style={{ ...CARD, padding: '12px 28px', borderRadius: 14, color: '#f1f5f9', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, background: 'transparent' }}>
          🏠 Menú
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/game/RoundHistoryTable.tsx src/modules/flag-game/components/game/RoundHistoryTable.test.tsx src/modules/flag-game/screens/ResultsScreen.tsx
git commit -m "feat: add RoundHistoryTable; refactor ResultsScreen"
```

---

## Task 11: StatsCard + Refactor ExplorerResultsScreen

**Files:**
- Create: `src/modules/flag-game/components/game/StatsCard.tsx`
- Create: `src/modules/flag-game/components/game/StatsCard.test.tsx`
- Modify: `src/modules/flag-game/screens/ExplorerResultsScreen.tsx`

- [ ] **Step 1: Write failing StatsCard test**

```tsx
// src/modules/flag-game/components/game/StatsCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';

describe('StatsCard', () => {
  it('renders the value', () => {
    render(<StatsCard value={42} label="pts" color="#fbbf24" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<StatsCard value={42} label="pts" color="#fbbf24" />);
    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('applies the color to the value element', () => {
    const { container } = render(<StatsCard value={42} label="pts" color="#fbbf24" />);
    const valueEl = container.querySelector('div > div:first-child') as HTMLElement;
    expect(valueEl).toHaveStyle({ color: '#fbbf24' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/StatsCard.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create StatsCard**

```tsx
// src/modules/flag-game/components/game/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  value: number;
  label: string;
  color: string;
}

export function StatsCard({ value, label, color }: StatsCardProps): React.JSX.Element {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 36,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run StatsCard test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/StatsCard.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Refactor ExplorerResultsScreen**

```tsx
// src/modules/flag-game/screens/ExplorerResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { StatsCard } from '../components/game/StatsCard';
import { RoundHistoryTable } from '../components/game/RoundHistoryTable';

const BLUE = '#3b82f6';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ExplorerResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { explorerScore, explorerCorrect, explorerBestStreak, explorerHistory, difficulty, startExplorer } = useGameStore();

  function handleRestart(): void {
    if (difficulty) { startExplorer(difficulty); navigate('/flag-game/explorer/play'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 64, animation: 'spinIn .6s ease both, float 2.5s ease-in-out .6s infinite', marginBottom: 8 }}>
        🗺️
      </div>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 34, fontWeight: 700, color: BLUE, margin: '0 0 4px' }}>
        ¡Tiempo!
      </h2>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, marginTop: 12 }}>
        <StatsCard value={explorerScore} label="pts" color="#fbbf24" />
        <StatsCard value={explorerCorrect} label="ok" color="#22c55e" />
        <StatsCard value={explorerBestStreak} label="🔥" color="#f97316" />
      </div>
      <RoundHistoryTable history={explorerHistory} />
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleRestart} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: BLUE, color: '#fff', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700 }}>
          🔄 De nuevo
        </button>
        <button className="btn" onClick={() => navigate('/flag-game')} style={{ ...CARD, padding: '12px 28px', borderRadius: 14, color: '#f1f5f9', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, background: 'transparent' }}>
          🏠 Menú
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/game/StatsCard.tsx src/modules/flag-game/components/game/StatsCard.test.tsx src/modules/flag-game/screens/ExplorerResultsScreen.tsx
git commit -m "feat: add StatsCard; refactor ExplorerResultsScreen"
```

---

## Task 12: Podium + Refactor FamilyResultsScreen

**Files:**
- Create: `src/modules/flag-game/components/game/Podium.tsx`
- Create: `src/modules/flag-game/components/game/Podium.test.tsx`
- Modify: `src/modules/flag-game/screens/FamilyResultsScreen.tsx`

- [ ] **Step 1: Write failing Podium test**

```tsx
// src/modules/flag-game/components/game/Podium.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Podium } from './Podium';
import type { Player } from '../../types';

const players: Player[] = [
  { id: 'p1', name: 'Ana', color: '#f59e0b', avatar: '🦁' },
  { id: 'p2', name: 'Bob', color: '#3b82f6', avatar: '🐯' },
  { id: 'p3', name: 'Cara', color: '#ef4444', avatar: '🦊' },
];
const scores: Record<string, number> = { p1: 100, p2: 70, p3: 40 };

describe('Podium', () => {
  it('renders the winner name', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('renders all three players', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Cara')).toBeInTheDocument();
  });

  it('renders the gold medal for the winner block', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('renders scores for each player', () => {
    render(<Podium sorted={players} scores={scores} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/game/Podium.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create Podium**

```tsx
// src/modules/flag-game/components/game/Podium.tsx
import React from 'react';
import {
  PODIUM_SLIDE_BASE,
  PODIUM_SLIDE_STEP,
  PODIUM_RISE_BASE,
  PODIUM_RISE_STEP,
  PODIUM_HEIGHT_FIRST,
  PODIUM_HEIGHT_SECOND,
  PODIUM_HEIGHT_THIRD,
  PODIUM_BLOCK_WIDTH,
} from '../../data/constants';
import type { Player } from '../../types';

interface PodiumProps {
  sorted: Player[];
  scores: Record<string, number>;
}

const MEDALS = ['🥈', '🥇', '🥉'];
const HEIGHTS = [PODIUM_HEIGHT_SECOND, PODIUM_HEIGHT_FIRST, PODIUM_HEIGHT_THIRD];

export function Podium({ sorted, scores }: PodiumProps): React.JSX.Element {
  const [first, second, third] = sorted;
  const podium = [second, first, third].filter(Boolean) as Player[];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 28 }}>
      {podium.map((player, idx) => (
        <div
          key={player.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: `slideUp .6s ease ${PODIUM_SLIDE_BASE + idx * PODIUM_SLIDE_STEP}s both`,
          }}
        >
          <span style={{ fontSize: 30, marginBottom: 4 }}>{player.avatar}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: player.color, marginBottom: 4 }}>
            {player.name}
          </span>
          <div
            style={{
              width: PODIUM_BLOCK_WIDTH,
              height: HEIGHTS[idx],
              borderRadius: '14px 14px 0 0',
              background: `linear-gradient(180deg,${player.color}44,${player.color}11)`,
              border: `1.5px solid ${player.color}55`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              animation: `podiumRise .6s ease ${PODIUM_RISE_BASE + idx * PODIUM_RISE_STEP}s both`,
              transformOrigin: 'bottom',
            }}
          >
            <span style={{ fontSize: 26 }}>{MEDALS[idx]}</span>
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: player.color }}>
              {scores[player.id] ?? 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run Podium test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/game/Podium.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Refactor FamilyResultsScreen**

```tsx
// src/modules/flag-game/screens/FamilyResultsScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { Podium } from '../components/game/Podium';
import { RPP } from '../data/constants';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilyResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, familyScores, familyHistory, difficulty, startFamily } = useGameStore();

  function handleRestart(): void {
    if (difficulty) { startFamily(difficulty, players); navigate('/flag-game/family/pass'); }
  }

  const sorted = [...players].sort(
    (a, b) => (familyScores[b.id] ?? 0) - (familyScores[a.id] ?? 0),
  );
  const winner = sorted[0];
  const topScore = winner ? (familyScores[winner.id] ?? 0) : 0;
  const isTie = sorted.filter((p) => (familyScores[p.id] ?? 0) === topScore).length > 1;

  if (!winner) return <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 20, animation: 'crownBounce 1s ease-in-out infinite', marginBottom: 2 }}>👑</div>
      <div style={{ fontSize: 64, animation: 'spinIn .6s ease .1s both, bounce 1.5s ease-in-out .7s infinite', marginBottom: 4 }}>🏆</div>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 700, color: isTie ? ACCENT : winner.color, margin: '0 0 4px' }}>
        {isTie ? '¡Empate!' : `¡${winner.name} gana!`}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>{topScore} pts</p>
      <Podium sorted={sorted} scores={familyScores} />
      <div style={{ ...CARD, padding: 16, width: '100%', maxWidth: 400, marginBottom: 24 }}>
        {sorted.map((player, i) => {
          const correct = (familyHistory[player.id] ?? []).filter((r) => r.correct).length;
          return (
            <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 700, color: '#64748b', width: 24 }}>#{i + 1}</span>
              <span style={{ fontSize: 24 }}>{player.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: player.color }}>{player.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{correct}/{RPP}</div>
              </div>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: player.color }}>
                {familyScores[player.id] ?? 0}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleRestart} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: ACCENT, color: '#1e293b', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700 }}>
          🔄 Revancha
        </button>
        <button className="btn" onClick={() => navigate('/flag-game')} style={{ ...CARD, padding: '12px 28px', borderRadius: 14, color: '#f1f5f9', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, background: 'transparent' }}>
          🏠 Menú
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/game/Podium.tsx src/modules/flag-game/components/game/Podium.test.tsx src/modules/flag-game/screens/FamilyResultsScreen.tsx
git commit -m "feat: add Podium; refactor FamilyResultsScreen"
```

---

## Task 13: ModeButton + Refactor MenuScreen

**Files:**
- Create: `src/modules/flag-game/components/ModeButton.tsx`
- Create: `src/modules/flag-game/components/ModeButton.test.tsx`
- Modify: `src/modules/flag-game/screens/MenuScreen.tsx`

- [ ] **Step 1: Write failing ModeButton test**

```tsx
// src/modules/flag-game/components/ModeButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeButton } from './ModeButton';

describe('ModeButton', () => {
  it('renders the icon', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });

  it('renders the sub description', () => {
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('10 rounds')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ModeButton icon="🎮" label="Solo" sub="10 rounds" delay={0.1} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/ModeButton.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create ModeButton**

```tsx
// src/modules/flag-game/components/ModeButton.tsx
import React from 'react';

interface ModeButtonProps {
  icon: string;
  label: string;
  sub: string;
  delay: number;
  highlight?: boolean;
  onClick: () => void;
}

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function ModeButton({
  icon,
  label,
  sub,
  delay,
  highlight = false,
  onClick,
}: ModeButtonProps): React.JSX.Element {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        ...CARD,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
        animation: `menuItem .6s ease ${delay}s both`,
        ...(highlight
          ? {
              background: 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(139,92,246,.08))',
              border: '1.5px solid rgba(59,130,246,.3)',
            }
          : {}),
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div>{label}</div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>{sub}</div>
      </div>
      <span style={{ color: ACCENT, fontSize: 18 }}>→</span>
    </button>
  );
}
```

- [ ] **Step 4: Run ModeButton test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/ModeButton.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Refactor MenuScreen**

```tsx
// src/modules/flag-game/screens/MenuScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useSettingsStore } from '../store/settingsStore';
import { ContinentPicker } from '../components/ContinentPicker';
import { ModeButton } from '../components/ModeButton';
import { FLAGS } from '../data/flags';

const ACCENT = '#fbbf24';

const MODES = [
  { key: 'solo-diff', icon: '🎮', label: 'Jugar solo', sub: '10 rondas · Opciones múltiples', delay: 0.1, highlight: false },
  { key: 'explorer-diff', icon: '🗺️', label: 'Explorador', sub: 'Ubicá países en su continente · Contrarreloj', delay: 0.2, highlight: true },
  { key: 'family-setup', icon: '👨‍👩‍👧‍👦', label: 'Desafío familiar', sub: 'Turnos por jugador', delay: 0.3, highlight: false },
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 80, animation: 'float 3s ease-in-out infinite, spinIn 0.8s ease both', marginBottom: 8 }}>🌍</div>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(28px,6vw,44px)', fontWeight: 700, background: `linear-gradient(135deg,${ACCENT},#f97316,#ef4444)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px', animation: 'breathe 4s ease-in-out infinite' }}>
        ¿Qué bandera es?
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>{FLAGS.length} países del mundo</p>
      <ContinentPicker selected={continent} onChange={setContinent} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
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
```

- [ ] **Step 6: Run TypeScript and existing MenuScreen tests**

```bash
npx tsc --noEmit && npx vitest run src/modules/flag-game/screens/MenuScreen.test.tsx
```

Expected: tsc clean, tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/ModeButton.tsx src/modules/flag-game/components/ModeButton.test.tsx src/modules/flag-game/screens/MenuScreen.tsx
git commit -m "feat: add ModeButton; refactor MenuScreen"
```

---

## Task 14: DifficultyButton + Refactor DifficultyScreen

**Files:**
- Create: `src/modules/flag-game/components/DifficultyButton.tsx`
- Create: `src/modules/flag-game/components/DifficultyButton.test.tsx`
- Modify: `src/modules/flag-game/screens/DifficultyScreen.tsx`

- [ ] **Step 1: Write failing DifficultyButton test**

```tsx
// src/modules/flag-game/components/DifficultyButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DifficultyButton } from './DifficultyButton';

describe('DifficultyButton', () => {
  it('renders the emoji', () => {
    render(<DifficultyButton emoji="😊" label="Fácil" description="3 opciones · 20s" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<DifficultyButton emoji="😊" label="Fácil" description="3 opciones · 20s" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('Fácil')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<DifficultyButton emoji="😊" label="Fácil" description="3 opciones · 20s" delay={0.1} onClick={vi.fn()} />);
    expect(screen.getByText('3 opciones · 20s')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<DifficultyButton emoji="😊" label="Fácil" description="3 opciones · 20s" delay={0.1} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/DifficultyButton.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create DifficultyButton**

```tsx
// src/modules/flag-game/components/DifficultyButton.tsx
import React from 'react';

interface DifficultyButtonProps {
  emoji: string;
  label: string;
  description: string;
  delay: number;
  onClick: () => void;
}

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function DifficultyButton({
  emoji,
  label,
  description,
  delay,
  onClick,
}: DifficultyButtonProps): React.JSX.Element {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        ...CARD,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
        animation: `menuItem .6s ease ${delay}s both`,
      }}
    >
      <span style={{ fontSize: 32 }}>{emoji}</span>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div>{label}</div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>{description}</div>
      </div>
      <span style={{ color: ACCENT, fontSize: 18 }}>→</span>
    </button>
  );
}
```

- [ ] **Step 4: Run DifficultyButton test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/DifficultyButton.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Refactor DifficultyScreen**

```tsx
// src/modules/flag-game/screens/DifficultyScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { DifficultyButton } from '../components/DifficultyButton';
import { DIFFICULTY, DIFFICULTY_ANIM_BASE, DIFFICULTY_ANIM_STEP } from '../data/constants';
import type { DifficultyKey } from '@/shared/types';

interface DifficultyScreenProps {
  mode: 'solo' | 'explorer';
}

const ACCENT = '#fbbf24';

const PLAY_ROUTE: Record<string, string> = {
  solo: '/flag-game/solo/play',
  explorer: '/flag-game/explorer/play',
};

export function DifficultyScreen({ mode }: DifficultyScreenProps): React.JSX.Element {
  const navigate = useNavigate();
  const { startSolo, startExplorer } = useGameStore();

  function handleSelect(key: DifficultyKey): void {
    if (mode === 'solo') startSolo(key);
    else startExplorer(key);
    navigate(PLAY_ROUTE[mode]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>{mode === 'solo' ? '🎮' : '🗺️'}</div>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(22px,5vw,34px)', fontWeight: 700, color: ACCENT, margin: '0 0 8px' }}>
        {mode === 'solo' ? 'Jugar solo' : 'Explorador'}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Elegí una dificultad</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {(Object.entries(DIFFICULTY) as [DifficultyKey, (typeof DIFFICULTY)[string]][]).map(
          ([key, cfg], i) => (
            <DifficultyButton
              key={key}
              emoji={cfg.emoji}
              label={cfg.label}
              description={`${cfg.options} opciones · ${cfg.time}s · ${cfg.points} pts`}
              delay={DIFFICULTY_ANIM_BASE + i * DIFFICULTY_ANIM_STEP}
              onClick={() => handleSelect(key)}
            />
          ),
        )}
      </div>
      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: 24, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}
      >
        ← Volver
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/DifficultyButton.tsx src/modules/flag-game/components/DifficultyButton.test.tsx src/modules/flag-game/screens/DifficultyScreen.tsx
git commit -m "feat: add DifficultyButton; refactor DifficultyScreen"
```

---

## Task 15: PlayerInput + Refactor FamilySetupScreen

**Files:**
- Create: `src/modules/flag-game/components/PlayerInput.tsx`
- Create: `src/modules/flag-game/components/PlayerInput.test.tsx`
- Modify: `src/modules/flag-game/screens/FamilySetupScreen.tsx`

- [ ] **Step 1: Write failing PlayerInput test**

```tsx
// src/modules/flag-game/components/PlayerInput.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerInput } from './PlayerInput';

describe('PlayerInput', () => {
  it('renders the avatar', () => {
    render(<PlayerInput index={0} value="" avatar="🦁" isLast={false} showRemove={false} onChange={vi.fn()} onRemove={vi.fn()} onEnter={vi.fn()} />);
    expect(screen.getByText('🦁')).toBeInTheDocument();
  });

  it('renders an input with the current value', () => {
    render(<PlayerInput index={0} value="Ana" avatar="🦁" isLast={false} showRemove={false} onChange={vi.fn()} onRemove={vi.fn()} onEnter={vi.fn()} />);
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const onChange = vi.fn();
    render(<PlayerInput index={0} value="" avatar="🦁" isLast={false} showRemove={false} onChange={onChange} onRemove={vi.fn()} onEnter={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows the remove button when showRemove is true', () => {
    render(<PlayerInput index={0} value="Ana" avatar="🦁" isLast={false} showRemove={true} onChange={vi.fn()} onRemove={vi.fn()} onEnter={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides the remove button when showRemove is false', () => {
    render(<PlayerInput index={0} value="Ana" avatar="🦁" isLast={false} showRemove={false} onChange={vi.fn()} onRemove={vi.fn()} onEnter={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<PlayerInput index={0} value="Ana" avatar="🦁" isLast={false} showRemove={true} onChange={vi.fn()} onRemove={onRemove} onEnter={vi.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/modules/flag-game/components/PlayerInput.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create PlayerInput**

```tsx
// src/modules/flag-game/components/PlayerInput.tsx
import React from 'react';

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
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 20 }}>{avatar}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && isLast && onEnter()}
        placeholder={`Jugador ${index + 1}`}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f1f5f9',
          fontFamily: "'Nunito', sans-serif",
          outline: 'none',
        }}
      />
      {showRemove && (
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run PlayerInput test to verify it passes**

```bash
npx vitest run src/modules/flag-game/components/PlayerInput.test.tsx
```

Expected: PASS (6 tests).

- [ ] **Step 5: Refactor FamilySetupScreen**

```tsx
// src/modules/flag-game/screens/FamilySetupScreen.tsx
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { PlayerInput } from '../components/PlayerInput';
import { DIFFICULTY, PCOLORS, PAVATARS, MAX_PLAYERS, MIN_PLAYERS } from '../data/constants';
import type { Player } from '../types';
import type { DifficultyKey } from '@/shared/types';

const ACCENT = '#fbbf24';
const CARD = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
};

export function FamilySetupScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { startFamily } = useGameStore();

  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [inputValue, setInputValue] = useState('');

  function addPlayer(): void {
    const name = inputValue.trim();
    if (!name || playerNames.includes(name)) return;
    setPlayerNames((prev) => [...prev.slice(0, prev.length - 1), name, '']);
    setInputValue('');
  }

  function handleStart(): void {
    const filled = playerNames.filter((n) => n.trim());
    if (filled.length < MIN_PLAYERS) return;
    const players: Player[] = filled.map((name, i) => ({
      id: `player-${i}`,
      name,
      color: PCOLORS[i % PCOLORS.length],
      avatar: PAVATARS[i % PAVATARS.length],
    }));
    startFamily(difficulty, players);
    navigate('/flag-game/family/pass');
  }

  const filledNames = playerNames.filter((n) => n.trim());
  const canStart = filledNames.length >= MIN_PLAYERS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(22px,5vw,34px)', fontWeight: 700, color: ACCENT, margin: '0 0 8px' }}>
        Desafío familiar
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Configurá la partida</p>

      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>Dificultad</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.entries(DIFFICULTY) as [DifficultyKey, (typeof DIFFICULTY)[string]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700,
                border: difficulty === key ? `1.5px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                background: difficulty === key ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                color: difficulty === key ? ACCENT : '#94a3b8',
              }}
            >
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'left' }}>Jugadores (mínimo 2)</p>
        {playerNames.map((name, idx) => (
          <PlayerInput
            key={idx}
            index={idx}
            value={name}
            avatar={PAVATARS[idx % PAVATARS.length]}
            isLast={idx === playerNames.length - 1}
            showRemove={playerNames.length > MIN_PLAYERS}
            onChange={(val) => setPlayerNames((prev) => prev.map((n, i) => (i === idx ? val : n)))}
            onRemove={() => setPlayerNames((prev) => prev.filter((_, i) => i !== idx))}
            onEnter={addPlayer}
          />
        ))}
        {playerNames.length < MAX_PLAYERS && (
          <button
            onClick={() => setPlayerNames((prev) => [...prev, ''])}
            style={{ ...CARD, width: '100%', padding: '10px', fontSize: 13, color: '#64748b', fontFamily: "'Nunito', sans-serif", cursor: 'pointer', marginTop: 4 }}
          >
            + Agregar jugador
          </button>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="btn"
        style={{ ...CARD, padding: '16px 40px', fontSize: 16, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: canStart ? '#0f172a' : '#64748b', background: canStart ? `linear-gradient(135deg,${ACCENT},#f97316)` : 'rgba(255,255,255,0.06)', border: 'none', cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        ¡Jugar!
      </button>

      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: 16, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}
      >
        ← Volver
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Run TypeScript and all tests**

```bash
npx tsc --noEmit && npx vitest run 2>/dev/null | tail -5
```

Expected: tsc clean, all pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/flag-game/components/PlayerInput.tsx src/modules/flag-game/components/PlayerInput.test.tsx src/modules/flag-game/screens/FamilySetupScreen.tsx
git commit -m "feat: add PlayerInput; refactor FamilySetupScreen"
```

---

## Final Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run full test suite with coverage**

```bash
npx vitest run --coverage 2>/dev/null | tail -20
```

Expected: all tests pass, coverage thresholds met (≥70% branches/functions/lines).

- [ ] **Step 3: Run ESLint across modified files**

```bash
npx eslint src/modules/flag-game/ 2>/dev/null | grep -c warning || echo 0
```

Expected: 0 warnings.

- [ ] **Step 4: Final commit if any loose files**

```bash
git status
```

If clean: done. If there are uncommitted files, stage and commit them.
