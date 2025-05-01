import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Basic client instantiation - further configuration may be needed
const client = new Client(
  {
    name: "diy-recipes-client",
    version: "1.0.0" // Replace with actual project version
  }
);

// Connect to the Vercel MCP server
const vercelTransport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-vercel", "VERCEL_API_KEY=As32OpQzDdt5LZcbkfXEJ0S8"]
});

await client.connect(vercelTransport);

// Export the client for use in other parts of the application
export default client;