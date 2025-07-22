import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  trailingSlash: true,
  // Use port 3001 to avoid conflict with existing app
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
