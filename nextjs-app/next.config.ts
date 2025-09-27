import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlpvvwlxjzexpgitsjlw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**', // Matches both /public/** and /sign/** for signed URLs
      },
      {
        protocol: 'https',
        hostname: 'bpdhbxvsguklkbusqtke.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**', // Matches both /public/** and /sign/** for signed URLs
      },
    ],
  },
};

export default nextConfig;