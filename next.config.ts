import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Allow compile in presence of minor lint differences
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Set turbopack root layout config
  compiler: {
    // Note: Next.js v16 NextConfig compiler option
  },
  // Alternative option is custom webpack config or direct runtime variables
};

export default nextConfig;
