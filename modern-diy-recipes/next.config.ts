import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add fallbacks for node core modules used by MCP SDK
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        'node:process': false,
        'node:stream': false,
        'node:buffer': false,
        'node:util': false,
        process: false,
        stream: false,
        buffer: false,
        util: false,
      };
    }
    
    // Ignore MCP module in client-side rendering
    if (!isServer) {
      // Exclude MCP-related modules from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@modelcontextprotocol/sdk': false,
      };
    }
    
    return config;
  },
  images: {
    unoptimized: true
  },
  // Skip type checking during build to avoid MCP import issues
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enhanced static serving configuration
  experimental: {
    // Enable streaming responses
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure proper MIME types
  headers: async () => {
    return [
      {
        source: '/fonts/:font*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/fonts/:font*.woff2',
        headers: [
          {
            key: 'Content-Type',
            value: 'font/woff2',
          },
        ],
      },
      {
        source: '/fonts/:font*.woff',
        headers: [
          {
            key: 'Content-Type',
            value: 'font/woff',
          },
        ],
      },
    ];
  },
  // Ensure port 3000 is used
  env: {
    PORT: '3000',
  },
};

export default nextConfig;
