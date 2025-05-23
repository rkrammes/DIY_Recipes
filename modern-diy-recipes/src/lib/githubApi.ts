/**
 * Browser-compatible GitHub API client
 * 
 * This replaces the server-only MCP implementation with a browser-compatible
 * GitHub API client that can be used in Next.js client components.
 */

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
 * GitHub API client configuration
 */
interface GitHubConfig {
  token?: string;
  baseUrl?: string;
}

class GitHubApiClient {
  private token: string | null = null;
  private baseUrl = 'https://api.github.com';

  constructor(config?: GitHubConfig) {
    this.token = config?.token || null;
    this.baseUrl = config?.baseUrl || 'https://api.github.com';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set the GitHub token for authentication
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Repository operations
   */
  async listRepos(): Promise<Repository[]> {
    const repos = await this.makeRequest('/user/repos');
    return repos.map((repo: any) => ({
      owner: repo.owner.login,
      name: repo.name,
      defaultBranch: repo.default_branch,
      private: repo.private,
      description: repo.description
    }));
  }

  async getRepo(owner: string, name: string): Promise<Repository> {
    const repo = await this.makeRequest(`/repos/${owner}/${name}`);
    return {
      owner: repo.owner.login,
      name: repo.name,
      defaultBranch: repo.default_branch,
      private: repo.private,
      description: repo.description
    };
  }

  async createRepo(name: string, options: { 
    description?: string;
    private?: boolean;
    initWithReadme?: boolean;
  } = {}): Promise<Repository> {
    const repo = await this.makeRequest('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: options.description,
        private: options.private,
        auto_init: options.initWithReadme
      })
    });
    
    return {
      owner: repo.owner.login,
      name: repo.name,
      defaultBranch: repo.default_branch,
      private: repo.private,
      description: repo.description
    };
  }

  /**
   * File operations
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const queryParams = ref ? `?ref=${ref}` : '';
    const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}${queryParams}`);
    
    if (response.type !== 'file') {
      throw new Error(`Path ${path} is not a file`);
    }
    
    // Decode base64 content
    return atob(response.content);
  }

  async createOrUpdateFile(owner: string, repo: string, options: FileOperation): Promise<void> {
    // Check if file exists to get SHA for update
    let sha: string | undefined;
    try {
      const existing = await this.makeRequest(`/repos/${owner}/${repo}/contents/${options.path}`);
      sha = existing.sha;
    } catch (error) {
      // File doesn't exist, that's fine for creation
    }

    await this.makeRequest(`/repos/${owner}/${repo}/contents/${options.path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: options.message,
        content: btoa(options.content), // Encode to base64
        branch: options.branch,
        ...(sha && { sha })
      })
    });
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, branch?: string): Promise<void> {
    // Get current file to get SHA
    const existing = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`);
    
    await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message,
        sha: existing.sha,
        branch
      })
    });
  }

  /**
   * Branch operations
   */
  async listBranches(owner: string, repo: string): Promise<string[]> {
    const branches = await this.makeRequest(`/repos/${owner}/${repo}/branches`);
    return branches.map((branch: any) => branch.name);
  }

  async createBranch(owner: string, repo: string, branch: string, fromBranch = 'main'): Promise<void> {
    // Get the SHA of the source branch
    const sourceBranch = await this.makeRequest(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
    
    // Create new branch
    await this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: sourceBranch.object.sha
      })
    });
  }

  /**
   * Pull request operations
   */
  async createPullRequest(owner: string, repo: string, options: {
    title: string;
    body?: string;
    head: string;
    base: string;
  }): Promise<{ url: string; number: number }> {
    const pr = await this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
    
    return {
      url: pr.html_url,
      number: pr.number
    };
  }

  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
    return this.makeRequest(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }
}

// Export a singleton instance
const githubApi = new GitHubApiClient();

export default githubApi;