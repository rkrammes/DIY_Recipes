#!/usr/bin/env node

/**
 * Comprehensive Diagnostic Script for Next.js Applications
 * 
 * This script performs various checks to help identify issues
 * with Next.js application startup and accessibility.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

// Helper for colorized console output
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
  let color;
  switch (type) {
    case 'success': color = colors.green; break;
    case 'warning': color = colors.yellow; break;
    case 'error': color = colors.red; break;
    case 'info': default: color = colors.cyan; break;
  }
  
  console.log(`${colors.gray}${prefix}${colors.reset} ${color}${message}${colors.reset}`);
}

// Section divider
function section(title) {
  const divider = '='.repeat(50);
  console.log(`\n${colors.bright}${colors.blue}${divider}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}= ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${divider}${colors.reset}\n`);
}

// Run a command and return output
function runCommand(command, silent = false) {
  try {
    if (!silent) log(`Running command: ${command}`, 'info');
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    if (!silent) log(`Command failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Check accessibility of a URL
async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          accessible: true,
          statusCode: res.statusCode,
          data: data.substring(0, 100) + '...' // Truncate for display
        });
      });
    }).on('error', (err) => {
      resolve({
        accessible: false,
        error: err.message
      });
    });
  });
}

// Main diagnostic function
async function runDiagnostics() {
  // Start with system information
  section('SYSTEM INFORMATION');
  log(`Node.js Version: ${process.version}`);
  log(`Platform: ${process.platform} ${process.arch}`);
  log(`Working Directory: ${process.cwd()}`);
  
  // Check for running processes on common ports
  section('PORT USAGE CHECK');
  const portsToCheck = [3000, 3001, 8000, 8080];
  for (const port of portsToCheck) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      log(`Port ${port} is in use.`, 'warning');
      // Try to get process info
      if (process.platform === 'darwin' || process.platform === 'linux') {
        const { success, output } = runCommand(`lsof -i :${port} || echo "No process found"`, true);
        if (success && output.trim() !== "No process found") {
          log(`Process using port ${port}:\n${output}`, 'info');
        }
      }
    } else {
      log(`Port ${port} is available.`, 'success');
    }
  }
  
  // Check if curl is available
  section('NETWORK CONNECTIVITY TEST');
  const { success: curlAvailable } = runCommand('which curl || echo "curl not found"', true);
  if (curlAvailable) {
    // Test connectivity to localhost on different ports with curl
    log('Testing local connectivity with curl:');
    for (const port of portsToCheck) {
      const { success, output } = runCommand(`curl -s -I -m 1 http://localhost:${port} || echo "Failed"`, true);
      if (success && !output.includes('Failed')) {
        log(`curl to localhost:${port} successful`, 'success');
      } else {
        log(`curl to localhost:${port} failed`, 'warning');
      }
    }
  } else {
    log('curl not available, skipping curl tests', 'warning');
  }
  
  // Check network connectivity with Node's http module
  log('Testing local connectivity with Node.js:');
  for (const port of portsToCheck) {
    const result = await checkUrl(`http://localhost:${port}`);
    if (result.accessible) {
      log(`Node.js http request to localhost:${port} successful (status ${result.statusCode})`, 'success');
    } else {
      log(`Node.js http request to localhost:${port} failed: ${result.error}`, 'warning');
    }
  }
  
  // Check Next.js configuration
  section('NEXT.JS CONFIGURATION CHECK');
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  const nextConfigJsPath = path.join(process.cwd(), 'next.config.js');
  
  if (fs.existsSync(nextConfigPath)) {
    log(`Found Next.js config at ${nextConfigPath}`, 'success');
    // TypeScript config - we can't directly require it, so just show it exists
  } else if (fs.existsSync(nextConfigJsPath)) {
    log(`Found Next.js config at ${nextConfigJsPath}`, 'success');
    // JS config - we could require it if needed
  } else {
    log('No Next.js config file found', 'warning');
  }
  
  // Check for required environment variables
  section('ENVIRONMENT VARIABLES CHECK');
  const envFiles = ['.env', '.env.local', '.env.development'];
  let envFound = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      envFound = true;
      log(`Found environment file: ${envFile}`, 'success');
      
      // Count variables but don't display them for security
      const envContent = fs.readFileSync(envPath, 'utf8');
      const varCount = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .length;
      
      log(`${envFile} contains ${varCount} variables`, 'info');
    }
  }
  
  if (!envFound) {
    log('No environment files found. This might cause issues if the app requires them.', 'warning');
  }
  
  // Check package.json for scripts and dependencies
  section('PACKAGE.JSON CHECK');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    
    log(`Next.js version: ${packageJson.dependencies?.next || 'Not found'}`, 'info');
    log(`React version: ${packageJson.dependencies?.react || 'Not found'}`, 'info');
    
    // Check scripts
    if (packageJson.scripts?.dev) {
      log(`dev script: ${packageJson.scripts.dev}`, 'success');
    } else {
      log('No dev script found in package.json', 'warning');
    }
    
    // Check for key dependencies
    const requiredDeps = ['next', 'react', 'react-dom'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);
    
    if (missingDeps.length > 0) {
      log(`Missing dependencies: ${missingDeps.join(', ')}`, 'error');
    } else {
      log('All core dependencies present', 'success');
    }
  } else {
    log('package.json not found!', 'error');
  }
  
  // Check for build issues
  section('BUILD CHECK');
  const nextDirPath = path.join(process.cwd(), '.next');
  
  if (fs.existsSync(nextDirPath)) {
    log('.next directory exists, checking structure...', 'info');
    
    // Check for key build outputs
    const buildFiles = ['build-manifest.json', 'server/pages-manifest.json'];
    const missingFiles = buildFiles.filter(file => 
      !fs.existsSync(path.join(nextDirPath, file))
    );
    
    if (missingFiles.length > 0) {
      log(`Missing build files: ${missingFiles.join(', ')}. You may need to run 'next build'`, 'warning');
    } else {
      log('Build files look good', 'success');
    }
  } else {
    log('.next directory not found. The application has not been built.', 'warning');
  }
  
  // Test port accessibility
  section('SERVER TEST');
  log('Starting a test server on port 9876...');
  
  const testServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server is running');
  });
  
  testServer.listen(9876, '0.0.0.0', async () => {
    log('Test server started on port 9876', 'success');
    log('Testing accessibility...');
    
    // Check if the test server is accessible
    const testResult = await checkUrl('http://localhost:9876');
    
    if (testResult.accessible) {
      log('Test server is accessible via localhost! Network appears to be working correctly.', 'success');
    } else {
      log(`Test server is NOT accessible via localhost: ${testResult.error}`, 'error');
      log('This indicates a fundamental issue with localhost connections.', 'error');
    }
    
    testServer.close();
    
    // Final summary
    section('DIAGNOSIS SUMMARY');
    log('Based on the diagnostics, here are possible issues:');
    
    if (!testResult.accessible) {
      log('1. Localhost connectivity issue - check hosts file or network settings', 'error');
    }
    
    const port3000InUse = await isPortInUse(3000);
    if (port3000InUse) {
      log('2. Port 3000 is already in use by another process', 'warning');
    }
    
    if (!envFound) {
      log('3. Missing environment variables may be preventing startup', 'warning');
    }
    
    log('\nNext steps:');
    log('1. Try a different port: npm run dev -- -p 3456');
    log('2. Run Next.js with verbose logging: DEBUG=* npm run dev');
    log('3. Check for error logs in the console');
    
    log('\nDiagnostics complete!', 'success');
  });
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('Error running diagnostics:', error);
});