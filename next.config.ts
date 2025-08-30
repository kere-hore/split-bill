import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  env: {
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || 'false',
  },
};

export default nextConfig;