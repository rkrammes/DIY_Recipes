export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Test Page</h1>
      <p>This is a simple test page to verify that the server is working correctly.</p>
      <p>Server time: {new Date().toISOString()}</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Debug Info</h2>
        <ul>
          <li>Node.js version: {process.version}</li>
          <li>Next.js version: {process.env.NEXT_RUNTIME || 'unknown'}</li>
          <li>Environment: {process.env.NODE_ENV}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  );
}