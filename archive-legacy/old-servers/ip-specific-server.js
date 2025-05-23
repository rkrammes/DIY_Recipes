import http from 'http';

// Create a very simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is working!\n');
});

// Bind to the specific IP address
const IP = '10.4.45.43';
const PORT = 9000;
server.listen(PORT, IP, () => {
  console.log(`Server running at http://${IP}:${PORT}/`);
  console.log(`Process ID: ${process.pid}`);
});