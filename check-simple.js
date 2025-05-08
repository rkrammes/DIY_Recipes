// check-simple.js
// Simple script to check if the server is running

import fetch from 'node-fetch';
import fs from 'fs';

console.log('Checking server at http://localhost:3000...');

// Function to check if server is up
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    console.log(`Server responded with status: ${response.status}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Server response length: ${text.length} bytes`);
      
      // Save the HTML response to a file
      fs.writeFileSync('server-response.html', text);
      console.log('Saved response to server-response.html');
      
      // Check for key elements
      const hasTerminal = text.includes('KRAFT_AI TERMINAL');
      const hasThemes = text.includes('HACKERS_TERMINAL') || 
                       text.includes('DYSTOPIA_CONSOLE') || 
                       text.includes('NEOTOPIA_INTERFACE');
      
      console.log(`Contains KRAFT_AI TERMINAL: ${hasTerminal}`);
      console.log(`Contains theme references: ${hasThemes}`);
    }
  } catch (error) {
    console.error(`Error checking server: ${error.message}`);
  }
}

// Run the check
checkServer();