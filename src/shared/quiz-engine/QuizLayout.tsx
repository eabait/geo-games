import React from 'react';

import styles from './QuizLayout.module.css';

const OPTION_ANIM_BASE_DELAY = 0.08;
const OPTION_ANIM_STEP_DELAY = 0.08;
const CHAR_CODE_A = 65;

export interface QuizOption {
  id: string;
  label: string;
}

interface QuizLayoutProps {
  questionSlot: React.ReactNode;
  options: QuizOption[];
  selectedId: string | null;
  correctId: string;
  onAnswer: (id: string) => void;
  timerPct: number;
  timerColor: string;
  timerUrgent: boolean;
  feedbackText: string | null;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

interface RenderOptionParams {
  option: QuizOption;
  index: number;
  selectedId: string | null;
  correctId: string;
  onAnswer: (id: string) => void;
}

type OptionState = 'correct' | 'wrong' | 'dimmed' | 'default';

function getOptionState(id: string, selectedId: string | null, correctId: string): OptionState {
  if (selectedId === null) return 'default';
  if (id === correctId) return 'correct';
  if (id === selectedId) return 'wrong';
  return 'dimmed';
}

function getOptionClassName(state: OptionState): string {
  return [styles.optionButton, styles[state]].filter(Boolean).join(' ');
}

function getBadgeText(
  optionId: string,
  selectedId: string | null,
  correctId: string,
  index: number,
): string {
  if (selectedId === optionId && selectedId === correctId) return '✓';
  if (selectedId === optionId && selectedId !== correctId) return '✗';
  return String.fromCharCode(CHAR_CODE_A + index);
}

function renderOption({
  option,
  index,
  selectedId,
  correctId,
  onAnswer,
}: RenderOptionParams): React.JSX.Element {
  const state = getOptionState(option.id, selectedId, correctId);

  return (
    <button
      key={option.id}
      className={getOptionClassName(state)}
      disabled={selectedId !== null}
      onClick={() => onAnswer(option.id)}
      style={
        {
          '--item-delay': `${OPTION_ANIM_BASE_DELAY + index * OPTION_ANIM_STEP_DELAY}s`,
        } as React.CSSProperties
      }
      type="button"
    >
      <span className={styles.badge}>{getBadgeText(option.id, selectedId, correctId, index)}</span>
      {option.label}
    </button>
  );
}

export function QuizLayout({
  questionSlot,
  options,
  selectedId,
  correctId,
  onAnswer,
  timerPct,
  timerColor,
  timerUrgent,
  feedbackText,
  headerLeft,
  headerRight,
}: QuizLayoutProps): React.JSX.Element {
  const timerValue = Math.round(timerPct);
  const feedbackClassName = [
    styles.feedbackPanel,
    selectedId === correctId ? styles.feedbackCorrect : styles.feedbackWrong,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.screen}>
      <nav className={styles.header}>
        <div className={styles.headerLeft}>{headerLeft}</div>
        <div className={styles.headerRight}>{headerRight}</div>
      </nav>

      <div
        aria-label="Time remaining"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={timerValue}
        className={styles.timerTrack}
        role="progressbar"
      >
        <div
          className={[styles.timerFill, timerUrgent ? styles.timerUrgent : '']
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--timer-width': `${timerPct}%`,
              '--timer-color': timerColor,
            } as React.CSSProperties
          }
        />
      </div>

      <div className={styles.questionArea}>{questionSlot}</div>

      <div className={styles.answerSection}>
        {options.map((option, index) =>
          renderOption({ option, index, selectedId, correctId, onAnswer }),
        )}
      </div>

      {feedbackText !== null && (
        <div aria-live="polite" className={feedbackClassName} role="status">
          {feedbackText}
        </div>
      )}
    </div>
  );
}
