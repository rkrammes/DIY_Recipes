const { useMcpTool } = require('@modelcontextprotocol/typescript-sdk');

async function testGithubMcp() {
  console.log('Testing GitHub MCP server...');

  try {
    // Test repository search
    const searchResult = await useMcpTool({
      serverName: 'github',
      toolName: 'github_search_repositories',
      arguments: { query: 'DIY_Recipes' }
    });
    console.log('Repository Search Result:', searchResult);

    // Test file content retrieval
    const fileResult = await useMcpTool({
      serverName: 'github',
      toolName: 'github_get_file_contents',
      arguments: {
        owner: 'modelcontextprotocol',
        repo: 'servers',
        path: 'README.md'
      }
    });
    console.log('File Content Result:', fileResult);

    // Test repository information retrieval (using search result if available)
    const repoInfoResult = await useMcpTool({
      serverName: 'github',
      toolName: 'github_search_repositories',
      arguments: { query: 'modelcontextprotocol/servers' }
    });
    console.log('Repository Info Result:', repoInfoResult);

  } catch (error) {
    console.error('Error testing GitHub MCP server:', error);
  }
}

async function runTests() {
  await testGithubMcp();
}

runTests();