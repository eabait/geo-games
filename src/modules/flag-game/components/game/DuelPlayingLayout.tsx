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
  onQuit: () => void;
  options: Flag[];
  playerPanels: DuelPlayerPanelState[];
  roundLabel: string;
  styles: Record<string, string>;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

interface CenterProps {
  currentFlag: Flag;
  onQuit: () => void;
  roundLabel: string;
  styles: Record<string, string>;
  timeLeft: number;
  timerColor: string;
  timerPct: number;
  timerUrgent: boolean;
}

// isTop=true → Player 2: DOM [header, grid], rotated 180° so grid appears at physical top
// isTop=false → Player 1: DOM [grid, header], normal orientation
function renderPlayerSection(
  panel: DuelPlayerPanelState,
  options: Flag[],
  currentFlag: Flag,
  isTop: boolean,
  styles: Record<string, string>,
): React.JSX.Element {
  const header = (
    <header className={styles.playerHeader}>
      <span className={styles.playerAvatar}>{panel.player.avatar}</span>
      <div className={styles.playerMeta}>
        <div className={styles.playerName}>{panel.player.name}</div>
        <div className={styles.playerScore}>{panel.score} pts</div>
      </div>
      {panel.feedbackText ? <div className={styles.feedback}>{panel.feedbackText}</div> : null}
    </header>
  );

  const grid = (
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
  );

  return (
    <section
      className={[
        styles.playerSection,
        isTop ? styles.playerSectionTop : styles.playerSectionBottom,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--player-color': panel.player.color } as React.CSSProperties}
    >
      {isTop ? (
        <>
          {header}
          {grid}
        </>
      ) : (
        <>
          {grid}
          {header}
        </>
      )}
    </section>
  );
}

function renderCenterSection({
  currentFlag,
  onQuit,
  roundLabel,
  styles,
  timeLeft,
  timerColor,
  timerPct,
  timerUrgent,
}: CenterProps): React.JSX.Element {
  return (
    <div className={styles.centerSection}>
      <div className={styles.centerBar}>
        <span className={styles.roundLabel}>RONDA {roundLabel}</span>
        <span className={styles.timerValue}>{timeLeft}s</span>
        <button className={styles.quitBtn} onClick={onQuit} type="button">
          ✕
        </button>
      </div>
      <div className={styles.flagCard}>
        <div className={styles.flagEmoji}>{currentFlag.code}</div>
        <div className={styles.flagMeta}>{currentFlag.continent}</div>
      </div>
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
    </div>
  );
}

export function DuelPlayingLayout({
  currentFlag,
  onQuit,
  options,
  playerPanels,
  roundLabel,
  styles,
  timeLeft,
  timerColor,
  timerPct,
  timerUrgent,
}: DuelPlayingLayoutProps): React.JSX.Element {
  const [p1, p2] = playerPanels;

  return (
    <div className={styles.screen}>
      {renderPlayerSection(p2, options, currentFlag, true, styles)}
      {renderCenterSection({
        currentFlag,
        onQuit,
        roundLabel,
        styles,
        timeLeft,
        timerColor,
        timerPct,
        timerUrgent,
      })}
      {renderPlayerSection(p1, options, currentFlag, false, styles)}
    </div>
  );
}
