const http = require('http');

console.log('Testing connection to localhost:3000...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Server is responding!');
  process.exit(0);
});

req.on('error', (error) => {
  console.error('Error connecting:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure the server is running');
  console.log('2. Check if port 3000 is blocked by firewall');
  console.log('3. Try accessing http://127.0.0.1:3000 instead');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Connection timed out');
  req.destroy();
});

req.end();