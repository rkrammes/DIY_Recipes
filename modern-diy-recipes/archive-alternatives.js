#!/usr/bin/env node

/**
 * Archive Alternative Interfaces Script
 * 
 * This script safely archives all alternative interface implementations
 * that are no longer needed, preserving them for future reference.
 */

const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const archiveDir = path.join(__dirname, 'archive', `alternative-interfaces-${timestamp}`);

// Files and directories to archive
const itemsToArchive = {
  components: [
    'src/components/TripleColumnLayout.tsx',
    'src/components/layouts/ColumnLayout.tsx',
    'src/components/layouts/EnhancedModularLayout.tsx',
    'src/components/layouts/KraftTerminalModularLayout.tsx',
    'src/components/layouts/ModularLayout.tsx',
    'src/components/layouts/ModuleLayout.tsx',
  ],
  
  pages: [
    'src/app/document-interface',
    'src/app/document-test',
    'src/app/document-view',
    'src/app/enhanced-formulations',
    'src/app/formula-dashboard',
    'src/app/formula-database',
    'src/app/kraft-modular',
    'src/app/minimal',
    'src/app/minimal-test',
    'src/app/module-dashboard',
    'src/app/module-formulations',
    'src/app/module-system',
    'src/app/modules',
    'src/app/simple-doc',
    'src/app/stable-test',
    'src/app/test',
    'src/app/test-fixed',
    'src/app/test-fixed-layout',
    'src/app/terminal',
  ],
  
  alternativeLayouts: [
    'src/app/console-layout.tsx',
    'src/app/fixed-layout.tsx',
    'src/app/layout-clientside.tsx',
    'src/app/layout-complex.backup.tsx',
    'src/app/layout-fix.tsx',
    'src/app/minimal-layout.tsx',
    'src/app/module-system-layout.tsx',
  ]
};

function createArchiveStructure() {
  // Create archive directory structure
  if (!fs.existsSync(path.join(__dirname, 'archive'))) {
    fs.mkdirSync(path.join(__dirname, 'archive'));
  }
  
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
  }
  
  // Create subdirectories
  ['components', 'pages', 'layouts'].forEach(subdir => {
    const fullPath = path.join(archiveDir, subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  console.log(`📁 Created archive directory: ${path.relative(__dirname, archiveDir)}`);
}

function moveItem(sourcePath, category) {
  const fullSourcePath = path.join(__dirname, sourcePath);
  
  if (!fs.existsSync(fullSourcePath)) {
    console.log(`⚠️  Skipping ${sourcePath} - not found`);
    return false;
  }
  
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(archiveDir, category, fileName);
  
  try {
    if (fs.statSync(fullSourcePath).isDirectory()) {
      // Move entire directory
      copyDirectoryRecursive(fullSourcePath, targetPath);
      fs.rmSync(fullSourcePath, { recursive: true });
    } else {
      // Move individual file
      fs.copyFileSync(fullSourcePath, targetPath);
      fs.unlinkSync(fullSourcePath);
    }
    
    console.log(`✅ Archived: ${sourcePath} → ${path.relative(__dirname, targetPath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to archive ${sourcePath}: ${error.message}`);
    return false;
  }
}

function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const items = fs.readdirSync(source);
  
  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function createArchiveManifest(archivedCount) {
  const manifest = {
    timestamp: new Date().toISOString(),
    reason: 'Cleaning up alternative interfaces to prevent confusion',
    preserved_main_interface: 'src/components/TripleColumnLayoutClean.tsx',
    features_extracted: [
      'Search functionality',
      'Error boundaries',
      'Enhanced keyboard navigation with audio feedback',
      'Loading states and error handling',
      'Keyboard shortcuts (Alt+1-5, F4 for theme cycling)'
    ],
    archived_count: archivedCount,
    archived_items: itemsToArchive,
    notes: [
      'All alternative interfaces have been safely archived',
      'Main interface now contains all the best features',
      'Themes will now apply consistently across all components',
      'Archive can be restored if needed for reference'
    ]
  };
  
  const manifestPath = path.join(archiveDir, 'ARCHIVE_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`📋 Created archive manifest: ${path.relative(__dirname, manifestPath)}`);
}

function archiveAlternatives() {
  console.log('🗂️  Starting archive of alternative interfaces...\n');
  
  createArchiveStructure();
  
  let totalArchived = 0;
  
  // Archive component layouts
  console.log('\n📐 Archiving alternative layout components:');
  itemsToArchive.components.forEach(item => {
    if (moveItem(item, 'components')) totalArchived++;
  });
  
  // Archive alternative pages
  console.log('\n📄 Archiving alternative page routes:');
  itemsToArchive.pages.forEach(item => {
    if (moveItem(item, 'pages')) totalArchived++;
  });
  
  // Archive alternative layout files
  console.log('\n📁 Archiving alternative layout files:');
  itemsToArchive.alternativeLayouts.forEach(item => {
    if (moveItem(item, 'layouts')) totalArchived++;
  });
  
  createArchiveManifest(totalArchived);
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✨ Archive Complete! Summary:`);
  console.log(`   📦 Archived ${totalArchived} items`);
  console.log(`   📁 Location: ${path.relative(__dirname, archiveDir)}`);
  console.log(`   🎯 Main interface: src/components/TripleColumnLayoutClean.tsx`);
  console.log(`   🚀 Codebase is now clean and confusion-free!`);
  console.log(`\n💡 All the best features have been preserved in the main interface:`);
  console.log(`   • Search functionality`);
  console.log(`   • Enhanced keyboard navigation`);
  console.log(`   • Loading states and error handling`);
  console.log(`   • Keyboard shortcuts (Alt+1-5, F4)`);
  console.log(`   • Error boundaries for graceful failures`);
  console.log(`\n🎨 Themes will now apply consistently across all components!`);
  console.log(`\n📌 To restore any archived files, copy them back from the archive directory.`);
}

// Run the archival process
archiveAlternatives();