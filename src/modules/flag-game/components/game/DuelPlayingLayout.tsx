import React from 'react';

import { OptionButton } from '../OptionButton';
import type { Flag, Player } from '../../types';

interface DuelPlayerPanelState {
  feedbackText: string | null;
  onAnswer: (flag: Flag) => void;
  player: Player;
  score: number;
  selected: Flag | null;
}

interface DuelPlayingLayoutProps {
  currentFlag: Flag;
  options: Flag[];
  playerPanels: DuelPlayerPanelState[];
  roundLabel: string;
  styles: Record<string, string>;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

function renderPlayerPanel(
  currentFlag: Flag,
  options: Flag[],
  panel: DuelPlayerPanelState,
  styles: Record<string, string>,
): React.JSX.Element {
  return (
    <section
      className={styles.playerPanel}
      key={panel.player.id}
      style={{ '--player-color': panel.player.color } as React.CSSProperties}
    >
      <header className={styles.playerHeader}>
        <span className={styles.playerAvatar}>{panel.player.avatar}</span>
        <div className={styles.playerMeta}>
          <div className={styles.playerName}>{panel.player.name}</div>
          <div className={styles.playerScore}>{panel.score} pts</div>
        </div>
      </header>
      <div className={styles.answerGrid}>
        {options.map((option, index) => (
          <OptionButton
            key={`${panel.player.id}-${option.name}`}
            currentFlag={currentFlag}
            index={index}
            onAnswer={panel.onAnswer}
            opt={option}
            selected={panel.selected}
          />
        ))}
      </div>
      {panel.feedbackText ? <div className={styles.feedback}>{panel.feedbackText}</div> : null}
    </section>
  );
}

export function DuelPlayingLayout({
  currentFlag,
  options,
  playerPanels,
  roundLabel,
  styles,
  timeLeft,
  timerColor,
  timerPct,
  timerUrgent,
}: DuelPlayingLayoutProps): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <nav className={styles.header}>
        <span className={styles.roundLabel}>{roundLabel}</span>
        <span className={styles.timerValue}>{timeLeft}s</span>
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
        <div className={styles.flagMeta}>{currentFlag.continent}</div>
        <div className={styles.flagPrompt}>¿Quién la reconoce primero?</div>
      </div>
      <div className={styles.panels}>
        {playerPanels.map((panel) => renderPlayerPanel(currentFlag, options, panel, styles))}
      </div>
    </div>
  );
}
