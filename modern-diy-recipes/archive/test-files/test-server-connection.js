const http = require('http');

// Simple HTTP request to check if server is up
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000 // 5 second timeout
};

console.log('Testing connection to server at http://localhost:3000...');

const req = http.request(options, (res) => {
  console.log(`Server responded with status code: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('SUCCESS: Server is running and responding correctly!');
  } else {
    console.log(`WARNING: Server responded with non-200 status code: ${res.statusCode}`);
  }
  
  // Collect response data
  const chunks = [];
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    const responseSize = Buffer.concat(chunks).length;
    console.log(`Response size: ${responseSize} bytes`);
    console.log('Server connection test completed.');
  });
});

req.on('error', (error) => {
  console.error('ERROR: Could not connect to server:', error.message);
  console.log('Please make sure the server is running at http://localhost:3000');
});

req.on('timeout', () => {
  console.error('ERROR: Request timed out after 5 seconds');
  req.destroy();
});

req.end();