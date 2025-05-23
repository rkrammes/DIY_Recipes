/**
 * GitHub MCP Client for Next.js application
 * 
 * This module provides integration with the GitHub Model Context Protocol (MCP) server,
 * allowing the application to interact with GitHub repositories, issues, and more.
 */

import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

/**
 * GitHub MCP client singleton instance
 */
let githubMcpClient: Client | null = null;

/**
 * GitHub repository operations interface
 */
export interface Repository {
  owner: string;
  name: string;
  defaultBranch?: string;
  private?: boolean;
  description?: string;
}

/**
 * GitHub file operations interface
 */
export interface FileOperation {
  path: string;
  content: string;
  message: string;
  branch?: string;
}

/**
 * Initialize the GitHub MCP client
 * 
 * @param options Configuration options
 * @param options.token GitHub personal access token
 * @param options.port Port for the GitHub MCP server
 * @returns The initialized GitHub MCP client
 */
export async function initializeGitHubMcp(options: { 
  token?: string;
  port?: number;
} = {}): Promise<Client> {
  // Return existing client if already initialized
  if (githubMcpClient) {
    return githubMcpClient;
  }

  // Use provided token or try to get from environment
  const token = options.token || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token is required. Provide it in options or set GITHUB_TOKEN environment variable.');
  }

  const port = options.port || 3001;

  try {
    // Create a new MCP client
    const client = new Client({
      name: 'diy-recipes-github-client',
      version: '1.0.0'
    });

    // Connect to the GitHub MCP server
    const transport = new StdioClientTransport({
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-github',
        `--port=${port}`,
        `--github-token=${token}`
      ]
    });

    await client.connect(transport);
    console.log('Connected to GitHub MCP server');
    
    // Store the client for reuse
    githubMcpClient = client;
    return client;
  } catch (error) {
    console.error('Failed to initialize GitHub MCP client:', error);
    throw error;
  }
}

/**
 * Repository operations
 */
export const GithubRepoOperations = {
  /**
   * List repositories for the authenticated user
   */
  async listRepos(): Promise<Repository[]> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.listUserRepos', {});
    return response.repositories;
  },

  /**
   * Get repository information
   */
  async getRepo(owner: string, name: string): Promise<Repository> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.getRepo', { owner, name });
    return response;
  },

  /**
   * Create a new repository
   */
  async createRepo(name: string, options: { 
    description?: string;
    private?: boolean;
    initWithReadme?: boolean;
  } = {}): Promise<Repository> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.createRepo', {
      name,
      description: options.description,
      private: options.private,
      auto_init: options.initWithReadme
    });
    return response;
  }
};

/**
 * File operations
 */
export const GithubFileOperations = {
  /**
   * Get file content from a repository
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.getFileContent', {
      owner,
      repo,
      path,
      ref
    });
    return response.content;
  },

  /**
   * Create or update a file in a repository
   */
  async createOrUpdateFile(owner: string, repo: string, options: FileOperation): Promise<void> {
    const client = await initializeGitHubMcp();
    await client.executeFunction('api.createOrUpdateFile', {
      owner,
      repo,
      path: options.path,
      content: options.content,
      message: options.message,
      branch: options.branch
    });
  },

  /**
   * Delete a file from a repository
   */
  async deleteFile(owner: string, repo: string, path: string, message: string, branch?: string): Promise<void> {
    const client = await initializeGitHubMcp();
    await client.executeFunction('api.deleteFile', {
      owner,
      repo,
      path,
      message,
      branch
    });
  }
};

/**
 * Branch operations
 */
export const GithubBranchOperations = {
  /**
   * List branches in a repository
   */
  async listBranches(owner: string, repo: string): Promise<string[]> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.listBranches', {
      owner,
      repo
    });
    return response.branches.map((branch: any) => branch.name);
  },

  /**
   * Create a new branch
   */
  async createBranch(owner: string, repo: string, branch: string, fromBranch?: string): Promise<void> {
    const client = await initializeGitHubMcp();
    await client.executeFunction('api.createBranch', {
      owner,
      repo,
      branch,
      from: fromBranch
    });
  }
};

/**
 * Pull request operations
 */
export const GithubPullRequestOperations = {
  /**
   * Create a pull request
   */
  async createPullRequest(owner: string, repo: string, options: {
    title: string;
    body?: string;
    head: string;
    base: string;
  }): Promise<{ url: string; number: number }> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.createPullRequest', {
      owner,
      repo,
      title: options.title,
      body: options.body,
      head: options.head,
      base: options.base
    });
    return {
      url: response.url,
      number: response.number
    };
  },

  /**
   * List pull requests
   */
  async listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'all'): Promise<any[]> {
    const client = await initializeGitHubMcp();
    const response = await client.executeFunction('api.listPullRequests', {
      owner,
      repo,
      state: state || 'open'
    });
    return response.pullRequests;
  }
};

/**
 * Export a unified GitHub MCP API
 */
export default {
  initialize: initializeGitHubMcp,
  repo: GithubRepoOperations,
  file: GithubFileOperations,
  branch: GithubBranchOperations,
  pullRequest: GithubPullRequestOperations
};