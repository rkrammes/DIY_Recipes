const servers = [
  {
    name: 'github',
    test: async () => {
      try {
        const result = await use_mcp_tool('github', 'search_repositories', {
          query: 'language:javascript',
          perPage: 1
        });
        console.log('[GitHub MCP] Success:', result);
      } catch (err) {
        console.error('[GitHub MCP] Failure:', err);
      }
    }
  },
  {
    name: 'supabase',
    test: async () => {
      try {
        const result = await use_mcp_tool('supabase', 'query_data', {
          sql: 'SELECT 1'
        });
        console.log('[Supabase MCP] Success:', result);
      } catch (err) {
        console.error('[Supabase MCP] Failure:', err);
      }
    }
  }
];

// Mock implementation if Roo Code API is unavailable
async function use_mcp_tool(server_name, tool_name, args) {
  console.log(`Invoking ${tool_name} on ${server_name} with`, args);
  // Replace with actual Roo Code SDK call, or MCP HTTP API call
  return { server: server_name, tool: tool_name, args, success: true };
}

async function verifyAll() {
  for (const server of servers) {
    console.log(`Testing MCP Server: ${server.name}`);
    await server.test();
  }
}

verifyAll();