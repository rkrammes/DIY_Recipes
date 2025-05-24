#!/usr/bin/env node

/**
 * Feature Extraction Script
 * Analyzes alternative interfaces for useful features to preserve
 */

const fs = require('fs');
const path = require('path');

const featuresToLookFor = [
  // Keyboard navigation
  { pattern: /useKeyboard|KeyboardNavigation|handleKey|onKeyDown|arrow.*key/i, category: 'Keyboard Navigation' },
  { pattern: /focus.*management|focusTrap|tabIndex/i, category: 'Focus Management' },
  
  // State management
  { pattern: /useReducer|dispatch|globalState|stateManager/i, category: 'State Management' },
  { pattern: /localStorage|sessionStorage|persist/i, category: 'Data Persistence' },
  
  // Performance
  { pattern: /useMemo|useCallback|React\.memo|virtualization|lazy/i, category: 'Performance' },
  { pattern: /debounce|throttle|requestAnimationFrame/i, category: 'Performance Optimization' },
  
  // User experience
  { pattern: /loading.*skeleton|placeholder|shimmer/i, category: 'Loading States' },
  { pattern: /error.*boundary|fallback|retry/i, category: 'Error Handling' },
  { pattern: /animation|transition|spring|gesture/i, category: 'Animations' },
  { pattern: /hotkey|shortcut|accelerator/i, category: 'Keyboard Shortcuts' },
  
  // Features
  { pattern: /search|filter|sort/i, category: 'Search/Filter' },
  { pattern: /export|import|csv|json/i, category: 'Import/Export' },
  { pattern: /print|pdf|download/i, category: 'Export Features' },
  { pattern: /undo|redo|history/i, category: 'History Management' },
  { pattern: /realtime|websocket|subscription/i, category: 'Real-time Updates' },
  
  // Accessibility
  { pattern: /aria-|role=|screen.*reader/i, category: 'Accessibility' },
  { pattern: /announce|live.*region/i, category: 'Screen Reader Support' },
  
  // Theme enhancements
  { pattern: /theme.*persist|theme.*storage|rememberTheme/i, category: 'Theme Persistence' },
  { pattern: /custom.*theme|theme.*editor/i, category: 'Theme Customization' },
  
  // Module features
  { pattern: /module.*registry|registerModule|dynamicModule/i, category: 'Module System' },
  { pattern: /plugin|extension|addon/i, category: 'Plugin System' }
];

const foundFeatures = {};
const fileFeatures = {};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(__dirname, filePath);
    const features = [];
    
    featuresToLookFor.forEach(({ pattern, category }) => {
      const matches = content.match(pattern);
      if (matches) {
        if (!foundFeatures[category]) {
          foundFeatures[category] = [];
        }
        
        // Extract context around the match
        matches.forEach(match => {
          const index = content.indexOf(match);
          const start = Math.max(0, index - 100);
          const end = Math.min(content.length, index + match.length + 100);
          const context = content.substring(start, end).trim();
          
          foundFeatures[category].push({
            file: relativePath,
            match,
            context: context.replace(/\s+/g, ' ').substring(0, 150) + '...'
          });
        });
        
        features.push(category);
      }
    });
    
    if (features.length > 0) {
      fileFeatures[relativePath] = [...new Set(features)];
    }
    
  } catch (err) {
    // Ignore read errors
  }
}

function analyzeFeatures() {
  console.log('🔍 Scanning alternative interfaces for useful features...\n');
  
  // Scan alternative layout components
  const layoutFiles = [
    'src/components/TripleColumnLayout.tsx',
    'src/components/layouts/ColumnLayout.tsx',
    'src/components/layouts/EnhancedModularLayout.tsx',
    'src/components/layouts/KraftTerminalModularLayout.tsx',
    'src/components/layouts/ModularLayout.tsx',
    'src/components/layouts/ModuleLayout.tsx',
  ];
  
  // Scan alternative pages
  const pageFiles = [
    'src/app/enhanced-formulations/page.tsx',
    'src/app/kraft-modular/page.tsx',
    'src/app/module-dashboard/page.tsx',
    'src/app/module-system/page.tsx',
    'src/app/terminal/page.tsx',
  ];
  
  [...layoutFiles, ...pageFiles].forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      scanFile(fullPath);
    }
  });
  
  // Now check what the main interface has
  console.log('📊 Comparing with current TripleColumnLayoutClean...\n');
  const mainFile = path.join(__dirname, 'src/components/TripleColumnLayoutClean.tsx');
  const mainContent = fs.readFileSync(mainFile, 'utf8');
  
  console.log('=' .repeat(80));
  console.log('\n🎯 FEATURES FOUND IN ALTERNATIVE INTERFACES:\n');
  
  Object.entries(foundFeatures).forEach(([category, instances]) => {
    console.log(`\n${category}:`);
    
    // Check if main file has this feature
    const hasInMain = instances.some(({ match }) => mainContent.includes(match));
    const status = hasInMain ? '✓ Already in main' : '⚠️  MISSING from main';
    
    console.log(`  Status: ${status}`);
    console.log(`  Found in ${instances.length} location(s):`);
    
    // Show unique files
    const uniqueFiles = [...new Set(instances.map(i => i.file))];
    uniqueFiles.forEach(file => {
      console.log(`    - ${file}`);
    });
    
    if (!hasInMain) {
      console.log(`  Example implementation:`);
      const example = instances[0];
      console.log(`    "${example.context}"`);
    }
  });
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n💡 RECOMMENDATIONS:\n');
  
  // Find missing critical features
  const criticalMissing = [];
  Object.entries(foundFeatures).forEach(([category, instances]) => {
    const hasInMain = instances.some(({ match }) => mainContent.includes(match));
    if (!hasInMain && ['Keyboard Navigation', 'Focus Management', 'Loading States', 'Error Handling'].includes(category)) {
      criticalMissing.push(category);
    }
  });
  
  if (criticalMissing.length > 0) {
    console.log('⚠️  Critical features missing from main interface:');
    criticalMissing.forEach(feature => {
      console.log(`  - ${feature}`);
    });
    console.log('\nThese should be extracted and added before cleanup.\n');
  } else {
    console.log('✅ Main interface has all critical features.\n');
  }
  
  // Show files with most unique features
  console.log('📁 Files with most unique features:');
  const sortedFiles = Object.entries(fileFeatures)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);
    
  sortedFiles.forEach(([file, features]) => {
    console.log(`  ${file}: ${features.length} features`);
    console.log(`    ${features.join(', ')}`);
  });
  
  console.log('\n');
}

analyzeFeatures();