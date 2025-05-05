// Test basic HTTP access to Supabase URL
require('dotenv').config({ path: '.env.local' });
const https = require('https');
const http = require('http');

// Get Supabase URL from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const url = new URL(supabaseUrl);

console.log(`Testing connection to ${url.hostname}...`);

// Configure the request
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: '/',
  method: 'GET',
  timeout: 10000,
};

const protocol = url.protocol === 'https:' ? https : http;

// Create the request
const req = protocol.request(options, (res) => {
  console.log(`🔍 Status Code: ${res.statusCode}`);
  console.log(`🔍 Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (data) => {
    console.log(`🔍 Partial response: ${data.toString().substring(0, 100)}...`);
  });
  
  res.on('end', () => {
    console.log('✅ Response ended successfully');
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Connection successful');
    } else {
      console.log('❌ Connection returned a non-200 status code');
    }
  });
});

// Handle errors
req.on('error', (error) => {
  console.error(`❌ Connection error: ${error.message}`);
  console.error(error);
});

// Handle timeout
req.on('timeout', () => {
  console.error('❌ Connection timed out');
  req.destroy();
});

// Send the request
req.end();