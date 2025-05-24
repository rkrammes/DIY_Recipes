#!/usr/bin/env node

/**
 * Interface Analysis Script
 * Identifies all alternative interfaces and their usage
 */

const fs = require('fs');
const path = require('path');

const alternativeInterfaces = {
  layouts: [
    // Component layouts
    { file: 'src/components/TripleColumnLayout.tsx', desc: 'Original with debug panels', reason: 'Has debug panels - replaced by Clean version' },
    { file: 'src/components/layouts/ColumnLayout.tsx', desc: 'Generic column layout', reason: 'Too generic - doesn\'t match terminal theme' },
    { file: 'src/components/layouts/EnhancedModularLayout.tsx', desc: 'Enhanced modular version', reason: 'Different design paradigm' },
    { file: 'src/components/layouts/KraftTerminalModularLayout.tsx', desc: 'Modular terminal variant', reason: 'Unnecessary variant' },
    { file: 'src/components/layouts/ModularLayout.tsx', desc: 'Basic modular layout', reason: 'Different design paradigm' },
    { file: 'src/components/layouts/ModuleLayout.tsx', desc: 'Module-based layout', reason: 'Different navigation structure' },
  ],
  
  pages: [
    // Test and experimental pages
    { route: '/document-interface', file: 'src/app/document-interface/page.tsx', reason: 'Alternative interface style' },
    { route: '/document-test', file: 'src/app/document-test/page.tsx', reason: 'Test page' },
    { route: '/document-view', file: 'src/app/document-view/page.tsx', reason: 'Alternative interface style' },
    { route: '/enhanced-formulations', file: 'src/app/enhanced-formulations/page.tsx', reason: 'Experimental variant' },
    { route: '/formula-dashboard', file: 'src/app/formula-dashboard/page.tsx', reason: 'Alternative dashboard' },
    { route: '/formula-database', file: 'src/app/formula-database/page.tsx', reason: 'Different interface paradigm' },
    { route: '/kraft-modular', file: 'src/app/kraft-modular/page.tsx', reason: 'Modular variant' },
    { route: '/minimal', file: 'src/app/minimal/page.tsx', reason: 'Minimal test interface' },
    { route: '/minimal-test', file: 'src/app/minimal-test/page.tsx', reason: 'Test interface' },
    { route: '/module-dashboard', file: 'src/app/module-dashboard/page.tsx', reason: 'Module-based variant' },
    { route: '/module-formulations', file: 'src/app/module-formulations/page.tsx', reason: 'Module-based variant' },
    { route: '/module-system', file: 'src/app/module-system/page.tsx', reason: 'Module system variant' },
    { route: '/modules', file: 'src/app/modules/page.tsx', reason: 'Module listing page' },
    { route: '/simple-doc', file: 'src/app/simple-doc/page.tsx', reason: 'Simple document view' },
    { route: '/stable-test', file: 'src/app/stable-test/page.tsx', reason: 'Test page' },
    { route: '/test', file: 'src/app/test/page.tsx', reason: 'Generic test page' },
    { route: '/test-fixed', file: 'src/app/test-fixed/page.tsx', reason: 'Test page' },
    { route: '/test-fixed-layout', file: 'src/app/test-fixed-layout/page.tsx', reason: 'Test page' },
    { route: '/terminal', file: 'src/app/terminal/page.tsx', reason: 'Command-line interface - different from main app' },
  ],
  
  alternativeLayouts: [
    { file: 'src/app/console-layout.tsx', reason: 'Alternative layout file' },
    { file: 'src/app/fixed-layout.tsx', reason: 'Alternative layout file' },
    { file: 'src/app/layout-clientside.tsx', reason: 'Alternative layout file' },
    { file: 'src/app/layout-complex.backup.tsx', reason: 'Backup file' },
    { file: 'src/app/layout-fix.tsx', reason: 'Alternative layout file' },
    { file: 'src/app/minimal-layout.tsx', reason: 'Alternative layout file' },
    { file: 'src/app/module-system-layout.tsx', reason: 'Module system layout' },
  ]
};

function analyzeInterfaces() {
  console.log('🔍 Analyzing Alternative Interfaces\n');
  console.log('=' .repeat(80));
  
  let totalFiles = 0;
  let missingFiles = 0;
  
  // Check layouts
  console.log('\n📐 ALTERNATIVE LAYOUT COMPONENTS:\n');
  alternativeInterfaces.layouts.forEach(item => {
    totalFiles++;
    const exists = fs.existsSync(path.join(__dirname, item.file));
    const status = exists ? '✓' : '✗';
    if (!exists) missingFiles++;
    
    console.log(`${status} ${item.file}`);
    console.log(`  Description: ${item.desc}`);
    console.log(`  Reason to remove: ${item.reason}\n`);
  });
  
  // Check pages
  console.log('\n📄 ALTERNATIVE PAGE ROUTES:\n');
  alternativeInterfaces.pages.forEach(item => {
    totalFiles++;
    const exists = fs.existsSync(path.join(__dirname, item.file));
    const status = exists ? '✓' : '✗';
    if (!exists) missingFiles++;
    
    console.log(`${status} ${item.route} (${item.file})`);
    console.log(`  Reason to remove: ${item.reason}\n`);
  });
  
  // Check alternative layouts
  console.log('\n📁 ALTERNATIVE LAYOUT FILES:\n');
  alternativeInterfaces.alternativeLayouts.forEach(item => {
    totalFiles++;
    const exists = fs.existsSync(path.join(__dirname, item.file));
    const status = exists ? '✓' : '✗';
    if (!exists) missingFiles++;
    
    console.log(`${status} ${item.file}`);
    console.log(`  Reason to remove: ${item.reason}\n`);
  });
  
  console.log('=' .repeat(80));
  console.log('\n📊 SUMMARY:\n');
  console.log(`Total alternative interfaces found: ${totalFiles - missingFiles}/${totalFiles}`);
  console.log(`\n💡 RECOMMENDATION: Archive or remove these to prevent confusion.`);
  console.log(`   The only interface needed is TripleColumnLayoutClean for the main app.\n`);
  
  // Find components that should be kept
  console.log('\n✅ COMPONENTS TO KEEP:\n');
  const essentialComponents = [
    'src/components/TripleColumnLayoutClean.tsx - Main interface component',
    'src/components/ThemeControls.tsx - Theme switching',
    'src/components/FormulationDetails.tsx - Recipe/formulation details',
    'src/components/IngredientDetails.tsx - Ingredient details',
    'src/components/RecipeDetailInTerminal.tsx - Recipe details in terminal style',
    'src/app/page.tsx - Main application entry',
    'src/app/layout.tsx - Root layout (needed for Next.js)',
    'Essential API routes in src/app/api/',
    'Settings, recipes, ingredients, formulations pages (core functionality)'
  ];
  
  essentialComponents.forEach(comp => console.log(`  • ${comp}`));
  
  console.log('\n🎯 All other interface variations can be archived to reduce confusion.\n');
}

analyzeInterfaces();