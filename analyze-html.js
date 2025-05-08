// analyze-html.js
// This script analyzes the HTML files to understand the interface without needing a server

import fs from 'fs';

console.log('Analyzing HTML files to understand the interface...');

// Function to check an HTML file for key elements
function analyzeHtmlFile(filePath) {
  console.log(`Analyzing file: ${filePath}`);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`File size: ${content.length} bytes`);
    
    // Check for key elements
    const hasTerminal = content.includes('KRAFT_AI TERMINAL');
    const hasHackers = content.includes('HACKERS_TERMINAL');
    const hasDystopia = content.includes('DYSTOPIA_CONSOLE');
    const hasNeotopia = content.includes('NEOTOPIA_INTERFACE');
    
    console.log(`Contains KRAFT_AI TERMINAL: ${hasTerminal}`);
    console.log(`Contains HACKERS_TERMINAL: ${hasHackers}`);
    console.log(`Contains DYSTOPIA_CONSOLE: ${hasDystopia}`);
    console.log(`Contains NEOTOPIA_INTERFACE: ${hasNeotopia}`);
    
    // Check for theme data attributes
    const hasHackersTheme = content.includes('data-theme="hackers"');
    const hasDystopiaTheme = content.includes('data-theme="dystopia"');
    const hasNeotopiaTheme = content.includes('data-theme="neotopia"');
    
    console.log(`Contains hackers theme: ${hasHackersTheme}`);
    console.log(`Contains dystopia theme: ${hasDystopiaTheme}`);
    console.log(`Contains neotopia theme: ${hasNeotopiaTheme}`);
    
    // Look for other key interface elements
    const hasThemeControls = content.includes('theme-selector') || content.includes('theme-controls');
    const hasAudio = content.includes('audio-control') || content.includes('sound-');
    const hasFormulations = content.includes('formulation') || content.includes('formula');
    const hasComponents = content.includes('component-') || content.includes('ingredient');
    
    console.log(`Contains theme controls: ${hasThemeControls}`);
    console.log(`Contains audio references: ${hasAudio}`);
    console.log(`Contains formulations: ${hasFormulations}`);
    console.log(`Contains components: ${hasComponents}`);
    
  } catch (error) {
    console.error(`Error analyzing file: ${error.message}`);
  }
}

// Analyze key files
console.log('\n--- Analyzing index.html ---');
analyzeHtmlFile('./index.html');

console.log('\n--- Analyzing index-terminal.html ---');
analyzeHtmlFile('./index-terminal.html');

console.log('\n--- Analyzing updated-index-terminal.html ---');
analyzeHtmlFile('./updated-index-terminal.html');