#!/usr/bin/env node

/**
 * Debug script for minimal test environment
 * 
 * This script helps identify potential issues with Next.js startup
 * by running with increased verbosity and debug options
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log file path
const LOG_FILE = path.join(__dirname, 'minimal-debug.log');

console.log('🔍 Starting debug mode for minimal test');
console.log(`📝 Logs will be saved to: ${LOG_FILE}`);

// Create write stream for log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

// Clear Next.js cache
console.log('🧹 Cleaning Next.js cache...');
try {
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
  }
  console.log('✅ Cache cleaned');
} catch (error) {
  console.error('❌ Error cleaning cache:', error.message);
}

// Start Next.js in debug mode
console.log('🚀 Starting Next.js in debug mode...');

const nextProcess = spawn('npm', ['run', 'dev', '--', '--debug'], {
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096 --trace-warnings',
    DEBUG: '*,-babel:*,-send,-express:*,next:*',
    NEXT_TELEMETRY_DISABLED: '1'
  }
});

// Log output
nextProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  logStream.write(output);
});

nextProcess.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(`❌ ERROR: ${output}`);
  logStream.write(`ERROR: ${output}`);
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error.message);
  logStream.write(`PROCESS ERROR: ${error.message}\n`);
});

nextProcess.on('close', (code) => {
  const message = `🛑 Next.js process exited with code ${code}`;
  console.log(message);
  logStream.write(`${message}\n`);
  logStream.end();
  
  if (code !== 0) {
    console.log('Check minimal-debug.log for detailed error information');
    console.log('Navigate to http://localhost:3000/minimal-test if the server is still running');
  }
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('👋 Shutting down debug session...');
  nextProcess.kill();
  logStream.end();
  process.exit(0);
});