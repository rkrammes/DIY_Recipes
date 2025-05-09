/**
 * Context7 MCP Adapter
 * 
 * This module provides an adapter for the Context7 MCP service,
 * which offers access to up-to-date documentation for various libraries.
 * It also includes Apple authentication integration.
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
 * Apple authentication result
 */
export interface AppleAuthResult {
  status: 'success' | 'error';
  user?: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  token?: string;
  error?: string;
}

/**
 * Apple authentication options
 */
export interface AppleAuthOptions {
  // Required parameters
  redirectUri: string;
  clientId: string;
  
  // Optional parameters
  state?: string;
  scope?: string[];
  responseMode?: 'query' | 'fragment' | 'form_post';
  responseType?: 'code' | 'id_token' | 'code id_token';
  
  // User data if available (for simulated mode)
  userData?: {
    email: string;
    name: string;
    role?: string;
    avatar?: string;
  };
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

  /**
   * Authenticate with Apple
   * This method handles Apple Sign In flow, either by redirecting to Apple's authentication
   * service or by simulating the authentication if in development mode
   */
  public async authenticateWithApple(options: AppleAuthOptions): Promise<AppleAuthResult> {
    try {
      // First check if we're running in a development environment where we might want to simulate
      if (process.env.NODE_ENV === 'development' && options.userData) {
        console.log('Development mode: Simulating Apple authentication');
        
        // Simulate successful authentication
        return {
          status: 'success',
          user: {
            id: `apple-${Date.now()}`,
            email: options.userData.email,
            name: options.userData.name,
            role: options.userData.role || 'user',
            avatarUrl: options.userData.avatar
          },
          token: `simulated-apple-token-${Date.now()}`
        };
      }
      
      // If running for real, use Context7 MCP to handle the Apple Sign In flow
      return this.executeFunction<AppleAuthResult>('authenticateWithApple', {
        redirectUri: options.redirectUri,
        clientId: options.clientId,
        state: options.state,
        scope: options.scope,
        responseMode: options.responseMode,
        responseType: options.responseType
      });
    } catch (error) {
      console.error('Error authenticating with Apple:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Verify Apple ID token
   * Used after receiving a token from Apple to verify it and extract user information
   */
  public async verifyAppleToken(token: string): Promise<AppleAuthResult> {
    try {
      return this.executeFunction<AppleAuthResult>('verifyAppleToken', {
        token
      });
    } catch (error) {
      console.error('Error verifying Apple token:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
