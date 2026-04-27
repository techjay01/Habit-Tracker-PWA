export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: '1.5rem',
      }}
    >
      {/* Animated ring */}
      <div
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: 'spin 2s linear infinite', position: 'absolute' }}
        >
          <circle cx="36" cy="36" r="32" stroke="var(--color-brand)" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: '2rem' }}>✦</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-text)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          Habit Tracker
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          Build consistency, one day at a time
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
