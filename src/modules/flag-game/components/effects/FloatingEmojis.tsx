interface FloatingEmojisProps {
  active: boolean;
}

const EMOJIS = ['🎉', '🏆', '⭐', '🎊', '🌟', '✨'];

export function FloatingEmojis({ active }: FloatingEmojisProps): JSX.Element | null {
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
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: `${Math.random() * 100}%`,
            fontSize: 16 + Math.random() * 20,
            animation: `emojiFloat ${2 + Math.random() * 2}s ease-out ${Math.random() * 2}s forwards`,
            opacity: 0,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </div>
      ))}
    </div>
  );
}
