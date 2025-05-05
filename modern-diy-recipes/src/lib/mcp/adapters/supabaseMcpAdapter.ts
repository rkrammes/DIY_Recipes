/**
 * Supabase MCP Adapter
 * 
 * TypeScript adapter for the Supabase MCP server.
 * Provides a type-safe interface for Supabase operations.
 */

import { BaseMcpAdapter, McpConnectionOptions } from '../base';

// Database operation types
export interface DbSelectParams {
  table: string;
  columns?: string;
  filter?: Record<string, any>;
  options?: {
    limit?: number;
    offset?: number;
    order?: {
      column: string;
      ascending: boolean;
    };
  };
}

export interface DbInsertParams {
  table: string;
  data: Record<string, any> | Record<string, any>[];
}

export interface DbUpdateParams {
  table: string;
  data: Record<string, any>;
  filter: Record<string, any>;
}

export interface DbDeleteParams {
  table: string;
  filter: Record<string, any>;
}

// Auth operation types
export interface AuthSignUpParams {
  email: string;
  password: string;
  data?: Record<string, any>;
}

export interface AuthSignInParams {
  email: string;
  password: string;
}

// Storage operation types
export interface StorageUploadParams {
  bucket: string;
  path: string;
  file: File | Blob | Buffer;
}

export interface StorageDownloadParams {
  bucket: string;
  path: string;
}

export interface StorageListParams {
  bucket: string;
  path?: string;
}

export interface StorageDeleteParams {
  bucket: string;
  paths: string | string[];
}

/**
 * Supabase MCP Adapter
 */
export default class SupabaseMcpAdapter extends BaseMcpAdapter {
  constructor(options: McpConnectionOptions = {}) {
    super('supabase', options);
  }

  /**
   * Get the MCP server package name
   */
  protected getServerPackage(): string {
    return '@mcp/supabase';
  }

  /**
   * Get additional arguments for the MCP server
   */
  protected getServerArgs(): string[] {
    const args = super.getServerArgs();
    
    // Add Supabase-specific arguments
    if (this.options.token) {
      args.push(`--token=${this.options.token}`);
    }
    
    // Add configPath if provided in serverPath
    if (this.options.serverPath) {
      args.push(`--configPath=${this.options.serverPath}`);
    }
    
    return args;
  }

  // Database operations

  /**
   * Select data from a table
   */
  async select<T = any>(params: DbSelectParams): Promise<T[]> {
    return this.executeFunction<T[]>('db.select', params);
  }

  /**
   * Insert data into a table
   */
  async insert<T = any>(params: DbInsertParams): Promise<T[]> {
    return this.executeFunction<T[]>('db.insert', params);
  }

  /**
   * Update data in a table
   */
  async update<T = any>(params: DbUpdateParams): Promise<T[]> {
    return this.executeFunction<T[]>('db.update', params);
  }

  /**
   * Delete data from a table
   */
  async delete<T = any>(params: DbDeleteParams): Promise<T[]> {
    return this.executeFunction<T[]>('db.delete', params);
  }

  // Auth operations

  /**
   * Sign up a new user
   */
  async signUp(params: AuthSignUpParams): Promise<{user: any, session: any}> {
    return this.executeFunction('auth.signUp', params);
  }

  /**
   * Sign in a user
   */
  async signIn(params: AuthSignInParams): Promise<{user: any, session: any}> {
    return this.executeFunction('auth.signIn', params);
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{success: boolean}> {
    return this.executeFunction('auth.signOut');
  }

  /**
   * Get the current user
   */
  async getUser(): Promise<any> {
    return this.executeFunction('auth.getUser');
  }

  // Storage operations

  /**
   * Upload a file to storage
   */
  async uploadFile(params: StorageUploadParams): Promise<{path: string}> {
    return this.executeFunction('storage.upload', params);
  }

  /**
   * Download a file from storage
   */
  async downloadFile(params: StorageDownloadParams): Promise<Blob> {
    return this.executeFunction('storage.download', params);
  }

  /**
   * List files in storage
   */
  async listFiles(params: StorageListParams): Promise<{name: string, id: string, metadata: any}[]> {
    return this.executeFunction('storage.list', params);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(params: StorageDeleteParams): Promise<{path: string}[]> {
    return this.executeFunction('storage.delete', params);
  }
}