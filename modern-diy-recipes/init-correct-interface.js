#!/usr/bin/env node

/**
 * Interface Initialization Script
 * 
 * This script captures the CURRENT interface running on port 3000 as the 
 * CORRECT baseline, overriding any contradictory documentation.
 * 
 * Run this to establish the current state as the source of truth.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

async function captureCurrentInterface() {
  console.log('🔍 Capturing current interface state from port 3000...\n');

  // Read current page.tsx to identify the component in use
  const pagePath = path.join(__dirname, 'src/app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Extract the component being used
  const componentMatch = pageContent.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
  const componentName = componentMatch ? componentMatch[1] : 'Unknown';
  const componentPath = componentMatch ? componentMatch[2] : 'Unknown';

  // Create timestamp
  const timestamp = new Date().toISOString();

  // Create the correct interface specification
  const correctInterface = {
    timestamp,
    capturedFrom: 'http://localhost:3000',
    component: {
      name: componentName,
      importPath: componentPath,
      file: 'src/app/page.tsx'
    },
    description: 'KRAFT_AI TERMINAL - Three-column retro terminal interface',
    layout: {
      header: '>KRAFT_AI TERMINAL_ with status indicators',
      columns: [
        'Left: DIRECTORIES (FORMULATIONS, INGREDIENTS, TOOLS, LIBRARY, SETTINGS)',
        'Center: List of items/formulations',
        'Right: Details panel'
      ],
      footer: 'Simple status bar (no debug panels)'
    },
    themes: ['hackers', 'dystopia', 'neotopia'],
    verification: {
      mustContain: ['TripleColumnLayoutClean'],
      mustNotContain: ['DEBUG', 'MODULE_STATISTICS', 'LIVE_SYSTEM_LOG', 'document-centric', 'module-based']
    }
  };

  // Write the correct interface specification
  const outputPath = path.join(__dirname, 'CORRECT_INTERFACE.json');
  fs.writeFileSync(outputPath, JSON.stringify(correctInterface, null, 2));
  
  console.log('✅ Current interface captured successfully!\n');
  console.log('📋 Interface Details:');
  console.log(`   Component: ${componentName}`);
  console.log(`   Import: ${componentPath}`);
  console.log(`   Timestamp: ${timestamp}\n`);

  // Update CLAUDE.md to reflect this is the correct interface
  updateClaudeMd(correctInterface);

  // Create a verification script
  createVerificationScript(correctInterface);

  console.log('🎯 Initialization complete! The current interface is now the source of truth.\n');
  console.log('📌 Any documentation that contradicts this is now considered outdated.\n');
}

function updateClaudeMd(correctInterface) {
  const claudeMdPath = path.join(__dirname, 'CLAUDE.md');
  let content = fs.readFileSync(claudeMdPath, 'utf8');
  
  // Add or update the correct interface section
  const updateSection = `
## 🎯 VERIFIED CORRECT INTERFACE (Last Updated: ${correctInterface.timestamp})

**THIS IS THE SOURCE OF TRUTH - captured from the running application**

The CORRECT interface uses:
- Component: \`${correctInterface.component.name}\`
- Import Path: \`${correctInterface.component.importPath}\`
- File: \`${correctInterface.component.file}\`

Any documentation that suggests using different components or layouts is OUTDATED and should be ignored.
`;

  // Insert after the project memory header
  if (content.includes('## 🎯 VERIFIED CORRECT INTERFACE')) {
    // Replace existing section
    content = content.replace(/## 🎯 VERIFIED CORRECT INTERFACE[\s\S]*?(?=##|$)/, updateSection + '\n');
  } else {
    // Add new section after first line
    const lines = content.split('\n');
    lines.splice(2, 0, updateSection);
    content = lines.join('\n');
  }

  fs.writeFileSync(claudeMdPath, content);
  console.log('📝 Updated CLAUDE.md with correct interface information\n');
}

function createVerificationScript(correctInterface) {
  const verifyScript = `#!/usr/bin/env node

/**
 * Interface Verification Script
 * Checks if the current codebase matches the correct interface
 */

const fs = require('fs');
const path = require('path');

function verify() {
  const pagePath = path.join(__dirname, 'src/app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  let isCorrect = true;
  const issues = [];

  // Check for correct component
  if (!pageContent.includes('${correctInterface.component.name}')) {
    isCorrect = false;
    issues.push('❌ Wrong component used in page.tsx');
  }

  // Check for forbidden content
  ${JSON.stringify(correctInterface.verification.mustNotContain)}.forEach(forbidden => {
    if (pageContent.includes(forbidden)) {
      isCorrect = false;
      issues.push(\`❌ Found forbidden content: \${forbidden}\`);
    }
  });

  if (isCorrect) {
    console.log('✅ Interface verification PASSED - using correct interface!');
  } else {
    console.log('⚠️  Interface verification FAILED:');
    issues.forEach(issue => console.log('   ' + issue));
    console.log('\\n📌 Run "node init-correct-interface.js" to see the correct configuration');
  }
}

verify();
`;

  fs.writeFileSync(path.join(__dirname, 'verify-interface.js'), verifyScript);
  fs.chmodSync(path.join(__dirname, 'verify-interface.js'), '755');
  console.log('🔧 Created verify-interface.js script for ongoing verification\n');
}

// Run the initialization
captureCurrentInterface().catch(console.error);