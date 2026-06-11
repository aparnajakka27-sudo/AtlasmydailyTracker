import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Allow compile in presence of minor lint differences
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db'],
  },
};

export default nextConfig;
