/**
 * Simple test for MCP server
 */
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/',
  method: 'GET'
};

console.log('Testing Supabase MCP server on port 3002...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Server info:', parsed);
      console.log('Available tools:', parsed.tools);
      console.log('Test completed successfully!');
    } catch (err) {
      console.error('Error parsing response:', err);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Error connecting to MCP server:', err.message);
});

req.end();