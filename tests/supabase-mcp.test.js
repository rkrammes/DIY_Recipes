/**
 * @jest-environment node
 */

// This file contains tests for using the Supabase Custom MCP server

const { runSupabaseMCPTests } = require('./supabase-mcp-tests');

describe('Supabase MCP Tests', () => {
  // Set a longer timeout since database operations can take time
  jest.setTimeout(30000);
  
  beforeAll(async () => {
    // Any setup needed before running tests
    console.log('Setting up Supabase MCP tests...');
  });
  
  afterAll(async () => {
    // Any cleanup needed after running tests
    console.log('Cleaning up after Supabase MCP tests...');
  });
  
  test('Run Supabase MCP tests for database interactions', async () => {
    try {
      // This will run the actual tests using the Supabase Custom MCP server
      const result = await runSupabaseMCPTests();
      expect(result.success).toBe(true);
    } catch (error) {
      console.error('Error in Supabase MCP tests:', error);
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
      expect(mcpConfig.mcpServers['supabase-custom']).toBeDefined();
      console.log('Supabase Custom MCP server configuration is valid');
    } catch (error) {
      console.error('Error checking MCP configuration:', error);
      expect(error).toBeUndefined();
    }
  });
});