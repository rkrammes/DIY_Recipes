/**
 * Client-side MCP Adapter
 * 
 * This client adapter provides the same interface as the server-side MCP adapters,
 * but makes API calls instead of using the MCP SDK directly.
 */

export type McpAdapterType = 
  | 'github'
  | 'puppeteer'
  | 'supabase'
  | 'vercel'
  | 'context7';

export interface McpConnectionOptions {
  timeout?: number;
}

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
 * Client-side MCP adapter that communicates with the server API
 */
export class ClientMcpAdapter implements McpAdapter {
  public isConnected: boolean = false;
  
  constructor(
    public readonly name: string,
    private readonly adapterType: McpAdapterType,
    private readonly options: McpConnectionOptions = {}
  ) {}

  private async callApi(action: string, data: any = {}) {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adapter: this.adapterType,
        action,
        ...data
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async connect(): Promise<void> {
    const result = await this.callApi('connect');
    this.isConnected = result.connected;
  }

  async disconnect(): Promise<void> {
    const result = await this.callApi('disconnect');
    this.isConnected = false;
  }

  async executeFunction<T = any>(functionName: string, params?: any): Promise<T> {
    const result = await this.callApi('execute', { functionName, params });
    return result.result as T;
  }

  async getServerInfo(): Promise<{ name: string; version: string }> {
    const result = await this.callApi('getServerInfo');
    return result.info;
  }

  async listTools(): Promise<string[]> {
    const result = await this.callApi('listTools');
    return result.tools;
  }

  async getStatus(): Promise<{ connected: boolean; name: string }> {
    const result = await this.callApi('status');
    this.isConnected = result.connected;
    return { connected: result.connected, name: result.name };
  }
}

/**
 * Create a client-side MCP adapter
 */
export function createClientMcpAdapter(type: McpAdapterType, options: McpConnectionOptions = {}): McpAdapter {
  const adapterNames: Record<McpAdapterType, string> = {
    github: 'GitHub MCP Adapter',
    puppeteer: 'Puppeteer MCP Adapter',
    supabase: 'Supabase MCP Adapter',
    vercel: 'Vercel MCP Adapter',
    context7: 'Context7 MCP Adapter',
  };

  return new ClientMcpAdapter(adapterNames[type], type, options);
}

/**
 * Singleton client MCP adapter instances
 */
const clientMcpAdapters: Record<McpAdapterType, McpAdapter | null> = {
  'github': null,
  'puppeteer': null,
  'supabase': null,
  'vercel': null,
  'context7': null,
};

/**
 * Get a singleton client MCP adapter instance
 */
export function getClientMcpAdapter(type: McpAdapterType, options: McpConnectionOptions = {}): McpAdapter {
  if (!clientMcpAdapters[type]) {
    clientMcpAdapters[type] = createClientMcpAdapter(type, options);
  }
  return clientMcpAdapters[type]!;
}