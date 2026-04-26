import React from 'react';

import { OptionButton } from '../OptionButton';
import type { Flag } from '../../types';

interface ClassicPlayingLayoutProps {
  currentFlag: Flag;
  feedbackText: string | null;
  headerLeft: React.ReactNode;
  headerRight: React.ReactNode;
  hintLabel: string;
  onAnswer: (flag: Flag) => void;
  onRevealHint: () => void;
  options: Flag[];
  rootStyle?: React.CSSProperties;
  selected: Flag | null;
  showHint: boolean;
  styles: Record<string, string>;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

function renderHintSection(
  currentFlag: Flag,
  hintLabel: string,
  onRevealHint: () => void,
  selected: Flag | null,
  showHint: boolean,
  styles: Record<string, string>,
): React.JSX.Element {
  if (!showHint && !selected) {
    return (
      <nav className={styles.hintNav}>
        <button className={styles.hintButton} onClick={onRevealHint} type="button">
          {hintLabel}
        </button>
      </nav>
    );
  }

  return showHint ? <p className={styles.hintText}>💡 {currentFlag.hint}</p> : <></>;
}

function renderFeedbackBanner(
  currentFlag: Flag,
  feedbackText: string | null,
  selected: Flag | null,
  styles: Record<string, string>,
): React.JSX.Element {
  if (!feedbackText) return <></>;

  return (
    <div
      className={[
        styles.feedbackPanel,
        selected?.name === currentFlag.name ? styles.feedbackCorrect : styles.feedbackWrong,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {feedbackText}
    </div>
  );
}

export function ClassicPlayingLayout({
  currentFlag,
  feedbackText,
  headerLeft,
  headerRight,
  hintLabel,
  onAnswer,
  onRevealHint,
  options,
  rootStyle,
  selected,
  showHint,
  styles,
  timerColor,
  timerPct,
  timerUrgent,
}: ClassicPlayingLayoutProps): React.JSX.Element {
  return (
    <div className={styles.screen} style={rootStyle}>
      <nav className={styles.header}>
        <div className={styles.headerLeft}>{headerLeft}</div>
        <div className={styles.headerRight}>{headerRight}</div>
      </nav>
      <div className={styles.timerTrack}>
        <div
          className={[styles.timerFill, timerUrgent ? styles.timerUrgent : '']
            .filter(Boolean)
            .join(' ')}
          style={
            { '--timer-width': `${timerPct}%`, '--timer-color': timerColor } as React.CSSProperties
          }
        />
      </div>
      <div className={styles.flagCard}>
        <div className={styles.flagEmoji}>{currentFlag.code}</div>
      </div>
      <div className={styles.continentPill}>{currentFlag.continent}</div>
      {renderHintSection(currentFlag, hintLabel, onRevealHint, selected, showHint, styles)}
      <div className={styles.answerSection}>
        {options.map((option, index) => (
          <OptionButton
            key={option.name}
            opt={option}
            index={index}
            isLoser={false}
            selected={selected}
            currentFlag={currentFlag}
            onAnswer={onAnswer}
          />
        ))}
      </div>
      {renderFeedbackBanner(currentFlag, feedbackText, selected, styles)}
    </div>
  );
}
