/**
 * Vercel MCP Adapter
 * 
 * TypeScript adapter for the Vercel MCP server.
 * Provides a type-safe interface for Vercel operations.
 */

import { BaseMcpAdapter, McpConnectionOptions } from '../base';

// Project operation types
export interface ProjectsListParams {
  limit?: number;
  from?: string;
}

export interface ProjectGetParams {
  projectId: string;
}

export interface ProjectCreateParams {
  name: string;
  framework?: string;
  gitRepository?: {
    type: string;
    repo: string;
  };
}

export interface ProjectDeleteParams {
  projectId: string;
}

// Deployment operation types
export interface DeploymentsListParams {
  projectId?: string;
  limit?: number;
  from?: string;
}

export interface DeploymentGetParams {
  deploymentId: string;
}

export interface DeploymentCreateParams {
  projectId: string;
  name?: string;
  meta?: Record<string, any>;
}

export interface DeploymentCancelParams {
  deploymentId: string;
}

// Domain operation types
export interface DomainsListParams {
  projectId?: string;
  limit?: number;
  from?: string;
}

export interface DomainGetParams {
  name: string;
}

export interface DomainAddParams {
  name: string;
  projectId?: string;
}

export interface DomainRemoveParams {
  name: string;
}

// Environment variable operation types
export interface EnvListParams {
  projectId: string;
}

export interface EnvAddParams {
  projectId: string;
  key: string;
  value: string;
  target?: ('production' | 'preview' | 'development')[];
}

export interface EnvEditParams {
  projectId: string;
  id: string;
  value: string;
  target?: ('production' | 'preview' | 'development')[];
}

export interface EnvRemoveParams {
  projectId: string;
  id: string;
}

/**
 * Vercel MCP Adapter
 */
export default class VercelMcpAdapter extends BaseMcpAdapter {
  constructor(options: McpConnectionOptions = {}) {
    super('vercel', options);
  }

  /**
   * Get the MCP server package name
   */
  protected getServerPackage(): string {
    return '@mcp/vercel';
  }

  /**
   * Get additional arguments for the MCP server
   */
  protected getServerArgs(): string[] {
    const args = super.getServerArgs();
    
    // Add Vercel-specific arguments
    if (this.options.token) {
      args.push(`--token=${this.options.token}`);
    }
    
    return args;
  }

  // Projects operations

  /**
   * List projects
   */
  async listProjects(params: ProjectsListParams = {}): Promise<any> {
    return this.executeFunction('projects.list', params);
  }

  /**
   * Get project details
   */
  async getProject(params: ProjectGetParams): Promise<any> {
    return this.executeFunction('projects.get', params);
  }

  /**
   * Create a new project
   */
  async createProject(params: ProjectCreateParams): Promise<any> {
    return this.executeFunction('projects.create', params);
  }

  /**
   * Delete a project
   */
  async deleteProject(params: ProjectDeleteParams): Promise<any> {
    return this.executeFunction('projects.delete', params);
  }

  // Deployments operations

  /**
   * List deployments
   */
  async listDeployments(params: DeploymentsListParams = {}): Promise<any> {
    return this.executeFunction('deployments.list', params);
  }

  /**
   * Get deployment details
   */
  async getDeployment(params: DeploymentGetParams): Promise<any> {
    return this.executeFunction('deployments.get', params);
  }

  /**
   * Create a new deployment
   */
  async createDeployment(params: DeploymentCreateParams): Promise<any> {
    return this.executeFunction('deployments.create', params);
  }

  /**
   * Cancel a deployment
   */
  async cancelDeployment(params: DeploymentCancelParams): Promise<any> {
    return this.executeFunction('deployments.cancel', params);
  }

  // Domains operations

  /**
   * List domains
   */
  async listDomains(params: DomainsListParams = {}): Promise<any> {
    return this.executeFunction('domains.list', params);
  }

  /**
   * Get domain details
   */
  async getDomain(params: DomainGetParams): Promise<any> {
    return this.executeFunction('domains.get', params);
  }

  /**
   * Add a domain
   */
  async addDomain(params: DomainAddParams): Promise<any> {
    return this.executeFunction('domains.add', params);
  }

  /**
   * Remove a domain
   */
  async removeDomain(params: DomainRemoveParams): Promise<any> {
    return this.executeFunction('domains.remove', params);
  }

  // Environment Variables operations

  /**
   * List environment variables
   */
  async listEnvVars(params: EnvListParams): Promise<any> {
    return this.executeFunction('env.list', params);
  }

  /**
   * Add environment variable
   */
  async addEnvVar(params: EnvAddParams): Promise<any> {
    return this.executeFunction('env.add', params);
  }

  /**
   * Edit environment variable
   */
  async editEnvVar(params: EnvEditParams): Promise<any> {
    return this.executeFunction('env.edit', params);
  }

  /**
   * Remove environment variable
   */
  async removeEnvVar(params: EnvRemoveParams): Promise<any> {
    return this.executeFunction('env.remove', params);
  }
}