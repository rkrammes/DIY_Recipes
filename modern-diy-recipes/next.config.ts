import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,  // Prevents image optimization issues if any
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side webpack config adjustments if needed
    }
    return config;
  },
};

export default nextConfig;
