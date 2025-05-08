#!/usr/bin/env node

/**
 * Comprehensive Network Diagnostics Tool for DIY Formulations
 * 
 * This script performs various network diagnostics to help troubleshoot
 * connectivity issues with locally running services.
 */

import http from 'http';
import { exec } from 'child_process';
import os from 'os';
import net from 'net';
import dns from 'dns';
import { promisify } from 'util';

const execPromise = promisify(exec);
const dnsLookup = promisify(dns.lookup);

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}===== DIY Formulations Network Diagnostics =====${colors.reset}\n`);

// Start a diagnostic server on multiple interfaces and ports
async function startDiagnosticServers() {
  const ports = [3000, 3001, 8080];
  const interfaces = ['0.0.0.0', '127.0.0.1', ...getLocalIPs()];
  const servers = [];

  console.log(`${colors.blue}Starting diagnostic servers on multiple interfaces and ports...${colors.reset}`);
  
  for (const intf of interfaces) {
    for (const port of ports) {
      try {
        const server = http.createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`Server running on ${intf}:${port}\n`);
        });
        
        await new Promise((resolve, reject) => {
          server.on('error', (err) => {
            console.log(`${colors.yellow}Could not start server on ${intf}:${port} - ${err.message}${colors.reset}`);
            resolve();
          });
          
          server.listen(port, intf, () => {
            console.log(`${colors.green}Server listening on http://${intf}:${port}/${colors.reset}`);
            servers.push({ server, interface: intf, port });
            resolve();
          });
          
          // Add a timeout to prevent hanging
          setTimeout(() => {
            resolve();
          }, 2000);
        });
      } catch (err) {
        console.log(`${colors.red}Error starting server on ${intf}:${port}: ${err.message}${colors.reset}`);
      }
    }
  }
  
  return servers;
}

// Check localhost connectivity
async function checkLocalhostConnectivity() {
  console.log(`\n${colors.blue}Checking localhost connectivity...${colors.reset}`);
  
  const variants = [
    { host: 'localhost', port: 3000 },
    { host: '127.0.0.1', port: 3000 },
    { host: '0.0.0.0', port: 3000 },
    ...getLocalIPs().map(ip => ({ host: ip, port: 3000 }))
  ];
  
  for (const { host, port } of variants) {
    await testConnection(host, port);
  }
}

// Test a specific host:port connection
async function testConnection(host, port) {
  return new Promise((resolve) => {
    const client = net.createConnection({ host, port }, () => {
      console.log(`${colors.green}✓ Successfully connected to ${host}:${port}${colors.reset}`);
      client.end();
      resolve(true);
    });
    
    client.on('error', (err) => {
      console.log(`${colors.red}✗ Failed to connect to ${host}:${port} - ${err.message}${colors.reset}`);
      resolve(false);
    });
    
    client.setTimeout(2000, () => {
      console.log(`${colors.yellow}⚠ Connection timeout for ${host}:${port}${colors.reset}`);
      client.destroy();
      resolve(false);
    });
  });
}

// Get all local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

// Check DNS resolution
async function checkDNS() {
  console.log(`\n${colors.blue}Checking DNS resolution...${colors.reset}`);
  
  try {
    const result = await dnsLookup('localhost');
    console.log(`${colors.green}localhost resolves to: ${result.address}${colors.reset}`);
  } catch (err) {
    console.log(`${colors.red}Error resolving localhost: ${err.message}${colors.reset}`);
  }
  
  try {
    const result = await execPromise('cat /etc/hosts | grep localhost');
    console.log(`${colors.green}Hosts file entries for localhost:\n${result.stdout}${colors.reset}`);
  } catch (err) {
    console.log(`${colors.yellow}Could not read /etc/hosts file or no localhost entries found${colors.reset}`);
  }
}

// Check for firewalls
async function checkFirewalls() {
  console.log(`\n${colors.blue}Checking firewall status...${colors.reset}`);
  
  if (process.platform === 'darwin') {
    // macOS
    try {
      const result = await execPromise('defaults read /Library/Preferences/com.apple.alf globalstate');
      const status = result.stdout.trim() === '1' ? 'enabled' : 'disabled';
      console.log(`${colors.yellow}macOS application firewall is ${status}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.yellow}Could not determine macOS firewall status${colors.reset}`);
    }
  } else if (process.platform === 'linux') {
    // Linux
    try {
      const ufwResult = await execPromise('ufw status');
      console.log(`${colors.yellow}UFW status: ${ufwResult.stdout.trim()}${colors.reset}`);
    } catch (err) {
      // UFW might not be installed
    }
    
    try {
      const iptablesResult = await execPromise('iptables -L | grep -i input');
      console.log(`${colors.yellow}IPTables input rules: ${iptablesResult.stdout.trim()}${colors.reset}`);
    } catch (err) {
      // Might not have permission
    }
  } else if (process.platform === 'win32') {
    // Windows
    try {
      const result = await execPromise('netsh advfirewall show allprofiles state');
      console.log(`${colors.yellow}Windows Firewall status:\n${result.stdout.trim()}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.yellow}Could not determine Windows firewall status${colors.reset}`);
    }
  }
}

// Check for containers or virtual environments
async function checkVirtualization() {
  console.log(`\n${colors.blue}Checking for virtualization and containers...${colors.reset}`);
  
  // Check for Docker
  try {
    const dockerResult = await execPromise('docker ps');
    console.log(`${colors.yellow}Docker appears to be running. Active containers:\n${dockerResult.stdout.trim()}${colors.reset}`);
  } catch (err) {
    console.log(`${colors.green}No Docker environment detected${colors.reset}`);
  }
  
  // Check for common virtualization signs
  try {
    if (process.platform === 'linux') {
      const virt = await execPromise('systemd-detect-virt || dmesg | grep -i virtual');
      console.log(`${colors.yellow}Virtualization status: ${virt.stdout.trim() || 'None detected'}${colors.reset}`);
    } else if (process.platform === 'darwin') {
      console.log(`${colors.yellow}Running on macOS - virtualization check not implemented${colors.reset}`);
    } else if (process.platform === 'win32') {
      console.log(`${colors.yellow}Running on Windows - virtualization check not implemented${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.green}No virtualization detected${colors.reset}`);
  }
}

// Check for proxies
async function checkProxies() {
  console.log(`\n${colors.blue}Checking for proxy configurations...${colors.reset}`);
  
  // Check environment variables
  const proxyEnvVars = ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'no_proxy'];
  let foundProxy = false;
  
  for (const envVar of proxyEnvVars) {
    if (process.env[envVar]) {
      console.log(`${colors.yellow}Found proxy environment variable: ${envVar}=${process.env[envVar]}${colors.reset}`);
      foundProxy = true;
    }
  }
  
  if (!foundProxy) {
    console.log(`${colors.green}No proxy environment variables detected${colors.reset}`);
  }
  
  // Check system proxy settings
  if (process.platform === 'darwin') {
    try {
      const networkServices = await execPromise('networksetup -listallnetworkservices | tail -n +2');
      const services = networkServices.stdout.trim().split('\n');
      
      for (const service of services) {
        try {
          const proxyStatus = await execPromise(`networksetup -getwebproxy "${service}"`);
          if (proxyStatus.stdout.includes('Enabled: Yes')) {
            console.log(`${colors.yellow}Web proxy enabled for ${service}:\n${proxyStatus.stdout.trim()}${colors.reset}`);
            foundProxy = true;
          }
        } catch (err) {
          // Skip errors for disabled services
        }
      }
      
      if (!foundProxy) {
        console.log(`${colors.green}No system proxy detected${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.yellow}Could not check system proxy settings${colors.reset}`);
    }
  }
}

// Check for localhost network interface status
async function checkLocalInterface() {
  console.log(`\n${colors.blue}Checking localhost network interface...${colors.reset}`);
  
  try {
    let result;
    if (process.platform === 'darwin' || process.platform === 'linux') {
      result = await execPromise('ifconfig lo0 || ifconfig lo');
      console.log(`${colors.green}Loopback interface status:\n${result.stdout.trim()}${colors.reset}`);
    } else if (process.platform === 'win32') {
      result = await execPromise('ipconfig | findstr Loopback');
      console.log(`${colors.green}Loopback interface status:\n${result.stdout.trim()}${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}Could not check loopback interface: ${err.message}${colors.reset}`);
  }
}

// Main function
async function main() {
  console.log(`${colors.bold}System Information:${colors.reset}`);
  console.log(`- Platform: ${process.platform}`);
  console.log(`- Node.js: ${process.version}`);
  console.log(`- Hostname: ${os.hostname()}`);
  console.log(`- Network interfaces: ${getLocalIPs().join(', ')}`);
  
  // Perform checks
  await checkDNS();
  await checkLocalInterface();
  await checkFirewalls();
  await checkVirtualization();
  await checkProxies();
  
  // Start diagnostic servers
  const servers = await startDiagnosticServers();
  
  if (servers.length > 0) {
    // If we successfully started any servers, check connectivity
    await checkLocalhostConnectivity();
    
    // Allow time for manual testing
    console.log(`\n${colors.bold}${colors.cyan}All diagnostic servers are now running${colors.reset}`);
    console.log(`${colors.cyan}You can manually test these URLs in a browser or with curl${colors.reset}`);
    console.log(`${colors.cyan}Press Ctrl+C to stop all servers${colors.reset}`);
    
    // Keep the script running
    await new Promise(() => {}); // This will never resolve
  } else {
    console.log(`\n${colors.red}${colors.bold}Could not start any diagnostic servers.${colors.reset}`);
    console.log(`${colors.red}This may indicate port conflicts or permission issues.${colors.reset}`);
  }
}

// Run the diagnostics
main().catch(err => {
  console.error(`${colors.red}${colors.bold}Error in network diagnostics:${colors.reset}`, err);
  process.exit(1);
});