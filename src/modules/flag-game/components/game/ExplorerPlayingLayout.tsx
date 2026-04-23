import React from 'react';

import { MobileMap } from '../MobileMap';
import { EXPLORER_STREAK_THRESHOLD } from '../../data/constants';
import type { Flag } from '../../types';

interface ExplorerPlayingLayoutProps {
  currentFlag: Flag;
  explorerBestStreak: number;
  explorerCorrect: number;
  explorerScore: number;
  explorerStreak: number;
  explorerTime: number;
  explorerTotal: number;
  feedbackText: string | null;
  onAnswer: (flag: Flag) => void;
  onGoHome: () => void;
  onRevealHint: () => void;
  options: Flag[];
  selected: Flag | null;
  showHint: boolean;
  styles: Record<string, string>;
  timerColor: string;
  timerCritical: boolean;
}

const HOME_BUTTON_LABEL = '🏠';

function renderExplorerHint(
  currentFlag: Flag,
  onRevealHint: () => void,
  selected: Flag | null,
  showHint: boolean,
  styles: Record<string, string>,
): React.JSX.Element {
  if (!showHint && selected === null) {
    return (
      <nav className={styles.hintNav}>
        <button className={styles.hintButton} onClick={onRevealHint} type="button">
          💡 Pista
        </button>
      </nav>
    );
  }

  return showHint ? <p className={styles.hintText}>💡 {currentFlag.hint}</p> : <></>;
}

function renderExplorerFeedback(
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

function renderStatsCard(
  explorerBestStreak: number,
  explorerCorrect: number,
  explorerScore: number,
  explorerTotal: number,
  styles: Record<string, string>,
): React.JSX.Element {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsItem}>
        <div className={styles.statsLabel}>Puntos</div>
        <div className={[styles.statsValue, styles.statsValueScore].join(' ')}>{explorerScore}</div>
      </div>
      <div className={styles.statsItem}>
        <div className={styles.statsLabel}>Aciertos</div>
        <div className={[styles.statsValue, styles.statsValueCorrect].join(' ')}>
          {explorerCorrect}/{explorerTotal}
        </div>
      </div>
      <div className={styles.statsItem}>
        <div className={styles.statsLabel}>Racha</div>
        <div className={[styles.statsValue, styles.statsValueStreak].join(' ')}>
          🔥{explorerBestStreak}
        </div>
      </div>
    </div>
  );
}

function renderPrompt(currentFlag: Flag, styles: Record<string, string>): React.JSX.Element {
  return (
    <div className={styles.flagPrompt}>
      <span className={styles.flagEmoji}>{currentFlag.code}</span>
      <div>
        <div className={styles.promptTitle}>¿Dónde queda?</div>
        <div className={styles.promptContinent}>{currentFlag.continent}</div>
      </div>
    </div>
  );
}

export function ExplorerPlayingLayout({
  currentFlag,
  explorerBestStreak,
  explorerCorrect,
  explorerScore,
  explorerStreak,
  explorerTime,
  explorerTotal,
  feedbackText,
  onAnswer,
  onGoHome,
  onRevealHint,
  options,
  selected,
  showHint,
  styles,
  timerColor,
  timerCritical,
}: ExplorerPlayingLayoutProps): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <nav className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.homeButton} onClick={onGoHome} type="button">
            {HOME_BUTTON_LABEL}
          </button>
          {explorerStreak >= EXPLORER_STREAK_THRESHOLD && (
            <span className={styles.streakBadge}>🔥x{explorerStreak}</span>
          )}
          <span className={styles.correctCount}>{explorerCorrect} acertadas</span>
        </div>
        <div className={styles.timerPill}>
          <span className={styles.timerIcon}>⏱️</span>
          <span
            className={[styles.timerValue, timerCritical ? styles.timerCritical : '']
              .filter(Boolean)
              .join(' ')}
            style={{ '--timer-color': timerColor } as React.CSSProperties}
          >
            {explorerTime}s
          </span>
        </div>
      </nav>
      {renderPrompt(currentFlag, styles)}
      {renderExplorerHint(currentFlag, onRevealHint, selected, showHint, styles)}
      <div className={styles.mapWrap}>
        <MobileMap
          options={options}
          correctName={currentFlag.name}
          selected={selected}
          onSelect={onAnswer}
        />
      </div>
      {renderExplorerFeedback(currentFlag, feedbackText, selected, styles)}
      {renderStatsCard(explorerBestStreak, explorerCorrect, explorerScore, explorerTotal, styles)}
    </div>
  );
}
