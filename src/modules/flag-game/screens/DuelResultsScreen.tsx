import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import type { DuelRoundResult, Player } from '../types';

import styles from './DuelResultsScreen.module.css';

const DUEL_PLAYERS_COUNT = 2;

interface RankedDuelPlayer extends Player {
  score: number;
}

function buildRankedPlayers(
  duelPlayers: Player[],
  duelScores: Record<string, number>,
): RankedDuelPlayer[] {
  return [...duelPlayers]
    .map((player) => ({
      ...player,
      score: duelScores[player.id] ?? 0,
    }))
    .sort((firstPlayer, secondPlayer) => secondPlayer.score - firstPlayer.score);
}

function getResolutionLabel(result: DuelRoundResult, playersById: Record<string, Player>): string {
  if (result.resolution === 'timeout') {
    return 'Sin puntos';
  }

  const winner = result.winnerId ? playersById[result.winnerId] : null;
  const answeringPlayer = result.answeringPlayerId ? playersById[result.answeringPlayerId] : null;

  if (result.resolution === 'correct') {
    return winner ? `${winner.name} acertó` : 'Respuesta correcta';
  }

  if (winner && answeringPlayer) {
    return `${winner.name} suma tras fallo de ${answeringPlayer.name}`;
  }

  return 'Punto al rival';
}

function renderHistoryRows(
  duelHistory: DuelRoundResult[],
  playersById: Record<string, Player>,
): React.JSX.Element {
  return (
    <div className={styles.historyCard}>
      {duelHistory.map((result, index) => (
        <div className={styles.historyRow} key={`${result.flag.name}-${index}`}>
          <div className={styles.historyMeta}>
            <span className={styles.roundLabel}>Ronda {index + 1}</span>
            <span className={styles.flagName}>
              {result.flag.code} {result.flag.name}
            </span>
          </div>
          <span className={styles.resolution}>{getResolutionLabel(result, playersById)}</span>
        </div>
      ))}
    </div>
  );
}

function renderScoreRows(rankedPlayers: RankedDuelPlayer[]): React.JSX.Element {
  return (
    <div className={styles.scoreCard}>
      {rankedPlayers.map((player) => (
        <div
          className={styles.playerRow}
          key={player.id}
          style={{ '--player-color': player.color } as React.CSSProperties}
        >
          <div className={styles.playerMeta}>
            <span className={styles.playerAvatar}>{player.avatar}</span>
            <span className={styles.playerName}>{player.name}</span>
          </div>
          <span className={styles.playerScore}>{player.score} pts</span>
        </div>
      ))}
    </div>
  );
}

function renderActions(
  navigate: ReturnType<typeof useNavigate>,
  handleRematch: () => void,
): React.JSX.Element {
  return (
    <div className={styles.actions}>
      <button
        className={['btn', styles.primaryButton].join(' ')}
        onClick={handleRematch}
        type="button"
      >
        🔄 Revancha
      </button>
      <button
        className={['btn', styles.secondaryButton].join(' ')}
        onClick={() => navigate('/flag-game')}
        type="button"
      >
        🏠 Menú
      </button>
    </div>
  );
}

function renderEmptyState(navigate: ReturnType<typeof useNavigate>): React.JSX.Element {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🏁</div>
      <h2 className={styles.emptyTitle}>Sin resultados</h2>
      <p className={styles.emptyCopy}>Todavía no hay un duelo terminado para resumir.</p>
      <button
        className={['btn', styles.secondaryButton].join(' ')}
        onClick={() => navigate('/flag-game')}
        type="button"
      >
        🏠 Menú
      </button>
    </div>
  );
}

export function DuelResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { difficulty, duelHistory, duelPlayers, duelScores, startDuel } = useGameStore();

  function handleRematch(): void {
    if (difficulty && duelPlayers.length === DUEL_PLAYERS_COUNT) {
      startDuel(difficulty, duelPlayers);
      navigate('/flag-game/duel/play');
    }
  }

  if (duelPlayers.length !== DUEL_PLAYERS_COUNT || duelHistory.length === 0) {
    return renderEmptyState(navigate);
  }

  const rankedPlayers = buildRankedPlayers(duelPlayers, duelScores);
  const winner = rankedPlayers[0];

  if (!winner) {
    return renderEmptyState(navigate);
  }

  const playersById = Object.fromEntries(duelPlayers.map((player) => [player.id, player]));
  const topScore = winner.score;
  const tiedPlayers = rankedPlayers.filter((player) => player.score === topScore);
  const isTie = tiedPlayers.length > 1;

  return (
    <div className={styles.screen}>
      <div className={styles.icon}>⚔️</div>
      <h2
        className={styles.title}
        style={
          {
            '--winner-color': isTie ? 'var(--color-accent)' : winner.color,
          } as React.CSSProperties
        }
      >
        {isTie ? '¡Empate!' : `¡${winner.name} gana!`}
      </h2>
      <p className={styles.subtitle}>
        {isTie ? 'Terminaron cabeza a cabeza.' : 'Resumen final del duelo.'}
      </p>
      {renderScoreRows(rankedPlayers)}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Historial</h3>
        {renderHistoryRows(duelHistory, playersById)}
      </div>
      {renderActions(navigate, handleRematch)}
    </div>
  );
}
