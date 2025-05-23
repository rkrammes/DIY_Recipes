/**
 * GitHub MCP Adapter
 * 
 * This adapter provides an interface to the GitHub MCP server.
 */

import { BaseMcpAdapter, McpConnectionOptions } from '../base';

/**
 * GitHub repository details
 */
export interface GitHubRepository {
  owner: string;
  name: string;
  defaultBranch?: string;
  private?: boolean;
  description?: string;
}

/**
 * GitHub file operation parameters
 */
export interface GitHubFileOperation {
  path: string;
  content: string;
  message: string;
  branch?: string;
  sha?: string;
}

/**
 * GitHub pull request creation parameters
 */
export interface GitHubPullRequestParams {
  title: string;
  body?: string;
  head: string;
  base: string;
}

/**
 * GitHub MCP Adapter implementation
 */
export class GitHubMcpAdapter extends BaseMcpAdapter {
  constructor(options: McpConnectionOptions = {}) {
    super('github', {
      ...options,
      args: [
        ...(options.args || []),
        ...(options.token ? [`--github-token=${options.token}`] : [])
      ]
    });
  }
  
  /**
   * Get the MCP server package name
   */
  protected getServerPackage(): string {
    return '@modelcontextprotocol/server-github';
  }
  
  /**
   * List repositories for the authenticated user
   */
  public async listRepositories(): Promise<GitHubRepository[]> {
    const response = await this.executeFunction<{ repositories: GitHubRepository[] }>(
      'api.listUserRepos', 
      {}
    );
    return response.repositories;
  }
  
  /**
   * Get repository information
   */
  public async getRepository(owner: string, name: string): Promise<GitHubRepository> {
    return this.executeFunction<GitHubRepository>(
      'api.getRepo', 
      { owner, name }
    );
  }
  
  /**
   * Create a new repository
   */
  public async createRepository(name: string, options: {
    description?: string;
    private?: boolean;
    initWithReadme?: boolean;
  } = {}): Promise<GitHubRepository> {
    return this.executeFunction<GitHubRepository>(
      'api.createRepo', 
      {
        name,
        description: options.description,
        private: options.private,
        auto_init: options.initWithReadme
      }
    );
  }
  
  /**
   * Get file content from a repository
   */
  public async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const response = await this.executeFunction<{ content: string }>(
      'api.getFileContent', 
      { owner, repo, path, ref }
    );
    return response.content;
  }
  
  /**
   * Create or update a file in a repository
   */
  public async createOrUpdateFile(owner: string, repo: string, options: GitHubFileOperation): Promise<{ sha: string; url: string }> {
    return this.executeFunction<{ sha: string; url: string }>(
      'api.createOrUpdateFile', 
      {
        owner,
        repo,
        path: options.path,
        content: options.content,
        message: options.message,
        branch: options.branch,
        sha: options.sha
      }
    );
  }
  
  /**
   * Delete a file from a repository
   */
  public async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<void> {
    await this.executeFunction(
      'api.deleteFile', 
      { owner, repo, path, message, sha, branch }
    );
  }
  
  /**
   * List branches in a repository
   */
  public async listBranches(owner: string, repo: string): Promise<string[]> {
    const response = await this.executeFunction<{ branches: { name: string }[] }>(
      'api.listBranches', 
      { owner, repo }
    );
    return response.branches.map(branch => branch.name);
  }
  
  /**
   * Create a new branch
   */
  public async createBranch(owner: string, repo: string, branch: string, fromBranch?: string): Promise<void> {
    await this.executeFunction(
      'api.createBranch', 
      { owner, repo, branch, from: fromBranch }
    );
  }
  
  /**
   * Create a pull request
   */
  public async createPullRequest(owner: string, repo: string, options: GitHubPullRequestParams): Promise<{ url: string; number: number }> {
    return this.executeFunction<{ url: string; number: number }>(
      'api.createPullRequest', 
      {
        owner,
        repo,
        title: options.title,
        body: options.body,
        head: options.head,
        base: options.base
      }
    );
  }
  
  /**
   * List pull requests
   */
  public async listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'all'): Promise<any[]> {
    const response = await this.executeFunction<{ pullRequests: any[] }>(
      'api.listPullRequests', 
      { owner, repo, state: state || 'open' }
    );
    return response.pullRequests;
  }
  
  /**
   * Advanced: Store recipe version in a repository
   */
  public async saveRecipeVersion(recipeId: string, recipe: any, commitMessage: string, options: {
    owner?: string;
    repo?: string;
    branch?: string;
    path?: string;
  } = {}): Promise<{ sha: string; url: string }> {
    const owner = options.owner || process.env.GITHUB_RECIPE_REPO_OWNER || 'diy-recipes';
    const repo = options.repo || process.env.GITHUB_RECIPE_REPO || 'recipe-data';
    const branch = options.branch || 'main';
    const path = options.path || `recipes/${recipeId}.json`;
    const content = JSON.stringify(recipe, null, 2);
    
    try {
      // Check if file exists
      let sha;
      try {
        const fileContent = await this.getFileContent(owner, repo, path, branch);
        // Get the file's SHA from metadata
        const fileMetadata = await this.executeFunction<{ sha: string }>(
          'api.getFileSha',
          { owner, repo, path, branch }
        );
        sha = fileMetadata.sha;
      } catch (error) {
        // File doesn't exist yet, that's fine
        sha = undefined;
      }
      
      // Create or update the file
      return await this.createOrUpdateFile(owner, repo, {
        path,
        content,
        message: commitMessage,
        branch,
        sha
      });
    } catch (error) {
      console.error('Error saving recipe version:', error);
      throw error;
    }
  }
  
  /**
   * Advanced: Get recipe version history
   */
  public async getRecipeVersionHistory(recipeId: string, options: {
    owner?: string;
    repo?: string;
    path?: string;
  } = {}): Promise<{
    versions: {
      sha: string;
      date: string;
      message: string;
      author: string;
    }[];
  }> {
    const owner = options.owner || process.env.GITHUB_RECIPE_REPO_OWNER || 'diy-recipes';
    const repo = options.repo || process.env.GITHUB_RECIPE_REPO || 'recipe-data';
    const path = options.path || `recipes/${recipeId}.json`;
    
    try {
      // Get commit history for this file
      const commits = await this.executeFunction<{
        commits: {
          sha: string;
          commit: {
            message: string;
            author: {
              name: string;
              date: string;
            };
          };
        }[];
      }>(
        'api.listCommits',
        { owner, repo, path }
      );
      
      // Format the response
      return {
        versions: commits.commits.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author.date,
          author: commit.commit.author.name
        }))
      };
    } catch (error) {
      console.error('Error getting recipe version history:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const githubMcpAdapter = new GitHubMcpAdapter();

export default GitHubMcpAdapter;