/**
 * MCP Adapter Factory
 * 
 * This module provides a unified factory for creating and managing MCP adapters.
 */

import { McpAdapter, McpConnectionOptions } from '../base';
import GitHubMcpAdapter from './githubMcpAdapter';
import PuppeteerMcpAdapter from './puppeteerMcpAdapter';
import SupabaseMcpAdapter from './supabaseMcpAdapter';
import VercelMcpAdapter from './vercelMcpAdapter';
import Context7McpAdapter from './context7McpAdapter';

// Import adapters as they are implemented
// import BraveSearchMcpAdapter from './braveSearchMcpAdapter';
// import MemoryMcpAdapter from './memoryMcpAdapter';
// import FilesystemMcpAdapter from './filesystemMcpAdapter';

/**
 * Supported MCP adapter types
 */
export type McpAdapterType = 
  | 'github'
  | 'puppeteer'
  | 'supabase'
  | 'vercel'
  | 'context7'
  // | 'brave-search'
  // | 'memory'
  // | 'filesystem'
  // | 'sequential-thinking'
  // | 'google-maps'
  // | 'everything'
;

/**
 * Create an MCP adapter instance
 */
export function createMcpAdapter(type: McpAdapterType, options: McpConnectionOptions = {}): McpAdapter {
  switch (type) {
    case 'github':
      return new GitHubMcpAdapter(options);
    case 'puppeteer':
      return new PuppeteerMcpAdapter(options);
    case 'supabase':
      return new SupabaseMcpAdapter(options);
    case 'vercel':
      return new VercelMcpAdapter(options);
    case 'context7':
      return new Context7McpAdapter(options);
    // Add cases for other adapters as they are implemented
    // case 'brave-search':
    //   return new BraveSearchMcpAdapter(options);
    // case 'memory':
    //   return new MemoryMcpAdapter(options);
    // case 'filesystem':
    //   return new FilesystemMcpAdapter(options);
    default:
      throw new Error(`Unsupported MCP adapter type: ${type}`);
  }
}

/**
 * Singleton MCP adapter instances
 */
const mcpAdapters: Record<McpAdapterType, McpAdapter | null> = {
  'github': null,
  'puppeteer': null,
  'supabase': null,
  'vercel': null,
  'context7': null,
  // 'brave-search': null,
  // 'memory': null,
  // 'filesystem': null,
  // 'sequential-thinking': null,
  // 'google-maps': null,
  // 'everything': null
};

/**
 * Get a singleton MCP adapter instance
 */
export function getMcpAdapter(type: McpAdapterType, options: McpConnectionOptions = {}): McpAdapter {
  if (!mcpAdapters[type]) {
    mcpAdapters[type] = createMcpAdapter(type, options);
  }
  return mcpAdapters[type]!;
}

/**
 * Initialize all MCP adapters
 */
export async function initializeMcpAdapters(): Promise<void> {
  const adapterTypes = Object.keys(mcpAdapters) as McpAdapterType[];
  
  for (const type of adapterTypes) {
    try {
      const adapter = getMcpAdapter(type);
      await adapter.connect();
      console.log(`Initialized ${type} MCP adapter`);
    } catch (error) {
      console.error(`Failed to initialize ${type} MCP adapter:`, error);
    }
  }
}

/**
 * Export available adapters and helpers
 */
export {
  GitHubMcpAdapter,
  PuppeteerMcpAdapter,
  SupabaseMcpAdapter,
  VercelMcpAdapter,
  Context7McpAdapter,
  // Add exports for other adapters as they are implemented
};

/**
 * Re-export the base types
 */
export { McpAdapter, McpConnectionOptions };

/**
 * Export from GitHub adapter
 */
export type { 
  GitHubRepository,
  GitHubFileOperation,
  GitHubPullRequestParams
} from './githubMcpAdapter';

/**
 * Export from Puppeteer adapter
 */
export type {
  ViewportOptions,
  ScreenshotOptions
} from './puppeteerMcpAdapter';

/**
 * Export from Context7 adapter
 */
export type {
  Context7Options,
  DocumentationResult,
  SearchResult,
  ValidationResult
} from './context7McpAdapter';