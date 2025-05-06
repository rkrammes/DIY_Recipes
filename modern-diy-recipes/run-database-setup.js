#!/usr/bin/env node

/**
 * Run Database Setup Script via Supabase MCP
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Path to SQL script
const SQL_SCRIPT_PATH = path.join(__dirname, 'supabase-setup.sql');

// Read the SQL file
const sql = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

// Prepare the request data
const requestData = JSON.stringify({
  method: 'query_data',
  params: { sql }
});

// Configure the request options
const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('Running database setup script via Supabase MCP...');

// Send the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(parsedData, null, 2));
      console.log('\nDatabase setup complete!');
      console.log('Your recipes should now display with ingredients when you restart the app.');
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.log('Make sure the Supabase MCP server is running on port 3002');
});

// Write data to request body
req.write(requestData);
req.end();