import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { Podium } from '../components/game/Podium';
import { RPP } from '../data/constants';
import type { Player } from '../types';

import styles from './FamilyResultsScreen.module.css';

interface RankedPlayer extends Player {
  correctAnswers: number;
  score: number;
}

function buildRankedPlayers(
  players: Player[],
  familyScores: Record<string, number>,
  familyHistory: Record<string, { correct: boolean }[]>,
): RankedPlayer[] {
  return [...players]
    .map((player) => ({
      ...player,
      correctAnswers: (familyHistory[player.id] ?? []).filter((result) => result.correct).length,
      score: familyScores[player.id] ?? 0,
    }))
    .sort((firstPlayer, secondPlayer) => secondPlayer.score - firstPlayer.score);
}

function renderRankingRows(rankedPlayers: RankedPlayer[]): React.JSX.Element {
  return (
    <div className={styles.summaryCard}>
      {rankedPlayers.map((player, index) => (
        <div
          className={styles.rankingRow}
          key={player.id}
          style={{ '--player-color': player.color } as React.CSSProperties}
        >
          <span className={styles.rankIndex}>#{index + 1}</span>
          <span className={styles.rankAvatar}>{player.avatar}</span>
          <div className={styles.rankMeta}>
            <div className={styles.rankName}>{player.name}</div>
            <div className={styles.rankStats}>
              {player.correctAnswers}/{RPP}
            </div>
          </div>
          <span className={styles.rankScore}>{player.score}</span>
        </div>
      ))}
    </div>
  );
}

export function FamilyResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, familyScores, familyHistory, difficulty, startFamily } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startFamily(difficulty, players);
      navigate('/flag-game/family/pass');
    }
  }

  const rankedPlayers = buildRankedPlayers(players, familyScores, familyHistory);
  const winner = rankedPlayers[0];
  const topScore = winner?.score ?? 0;
  const tiedPlayers = rankedPlayers.filter((player) => player.score === topScore);
  const isTie = tiedPlayers.length > 1;

  if (!winner) return <div className={styles.emptyState}>...</div>;

  return (
    <div className={styles.screen}>
      <div className={styles.crown}>👑</div>
      <div className={styles.trophy}>🏆</div>
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
      <p className={styles.subtitle}>{topScore} pts</p>
      <Podium sorted={rankedPlayers} scores={familyScores} />
      {renderRankingRows(rankedPlayers)}
      <div className={styles.actions}>
        <button
          className={['btn', styles.primaryButton].join(' ')}
          onClick={handleRestart}
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
    </div>
  );
}
