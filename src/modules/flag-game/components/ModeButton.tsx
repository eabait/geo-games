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
