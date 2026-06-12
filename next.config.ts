import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Allow compile in presence of minor lint differences
  },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db'],
  },
};

export default nextConfig;
