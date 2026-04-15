import { BackgroundStars } from '@/shared/components/BackgroundStars';

// NOTE: Layout is shared; do not import flag-game specifics here long-term.
// BackgroundStars should move to shared if other games use it.

const GLOBAL_STYLES = `
  @keyframes popIn { 0%{transform:scale(0) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px)} 30%{transform:translateX(10px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.1)} }
  @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(251,191,36,.2)} 50%{box-shadow:0 0 50px rgba(251,191,36,.6)} }
  @keyframes flagEnter { 0%{transform:rotateY(90deg) scale(.5);opacity:0} 50%{transform:rotateY(-10deg) scale(1.05)} 100%{transform:rotateY(0) scale(1);opacity:1} }
  @keyframes scorePop { 0%{transform:scale(1)} 30%{transform:scale(1.6)} 60%{transform:scale(.9)} 100%{transform:scale(1)} }
  @keyframes confettiFall { 0%{transform:translateY(0) translateX(0) rotate(0);opacity:1} 100%{transform:translateY(400px) translateX(var(--drift,0px)) rotate(720deg);opacity:0} }
  @keyframes emojiFloat { 0%{transform:translateY(0) scale(0);opacity:0} 15%{opacity:1;transform:translateY(-50px) scale(1)} 100%{transform:translateY(-600px) scale(.5) rotate(30deg);opacity:0} }
  @keyframes screenFlash { 0%{opacity:.5} 100%{opacity:0} }
  @keyframes sparkle { 0%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(0);opacity:1} 100%{transform:translate(-50%,-50%) rotate(var(--angle)) translateX(25px) scale(0);opacity:0} }
  @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.8} }
  @keyframes timerPulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.8)} }
  @keyframes optionEnter { 0%{transform:translateX(-20px);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes correctPulse { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.4)} 70%{box-shadow:0 0 0 12px rgba(34,197,94,0)} }
  @keyframes wrongShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
  @keyframes podiumRise { 0%{transform:scaleY(0)} 100%{transform:scaleY(1)} }
  @keyframes crownBounce { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-5px) rotate(-5deg)} 75%{transform:translateY(-5px) rotate(5deg)} }
  @keyframes resultRow { 0%{transform:translateX(-40px);opacity:0} 100%{transform:translateX(0);opacity:1} }
  @keyframes spinIn { 0%{transform:rotate(0) scale(0);opacity:0} 50%{transform:rotate(200deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1);opacity:1} }
  @keyframes menuItem { 0%{transform:translateY(50px);opacity:0} 60%{transform:translateY(-4px)} 100%{transform:translateY(0);opacity:1} }
  @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
  @keyframes mapPinEnter { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.15)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
  .btn{transition:all .2s cubic-bezier(.34,1.56,.64,1);cursor:pointer}
  .btn:hover{transform:translateY(-3px) scale(1.02)}
  .btn:active{transform:translateY(-1px) scale(.98)}
`;

interface LayoutProps {
  children: React.ReactNode;
  soundOn: boolean;
  onToggleSound: () => void;
  confetti?: React.ReactNode;
  flash?: React.ReactNode;
  emojis?: React.ReactNode;
}

export function Layout({
  children,
  soundOn,
  onToggleSound,
  confetti,
  flash,
  emojis,
}: LayoutProps): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Nunito', sans-serif",
        color: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{GLOBAL_STYLES}</style>
      <BackgroundStars />
      {confetti}
      {emojis}
      {flash}
      <button
        onClick={onToggleSound}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          cursor: 'pointer',
          color: '#f1f5f9',
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
      {children}
    </div>
  );
}
