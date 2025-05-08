import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server with custom agent options
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: true,
  ws: true,
});

// Create an HTTP Server with the proxy
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Forward the request to the target server
  proxy.web(req, res, { 
    target: 'http://localhost:3000' 
  }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: Unable to connect to the application server');
  });
});

// Listen for the 'upgrade' event to proxy WebSocket connections
server.on('upgrade', (req, socket, head) => {
  console.log(`[${new Date().toISOString()}] WebSocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head, { target: 'http://localhost:3000' });
});

// Log proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: Unable to connect to the application server');
  }
});

// Set up the server port and start listening
const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running at http://0.0.0.0:${PORT}/`);
  console.log(`Forwarding to: http://localhost:3000`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
});