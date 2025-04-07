import * as githubAdapter from '../js/adapters/github-mcp-adapter';

describe('GitHub MCP Adapter', () => {
    let originalMcp;

    beforeEach(() => {
        originalMcp = window.mcp || {};
        window.mcp = {
            callTool: jest.fn()
        };
    });

    afterEach(() => {
        window.mcp = originalMcp;
        jest.clearAllMocks();
    });

    const simulateSuccess = (result) => {
        window.mcp.callTool.mockResolvedValue(result);
    };

    const simulateFailureThenSuccess = (result) => {
        window.mcp.callTool
            .mockRejectedValueOnce(new Error('Official server error'))
            .mockResolvedValueOnce(result);
    };

    const simulateDoubleFailure = () => {
        window.mcp.callTool
            .mockRejectedValueOnce(new Error('Official server error'))
            .mockRejectedValueOnce(new Error('Fallback error'));
    };

    test('searchRepositories - official success', async () => {
        const mockResult = { items: [] };
        simulateSuccess(mockResult);
        const res = await githubAdapter.searchRepositories('test');
        expect(res).toBe(mockResult);
        expect(window.mcp.callTool).toHaveBeenCalledWith('github', 'search_repositories', expect.any(Object));
    });

    test('searchRepositories - fallback success', async () => {
        const mockResult = { items: [] };
        simulateFailureThenSuccess(mockResult);
        const res = await githubAdapter.searchRepositories('test');
        expect(res).toBe(mockResult);
        expect(window.mcp.callTool).toHaveBeenCalledTimes(2);
        expect(window.mcp.callTool).toHaveBeenLastCalledWith('custom-github', 'search_repositories', expect.any(Object));
    });

    test('searchRepositories - both fail', async () => {
        simulateDoubleFailure();
        await expect(githubAdapter.searchRepositories('test')).rejects.toThrow();
    });

    test('getFileContents', async () => {
        const mockResult = { content: 'file content' };
        simulateSuccess(mockResult);
        const res = await githubAdapter.getFileContents('owner', 'repo', 'path');
        expect(res).toBe(mockResult);
    });

    test('getRepositoryInfo', async () => {
        const mockResult = { name: 'repo' };
        simulateSuccess(mockResult);
        const res = await githubAdapter.getRepositoryInfo('owner', 'repo');
        expect(res).toBe(mockResult);
    });

    test('createIssue', async () => {
        const mockResult = { number: 1 };
        simulateSuccess(mockResult);
        const res = await githubAdapter.createIssue('owner', 'repo', 'title', 'body');
        expect(res).toBe(mockResult);
    });

    test('listIssues', async () => {
        const mockResult = [{ number: 1 }];
        simulateSuccess(mockResult);
        const res = await githubAdapter.listIssues('owner', 'repo');
        expect(res).toBe(mockResult);
    });

    test('handles MCP not available', async () => {
        window.mcp = null;
        await expect(githubAdapter.searchRepositories('test')).rejects.toThrow();
    });
});