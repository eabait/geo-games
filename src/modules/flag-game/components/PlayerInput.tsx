import React from 'react';

interface PlayerInputProps {
  index: number;
  value: string;
  avatar: string;
  isLast: boolean;
  showRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  onEnter: () => void;
}

export function PlayerInput({
  index,
  value,
  avatar,
  isLast,
  showRemove,
  onChange,
  onRemove,
  onEnter,
}: PlayerInputProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 20 }}>{avatar}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && isLast && onEnter()}
        placeholder={`Jugador ${index + 1}`}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f1f5f9',
          fontFamily: "'Nunito', sans-serif",
          outline: 'none',
        }}
      />
      {showRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
