import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // Configure Turbopack rules here
    }
  },
  images: {
    unoptimized: true,  // Prevents image optimization issues if any
  }
};

export default nextConfig;
