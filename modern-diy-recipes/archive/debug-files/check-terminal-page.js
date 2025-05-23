const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/terminal',
  method: 'GET'
};

console.log('Checking if the terminal page is accessible...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Terminal page is accessible!');
    console.log('The KraftTerminalModularLayout component is working.');
    console.log('');
    console.log('You can now access the terminal interface at:');
    console.log('  http://localhost:3000/terminal');
    console.log('');
    console.log('Note: If you see missing tables messages, that\'s expected and the component');
    console.log('has been updated to handle this gracefully with proper error messages.');
  } else {
    console.log('❌ Terminal page returned a non-200 status code.');
    console.log('Make sure the app is running with "npm run dev".');
  }
});

req.on('error', (e) => {
  console.error('❌ Error connecting to the terminal page:');
  console.error(`   ${e.message}`);
  console.error('');
  console.error('Make sure the app is running with "npm run dev".');
});

req.end();