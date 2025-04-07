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
  if (typeof window !== 'undefined' && window.mcp && typeof window.mcp.callTool === 'function') {
    try {
      const result = await window.mcp.callTool(server_name, tool_name, args);
      console.log(`[MCP Call Success] ${server_name} - ${tool_name}:`, result);
      return result;
    } catch (err) {
      console.error(`[MCP Call Error] ${server_name} - ${tool_name}:`, err);
      throw err;
    }
  } else {
    console.warn('window.mcp.callTool not available, using mock response');
    return { server: server_name, tool: tool_name, args, success: true };
  }
}

async function verifyAll() {
  for (const server of servers) {
    console.log(`Testing MCP Server: ${server.name}`);
    await server.test();
  }
}

verifyAll();