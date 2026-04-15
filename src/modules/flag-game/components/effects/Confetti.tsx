interface ConfettiProps {
  active: boolean;
}

const COLS = ['#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316'];

export function Confetti({ active }: ConfettiProps): JSX.Element | null {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 35 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '40%',
            left: `${Math.random() * 100}%`,
            width: 6 + Math.random() * 8,
            height: (6 + Math.random() * 8) * 0.6,
            background: COLS[i % COLS.length],
            borderRadius: 2,
            animation: `confettiFall ${1.2 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
