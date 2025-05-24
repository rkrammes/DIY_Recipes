#!/usr/bin/env node

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
  if (!pageContent.includes('TripleColumnLayoutClean')) {
    isCorrect = false;
    issues.push('❌ Wrong component used in page.tsx');
  }

  // Check for forbidden content
  ["DEBUG","MODULE_STATISTICS","LIVE_SYSTEM_LOG","document-centric","module-based"].forEach(forbidden => {
    if (pageContent.includes(forbidden)) {
      isCorrect = false;
      issues.push(`❌ Found forbidden content: ${forbidden}`);
    }
  });

  if (isCorrect) {
    console.log('✅ Interface verification PASSED - using correct interface!');
  } else {
    console.log('⚠️  Interface verification FAILED:');
    issues.forEach(issue => console.log('   ' + issue));
    console.log('\n📌 Run "node init-correct-interface.js" to see the correct configuration');
  }
}

verify();
