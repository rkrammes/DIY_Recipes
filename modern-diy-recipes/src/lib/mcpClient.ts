// Safe conditional loading of MCP SDK
// This prevents client-side bundling of the SDK which contains Node.js specific code

// Define client interface
export interface McpClient {
  connect: (transport: any) => Promise<any>;
  prompt: (params: any) => Promise<any>;
  isConnected: () => boolean;
}

// Server-only implementation
let clientInstance: McpClient | null = null;

// This will only run on the server side
export async function initMcpClient() {
  if (typeof window !== 'undefined') {
    // We're on the client side, do nothing
    return null;
  }
  
  if (clientInstance) {
    return clientInstance;
  }
  
  try {
    // Dynamic imports that only work on the server
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
    
    // Basic client instantiation
    const client = new Client({
      name: "diy-recipes-client",
      version: "1.0.0" 
    });
    
    // Connect to the Vercel MCP server
    const vercelTransport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-vercel", "VERCEL_API_KEY=As32OpQzDdt5LZcbkfXEJ0S8"]
    });
    
    await client.connect(vercelTransport);
    clientInstance = client;
    
    return client;
  } catch (error) {
    console.error("Failed to initialize MCP client:", error);
    return null;
  }
}

// Safe client getter for use in server components/actions
export async function getMcpClient(): Promise<McpClient | null> {
  if (typeof window !== 'undefined') {
    return null; // Not available on client
  }
  
  return await initMcpClient();
}

// Placeholder for client-side components
export function isMcpAvailable(): boolean {
  return typeof window === 'undefined';
}