// Simple script to check if a server is running on port 3000
const http = require('http');

console.log('Checking if a server is running on port 3000...');

const req = http.get('http://localhost:3000', (res) => {
  console.log(`Server responded with status code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received successfully!');
    console.log(`Content length: ${data.length} bytes`);
    console.log('First 200 characters:');
    console.log(data.substring(0, 200));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(`Error connecting to port 3000: ${err.message}`);
  process.exit(1);
});

// Set a timeout
req.setTimeout(5000, () => {
  console.error('Request timed out after 5 seconds');
  req.destroy();
  process.exit(1);
});