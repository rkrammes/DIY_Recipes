import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // MCP SDK is now handled via API routes, no need for client-side fallbacks
    return config;
  },
  images: {
    unoptimized: true
  },
  // Type checking configuration
  typescript: {
    // Type checking is now enabled for production builds
    ignoreBuildErrors: false,
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
