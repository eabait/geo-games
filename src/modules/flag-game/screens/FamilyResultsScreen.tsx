import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/gameStore';
import { Podium } from '../components/game/Podium';
import { RPP } from '../data/constants';

import styles from './FamilyResultsScreen.module.css';

export function FamilyResultsScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { players, familyScores, familyHistory, difficulty, startFamily } = useGameStore();

  function handleRestart(): void {
    if (difficulty) {
      startFamily(difficulty, players);
      navigate('/flag-game/family/pass');
    }
  }

  const sorted = [...players].sort((a, b) => (familyScores[b.id] ?? 0) - (familyScores[a.id] ?? 0));
  const winner = sorted[0];
  const topScore = winner ? (familyScores[winner.id] ?? 0) : 0;
  const isTie = sorted.filter((p) => (familyScores[p.id] ?? 0) === topScore).length > 1;

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
      <Podium sorted={sorted} scores={familyScores} />
      <div className={styles.summaryCard}>
        {sorted.map((player, i) => {
          const correct = (familyHistory[player.id] ?? []).filter((r) => r.correct).length;
          return (
            <div
              className={styles.rankingRow}
              key={player.id}
              style={{ '--player-color': player.color } as React.CSSProperties}
            >
              <span className={styles.rankIndex}>#{i + 1}</span>
              <span className={styles.rankAvatar}>{player.avatar}</span>
              <div className={styles.rankMeta}>
                <div className={styles.rankName}>{player.name}</div>
                <div className={styles.rankStats}>
                  {correct}/{RPP}
                </div>
              </div>
              <span className={styles.rankScore}>{familyScores[player.id] ?? 0}</span>
            </div>
          );
        })}
      </div>
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
