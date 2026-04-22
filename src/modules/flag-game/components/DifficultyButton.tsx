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
