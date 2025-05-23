/**
 * Base MCP Adapter
 * 
 * This module provides the base class and types for all MCP adapters.
 */

import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

/**
 * Connection options for MCP servers
 */
export interface McpConnectionOptions {
  port?: number;
  token?: string;
  timeout?: number;
  args?: string[];
  serverPath?: string;
}

/**
 * Base MCP adapter interface
 */
export interface McpAdapter {
  name: string;
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  executeFunction<T = any>(functionName: string, params?: any): Promise<T>;
  getServerInfo(): Promise<{ name: string; version: string }>;
  listTools(): Promise<string[]>;
}

/**
 * Base MCP adapter implementation
 */
export abstract class BaseMcpAdapter implements McpAdapter {
  protected client: Client | null = null;
  protected options: McpConnectionOptions;
  public isConnected: boolean = false;
  
  constructor(
    public readonly name: string,
    options: McpConnectionOptions = {}
  ) {
    this.options = {
      port: 0, // Use dynamic port
      timeout: 30000, // 30 seconds
      ...options
    };
  }
  
  /**
   * Get the MCP server package name
   */
  protected abstract getServerPackage(): string;
  
  /**
   * Get additional arguments for the MCP server
   */
  protected getServerArgs(): string[] {
    const args = ['-y', this.getServerPackage()];
    
    if (this.options.port && this.options.port > 0) {
      args.push(`--port=${this.options.port}`);
    }
    
    if (this.options.args) {
      args.push(...this.options.args);
    }
    
    return args;
  }
  
  /**
   * Connect to the MCP server
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }
    
    try {
      // Create a new MCP client
      this.client = new Client({
        name: `diy-recipes-${this.name}-client`,
        version: '1.0.0'
      });
      
      // Connect to the MCP server using stdio transport
      const transport = new StdioClientTransport({
        command: 'npx',
        args: this.getServerArgs(),
        timeout: this.options.timeout
      });
      
      await this.client.connect(transport);
      this.isConnected = true;
      
      console.log(`Connected to ${this.name} MCP server`);
    } catch (error) {
      console.error(`Failed to connect to ${this.name} MCP server:`, error);
      this.isConnected = false;
      this.client = null;
      throw error;
    }
  }
  
  /**
   * Disconnect from the MCP server
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }
    
    try {
      await this.client.disconnect();
      this.isConnected = false;
      this.client = null;
      
      console.log(`Disconnected from ${this.name} MCP server`);
    } catch (error) {
      console.error(`Failed to disconnect from ${this.name} MCP server:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a function on the MCP server
   */
  public async executeFunction<T = any>(functionName: string, params: any = {}): Promise<T> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
    
    if (!this.client) {
      throw new Error(`Cannot execute function: Not connected to ${this.name} MCP server`);
    }
    
    try {
      const result = await this.client.executeFunction(functionName, params);
      return result as T;
    } catch (error) {
      console.error(`Error executing function ${functionName} on ${this.name} MCP server:`, error);
      throw error;
    }
  }
  
  /**
   * Get server information
   */
  public async getServerInfo(): Promise<{ name: string; version: string }> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
    
    const info = await this.client!.getServerInfo();
    return {
      name: info.name,
      version: info.version
    };
  }
  
  /**
   * List available tools on the MCP server
   */
  public async listTools(): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
    
    const info = await this.client!.getServerInfo();
    return Object.keys(info.toolFunctions || {});
  }
}