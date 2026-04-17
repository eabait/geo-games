import React from 'react';
interface SparklesProps {
  active: boolean;
}

export function Sparkles({ active }: SparklesProps): React.JSX.Element | null {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 210,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 6px 2px #fbbf24',
            animation: `sparkle ${0.4 + Math.random() * 0.6}s ease-out ${Math.random() * 0.4}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
