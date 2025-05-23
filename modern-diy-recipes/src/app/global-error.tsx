'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e12',
          color: '#33ff33',
          fontFamily: 'monospace',
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Critical Error
            </h2>
            <p style={{ marginBottom: '2rem' }}>
              A critical error occurred. The application needs to restart.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#33ff33',
                color: '#0a0e12',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}