/**
 * @jest-environment node
 */

// This file contains Puppeteer tests for the DIY_Recipes web app's collapsible UI components
const { runPuppeteerTests } = require('./puppeteer-ui-tests');

describe('Puppeteer UI Tests', () => {
  // Set a longer timeout since UI tests take time
  jest.setTimeout(30000);
  
  beforeAll(async () => {
    // Any setup needed before running tests
    console.log('Setting up Puppeteer UI tests...');
  });
  
  afterAll(async () => {
    // Any cleanup needed after running tests
    console.log('Cleaning up after Puppeteer UI tests...');
  });
  
  test('Run UI tests for collapsible components', async () => {
    try {
      // This will run the actual tests using the Puppeteer MCP server
      await runPuppeteerTests();
      expect(true).toBe(true); // If we get here, tests succeeded
    } catch (error) {
      console.error('Error in Puppeteer UI tests:', error);
      // Fail the test if there's an error
      expect(error).toBeUndefined();
    }
  });
  
  // Add more specific test cases as needed
  test('MCP server is properly configured', () => {
    // Check if MCP configuration exists
    const fs = require('fs');
    const path = require('path');
    
    try {
      const mcpConfigPath = path.resolve(__dirname, '../.roo/mcp.json');
      const mcpConfig = fs.existsSync(mcpConfigPath) ?
                        JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8')) :
                        null;
      
      expect(mcpConfig).not.toBeNull();
      expect(mcpConfig.mcpServers).toBeDefined();
      expect(mcpConfig.mcpServers.puppeteer).toBeDefined();
      console.log('MCP server configuration is valid');
    } catch (error) {
      console.error('Error checking MCP configuration:', error);
      expect(error).toBeUndefined();
    }
  });
});