/**
 * Context7 MCP Adapter
 * 
 * This module provides an adapter for the Context7 MCP service,
 * which offers access to up-to-date documentation for various libraries.
 */

import { BaseMcpAdapter, McpConnectionOptions } from '../base';

/**
 * Context7-specific options
 */
export interface Context7Options extends McpConnectionOptions {
  token?: string; // Context7 authentication token (optional, uses public token if not provided)
}

/**
 * Context7 documentation result
 */
export interface DocumentationResult {
  library: string;
  version: string;
  sections?: Record<string, any>;
  content?: any[];
}

/**
 * Context7 search result
 */
export interface SearchResult {
  results: {
    title: string;
    library: string;
    version: string;
    content: string;
    url?: string;
  }[];
  query: string;
}

/**
 * Context7 validation result
 */
export interface ValidationResult {
  valid: boolean;
  warnings?: string[];
  errors?: string[];
}

/**
 * Context7 MCP adapter
 */
export default class Context7McpAdapter extends BaseMcpAdapter {
  constructor(options: Context7Options = {}) {
    super('context7', options);
  }

  /**
   * Get the server package name
   */
  protected getServerPackage(): string {
    return 'context7';
  }

  /**
   * Get additional arguments for the MCP server
   */
  protected getServerArgs(): string[] {
    const args = super.getServerArgs();
    
    // Add 'mcp' command
    if (!args.includes('mcp')) {
      args.push('mcp');
    }
    
    // Add token if provided
    const token = (this.options as Context7Options).token || 'public';
    if (!args.some(arg => arg.startsWith('--token='))) {
      args.push(`--token=${token}`);
    }
    
    return args;
  }

  /**
   * Get documentation for a specific library
   */
  public async getDocumentation(
    library: string, 
    version: string = 'latest', 
    topic: string | null = null
  ): Promise<DocumentationResult> {
    return this.executeFunction<DocumentationResult>('getDocumentation', {
      library,
      version,
      topic
    });
  }

  /**
   * Get code examples for a specific library
   */
  public async getExamples(
    library: string,
    version: string = 'latest',
    topic: string
  ): Promise<{ examples: any[] }> {
    return this.executeFunction<{ examples: any[] }>('getExamples', {
      library,
      version,
      topic
    });
  }

  /**
   * Search for documentation across multiple libraries
   */
  public async search(
    query: string,
    libraries: string[] = []
  ): Promise<SearchResult> {
    return this.executeFunction<SearchResult>('search', {
      query,
      libraries: libraries.length > 0 ? libraries : undefined
    });
  }

  /**
   * Validate code against API documentation
   */
  public async validate(
    code: string,
    library: string,
    version: string = 'latest'
  ): Promise<ValidationResult> {
    return this.executeFunction<ValidationResult>('validate', {
      code,
      library,
      version
    });
  }

  /**
   * Get a list of available libraries
   */
  public async getLibraries(): Promise<string[]> {
    return this.executeFunction<string[]>('getLibraries', {});
  }

  /**
   * Check if a library is available
   */
  public async isLibraryAvailable(library: string): Promise<boolean> {
    try {
      const libraries = await this.getLibraries();
      return libraries.includes(library);
    } catch (error) {
      console.error(`Error checking if library ${library} is available:`, error);
      return false;
    }
  }

  /**
   * Check the connection status
   */
  public async checkConnection(): Promise<boolean> {
    try {
      await this.executeFunction('ping', {});
      return true;
    } catch (error) {
      console.error('Context7 MCP connection check failed:', error);
      return false;
    }
  }
}
