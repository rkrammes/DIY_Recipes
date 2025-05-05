/**
 * Comprehensive Next.js Diagnostic Tool
 * 
 * This script helps diagnose issues with Next.js applications by:
 * 1. Checking for circular dependencies
 * 2. Detecting provider initialization problems
 * 3. Monitoring for memory leaks
 * 4. Testing server connectivity
 * 5. Verifying hydration issues
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');

const COLOR = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Logging helper
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let prefix = '';
  
  switch (type) {
    case 'error': prefix = `${COLOR.red}ERROR`; break;
    case 'warn': prefix = `${COLOR.yellow}WARN`; break;
    case 'success': prefix = `${COLOR.green}SUCCESS`; break;
    case 'step': prefix = `${COLOR.blue}STEP`; break;
    case 'info': default: prefix = `${COLOR.cyan}INFO`; break;
  }
  
  console.log(`[${timestamp}] ${prefix}${COLOR.reset}: ${message}`);
}

// Create a diagnostic log file
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `next-debug-${Date.now()}.log`);
const logStream = fs.createWriteStream(logFile);

function logToFile(message) {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] ${message}\n`);
}

// Function to check for circular dependencies
async function checkCircularDependencies() {
  log('Checking for circular dependencies...', 'step');
  try {
    const madge = path.join(__dirname, 'node_modules', '.bin', 'madge');
    
    if (fs.existsSync(madge)) {
      log('Using madge to detect circular dependencies');
      const result = execSync(`${madge} --circular --extensions ts,tsx,js,jsx src`, { encoding: 'utf8' });
      
      if (result.trim()) {
        log('Circular dependencies found:', 'error');
        log(result);
        logToFile(`CIRCULAR DEPENDENCIES:\n${result}`);
      } else {
        log('No circular dependencies found', 'success');
      }
    } else {
      log('madge not found in node_modules. Installing temporarily...', 'warn');
      execSync('npm install --no-save madge', { stdio: 'inherit' });
      log('Checking for circular dependencies with madge');
      const result = execSync(`npx madge --circular --extensions ts,tsx,js,jsx src`, { encoding: 'utf8' });
      
      if (result.trim()) {
        log('Circular dependencies found:', 'error');
        log(result);
        logToFile(`CIRCULAR DEPENDENCIES:\n${result}`);
      } else {
        log('No circular dependencies found', 'success');
      }
    }
  } catch (error) {
    log(`Error checking circular dependencies: ${error.message}`, 'error');
    logToFile(`ERROR CHECKING CIRCULAR DEPENDENCIES: ${error.message}`);
    
    // Fallback to manual check for known problematic imports
    log('Falling back to manual check for known problematic imports', 'warn');
    const problemPatterns = [
      { file: 'ThemeProvider', importing: 'AnimationProvider' },
      { file: 'AnimationProvider', importing: 'ThemeProvider' },
      { file: 'AudioProvider', importing: 'ThemeProvider' }
    ];
    
    let foundProblems = false;
    
    // Find all TypeScript files
    const tsFiles = findFilesRecursive(path.join(__dirname, 'src'), ['.ts', '.tsx']);
    
    tsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      problemPatterns.forEach(pattern => {
        if (path.basename(file).includes(pattern.file) && 
            content.includes(`import`) && 
            content.includes(pattern.importing)) {
          log(`Possible circular import in ${file}: imports ${pattern.importing}`, 'error');
          logToFile(`POSSIBLE CIRCULAR IMPORT: ${file} imports ${pattern.importing}`);
          foundProblems = true;
        }
      });
    });
    
    if (!foundProblems) {
      log('No obvious circular dependencies found in manual check', 'success');
    }
  }
}

// Utility to find files recursively
function findFilesRecursive(dir, extensions) {
  let results = [];
  
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(findFilesRecursive(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Check for common SSR issues
function checkSSRIssues() {
  log('Checking for common SSR issues...', 'step');
  
  const problemPatterns = [
    { pattern: 'localStorage', context: 'outside useEffect' },
    { pattern: 'document.', context: 'outside useEffect' },
    { pattern: 'window.', context: 'outside useEffect' },
    { pattern: 'navigator.', context: 'outside useEffect' },
    { pattern: 'new Audio', context: 'outside useEffect' }
  ];
  
  // Find all React component files
  const componentFiles = findFilesRecursive(path.join(__dirname, 'src'), ['.tsx', '.jsx']);
  
  let foundProblems = false;
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    let inUseEffect = false;
    let inUseClientDirective = false;
    
    lines.forEach((line, index) => {
      // Keep track of useEffect blocks
      if (line.includes('useEffect')) {
        inUseEffect = true;
      } else if (inUseEffect && line.includes('})) {')) {
        inUseEffect = false;
      }
      
      // Keep track of "use client" directive
      if (line.includes('"use client"') || line.includes("'use client'")) {
        inUseClientDirective = true;
      }
      
      // Check for browser APIs outside useEffect
      if (!inUseEffect && !inUseClientDirective) {
        problemPatterns.forEach(({ pattern, context }) => {
          if (line.includes(pattern) && !line.includes('typeof') && !line.includes('===')) {
            log(`Possible SSR issue in ${file}:${index + 1}: using ${pattern} ${context}`, 'error');
            logToFile(`SSR ISSUE: ${file}:${index + 1}: using ${pattern} ${context}`);
            logToFile(`  ${line.trim()}`);
            foundProblems = true;
          }
        });
      }
    });
  });
  
  if (!foundProblems) {
    log('No obvious SSR issues found', 'success');
  }
}

// Start a test server and check connectivity
async function testServerConnectivity() {
  log('Testing server connectivity...', 'step');
  
  return new Promise((resolve) => {
    // Create a simple test server
    const server = http.createServer((req, res) => {
      log(`Request received: ${req.method} ${req.url}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Server connectivity test successful');
    });
    
    // Listen on a random port
    server.listen(0, '0.0.0.0', () => {
      const port = server.address().port;
      log(`Test server started on port ${port}`);
      
      // Try to connect to ourselves
      http.get(`http://localhost:${port}`, (res) => {
        log(`Localhost connectivity test successful! Status: ${res.statusCode}`, 'success');
        server.close(() => {
          log('Test server closed');
          resolve(true);
        });
      }).on('error', (err) => {
        log(`Localhost connectivity test failed: ${err.message}`, 'error');
        logToFile(`CONNECTIVITY TEST FAILED: ${err.message}`);
        
        // Try a direct IP connection
        http.get(`http://127.0.0.1:${port}`, (res) => {
          log(`IP address connectivity test successful! Status: ${res.statusCode}`, 'success');
          server.close(() => {
            log('Test server closed');
            resolve(true);
          });
        }).on('error', (err) => {
          log(`IP address connectivity test also failed: ${err.message}`, 'error');
          logToFile(`IP ADDRESS CONNECTIVITY TEST FAILED: ${err.message}`);
          server.close(() => {
            log('Test server closed');
            resolve(false);
          });
        });
      });
    });
    
    server.on('error', (err) => {
      log(`Server error: ${err.message}`, 'error');
      logToFile(`SERVER TEST ERROR: ${err.message}`);
      resolve(false);
    });
  });
}

// Check Next.js config for issues
function checkNextConfig() {
  log('Checking Next.js configuration...', 'step');
  
  const configFiles = [
    path.join(__dirname, 'next.config.js'),
    path.join(__dirname, 'next.config.ts'),
    path.join(__dirname, 'next.config.mjs')
  ];
  
  let configFile = null;
  
  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      configFile = file;
      break;
    }
  }
  
  if (!configFile) {
    log('No Next.js config file found!', 'warn');
    return;
  }
  
  log(`Found Next.js config at ${configFile}`, 'success');
  const content = fs.readFileSync(configFile, 'utf8');
  
  // Check for potential issues
  if (content.includes('experimental')) {
    log('Config contains experimental features, which may cause instability', 'warn');
    logToFile('CONFIG WARNING: Using experimental features');
  }
  
  if (content.includes('webpack') && content.includes('resolve.alias')) {
    log('Config contains webpack alias configuration', 'info');
  }
  
  if (content.includes('ignoreBuildErrors: true')) {
    log('Config is ignoring TypeScript build errors, which may hide issues', 'warn');
    logToFile('CONFIG WARNING: Ignoring TypeScript build errors');
  }
}

// Check memory usage during Next.js startup
async function checkMemoryUsage() {
  log('Starting Next.js to monitor memory usage...', 'step');
  
  return new Promise((resolve) => {
    // Start Next.js with a child process
    const nextProcess = spawn('npm', ['run', 'dev', '--', '--port', '0'], {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let memoryReadings = [];
    let initialMemory = process.memoryUsage().heapUsed;
    let startTime = Date.now();
    let serverStarted = false;
    
    // Monitor stdout
    nextProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // When server is ready
      if (chunk.includes('ready') && !serverStarted) {
        serverStarted = true;
        const currentMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = (currentMemory - initialMemory) / 1024 / 1024;
        const timeTaken = (Date.now() - startTime) / 1000;
        
        log(`Next.js server started in ${timeTaken.toFixed(2)}s`, 'success');
        log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`, 'info');
        logToFile(`STARTUP MEMORY INCREASE: ${memoryIncrease.toFixed(2)} MB`);
        logToFile(`STARTUP TIME: ${timeTaken.toFixed(2)}s`);
        
        // Record memory reading
        memoryReadings.push({
          time: timeTaken,
          memory: currentMemory,
          increase: memoryIncrease
        });
        
        // Wait a bit more and check memory again
        setTimeout(() => {
          const finalMemory = process.memoryUsage().heapUsed;
          const totalIncrease = (finalMemory - initialMemory) / 1024 / 1024;
          
          log(`Final memory increase: ${totalIncrease.toFixed(2)} MB`, 'info');
          logToFile(`FINAL MEMORY INCREASE: ${totalIncrease.toFixed(2)} MB`);
          
          // Kill the Next.js process
          nextProcess.kill();
          resolve({
            memoryReadings,
            output,
            success: true
          });
        }, 10000);
      }
    });
    
    // Monitor stderr
    nextProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Log errors
      if (chunk.includes('error')) {
        log(`Next.js error: ${chunk.trim()}`, 'error');
        logToFile(`NEXT.JS ERROR: ${chunk.trim()}`);
      }
    });
    
    // Handle process exit
    nextProcess.on('close', (code) => {
      if (code !== 0 && !serverStarted) {
        log(`Next.js process exited with code ${code} before server started`, 'error');
        logToFile(`NEXT.JS EXIT CODE: ${code}`);
        logToFile(`NEXT.JS OUTPUT:\n${output}`);
        resolve({
          success: false,
          output,
          exitCode: code
        });
      }
    });
    
    // Set a timeout in case Next.js never starts
    setTimeout(() => {
      if (!serverStarted) {
        log('Next.js failed to start within 60 seconds', 'error');
        logToFile('TIMEOUT: Next.js failed to start within 60 seconds');
        nextProcess.kill();
        resolve({
          success: false,
          output,
          timeout: true
        });
      }
    }, 60000);
  });
}

// Run all the checks
async function runDiagnostics() {
  log('Starting Next.js diagnostics...', 'step');
  logToFile('NEXT.JS DIAGNOSTICS STARTED');
  
  try {
    // Get basic system info
    log(`Node.js version: ${process.version}`);
    log(`Platform: ${process.platform} ${process.arch}`);
    log(`Working directory: ${process.cwd()}`);
    
    logToFile(`NODE.JS VERSION: ${process.version}`);
    logToFile(`PLATFORM: ${process.platform} ${process.arch}`);
    logToFile(`WORKING DIRECTORY: ${process.cwd()}`);
    
    // Check for circular dependencies
    await checkCircularDependencies();
    
    // Check for common SSR issues
    checkSSRIssues();
    
    // Check Next.js configuration
    checkNextConfig();
    
    // Test server connectivity
    const connectivityResult = await testServerConnectivity();
    
    if (!connectivityResult) {
      log('Server connectivity test failed. This may indicate network issues.', 'error');
    }
    
    // Monitor memory usage during startup
    const memoryResult = await checkMemoryUsage();
    
    if (!memoryResult.success) {
      log('Memory usage test failed. Next.js may have stability issues.', 'error');
    }
    
    // Final summary
    log('Diagnostics complete', 'success');
    log(`Results saved to ${logFile}`, 'info');
    
    logToFile('DIAGNOSTICS COMPLETE');
    logStream.end();
    
  } catch (error) {
    log(`Error running diagnostics: ${error.message}`, 'error');
    console.error(error);
    logToFile(`FATAL ERROR: ${error.message}`);
    logToFile(error.stack);
    logStream.end();
  }
}

// Run the diagnostics
runDiagnostics();