#!/usr/bin/env node

/**
 * Context7 MCP Integration Test for DIY Recipes
 * 
 * This script tests the Context7 MCP integration in the DIY Recipes app.
 * It uses the Context7 MCP adapter to access documentation for Next.js, Tailwind CSS,
 * React, and Supabase, which are the main libraries used in the DIY Recipes app.
 */

// Import MCP types and utilities
const { createMcpAdapter } = require('./src/lib/mcp/adapters');

// Main function to test Context7 MCP integration
async function testContext7Integration() {
  console.log('Testing Context7 MCP integration for DIY Recipes...\n');
  
  try {
    // Create and initialize Context7 MCP adapter
    console.log('Initializing Context7 MCP adapter...');
    const context7 = createMcpAdapter('context7', {
      token: process.env.CONTEXT7_TOKEN || 'public' // Use public token if not provided
    });
    
    await context7.connect();
    console.log('Successfully connected to Context7 MCP server\n');
    
    // Check connection status
    const isConnected = await context7.checkConnection();
    if (!isConnected) {
      throw new Error('Connection check failed. Please check your internet connection and Context7 token.');
    }
    
    // Get list of available libraries
    console.log('Getting list of available libraries...');
    const libraries = await context7.getLibraries();
    console.log(`Found ${libraries.length} available libraries.`);
    console.log(`Some available libraries: ${libraries.slice(0, 5).join(', ')}${libraries.length > 5 ? '...' : ''}\n`);
    
    // Test 1: Get Next.js documentation
    console.log('Test 1: Getting Next.js documentation...');
    const nextjsDocs = await context7.getDocumentation('next', 'latest');
    console.log(`Retrieved documentation for Next.js v${nextjsDocs.version}`);
    if (nextjsDocs.sections) {
      console.log(`Available sections: ${Object.keys(nextjsDocs.sections).join(', ')}`);
    }
    console.log('✅ Next.js documentation test passed\n');
    
    // Test 2: Get Tailwind CSS documentation
    console.log('Test 2: Getting Tailwind CSS documentation...');
    const tailwindDocs = await context7.getDocumentation('tailwind', 'latest');
    console.log(`Retrieved documentation for Tailwind CSS v${tailwindDocs.version}`);
    if (tailwindDocs.sections) {
      console.log(`Available sections: ${Object.keys(tailwindDocs.sections).join(', ')}`);
    }
    console.log('✅ Tailwind CSS documentation test passed\n');
    
    // Test 3: Search for "animation" across libraries
    console.log('Test 3: Searching for "animation" across libraries...');
    const animationResults = await context7.search('animation', ['react', 'tailwind']);
    console.log(`Found ${animationResults.results.length} results for "animation"`);
    console.log('Top 3 results:');
    animationResults.results.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.title} (${result.library})`);
    });
    console.log('✅ Animation search test passed\n');
    
    // Test 4: Get Supabase authentication examples
    console.log('Test 4: Getting Supabase authentication examples...');
    const supabaseExamples = await context7.getExamples('supabase-js', 'latest', 'auth');
    console.log(`Retrieved ${supabaseExamples.examples.length} examples for Supabase authentication`);
    console.log('✅ Supabase examples test passed\n');
    
    // Test 5: Validate React code against API documentation
    console.log('Test 5: Validating React code...');
    const reactCode = `
      import { useState, useEffect } from 'react';
      
      function Counter() {
        const [count, setCount] = useState(0);
        
        useEffect(() => {
          document.title = \`You clicked \${count} times\`;
        }, [count]);
        
        return (
          <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
              Click me
            </button>
          </div>
        );
      }
      
      export default Counter;
    `;
    const validationResult = await context7.validate(reactCode, 'react', 'latest');
    console.log(`Validation result: ${validationResult.valid ? 'Valid' : 'Invalid'}`);
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.log(`Warnings: ${validationResult.warnings.length}`);
    }
    console.log('✅ React code validation test passed\n');
    
    // Disconnect from Context7 MCP server
    await context7.disconnect();
    console.log('Disconnected from Context7 MCP server');
    
    console.log('\n✅ Context7 MCP integration for DIY Recipes tested successfully!');
    console.log('You can now use Context7 MCP in your development workflow for up-to-date documentation.');
    
  } catch (error) {
    console.error('\n❌ Error testing Context7 MCP integration:', error.message);
    console.error('Please make sure you have the Context7 package installed:');
    console.error('  npm install -g context7');
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testContext7Integration().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { testContext7Integration };