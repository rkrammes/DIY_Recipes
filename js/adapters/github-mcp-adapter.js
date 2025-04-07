/**
 * GitHub MCP Adapter
 * Wraps calls to the official GitHub MCP server, with fallback to custom implementation.
 */

const GITHUB_OFFICIAL_SERVER = 'github'; // Official MCP server name
const CUSTOM_GITHUB_SERVER = 'custom-github'; // Placeholder custom server name

async function callMcpTool(server, tool, args) {
    try {
        if (!window.mcp || !window.mcp.callTool) throw new Error('MCP not available');
        return await window.mcp.callTool(server, tool, args);
    } catch (err) {
        console.warn(`Failed MCP call on server "${server}" tool "${tool}":`, err);
        throw err;
    }
}

async function fallbackCall(tool, args) {
    try {
        if (!window.mcp || !window.mcp.callTool) throw new Error('MCP not available');
        return await window.mcp.callTool(CUSTOM_GITHUB_SERVER, tool, args);
    } catch (err) {
        console.warn(`Fallback MCP call failed on tool "${tool}":`, err);
        throw err;
    }
}

async function safeMcpCall(toolName, args) {
    try {
        return await callMcpTool(GITHUB_OFFICIAL_SERVER, toolName, args);
    } catch (err) {
        console.warn(`Official server failed for "${toolName}", trying fallback`);
        return await fallbackCall(toolName, args);
    }
}

export async function searchRepositories(query, options = {}) {
    const args = {
        query,
        page: options.page || 1,
        perPage: options.perPage || 30
    };
    return safeMcpCall('search_repositories', args);
}

export async function getFileContents(owner, repo, path, branch = 'main') {
    const args = {
        owner,
        repo,
        path,
        branch
    };
    return safeMcpCall('get_file_contents', args);
}

export async function getRepositoryInfo(owner, repo) {
    const args = {
        owner,
        repo
    };
    return safeMcpCall('get_repo', args);
}

export async function createIssue(owner, repo, title, body, options = {}) {
    const args = {
        owner,
        repo,
        title,
        body,
        assignees: options.assignees || [],
        milestone: options.milestone,
        labels: options.labels || []
    };
    return safeMcpCall('create_issue', args);
}

export async function listIssues(owner, repo, options = {}) {
    const args = {
        owner,
        repo,
        state: options.state || 'open',
        labels: options.labels || [],
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
    };
    return safeMcpCall('list_issues', args);
}

export default {
    searchRepositories,
    getFileContents,
    getRepositoryInfo,
    createIssue,
    listIssues
};