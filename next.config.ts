import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3050", "127.0.0.1:3050", "192.168.*:3050", "10.*:3050"
      ]
    }
  }
};

export default nextConfig;
